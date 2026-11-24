import type { KeyObject } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { EbayOAuthClient } from "@/auth/oauth.js";
import { RateLimitTracker } from "@/ebay-client/rateLimitTracker.js";
import {
	parseSigningPrivateKey,
	signEbayRequest,
} from "@/ebay-client/signEbayRequest.js";
import type { EbayConfig } from "@/shared/ebay.js";
import { getBaseUrl, getIdentityBaseUrl } from "@/shared/environment.js";
import { getErrorMessage } from "@/shared/errors.js";
import {
	type HttpResponse,
	httpRequestEffect,
	type ResponseType,
	readHttpFailureMessage,
} from "@/shared/http.js";
import {
	apiLogger,
	logErrorResponse,
	logRequest,
	logResponse,
} from "@/shared/logger.js";

/**
 * Which eBay OAuth token a request authenticates with.
 *
 * `'application'` forces the client-credentials application token. Omitting
 * the token type keeps the default path, which prefers a configured user token
 * and falls back to the application token.
 */
export type EbayTokenType = "application";

/**
 * Per-request overrides accepted by the verb helpers ({@link EbayApiClient.get}
 * et al). `headers` are merged over the client defaults (the auth header is
 * always applied last and cannot be overridden); `params` are appended to the
 * query string — useful for POSTs that also take query parameters.
 */
export interface EbayRequestConfig {
	/** Headers merged over the client defaults before auth is applied. */
	headers?: Record<string, string>;
	/** Query parameters appended to the request URL. */
	params?: Record<string, unknown>;
	/** Successful response decoder for non-JSON endpoints such as binary evidence files. */
	responseType?: ResponseType;
	/** Treat `endpoint` as a full URL (APIs on another eBay host, e.g. `apim`). */
	absolute?: boolean;
	/** Per-request timeout override, e.g. for large media uploads. */
	timeoutMs?: number;
	/** Stop reading an `arraybuffer` body past this many bytes (see HttpRequestOptions); every verb forwards it. */
	maxBytes?: number;
	/**
	 * Token the request must authenticate with. Omit for the default
	 * user-first token, or pass `'application'` for endpoints eBay documents as
	 * requiring a client-credentials application token (the Buy APIs).
	 */
	tokenType?: EbayTokenType;
	/**
	 * Attach eBay Digital Signature headers (RFC 9421) when signing credentials are
	 * configured. Set for the calls eBay requires signatures on for EU/UK sellers
	 * (the Finances API, Fulfillment issueRefund); a no-op without credentials.
	 */
	signed?: boolean;
}

/** Successful eBay response with the transport metadata some endpoints put their result in. */
export interface EbayResponse<T> {
	/** Decoded response body (`undefined` for an empty body). */
	readonly data: T;
	/** HTTP status code. */
	readonly status: number;
	/** Response headers with lower-cased names (e.g. `location`). */
	readonly headers: Record<string, string>;
}

/** Bodies that must never be echoed into debug logs. */
const isBinaryBody = (requestBody: unknown): boolean =>
	requestBody instanceof FormData ||
	requestBody instanceof Blob ||
	requestBody instanceof Uint8Array ||
	requestBody instanceof ArrayBuffer;

const CONTENT_TYPE_HEADER = "content-type";

const hasHeader = (
	headers: Record<string, string> | undefined,
	name: string,
): boolean =>
	headers !== undefined &&
	Object.keys(headers).some((key) => key.toLowerCase() === name);

/** Removes every spelling of a header so fetch can derive it from the body. */
const deleteHeader = (headers: Record<string, string>, name: string): void => {
	for (const key of Object.keys(headers)) {
		if (key.toLowerCase() === name) {
			delete headers[key];
		}
	}
};

interface SerializedBody {
	readonly wireBody: unknown;
	readonly digestBytes?: string | Uint8Array;
}

interface SignedRequest {
	readonly wireBody: unknown;
	readonly signatureHeaders: Record<string, string>;
}

/**
 * Serialize a body exactly as the HTTP adapter would so its Content-Digest
 * matches the bytes on the wire. Multipart and Blob bodies never reach here:
 * fetch streams them, so they cannot be digested up front.
 */
const serializeSignedBody = (requestBody: unknown): SerializedBody => {
	if (requestBody === undefined || requestBody === null) {
		return { wireBody: requestBody };
	}
	if (typeof requestBody === "string" || requestBody instanceof Uint8Array) {
		return { wireBody: requestBody, digestBytes: requestBody };
	}
	if (requestBody instanceof ArrayBuffer) {
		return { wireBody: requestBody, digestBytes: new Uint8Array(requestBody) };
	}
	if (requestBody instanceof URLSearchParams) {
		const encoded = requestBody.toString();
		return { wireBody: requestBody, digestBytes: encoded };
	}
	const json = JSON.stringify(requestBody);
	return { wireBody: json, digestBytes: json };
};

// A proxy forwards eBay's Host header and path, so the signature covers the eBay URL.
const ebayFacingUrl = (
	url: string,
	ebayBaseUrl: string,
	apiBaseUrl: string | undefined,
): string =>
	apiBaseUrl !== undefined && url.startsWith(apiBaseUrl)
		? `${ebayBaseUrl}${url.slice(apiBaseUrl.length)}`
		: url;

const SIGNATURE_ERROR_PATTERN = /signature/i;
const TRAILING_PERIOD_PATTERN = /\.?$/;

/** True when an eBay error body points at a missing or rejected digital signature. */
const isSignatureFailure = (detail: string | undefined): boolean =>
	detail !== undefined && SIGNATURE_ERROR_PATTERN.test(detail);

function isPresent<Present>(present: Present | undefined): present is Present {
	return present != null;
}

/** Remediation appended to signature failures when the server has no signing credentials. */
const SIGNING_SETUP_HINT =
	" eBay requires Digital Signatures on this call for EU/UK sellers. Create a key with ebay_create_signing_key, then set EBAY_SIGNING_KEY_JWE (the jwe value) and EBAY_SIGNING_PRIVATE_KEY (the privateKey value) and restart the server.";

function signingSetupMessage(
	detail: string | undefined,
	signed: boolean | undefined,
	hasSigningCredentials: boolean,
): string | undefined {
	if (signed !== true) {
		return undefined;
	}

	if (!isSignatureFailure(detail)) {
		return undefined;
	}

	if (hasSigningCredentials) {
		return undefined;
	}

	return `${detail?.replace(TRAILING_PERIOD_PATTERN, ".")}${SIGNING_SETUP_HINT}`;
}

/** Normalized request options used by the client transport. */
interface EbayRequestOptions {
	/** Query-string parameters appended to the request URL. */
	readonly params?: Record<string, unknown> | undefined;
	/** JSON/XML/form body passed to the HTTP adapter. */
	readonly data?: unknown;
	/** Headers merged over the client defaults before auth is applied. */
	readonly headers?: Record<string, string> | undefined;
	/** Successful response decoder for non-JSON endpoints. */
	readonly responseType?: ResponseType | undefined;
	/** Whether `endpoint` was already an absolute URL. */
	readonly absolute?: boolean | undefined;
	/** Per-request timeout override. */
	readonly timeoutMs?: number | undefined;
	/** Binary body read limit passed to the HTTP adapter. */
	readonly maxBytes?: number | undefined;
	/** Token the request must authenticate with; omit for the default path. */
	readonly tokenType?: EbayTokenType | undefined;
	/** Attach eBay Digital Signature headers when signing credentials are configured. */
	readonly signed?: boolean | undefined;
}

/** Retry counters carried between recursive request attempts. */
interface RequestRetryState {
	/** Whether a 401 already triggered the one allowed token-refresh retry. */
	readonly authRetried: boolean;
	/** Number of server-error backoff retries already attempted. */
	readonly serverRetries: number;
}

/** Context required to turn an HTTP failure into a retry or final error. */
interface RequestFailureContext {
	/** HTTP method used for this request. */
	readonly method: string;
	/** Fully qualified request URL. */
	readonly url: string;
	/** Normalized request options for a retry. */
	readonly options: EbayRequestOptions;
	/** Retry counters for this attempt. */
	readonly state: RequestRetryState;
}

/**
 * Remediation hint for a token failure, matched to the token the request needs.
 *
 * Setting user tokens cannot repair rejected client credentials, so an
 * application request has to point at the credentials instead.
 */
const tokenFailureRemediation = (
	tokenType: EbayTokenType | undefined,
): string =>
	tokenType === "application"
		? "This endpoint requires an application access token minted from client credentials, which a user token cannot supply. Check EBAY_CLIENT_ID and EBAY_CLIENT_SECRET."
		: "Please use the ebay_set_user_tokens_with_expiry tool to provide valid tokens.";

function isServerStatus(status: number | undefined): boolean {
	if (typeof status !== "number") {
		return false;
	}

	return status >= 500;
}

function retryWaitMilliseconds(retryAfter: string | undefined): number {
	if (retryAfter === undefined) {
		return 60_000;
	}

	if (retryAfter === "") {
		return 60_000;
	}

	return Number.parseInt(retryAfter, 10) * 1000;
}

/**
 * Base client for making eBay API requests.
 *
 * Wraps the native-`fetch` helper ({@link httpRequest}) with eBay-specific
 * concerns the old axios interceptors used to handle: per-request auth-token
 * injection, a sliding-window rate-limit guard, request/response logging, and
 * retry/refresh handling for 401 (refresh once), 429, and 5xx (exponential
 * backoff) responses.
 */
export class EbayApiClient {
	private readonly authClient: EbayOAuthClient;
	private readonly baseUrl: string;
	private readonly rateLimitTracker: RateLimitTracker;
	private readonly config: EbayConfig;
	private readonly timeoutMs = 30_000;
	/** Parsed signing key, cached after the first signed request. */
	private signingKey: KeyObject | undefined;

	/**
	 * Build default request headers based on configured marketplace and language.
	 */
	private getDefaultHeaders(): Record<string, string> {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			Accept: "application/json",
		};

		if (this.config.contentLanguage) {
			headers["Content-Language"] = this.config.contentLanguage;
			// undici defaults Accept-Language to `*`, which eBay Inventory rejects (error 25709).
			headers["Accept-Language"] = this.config.contentLanguage;
		}

		if (this.config.marketplaceId) {
			headers["X-EBAY-C-MARKETPLACE-ID"] = this.config.marketplaceId;
		}

		return headers;
	}

	constructor(config: EbayConfig) {
		this.config = config;
		this.authClient = new EbayOAuthClient(config);
		this.baseUrl = getBaseUrl(config.environment, config.apiBaseUrl);
		this.rateLimitTracker = new RateLimitTracker();
	}

	/** Parse (once) and return the configured signing key. */
	private getSigningKey(privateKey: string): KeyObject {
		if (this.signingKey === undefined) {
			this.signingKey = parseSigningPrivateKey(privateKey);
		}
		return this.signingKey;
	}

	private signRequest(
		method: string,
		url: string,
		options: EbayRequestOptions,
	): SignedRequest {
		const { signing, environment, apiBaseUrl } = this.config;

		if (options.signed !== true) {
			return { wireBody: options.data, signatureHeaders: {} };
		}

		if (signing === undefined) {
			return { wireBody: options.data, signatureHeaders: {} };
		}

		const isMultipart = options.data instanceof FormData;
		const isBlob = options.data instanceof Blob;

		if (isMultipart) {
			throw new Error(
				"Multipart and Blob request bodies cannot be digitally signed.",
			);
		}

		if (isBlob) {
			throw new Error(
				"Multipart and Blob request bodies cannot be digitally signed.",
			);
		}

		const { wireBody, digestBytes } = serializeSignedBody(options.data);
		// Absolute signed endpoints are the apiz-hosted Finances calls.
		const ebayBaseUrl = options.absolute
			? getIdentityBaseUrl(environment)
			: getBaseUrl(environment);
		const signedUrl = ebayFacingUrl(url, ebayBaseUrl, apiBaseUrl);

		try {
			const signingKey = this.getSigningKey(signing.privateKey);
			const signatureHeaders = signEbayRequest(
				{
					method,
					url: signedUrl,
					...(isPresent(digestBytes) ? { bodyBytes: digestBytes } : {}),
				},
				signing.keyJwe,
				signingKey,
			);
			return { wireBody, signatureHeaders };
		} catch (cause) {
			throw new Error(`Failed to sign request: ${getErrorMessage(cause)}`, {
				cause,
			});
		}
	}

	/**
	 * Acquire the access token a request should authenticate with.
	 *
	 * Both token-acquisition sites (the initial attempt and the 401 retry) route
	 * through here, so an `'application'` request cannot silently downgrade to
	 * the user token on a retry.
	 */
	private async acquireAccessToken(
		tokenType: EbayTokenType | undefined,
	): Promise<string> {
		const isApplicationToken = tokenType === "application";

		if (isApplicationToken) {
			return await this.authClient.getOrRefreshAppAccessToken();
		}

		return await this.authClient.getAccessToken();
	}

	/**
	 * Return the credential validation error that would block an authenticated request.
	 */
	private accessTokenValidationError(): Error | undefined {
		if (!(this.config.clientId && this.config.clientSecret)) {
			return new Error(
				"Missing required eBay credentials. Please set EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in your .env file.",
			);
		}

		return undefined;
	}

	/**
	 * Serialize the full error response body so structured fields (errorId, parameters)
	 * survive into the thrown message for diagnostics.
	 */
	private ebayErrorBody(errorBody: unknown): string {
		if (errorBody == null) return "";
		try {
			return ` | response: ${JSON.stringify(errorBody)}`;
		} catch {
			return "";
		}
	}

	/**
	 * Core request boundary shared by every verb.
	 */
	private async request<T>(
		method: string,
		endpoint: string,
		options: EbayRequestOptions,
	): Promise<T> {
		return (await this.requestResponse<T>(method, endpoint, options)).data;
	}

	/**
	 * Core request boundary that also returns status and headers.
	 */
	private async requestResponse<T>(
		method: string,
		endpoint: string,
		options: EbayRequestOptions,
	): Promise<EbayResponse<T>> {
		const url = options.absolute ? endpoint : `${this.baseUrl}${endpoint}`;
		const httpResponse = await this.sendWithRetry<T>(method, url, options, {
			authRetried: false,
			serverRetries: 0,
		});

		return {
			data: httpResponse.data,
			status: httpResponse.status,
			headers: httpResponse.headers,
		};
	}

	/**
	 * Execute one request attempt, recursively re-entering for bounded retries.
	 */
	private async sendWithRetry<T>(
		method: string,
		url: string,
		options: EbayRequestOptions,
		state: RequestRetryState,
	): Promise<HttpResponse<T>> {
		// In proxy auth mode the upstream proxy supplies credentials, so the server
		// neither requires nor validates its own. See EBAY_MCP_DISABLE_AUTH_HEADER.
		const suppliesOwnAuth = !this.config.disableAuthHeader;

		if (suppliesOwnAuth) {
			const validationError = this.accessTokenValidationError();

			if (validationError) {
				throw validationError;
			}
		}

		const isPastLocalRateLimit = !this.rateLimitTracker.canMakeRequest();

		if (isPastLocalRateLimit) {
			const stats = this.rateLimitTracker.getStats();
			throw new Error(
				`Rate limit exceeded: ${stats.current}/${stats.max} requests in ${stats.windowMs}ms window. Please wait before making more requests.`,
			);
		}

		const headers: Record<string, string> = {
			...this.getDefaultHeaders(),
			...options.headers,
		};
		const isMultipartBody = options.data instanceof FormData;

		if (isMultipartBody) {
			// fetch must set the multipart content-type itself so the boundary matches.
			deleteHeader(headers, CONTENT_TYPE_HEADER);
		} else {
			const isBlobBody = options.data instanceof Blob;
			const hasCallerContentType = hasHeader(
				options.headers,
				CONTENT_TYPE_HEADER,
			);

			if (isBlobBody) {
				if (!hasCallerContentType) {
					// A Blob carries its own MIME type; only an explicit caller header overrides it.
					deleteHeader(headers, CONTENT_TYPE_HEADER);
				}
			}
		}

		// Proxy auth mode: attach no Authorization header and acquire no token —
		// the upstream proxy injects whatever credentials eBay requires.
		if (suppliesOwnAuth) {
			let token: string;

			try {
				token = await this.acquireAccessToken(options.tokenType);
			} catch (cause) {
				throw new Error(
					`Failed to get access token: ${getErrorMessage(cause)}`,
					{ cause },
				);
			}

			const isTokenMissing = !token;

			if (isTokenMissing) {
				throw new Error(
					"Access token is missing. Provide EBAY_USER_REFRESH_TOKEN or valid app credentials, then retry.",
				);
			}

			headers["Authorization"] = `Bearer ${token}`;
		}

		const { wireBody, signatureHeaders } = this.signRequest(
			method,
			url,
			options,
		);
		Object.assign(headers, signatureHeaders);

		this.rateLimitTracker.recordRequest();
		logRequest(
			method,
			url,
			options.params,
			isBinaryBody(options.data) ? "[binary body]" : options.data,
		);

		const timeoutMs = options.timeoutMs ?? this.timeoutMs;
		const params = options.params;
		const responseType = options.responseType;
		const maxBytes = options.maxBytes;

		let httpResponse: HttpResponse<T>;

		try {
			httpResponse = await httpRequestEffect<T>({
				method,
				url,
				headers,
				body: wireBody,
				timeoutMs,
				...(isPresent(params) ? { params } : {}),
				...(isPresent(responseType) ? { responseType } : {}),
				...(isPresent(maxBytes) ? { maxBytes } : {}),
			});
		} catch (error) {
			throw new Error(getErrorMessage(error), { cause: error });
		}

		const status = httpResponse.status;
		const isSuccess = status >= 200 && status <= 299;

		if (isSuccess) {
			logResponse(
				httpResponse.status,
				httpResponse.statusText,
				httpResponse.data,
				httpResponse.headers["x-ebay-c-ratelimit-remaining"],
				httpResponse.headers["x-ebay-c-ratelimit-limit"],
			);

			return httpResponse;
		}

		return await this.handleCompletedFailure<T>(httpResponse, {
			method,
			url,
			options,
			state,
		});
	}

	/**
	 * Turn a completed non-2xx response into a bounded retry or a plain Error.
	 */
	private async handleCompletedFailure<T>(
		httpResponse: HttpResponse<T>,
		context: RequestFailureContext,
	): Promise<HttpResponse<T>> {
		const { method, url, options, state } = context;
		const status = httpResponse.status;

		logErrorResponse(status, httpResponse.statusText, url, httpResponse.data);

		// 401 — refresh the token once, then retry the request. Skipped in proxy
		// auth mode: the server holds no token to refresh, so a 401 (the proxy's
		// own auth failing) is surfaced directly rather than retried.
		const isUnauthorized = status === 401;
		const canRefreshAuth = this.config.disableAuthHeader !== true;

		if (isUnauthorized) {
			if (canRefreshAuth) {
				return await this.retryUnauthorized<T>(httpResponse, context);
			}
		}

		// 429 — surface a clear rate-limit message with the server's retry hint.
		const isRateLimited = status === 429;

		if (isRateLimited) {
			const retryAfter = httpResponse.headers["retry-after"];
			const waitTime = retryWaitMilliseconds(retryAfter);
			throw new Error(
				`eBay API rate limit exceeded. Retry after ${waitTime / 1000} seconds. ` +
					"Consider reducing request frequency or upgrading to user tokens for higher limits.",
			);
		}

		// 5xx — retry up to three times with exponential backoff.
		const isServerError = isServerStatus(status);
		const canRetryServerError = state.serverRetries < 3;

		if (isServerError) {
			if (canRetryServerError) {
				const backoff = 2 ** state.serverRetries * 1000;
				const delayMs = Math.min(backoff, 5000);
				const nextServerRetries = state.serverRetries + 1;
				apiLogger.warn(`Server error (${status}). Retrying...`, {
					attempt: `${nextServerRetries}/3`,
					delayMs,
				});
				await setTimeout(delayMs);

				return await this.sendWithRetry<T>(method, url, options, {
					...state,
					serverRetries: nextServerRetries,
				});
			}
		}

		throw new Error(this.httpStatusMessage(httpResponse, context));
	}

	private async retryUnauthorized<T>(
		httpResponse: HttpResponse<T>,
		context: RequestFailureContext,
	): Promise<HttpResponse<T>> {
		const { options, state, method, url } = context;
		const canRetryAuth = !state.authRetried;

		if (canRetryAuth) {
			apiLogger.warn(
				"Authentication error (401). Attempting to refresh the access token...",
			);

			try {
				await this.acquireAccessToken(options.tokenType);
			} catch (refreshError) {
				const reason = getErrorMessage(refreshError);
				apiLogger.error("Failed to refresh token", { error: reason });
				const detail = readHttpFailureMessage(
					httpResponse.data,
					"Invalid access token",
				);
				throw new Error(
					`${detail}. Token refresh failed: ${reason}. ` +
						tokenFailureRemediation(options.tokenType),
					{ cause: refreshError },
				);
			}

			apiLogger.info("Token refreshed successfully. Retrying request...");

			return await this.sendWithRetry<T>(method, url, options, {
				...state,
				authRetried: true,
			});
		}

		const detail = readHttpFailureMessage(
			httpResponse.data,
			"Invalid access token",
		);
		throw new Error(
			`${detail}. Automatic token refresh failed. ` +
				tokenFailureRemediation(options.tokenType),
		);
	}

	private httpStatusMessage<T>(
		httpResponse: HttpResponse<T>,
		context: RequestFailureContext,
	): string {
		const { url, options } = context;
		const status = httpResponse.status;
		const extracted = readHttpFailureMessage(httpResponse.data, "");
		const detail = extracted === "" ? undefined : extracted;
		const setupMessage = signingSetupMessage(
			detail,
			options.signed,
			this.config.signing !== undefined,
		);

		if (setupMessage !== undefined) {
			return setupMessage;
		}

		const fallback = `Request to ${url} failed with status ${status}`;
		const shownDetail = detail ?? fallback;

		return `eBay API Error: ${shownDetail}${this.ebayErrorBody(httpResponse.data)}`;
	}

	/**
	 * Make a GET request to eBay API
	 */
	async get<T = unknown>(
		endpoint: string,
		params?: Record<string, unknown>,
		config?: EbayRequestConfig,
	): Promise<T> {
		return await this.request<T>("GET", endpoint, {
			params: { ...params, ...config?.params },
			headers: config?.headers,
			responseType: config?.responseType,
			absolute: config?.absolute,
			timeoutMs: config?.timeoutMs,
			maxBytes: config?.maxBytes,
			tokenType: config?.tokenType,
			signed: config?.signed,
		});
	}

	/**
	 * Make a GET request and keep the status and headers of the successful
	 * response — for file downloads whose name and type arrive in headers.
	 */
	async getForResponse<T = unknown>(
		endpoint: string,
		params?: Record<string, unknown>,
		config?: EbayRequestConfig,
	): Promise<EbayResponse<T>> {
		return await this.requestResponse<T>("GET", endpoint, {
			params: { ...params, ...config?.params },
			headers: config?.headers,
			responseType: config?.responseType,
			absolute: config?.absolute,
			timeoutMs: config?.timeoutMs,
			maxBytes: config?.maxBytes,
			tokenType: config?.tokenType,
			signed: config?.signed,
		});
	}

	/**
	 * Make a POST request to eBay API
	 */
	async post<T = unknown>(
		endpoint: string,
		requestBody?: unknown,
		config?: EbayRequestConfig,
	): Promise<T> {
		return (await this.postForResponse<T>(endpoint, requestBody, config)).data;
	}

	/**
	 * Make a POST request and keep the status and headers of the successful
	 * response — for endpoints that return their result in a `Location` header.
	 */
	async postForResponse<T = unknown>(
		endpoint: string,
		requestBody?: unknown,
		config?: EbayRequestConfig,
	): Promise<EbayResponse<T>> {
		return await this.requestResponse<T>("POST", endpoint, {
			data: requestBody,
			params: config?.params,
			headers: config?.headers,
			responseType: config?.responseType,
			absolute: config?.absolute,
			timeoutMs: config?.timeoutMs,
			maxBytes: config?.maxBytes,
			tokenType: config?.tokenType,
			signed: config?.signed,
		});
	}

	/**
	 * Make a PUT request to eBay API
	 */
	async put<T = unknown>(
		endpoint: string,
		requestBody?: unknown,
		config?: EbayRequestConfig,
	): Promise<T> {
		return (await this.putForResponse<T>(endpoint, requestBody, config)).data;
	}

	/**
	 * Make a PUT request and keep the status and headers of the successful
	 * response — for asynchronous updates that return a task `Location` header.
	 */
	async putForResponse<T = unknown>(
		endpoint: string,
		requestBody?: unknown,
		config?: EbayRequestConfig,
	): Promise<EbayResponse<T>> {
		return await this.requestResponse<T>("PUT", endpoint, {
			data: requestBody,
			params: config?.params,
			headers: config?.headers,
			responseType: config?.responseType,
			absolute: config?.absolute,
			timeoutMs: config?.timeoutMs,
			maxBytes: config?.maxBytes,
			tokenType: config?.tokenType,
			signed: config?.signed,
		});
	}

	/**
	 * Make a PATCH request to eBay API
	 */
	async patch<T = unknown>(
		endpoint: string,
		requestBody?: unknown,
		config?: EbayRequestConfig,
	): Promise<T> {
		return await this.request<T>("PATCH", endpoint, {
			data: requestBody,
			params: config?.params,
			headers: config?.headers,
			responseType: config?.responseType,
			absolute: config?.absolute,
			timeoutMs: config?.timeoutMs,
			maxBytes: config?.maxBytes,
			tokenType: config?.tokenType,
			signed: config?.signed,
		});
	}

	/**
	 * Make a DELETE request to eBay API
	 */
	async delete<T = unknown>(
		endpoint: string,
		config?: EbayRequestConfig,
	): Promise<T> {
		return (await this.deleteForResponse<T>(endpoint, config)).data;
	}

	/**
	 * Make a DELETE request and keep the status and headers of the successful
	 * response — for asynchronous deletes that return a task `Location` header.
	 * `requestBody` is the optional body a few eBay DELETE calls document.
	 */
	async deleteForResponse<T = unknown>(
		endpoint: string,
		config?: EbayRequestConfig,
		requestBody?: unknown,
	): Promise<EbayResponse<T>> {
		return await this.requestResponse<T>("DELETE", endpoint, {
			data: requestBody,
			params: config?.params,
			headers: config?.headers,
			responseType: config?.responseType,
			absolute: config?.absolute,
			timeoutMs: config?.timeoutMs,
			maxBytes: config?.maxBytes,
			tokenType: config?.tokenType,
			signed: config?.signed,
		});
	}

	/**
	 * Initialize the client (load user tokens from storage)
	 */
	initialize = (): Promise<void> => this.authClient.initialize();

	/**
	 * Check if client is authenticated
	 */
	isAuthenticated(): boolean {
		return this.authClient.isAuthenticated();
	}

	/**
	 * Check if user tokens are available
	 */
	hasUserTokens(): boolean {
		return this.authClient.hasUserTokens();
	}

	/**
	 * Set user access and refresh tokens
	 */
	setUserTokens = (
		accessToken: string,
		refreshToken: string,
		accessTokenExpiry?: number,
		refreshTokenExpiry?: number,
	): Promise<void> =>
		this.authClient.setUserTokens(
			accessToken,
			refreshToken,
			accessTokenExpiry,
			refreshTokenExpiry,
		);

	/**
	 * Get token information for debugging
	 */
	getTokenInfo() {
		return this.authClient.getTokenInfo();
	}

	/**
	 * Get the OAuth client instance for advanced operations
	 */
	getOAuthClient(): EbayOAuthClient {
		return this.authClient;
	}

	/**
	 * Get rate limit statistics
	 */
	getRateLimitStats() {
		return this.rateLimitTracker.getStats();
	}

	/**
	 * Get the config object (for accessing environment, etc.)
	 */
	getConfig(): EbayConfig {
		return this.config;
	}

	/**
	 * Manually refresh user access token using the refresh token
	 * This is useful when you encounter "Invalid access token" errors
	 * The token will be automatically saved to storage after refresh
	 */
	refreshUserToken = async (): Promise<void> => {
		await this.authClient.refreshUserToken();
	};

	/**
	 * Make a GET request with a full URL (for APIs that use different base URLs)
	 * Used by Identity API which uses the apiz subdomain
	 */
	async getWithFullUrl<T = unknown>(
		fullUrl: string,
		params?: Record<string, unknown>,
	): Promise<T> {
		return await this.request<T>("GET", fullUrl, { params, absolute: true });
	}
}
