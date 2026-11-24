import type { z } from "zod";
import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import { formatZodIssues } from "@/shared/zodIssues.js";

export type QueryParams = Record<string, string | number>;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface EndpointParamSpec {
	readonly wireName: string;
	readonly value: string | number | undefined;
}

export function decodeEndpointInputEffect<Schema extends z.ZodTypeAny>(
	schema: Schema,
	input: unknown,
): z.infer<Schema> {
	const parsedInput = schema.safeParse(input);

	if (parsedInput.success) {
		return parsedInput.data;
	}

	throw new Error(formatZodIssues(parsedInput.error));
}

export function marketplaceHeader(marketplaceId: string): EbayRequestConfig {
	return {
		headers: { "X-EBAY-C-MARKETPLACE-ID": marketplaceId },
	};
}

export function buildEndpointParams(
	params: Record<string, EndpointParamSpec>,
): QueryParams | undefined {
	const query: QueryParams = {};

	for (const param of Object.values(params)) {
		const paramValue = param.value;

		if (paramValue === undefined) {
			continue;
		}

		if (paramValue === "") {
			continue;
		}

		query[param.wireName] = paramValue;
	}

	const hasQuery = Object.keys(query).length > 0;

	if (hasQuery) {
		return query;
	}

	return undefined;
}

export function requireStringEffect(value: unknown, name: string): string {
	if (typeof value !== "string") {
		throw new Error(`${name} is required and must be a string`);
	}

	if (value.length === 0) {
		throw new Error(`${name} is required and must be a string`);
	}

	return value;
}

export function optionalStringEffect(
	value: unknown,
	name: string,
): string | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value !== "string") {
		throw new Error(`${name} must be a string when provided`);
	}

	return value;
}

export function optionalPositiveNumberEffect(
	value: unknown,
	name: string,
): number | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value !== "number") {
		throw new Error(`${name} must be a positive number when provided`);
	}

	if (value < 1) {
		throw new Error(`${name} must be a positive number when provided`);
	}

	return value;
}

export function optionalNonNegativeNumberEffect(
	value: unknown,
	name: string,
): number | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value !== "number") {
		throw new Error(`${name} must be a non-negative number when provided`);
	}

	if (value < 0) {
		throw new Error(`${name} must be a non-negative number when provided`);
	}

	return value;
}

export function requireObjectEffect<ObjectShape extends object>(
	value: unknown,
	name: string,
): ObjectShape {
	if (typeof value !== "object") {
		throw new Error(`${name} is required and must be an object`);
	}

	if (value === null) {
		throw new Error(`${name} is required and must be an object`);
	}

	return value as ObjectShape;
}

export function createEbayRequestFailure(
	method: HttpMethod,
	path: string,
	cause: unknown,
): Error {
	const detail = cause instanceof Error ? cause.message : String(cause);

	return new Error(`eBay ${method} ${path} failed: ${detail}`, { cause });
}

async function requestWithEbayError<Response>(
	method: HttpMethod,
	path: string,
	send: () => Promise<Response>,
): Promise<Response> {
	try {
		return await send();
	} catch (cause) {
		throw createEbayRequestFailure(method, path, cause);
	}
}

export function requestGetEffect<Response = unknown>(
	client: EbayApiClient,
	path: string,
	params?: QueryParams,
	config?: EbayRequestConfig,
): Promise<Response> {
	return requestWithEbayError("GET", path, function sendGet() {
		if (config !== undefined) {
			return client.get<Response>(path, params, config);
		}

		if (params === undefined) {
			return client.get<Response>(path);
		}

		return client.get<Response>(path, params);
	});
}

export function requestPostEffect<Response = unknown>(
	client: EbayApiClient,
	path: string,
	requestBody?: unknown,
	config?: EbayRequestConfig,
): Promise<Response> {
	return requestWithEbayError("POST", path, function sendPost() {
		if (config !== undefined) {
			return client.post<Response>(path, requestBody, config);
		}

		if (requestBody === undefined) {
			return client.post<Response>(path);
		}

		return client.post<Response>(path, requestBody);
	});
}

export function requestPutEffect<Response = unknown>(
	client: EbayApiClient,
	path: string,
	requestBody?: unknown,
	config?: EbayRequestConfig,
): Promise<Response> {
	return requestWithEbayError("PUT", path, function sendPut() {
		if (config === undefined) {
			return client.put<Response>(path, requestBody);
		}

		return client.put<Response>(path, requestBody, config);
	});
}

export function requestPatchEffect<Response = unknown>(
	client: EbayApiClient,
	path: string,
	requestBody?: unknown,
	config?: EbayRequestConfig,
): Promise<Response> {
	return requestWithEbayError("PATCH", path, function sendPatch() {
		if (config === undefined) {
			return client.patch<Response>(path, requestBody);
		}

		return client.patch<Response>(path, requestBody, config);
	});
}

export function requestDeleteEffect<Response = unknown>(
	client: EbayApiClient,
	path: string,
): Promise<Response> {
	return requestWithEbayError("DELETE", path, function sendDelete() {
		return client.delete<Response>(path);
	});
}
