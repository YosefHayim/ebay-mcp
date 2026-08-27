import type { EbayApiClient, EbayRequestConfig } from '@/api/client.js';
import { Data, Effect } from 'effect';

/**
 * Query-string values accepted by the eBay REST client helpers.
 */
export type QueryParams = Record<string, string | number>;

/** HTTP methods supported by the shared eBay REST request helpers. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** One endpoint-owned query parameter allowed by {@link buildEndpointParams}. */
export interface EndpointParamSpec {
  /** Query-string key expected by eBay, usually snake_case from the OpenAPI spec. */
  readonly wireName: string;
  /** Already-typed local value; undefined and empty strings are omitted. */
  readonly value: string | number | undefined;
}

/** Tagged failure returned by migrated eBay API endpoint Effects. */
export class EbayApiError extends Data.TaggedError('EbayApiError')<{
  /** HTTP method used by the failed eBay request. */
  readonly method: HttpMethod;
  /** eBay REST path passed to the request adapter. */
  readonly path: string;
  /** Lower-level transport, parsing, or adapter failure. */
  readonly cause: unknown;
}> {
  override get message(): string {
    const detail = this.cause instanceof Error ? this.cause.message : String(this.cause);
    return `eBay ${this.method} ${this.path} failed: ${detail}`;
  }
}

/** Tagged validation failure returned before an endpoint request is sent. */
export class EndpointInputError extends Data.TaggedError('EndpointInputError')<{
  /** Endpoint parameter that failed validation. */
  readonly parameter: string;
  /** Human-readable validation failure message. */
  readonly message: string;
}> {}

/**
 * Builds query params from an endpoint-owned allow-list.
 *
 * @param params - Camel-case local parameter names mapped to their eBay wire names and values.
 * @returns A query object for the request adapter, or undefined when every value is omitted.
 *
 * @example
 * ```ts
 * const params = buildEndpointParams({
 *   policyTypes: { wireName: 'policy_types', value: input.policyTypes },
 * });
 * ```
 */
export const buildEndpointParams = (
  params: Record<string, EndpointParamSpec>,
): QueryParams | undefined => {
  const query: QueryParams = {};

  for (const param of Object.values(params)) {
    if (param.value !== undefined && param.value !== '') {
      query[param.wireName] = param.value;
    }
  }

  return Object.keys(query).length > 0 ? query : undefined;
};

/**
 * Require a tool argument or API field to be a non-empty string inside Effect code.
 *
 * @param value - Unknown value supplied by a caller or transport boundary.
 * @param name - Parameter name used in the validation message.
 * @returns An Effect that succeeds with the string or fails with a tagged input error.
 *
 * @example
 * ```ts
 * const signingKeyId = yield* requireStringEffect(input.signingKeyId, 'signingKeyId');
 * ```
 */
export const requireStringEffect = (
  value: unknown,
  name: string,
): Effect.Effect<string, EndpointInputError> => {
  if (!value || typeof value !== 'string') {
    return Effect.fail(
      new EndpointInputError({
        parameter: name,
        message: `${name} is required and must be a string`,
      }),
    );
  }

  return Effect.succeed(value);
};

/**
 * Validate an optional string inside Effect code.
 *
 * @param value - Optional value supplied for an endpoint query parameter.
 * @param name - Parameter name used in the validation message.
 * @returns An Effect that succeeds with the string, undefined, or a tagged input error.
 *
 * @example
 * ```ts
 * const sort = yield* optionalStringEffect(input.sort, 'sort');
 * ```
 */
export const optionalStringEffect = (
  value: unknown,
  name: string,
): Effect.Effect<string | undefined, EndpointInputError> => {
  if (value === undefined) {
    return Effect.succeed(undefined);
  }

  if (typeof value !== 'string') {
    return Effect.fail(
      new EndpointInputError({
        parameter: name,
        message: `${name} must be a string when provided`,
      }),
    );
  }

  return Effect.succeed(value);
};

/**
 * Validate an optional positive numeric query parameter inside Effect code.
 *
 * @param value - Optional value supplied for an endpoint query parameter.
 * @param name - Parameter name used in the validation message.
 * @returns An Effect that succeeds with the number, undefined, or a tagged input error.
 *
 * @example
 * ```ts
 * const limit = yield* optionalPositiveNumberEffect(input.limit, 'limit');
 * ```
 */
export const optionalPositiveNumberEffect = (
  value: unknown,
  name: string,
): Effect.Effect<number | undefined, EndpointInputError> => {
  if (value === undefined) {
    return Effect.succeed(undefined);
  }

  if (typeof value !== 'number' || value < 1) {
    return Effect.fail(
      new EndpointInputError({
        parameter: name,
        message: `${name} must be a positive number when provided`,
      }),
    );
  }

  return Effect.succeed(value);
};

/**
 * Validate an optional non-negative numeric query parameter inside Effect code.
 *
 * @param value - Optional value supplied for an endpoint query parameter.
 * @param name - Parameter name used in the validation message.
 * @returns An Effect that succeeds with the number, undefined, or a tagged input error.
 *
 * @example
 * ```ts
 * const offset = yield* optionalNonNegativeNumberEffect(input.offset, 'offset');
 * ```
 */
export const optionalNonNegativeNumberEffect = (
  value: unknown,
  name: string,
): Effect.Effect<number | undefined, EndpointInputError> => {
  if (value === undefined) {
    return Effect.succeed(undefined);
  }

  if (typeof value !== 'number' || value < 0) {
    return Effect.fail(
      new EndpointInputError({
        parameter: name,
        message: `${name} must be a non-negative number when provided`,
      }),
    );
  }

  return Effect.succeed(value);
};

/**
 * Require a tool argument or API payload field to be an object inside Effect code.
 *
 * @param value - Unknown value supplied by a caller or transport boundary.
 * @param name - Parameter name used in the validation message.
 * @returns An Effect that succeeds with the expected object shape or fails with a tagged input error.
 *
 * @example
 * ```ts
 * const request = yield* requireObjectEffect<CreateOffersRequest>(body, 'offerData');
 * ```
 */
export const requireObjectEffect = <T extends object>(
  value: unknown,
  name: string,
): Effect.Effect<T, EndpointInputError> => {
  if (!value || typeof value !== 'object') {
    return Effect.fail(
      new EndpointInputError({
        parameter: name,
        message: `${name} is required and must be an object`,
      }),
    );
  }

  return Effect.succeed(value as T);
};

/**
 * Execute a GET request as an Effect with typed eBay API errors.
 *
 * @param client - eBay REST client that owns auth and transport details.
 * @param path - eBay REST path to request.
 * @param params - Optional query parameters already mapped to eBay wire names.
 * @param config - Optional per-request headers or params, used for endpoint-specific headers.
 * @returns An Effect that succeeds with the generated eBay response DTO.
 *
 * @example
 * ```ts
 * const response = await Effect.runPromise(requestGetEffect(client, path, params));
 * ```
 */
export const requestGetEffect = <T = unknown>(
  client: EbayApiClient,
  path: string,
  params?: QueryParams,
  config?: EbayRequestConfig,
): Effect.Effect<T, EbayApiError> =>
  Effect.tryPromise({
    try: () => {
      if (config !== undefined) {
        return client.get<T>(path, params, config);
      }

      return params === undefined ? client.get<T>(path) : client.get<T>(path, params);
    },
    catch: (cause) => new EbayApiError({ method: 'GET', path, cause }),
  });

/**
 * Execute a POST request as an Effect with typed eBay API errors.
 *
 * @param client - eBay REST client that owns auth and transport details.
 * @param path - eBay REST path to request.
 * @param body - Optional JSON body to send.
 * @param config - Optional per-request headers or params, used for endpoint-specific headers.
 * @returns An Effect that succeeds with the generated eBay response DTO.
 *
 * @example
 * ```ts
 * const response = await Effect.runPromise(requestPostEffect(client, path, body));
 * ```
 */
export const requestPostEffect = <T = unknown>(
  client: EbayApiClient,
  path: string,
  body?: unknown,
  config?: EbayRequestConfig,
): Effect.Effect<T, EbayApiError> =>
  Effect.tryPromise({
    try: () => {
      if (config !== undefined) {
        return client.post<T>(path, body, config);
      }

      return body === undefined ? client.post<T>(path) : client.post<T>(path, body);
    },
    catch: (cause) => new EbayApiError({ method: 'POST', path, cause }),
  });

/**
 * Execute a PUT request as an Effect with typed eBay API errors.
 *
 * @param client - eBay REST client that owns auth and transport details.
 * @param path - eBay REST path to request.
 * @param body - Optional JSON body to send.
 * @returns An Effect that succeeds with the generated eBay response DTO.
 *
 * @example
 * ```ts
 * const response = await Effect.runPromise(requestPutEffect(client, path, body));
 * ```
 */
export const requestPutEffect = <T = unknown>(
  client: EbayApiClient,
  path: string,
  body?: unknown,
  config?: EbayRequestConfig,
): Effect.Effect<T, EbayApiError> =>
  Effect.tryPromise({
    try: () =>
      config === undefined ? client.put<T>(path, body) : client.put<T>(path, body, config),
    catch: (cause) => new EbayApiError({ method: 'PUT', path, cause }),
  });

/**
 * Execute a DELETE request as an Effect with typed eBay API errors.
 *
 * @param client - eBay REST client that owns auth and transport details.
 * @param path - eBay REST path to request.
 * @returns An Effect that succeeds with the generated eBay response DTO.
 *
 * @example
 * ```ts
 * await Effect.runPromise(requestDeleteEffect(client, path));
 * ```
 */
export const requestDeleteEffect = <T = unknown>(
  client: EbayApiClient,
  path: string,
): Effect.Effect<T, EbayApiError> =>
  Effect.tryPromise({
    try: () => client.delete<T>(path),
    catch: (cause) => new EbayApiError({ method: 'DELETE', path, cause }),
  });
