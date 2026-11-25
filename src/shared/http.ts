import { getErrorMessage } from "@/shared/errors.js";
import { isRecord } from "@/shared/typeGuards.js";

export type ResponseType = "json" | "text" | "arraybuffer";

export interface HttpRequestOptions {
	method?: string;
	url: string;
	baseUrl?: string;
	params?: Record<string, unknown>;
	headers?: Record<string, string>;
	body?: unknown;
	timeoutMs?: number;
	responseType?: ResponseType;
	maxBytes?: number;
}

export interface HttpResponse<T> {
	data: T;
	status: number;
	statusText: string;
	headers: Record<string, string>;
}

export function readHttpFailureMessage(
	body: unknown,
	fallback: string,
): string {
	if (!isRecord(body)) {
		return fallback;
	}

	const description = body["error_description"];

	if (typeof description == "string") {
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

	if (typeof longMessage == "string") {
		return longMessage;
	}

	const shortMessage = firstError["message"];

	if (typeof shortMessage == "string") {
		return shortMessage;
	}

	return fallback;
}

export function describeHttpError(
	error: unknown,
	fallback = "Unknown error",
): string {
	return getErrorMessage(error, fallback);
}

function stringifyParam(param: unknown): string {
	const isString = typeof param == "string";

	if (isString) {
		return param;
	}

	const isNumber = typeof param == "number";

	if (isNumber) {
		return String(param);
	}

	const isBoolean = typeof param == "boolean";

	if (isBoolean) {
		return String(param);
	}

	const isBigint = typeof param == "bigint";

	if (isBigint) {
		return String(param);
	}

	return JSON.stringify(param);
}

function buildUrl(
	url: string,
	baseUrl?: string,
	params?: Record<string, unknown>,
): string {
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
}

interface PreparedBody {
	body: BodyInit | undefined;
	contentType?: string;
}

function prepareBody(requestBody: unknown): PreparedBody {
	if (requestBody == null) {
		return { body: undefined };
	}
	if (typeof requestBody == "string") {
		return { body: requestBody };
	}
	if (requestBody instanceof URLSearchParams) {
		return {
			body: requestBody.toString(),
			contentType: "application/x-www-form-urlencoded",
		};
	}

	const isBytes = requestBody instanceof Uint8Array;

	if (isBytes) {
		return { body: requestBody as BodyInit };
	}

	const isArrayBuffer = requestBody instanceof ArrayBuffer;

	if (isArrayBuffer) {
		return { body: requestBody as BodyInit };
	}

	// fetch derives the content-type itself (multipart boundary / blob type).
	const isFormData = requestBody instanceof FormData;

	if (isFormData) {
		return { body: requestBody };
	}

	const isBlob = requestBody instanceof Blob;

	if (isBlob) {
		return { body: requestBody };
	}

	return { body: JSON.stringify(requestBody), contentType: "application/json" };
}

function collectHeaders(response: Response): Record<string, string> {
	const headers: Record<string, string> = {};
	response.headers.forEach((headerValue, headerName) => {
		headers[headerName.toLowerCase()] = headerValue;
	});
	return headers;
}

async function readCappedBody(
	response: Response,
	maxBytes: number,
): Promise<Buffer> {
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
}

async function decodeBody<T>(
	response: Response,
	responseType: ResponseType,
	maxBytes?: number,
): Promise<T> {
	if (responseType == "arraybuffer") {
		return (
			maxBytes === undefined
				? Buffer.from(await response.arrayBuffer())
				: await readCappedBody(response, maxBytes)
		) as T;
	}
	const text = await response.text();
	if (responseType == "text") {
		return text as T;
	}
	// JSON: an empty body (e.g. 204 No Content) is not valid JSON — return undefined.
	return (text ? JSON.parse(text) : undefined) as T;
}

function parseErrorData(text: string): unknown {
	if (!text) {
		return;
	}
	try {
		return JSON.parse(text) as unknown;
	} catch {
		return text;
	}
}

interface RequestDeadline {
	readonly signal: AbortSignal;
	readonly expired: () => boolean;
	readonly clear: () => void;
}

function startDeadline(timeoutMs?: number): RequestDeadline {
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
}

function pickContentType(
	contentType: string | undefined,
	hasContentType: boolean,
): string | undefined {
	const isMissing = contentType == null;

	if (isMissing) {
		return undefined;
	}

	const isEmpty = contentType == "";

	if (isEmpty) {
		return undefined;
	}

	const isAlreadySet = hasContentType;

	if (isAlreadySet) {
		return undefined;
	}

	return contentType;
}

function isSuccessStatus(status: number): boolean {
	const isBelowSuccess = status < 200;

	if (isBelowSuccess) {
		return false;
	}

	const isAboveSuccess = status > 299;

	if (isAboveSuccess) {
		return false;
	}

	return true;
}

export async function httpRequestEffect<T = unknown>(
	options: HttpRequestOptions,
): Promise<HttpResponse<T>> {
	const { method = "GET", responseType = "json", timeoutMs } = options;
	const url = buildUrl(options.url, options.baseUrl, options.params);
	const { body: wireBody, contentType } = prepareBody(options.body);

	const headers: Record<string, string> = { ...options.headers };
	const hasContentType = Object.keys(headers).some(
		(key) => key.toLowerCase() == "content-type",
	);

	const preparedType = pickContentType(contentType, hasContentType);
	const shouldAddType = preparedType != null;

	if (shouldAddType) {
		headers["Content-Type"] = preparedType;
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
	const isSuccess = isSuccessStatus(status);

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
