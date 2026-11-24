/**
 * Minimal HTTP client built on the native `fetch` API (Node ≥ 18).
 *
 * Why this exists: the project previously used axios. axios drags in transitive
 * dependencies (`follow-redirects`, `form-data`, `proxy-from-env`) and hides
 * request/response handling behind interceptors. Native `fetch` covers every
 * use case here with zero dependencies, but it has sharp edges this module
 * centralizes so call sites never repeat them:
 *
 *  1. `fetch` does NOT reject on 4xx/5xx — {@link httpRequestEffect} returns those responses, and {@link httpRequest} throws a plain Error.
 *  2. `fetch` does NOT parse JSON — and `response.json()` throws on an empty (204) body.
 *  3. Timeouts need an `AbortController`.
 *  4. Query params need explicit `URLSearchParams` serialization.
 *  5. Callers branch on the response status instead of an error class.
 *
 * Keeping these in one place is the single source of truth that lets the rest of
 * the codebase treat HTTP like the old axios calls without the dependency.
 */

import { getErrorMessage } from "@/shared/errors.js";
import { isRecord } from "@/shared/typeGuards.js";

/** How to decode a successful response body. Defaults to `json`. */
export type ResponseType = "json" | "text" | "arraybuffer";

/**
 * Options for {@link httpRequest}. Mirrors the subset of axios config the
 * codebase actually used, expressed in fetch-native terms.
 */
export interface HttpRequestOptions {
	/** HTTP method. Defaults to `GET`. */
	method?: string;
	/** Absolute URL, or a path to be joined onto `baseUrl`. */
	url: string;
	/** Optional base URL prepended to `url` when `url` is a path. */
	baseUrl?: string;
	/** Query parameters; `null`/`undefined` values are skipped. */
	params?: Record<string, unknown>;
	/** Request headers. Caller-provided values win over inferred defaults. */
	headers?: Record<string, string>;
	/**
	 * Request body. An object is JSON-stringified (with a JSON content-type when
	 * none is set); a `URLSearchParams` is form-encoded; strings/`Buffer` are sent
	 * as-is; `FormData`/`Blob` are handed to fetch untouched so it can set the
	 * multipart boundary. `undefined` sends no body.
	 */
	body?: unknown;
	/** Abort the request after this many milliseconds. */
	timeoutMs?: number;
	/** Decoding for the success body. Defaults to `json`. */
	responseType?: ResponseType;
	/**
	 * For `arraybuffer` bodies: stop reading once the body is known to exceed this many
	 * bytes. The returned buffer is then empty (a larger `content-length`) or truncated just
	 * past the limit, so the caller can reject it without buffering the whole file.
	 */
	maxBytes?: number;
}

/**
 * Normalized successful response. `headers` keys are lowercased so callers can
 * read them case-insensitively (the same guarantee axios gave).
 */
export interface HttpResponse<T> {
	data: T;
	status: number;
	statusText: string;
	headers: Record<string, string>;
}

/**
 * Reads the eBay REST (`errors[].longMessage`) or OAuth (`error_description`)
 * detail from a completed error body.
 *
 * @param body - Parsed error body from a completed HTTP response.
 * @param fallback - Message used when the body has no string detail.
 * @returns The extracted detail, or `fallback`.
 */
export function readHttpFailureMessage(
	body: unknown,
	fallback: string,
): string {
	if (!isRecord(body)) {
		return fallback;
	}

	const description = body["error_description"];

	if (typeof description === "string") {
		return description;
	}

	const errors = body["errors"];

	if (!Array.isArray(errors)) {
		return fallback;
	}

	const firstError = errors[0];

	if (!isRecord(firstError)) {
		return fallback;
	}

	const longMessage = firstError["longMessage"];

	if (typeof longMessage === "string") {
		return longMessage;
	}

	const shortMessage = firstError["message"];

	if (typeof shortMessage === "string") {
		return shortMessage;
	}

	return fallback;
}

/**
 * Returns the thrown error message. HTTP details are already on that message.
 *
 * @param error - Unknown thrown value to describe.
 * @param fallback - Message to use when `error` is not an Error.
 * @returns Human-readable error detail.
 */
export function describeHttpError(
	error: unknown,
	fallback = "Unknown error",
): string {
	return getErrorMessage(error, fallback);
}

/** Coerce a query-param value to a string without producing `[object Object]`. */
const stringifyParam = (param: unknown): string => {
	if (typeof param === "string") {
		return param;
	}
	if (
		typeof param === "number" ||
		typeof param === "boolean" ||
		typeof param === "bigint"
	) {
		return String(param);
	}
	return JSON.stringify(param);
};

/** Build the final request URL, appending serialized query params. */
const buildUrl = (
	url: string,
	baseUrl?: string,
	params?: Record<string, unknown>,
): string => {
	let full = baseUrl
		? `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`
		: url;

	if (params) {
		const search = new URLSearchParams();
		for (const [name, param] of Object.entries(params)) {
			if (param == null) {
				continue;
			}
			const entries = Array.isArray(param) ? param : [param];
			for (const entry of entries) {
				search.append(name, stringifyParam(entry));
			}
		}
		const query = search.toString();
		if (query) {
			full += (full.includes("?") ? "&" : "?") + query;
		}
	}

	return full;
};

/** Result of {@link prepareBody}: the wire body plus any content-type to infer. */
interface PreparedBody {
	body: BodyInit | undefined;
	contentType?: string;
}

/** Serialize the request body and infer a content-type when the caller omitted one. */
const prepareBody = (requestBody: unknown): PreparedBody => {
	if (requestBody == null) {
		return { body: undefined };
	}
	if (typeof requestBody === "string") {
		return { body: requestBody };
	}
	if (requestBody instanceof URLSearchParams) {
		return {
			body: requestBody.toString(),
			contentType: "application/x-www-form-urlencoded",
		};
	}
	if (requestBody instanceof Uint8Array || requestBody instanceof ArrayBuffer) {
		return { body: requestBody as BodyInit };
	}
	if (requestBody instanceof FormData || requestBody instanceof Blob) {
		// fetch derives the content-type itself (multipart boundary / blob type).
		return { body: requestBody };
	}
	return { body: JSON.stringify(requestBody), contentType: "application/json" };
};

/** Lowercase response header names into a plain record for case-insensitive reads. */
const collectHeaders = (response: Response): Record<string, string> => {
	const headers: Record<string, string> = {};
	response.headers.forEach((headerValue, headerName) => {
		headers[headerName.toLowerCase()] = headerValue;
	});
	return headers;
};

/** Read a binary body, stopping as soon as it is known to exceed `maxBytes`. */
const readCappedBody = async (
	response: Response,
	maxBytes: number,
): Promise<Buffer> => {
	const chunks: Uint8Array[] = [];
	let size = 0;
	if (Number(response.headers.get("content-length")) > maxBytes) {
		await response.body?.cancel();
		return Buffer.alloc(0);
	}
	for await (const chunk of response.body ?? []) {
		chunks.push(chunk);
		size += chunk.byteLength;
		if (size > maxBytes) {
			break;
		}
	}
	return Buffer.concat(chunks, size);
};

/** Decode a successful body per `responseType`, treating an empty body as `undefined`. */
const decodeBody = async <T>(
	response: Response,
	responseType: ResponseType,
	maxBytes?: number,
): Promise<T> => {
	if (responseType === "arraybuffer") {
		return (
			maxBytes === undefined
				? Buffer.from(await response.arrayBuffer())
				: await readCappedBody(response, maxBytes)
		) as T;
	}
	const text = await response.text();
	if (responseType === "text") {
		return text as T;
	}
	// JSON: an empty body (e.g. 204 No Content) is not valid JSON — return undefined.
	return (text ? JSON.parse(text) : undefined) as T;
};

/** Parse an error body as JSON when possible, otherwise keep the raw text. */
const parseErrorData = (text: string): unknown => {
	if (!text) {
		return;
	}
	try {
		return JSON.parse(text) as unknown;
	} catch {
		return text;
	}
};

/**
 * Abort handle covering one request *and* the read of its body.
 *
 * `fetch` resolves as soon as the response headers arrive, so a deadline that
 * stops there leaves `response.text()` free to stall forever on a body that never
 * finishes arriving. The same controller therefore stays armed until the body
 * has been decoded.
 */
interface RequestDeadline {
	/** Signal passed to `fetch`; aborts the response stream too. */
	readonly signal: AbortSignal;
	/** Whether our own timer aborted this request. */
	readonly expired: () => boolean;
	/** Disarm the timer; safe to call more than once. */
	readonly clear: () => void;
}

/** Arm a {@link RequestDeadline}; without `timeoutMs` the request is never aborted. */
const startDeadline = (timeoutMs?: number): RequestDeadline => {
	const controller = new AbortController();
	let expired = false;
	const timer = timeoutMs
		? setTimeout(() => {
				expired = true;
				controller.abort();
			}, timeoutMs)
		: undefined;

	return {
		signal: controller.signal,
		expired: () => expired,
		clear: () => {
			if (timer) {
				clearTimeout(timer);
			}
		},
	};
};

export async function httpRequestEffect<T = unknown>(
	options: HttpRequestOptions,
): Promise<HttpResponse<T>> {
	const { method = "GET", responseType = "json", timeoutMs } = options;
	const url = buildUrl(options.url, options.baseUrl, options.params);
	const { body: wireBody, contentType } = prepareBody(options.body);

	const headers: Record<string, string> = { ...options.headers };
	const hasContentType = Object.keys(headers).some(
		(key) => key.toLowerCase() === "content-type",
	);

	if (contentType && !hasContentType) {
		headers["Content-Type"] = contentType;
	}

	const deadline = startDeadline(timeoutMs);

	function failure(error: unknown, stage: string): Error {
		const timedOut = deadline.expired();

		if (timedOut) {
			return new Error(
				`Request to ${url} timed out after ${timeoutMs}ms reading the ${stage}`,
				{ cause: error },
			);
		}

		return new Error(getErrorMessage(error, `Request to ${url} failed`), {
			cause: error,
		});
	}

	try {
		let response: Response;

		try {
			response = await fetch(url, {
				method,
				headers,
				body: wireBody ?? null,
				signal: deadline.signal,
			});
		} catch (error) {
			throw failure(error, "response headers");
		}

		const responseHeaders = collectHeaders(response);
		const isFailedStatus = !response.ok;

		if (isFailedStatus) {
			let errorText: string;

			try {
				errorText = await response.text();
			} catch (error) {
				throw failure(error, "error body");
			}

			const errorBody = parseErrorData(errorText);

			return {
				data: errorBody as T,
				status: response.status,
				statusText: response.statusText,
				headers: responseHeaders,
			};
		}

		let decodedBody: T;

		try {
			decodedBody = await decodeBody<T>(
				response,
				responseType,
				options.maxBytes,
			);
		} catch (error) {
			throw failure(error, "response body");
		}

		return {
			data: decodedBody,
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
		};
	} finally {
		deadline.clear();
	}
}

export async function httpRequest<T = unknown>(
	options: HttpRequestOptions,
): Promise<HttpResponse<T>> {
	const response = await httpRequestEffect<T>(options);
	const status = response.status;
	const isSuccess = status >= 200 && status <= 299;

	if (isSuccess) {
		return response;
	}

	const url = buildUrl(options.url, options.baseUrl, options.params);

	throw new Error(
		readHttpFailureMessage(
			response.data,
			`Request to ${url} failed with status ${status}`,
		),
	);
}
