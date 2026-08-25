/**
 * Minimal HTTP client built on the native `fetch` API (Node ≥ 18).
 *
 * Why this exists: the project previously used axios. axios drags in transitive
 * dependencies (`follow-redirects`, `form-data`, `proxy-from-env`) and hides
 * request/response handling behind interceptors. Native `fetch` covers every
 * use case here with zero dependencies, but it has sharp edges this module
 * centralizes so call sites never repeat them:
 *
 *  1. `fetch` does NOT reject on 4xx/5xx — we throw {@link HttpError} on `!res.ok`.
 *  2. `fetch` does NOT parse JSON — and `res.json()` throws on an empty (204) body.
 *  3. Timeouts need an `AbortController`.
 *  4. Query params need explicit `URLSearchParams` serialization.
 *  5. Error narrowing replaces `axios.isAxiosError` with {@link isHttpError}.
 *
 * Keeping these in one place is the single source of truth that lets the rest of
 * the codebase treat HTTP like the old axios calls without the dependency.
 */

import { getErrorMessage } from '@/utils/errors.js';
import { isRecord } from '@/utils/typeGuards.js';
import { Cause, Data, Effect, Exit, Option } from 'effect';

/** How to decode a successful response body. Defaults to `json`. */
export type ResponseType = 'json' | 'text' | 'arraybuffer';

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
 * Tagged failure for any non-2xx response, network failure, or timeout. Carries the
 * parsed error body and response headers so callers can react to eBay error
 * shapes, `retry-after`, and rate-limit headers.
 *
 * `status` is `undefined` for network/timeout failures (no response received).
 */
export class HttpError extends Data.TaggedError('HttpError')<{
  /** Human-readable failure detail. */
  readonly message: string;
  /** Failed request URL. */
  readonly url: string;
  /** HTTP status for response failures; absent for network/timeout failures. */
  readonly status?: number;
  /** HTTP status text for response failures. */
  readonly statusText?: string;
  /** Parsed response body (JSON when decodable, otherwise the raw text). */
  readonly data?: unknown;
  /** Lowercased response headers, empty for network/timeout failures. */
  readonly headers: Record<string, string>;
  /** True when the failure was our own timeout aborting the request. */
  readonly isTimeout: boolean;
}> {
  constructor(
    message: string,
    init: {
      url: string;
      status?: number;
      statusText?: string;
      data?: unknown;
      headers?: Record<string, string>;
      isTimeout?: boolean;
    },
  ) {
    super({
      message,
      url: init.url,
      ...(init.status === undefined ? {} : { status: init.status }),
      ...(init.statusText === undefined ? {} : { statusText: init.statusText }),
      ...(init.data === undefined ? {} : { data: init.data }),
      headers: init.headers ?? {},
      isTimeout: init.isTimeout ?? false,
    });
  }
}

/**
 * Type guard replacing `axios.isAxiosError`.
 *
 * @param error - Unknown thrown value to inspect.
 * @returns True when the value is this module's {@link HttpError}.
 *
 * @example
 * ```ts
 * if (isHttpError(error)) return error.status;
 * ```
 */
export const isHttpError = (error: unknown): error is HttpError => error instanceof HttpError;

/**
 * Extract a human-readable message from an error, understanding both the eBay
 * REST error shape (`errors[].longMessage`) and the OAuth error shape
 * (`error_description`). Falls back to the error message, then `fallback`.
 *
 * @param error - Unknown thrown value to describe.
 * @param fallback - Message to use when no structured message is available.
 * @returns Human-readable error detail.
 *
 * @example
 * ```ts
 * const message = describeHttpError(error, 'Request failed');
 * ```
 */
export const describeHttpError = (error: unknown, fallback = 'Unknown error'): string => {
  if (isHttpError(error)) {
    const { data } = error;
    if (isRecord(data)) {
      if (typeof data.error_description === 'string') {
        return data.error_description;
      }
      const firstError = Array.isArray(data.errors) ? data.errors[0] : undefined;
      if (isRecord(firstError)) {
        const detail = firstError.longMessage ?? firstError.message;
        if (typeof detail === 'string') {
          return detail;
        }
      }
    }
    return error.message || fallback;
  }
  return getErrorMessage(error, fallback);
};

/** Coerce a query-param value to a string without producing `[object Object]`. */
const stringifyParam = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  return JSON.stringify(value);
};

/** Build the final request URL, appending serialized query params. */
const buildUrl = (url: string, baseUrl?: string, params?: Record<string, unknown>): string => {
  let full = baseUrl ? `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}` : url;

  if (params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value == null) {
        continue;
      }
      const entries = Array.isArray(value) ? value : [value];
      for (const entry of entries) {
        search.append(key, stringifyParam(entry));
      }
    }
    const query = search.toString();
    if (query) {
      full += (full.includes('?') ? '&' : '?') + query;
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
const prepareBody = (body: unknown): PreparedBody => {
  if (body == null) {
    return { body: undefined };
  }
  if (typeof body === 'string') {
    return { body };
  }
  if (body instanceof URLSearchParams) {
    return { body: body.toString(), contentType: 'application/x-www-form-urlencoded' };
  }
  if (body instanceof Uint8Array || body instanceof ArrayBuffer) {
    return { body: body as BodyInit };
  }
  if (body instanceof FormData || body instanceof Blob) {
    // fetch derives the content-type itself (multipart boundary / blob type).
    return { body };
  }
  return { body: JSON.stringify(body), contentType: 'application/json' };
};

/** Lowercase response header names into a plain record for case-insensitive reads. */
const collectHeaders = (response: Response): Record<string, string> => {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });
  return headers;
};

/** Decode a successful body per `responseType`, treating an empty body as `undefined`. */
const decodeBody = async <T>(response: Response, responseType: ResponseType): Promise<T> => {
  if (responseType === 'arraybuffer') {
    return Buffer.from(await response.arrayBuffer()) as T;
  }
  const text = await response.text();
  if (responseType === 'text') {
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
  return Effect.runSync(
    Effect.try({
      try: () => JSON.parse(text) as unknown,
      catch: () => text,
    }).pipe(Effect.catchAll((rawText) => Effect.succeed(rawText))),
  );
};

/** Run native fetch with timeout handling and normalized transport failures. */
const fetchWithTimeout = (
  url: string,
  init: RequestInit,
  timeoutMs?: number,
): Effect.Effect<Response, HttpError> => {
  const controller = new AbortController();
  let timedOut = false;
  const timer = timeoutMs
    ? setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs)
    : undefined;

  return Effect.tryPromise({
    try: () => fetch(url, { ...init, signal: controller.signal }),
    catch: (error) => {
      if (timedOut) {
        return new HttpError(`Request to ${url} timed out after ${timeoutMs}ms`, {
          url,
          isTimeout: true,
        });
      }
      return new HttpError(getErrorMessage(error, `Request to ${url} failed`), { url });
    },
  }).pipe(
    Effect.ensuring(
      Effect.sync(() => {
        if (timer) {
          clearTimeout(timer);
        }
      }),
    ),
  );
};

/**
 * Builds an HTTP request Effect with timeout, query/body serialization, and uniform
 * error semantics. Succeeds on 2xx; fails with {@link HttpError} otherwise (and
 * on network/timeout failures).
 *
 * @typeParam T - Shape of the decoded success body.
 * @param options - Fetch-native request options plus timeout and response decoding settings.
 * @returns Effect that succeeds with status, lowercased headers, and decoded response body.
 *
 * @example
 * ```ts
 * const response = await Effect.runPromise(httpRequestEffect<{ id: string }>({ url }));
 * ```
 */
export const httpRequestEffect = <T = unknown>(
  options: HttpRequestOptions,
): Effect.Effect<HttpResponse<T>, HttpError> => {
  const { method = 'GET', responseType = 'json', timeoutMs } = options;
  const url = buildUrl(options.url, options.baseUrl, options.params);
  const { body, contentType } = prepareBody(options.body);

  const headers: Record<string, string> = { ...options.headers };
  if (contentType && !Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = contentType;
  }

  return Effect.gen(function* () {
    const response = yield* fetchWithTimeout(url, { method, headers, body }, timeoutMs);
    const responseHeaders = collectHeaders(response);

    if (!response.ok) {
      const errorText = yield* Effect.tryPromise({
        try: () => response.text(),
        catch: (error) =>
          new HttpError(getErrorMessage(error, `Request to ${url} failed`), {
            url,
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
          }),
      });
      const data = parseErrorData(errorText);
      return yield* Effect.fail(
        new HttpError(`Request to ${url} failed with status ${response.status}`, {
          url,
          status: response.status,
          statusText: response.statusText,
          data,
          headers: responseHeaders,
        }),
      );
    }

    const data = yield* Effect.tryPromise({
      try: () => decodeBody<T>(response, responseType),
      catch: (error) =>
        new HttpError(getErrorMessage(error, `Request to ${url} failed`), {
          url,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        }),
    });

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    };
  });
};

/**
 * Perform an HTTP request through {@link httpRequestEffect}.
 *
 * @typeParam T - Shape of the decoded success body.
 * @param options - Fetch-native request options plus timeout and response decoding settings.
 * @returns Status, lowercased headers, and decoded response body.
 *
 * @example
 * ```ts
 * const response = await httpRequest<{ id: string }>({ url: '/resource', baseUrl });
 * ```
 */
export const httpRequest = async <T = unknown>(
  options: HttpRequestOptions,
): Promise<HttpResponse<T>> => {
  const exit = await Effect.runPromiseExit(httpRequestEffect<T>(options));

  if (Exit.isSuccess(exit)) {
    return exit.value;
  }

  const failure = Cause.failureOption(exit.cause);
  if (Option.isSome(failure)) {
    throw failure.value;
  }

  throw new HttpError(Cause.pretty(exit.cause), { url: options.url });
};
