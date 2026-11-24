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

export type EbayTokenType = "application";

export interface EbayRequestConfig {
	headers?: Record<string, string>;
	params?: Record<string, unknown>;
	responseType?: ResponseType;
	absolute?: boolean;
	timeoutMs?: number;
	maxBytes?: number;
	tokenType?: EbayTokenType;
	signed?: boolean;
}

export interface EbayResponse<T> {
	readonly data: T;
	readonly status: number;
	readonly headers: Record<string, string>;
}

function isBinaryBody(requestBody: unknown): boolean {
	return (
		requestBody instanceof FormData ||
		requestBody instanceof Blob ||
		requestBody instanceof Uint8Array ||
		requestBody instanceof ArrayBuffer
	);
}

const CONTENT_TYPE_HEADER = "content-type";

function hasHeader(
	headers: Record<string, string> | undefined,
	name: string,
): boolean {
	return (
		headers !== undefined &&
		Object.keys(headers).some((key) => key.toLowerCase() == name)
	);
}

function deleteHeader(headers: Record<string, string>, name: string): void {
	for (const key of Object.keys(headers)) {
		if (key.toLowerCase() == name) {
			delete headers[key];
		}
	}
}

interface SerializedBody {
	readonly wireBody: unknown;
	readonly digestBytes?: string | Uint8Array;
}

interface SignedRequest {
	readonly wireBody: unknown;
	readonly signatureHeaders: Record<string, string>;
}

function serializeSignedBody(requestBody: unknown): SerializedBody {
	if (requestBody === undefined || requestBody === null) {
		return { wireBody: requestBody };
	}
	if (typeof requestBody == "string" || requestBody instanceof Uint8Array) {
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
}

// A proxy forwards eBay's Host header and path, so the signature covers the eBay URL.
function ebayFacingUrl(
	url: string,
	ebayBaseUrl: string,
	apiBaseUrl: string | undefined,
): string {
	return apiBaseUrl !== undefined && url.startsWith(apiBaseUrl)
		? `${ebayBaseUrl}${url.slice(apiBaseUrl.length)}`
		: url;
}

const SIGNATURE_ERROR_PATTERN = /signature/i;
const TRAILING_PERIOD_PATTERN = /\.?$/;

function isSignatureFailure(detail: string | undefined): boolean {
	return detail !== undefined && SIGNATURE_ERROR_PATTERN.test(detail);
}

function isPresent<Present>(present: Present | undefined): present is Present {
	return present != null;
}

const SIGNING_SETUP_HINT =
	" eBay requires Digital Signatures on this call for EU/UK sellers. Create a key with ebay_create_signing_key, then set EBAY_SIGNING_KEY_JWE (the jwe value) and EBAY_SIGNING_PRIVATE_KEY (the privateKey value) and restart the server.";

function signingSetupMessage(
	detail: string | undefined,
	signed: boolean | undefined,
	hasSigningCredentials: boolean,
): string | undefined {
	if (signed != true) {
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

interface EbayRequestOptions {
	readonly params?: Record<string, unknown> | undefined;
	readonly data?: unknown;
	readonly headers?: Record<string, string> | undefined;
	readonly responseType?: ResponseType | undefined;
	readonly absolute?: boolean | undefined;
	readonly timeoutMs?: number | undefined;
	readonly maxBytes?: number | undefined;
	readonly tokenType?: EbayTokenType | undefined;
	readonly signed?: boolean | undefined;
}

interface RequestRetryState {
	readonly authRetried: boolean;
	readonly serverRetries: number;
}

interface RequestFailureContext {
	readonly method: string;
	readonly url: string;
	readonly options: EbayRequestOptions;
	readonly state: RequestRetryState;
}

function tokenFailureRemediation(tokenType: EbayTokenType | undefined): string {
	return tokenType == "application"
		? "This endpoint requires an application access token minted from client credentials, which a user token cannot supply. Check EBAY_CLIENT_ID and EBAY_CLIENT_SECRET."
		: "Please use the ebay_set_user_tokens_with_expiry tool to provide valid tokens.";
}

function isServerStatus(status: number | undefined): boolean {
	if (typeof status != "number") {
		return false;
	}

	return status >= 500;
}

function retryWaitMilliseconds(retryAfter: string | undefined): number {
	if (retryAfter === undefined) {
		return 60_000;
	}

	if (retryAfter == "") {
		return 60_000;
	}

	return Number.parseInt(retryAfter, 10) * 1000;
}

export class EbayApiClient {
	private readonly authClient: EbayOAuthClient;
	private readonly baseUrl: string;
	private readonly rateLimitTracker: RateLimitTracker;
	private readonly config: EbayConfig;
	private readonly timeoutMs = 30_000;
	private signingKey: KeyObject | undefined;

	private getDefaultHeaders = (): Record<string, string> => {
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
	};

	constructor(config: EbayConfig) {
		this.config = config;
		this.authClient = new EbayOAuthClient(config);
		this.baseUrl = getBaseUrl(config.environment, config.apiBaseUrl);
		this.rateLimitTracker = new RateLimitTracker();
	}

	private getSigningKey = (privateKey: string): KeyObject => {
		if (this.signingKey === undefined) {
			this.signingKey = parseSigningPrivateKey(privateKey);
		}
		return this.signingKey;
	};

	private signRequest = (
		method: string,
		url: string,
		options: EbayRequestOptions,
	): SignedRequest => {
		const { signing, environment, apiBaseUrl } = this.config;

		if (options.signed != true) {
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
	};

	private acquireAccessToken = async (
		tokenType: EbayTokenType | undefined,
	): Promise<string> => {
		const isApplicationToken = tokenType == "application";

		if (isApplicationToken) {
			return await this.authClient.getOrRefreshAppAccessToken();
		}

		return await this.authClient.getAccessToken();
	};

	private accessTokenValidationError = (): Error | undefined => {
		if (!(this.config.clientId && this.config.clientSecret)) {
			return new Error(
				"Missing required eBay credentials. Please set EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in your .env file.",
			);
		}

		return undefined;
	};

	private ebayErrorBody = (errorBody: unknown): string => {
		if (errorBody == null) return "";
		try {
			return ` | response: ${JSON.stringify(errorBody)}`;
		} catch {
			return "";
		}
	};

	private request = async <T>(
		method: string,
		endpoint: string,
		options: EbayRequestOptions,
	): Promise<T> => {
		return (await this.requestResponse<T>(method, endpoint, options)).data;
	};

	private requestResponse = async <T>(
		method: string,
		endpoint: string,
		options: EbayRequestOptions,
	): Promise<EbayResponse<T>> => {
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
	};

	private sendWithRetry = async <T>(
		method: string,
		url: string,
		options: EbayRequestOptions,
		state: RequestRetryState,
	): Promise<HttpResponse<T>> => {
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
	};

	private handleCompletedFailure = async <T>(
		httpResponse: HttpResponse<T>,
		context: RequestFailureContext,
	): Promise<HttpResponse<T>> => {
		const { method, url, options, state } = context;
		const status = httpResponse.status;

		logErrorResponse(status, httpResponse.statusText, url, httpResponse.data);

		// 401 — refresh the token once, then retry the request. Skipped in proxy
		// auth mode: the server holds no token to refresh, so a 401 (the proxy's
		// own auth failing) is surfaced directly rather than retried.
		const isUnauthorized = status == 401;
		const canRefreshAuth = this.config.disableAuthHeader != true;

		if (isUnauthorized) {
			if (canRefreshAuth) {
				return await this.retryUnauthorized<T>(httpResponse, context);
			}
		}

		// 429 — surface a clear rate-limit message with the server's retry hint.
		const isRateLimited = status == 429;

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
	};

	private retryUnauthorized = async <T>(
		httpResponse: HttpResponse<T>,
		context: RequestFailureContext,
	): Promise<HttpResponse<T>> => {
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
	};

	private httpStatusMessage = <T>(
		httpResponse: HttpResponse<T>,
		context: RequestFailureContext,
	): string => {
		const { url, options } = context;
		const status = httpResponse.status;
		const extracted = readHttpFailureMessage(httpResponse.data, "");
		const detail = extracted == "" ? undefined : extracted;
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
	};

	get = async <T = unknown>(
		endpoint: string,
		params?: Record<string, unknown>,
		config?: EbayRequestConfig,
	): Promise<T> => {
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
	};

	getForResponse = async <T = unknown>(
		endpoint: string,
		params?: Record<string, unknown>,
		config?: EbayRequestConfig,
	): Promise<EbayResponse<T>> => {
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
	};

	post = async <T = unknown>(
		endpoint: string,
		requestBody?: unknown,
		config?: EbayRequestConfig,
	): Promise<T> => {
		return (await this.postForResponse<T>(endpoint, requestBody, config)).data;
	};

	postForResponse = async <T = unknown>(
		endpoint: string,
		requestBody?: unknown,
		config?: EbayRequestConfig,
	): Promise<EbayResponse<T>> => {
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
	};

	put = async <T = unknown>(
		endpoint: string,
		requestBody?: unknown,
		config?: EbayRequestConfig,
	): Promise<T> => {
		return (await this.putForResponse<T>(endpoint, requestBody, config)).data;
	};

	putForResponse = async <T = unknown>(
		endpoint: string,
		requestBody?: unknown,
		config?: EbayRequestConfig,
	): Promise<EbayResponse<T>> => {
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
	};

	patch = async <T = unknown>(
		endpoint: string,
		requestBody?: unknown,
		config?: EbayRequestConfig,
	): Promise<T> => {
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
	};

	delete = async <T = unknown>(
		endpoint: string,
		config?: EbayRequestConfig,
	): Promise<T> => {
		return (await this.deleteForResponse<T>(endpoint, config)).data;
	};

	deleteForResponse = async <T = unknown>(
		endpoint: string,
		config?: EbayRequestConfig,
		requestBody?: unknown,
	): Promise<EbayResponse<T>> => {
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
	};

	initialize = (): Promise<void> => this.authClient.initialize();

	isAuthenticated = (): boolean => {
		return this.authClient.isAuthenticated();
	};

	hasUserTokens = (): boolean => {
		return this.authClient.hasUserTokens();
	};

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

	getTokenInfo = () => {
		return this.authClient.getTokenInfo();
	};

	getOAuthClient = (): EbayOAuthClient => {
		return this.authClient;
	};

	getRateLimitStats = () => {
		return this.rateLimitTracker.getStats();
	};

	getConfig = (): EbayConfig => {
		return this.config;
	};

	refreshUserToken = async (): Promise<void> => {
		await this.authClient.refreshUserToken();
	};

	getWithFullUrl = async <T = unknown>(
		fullUrl: string,
		params?: Record<string, unknown>,
	): Promise<T> => {
		return await this.request<T>("GET", fullUrl, { params, absolute: true });
	};
}
