import { randomUUID } from 'node:crypto';
import XmlBuilder, { type XMLBuilder as XmlBuilderInstance } from 'fast-xml-builder';
import { XMLParser } from 'fast-xml-parser';
import type { EbayApiClient } from '@/api/client.js';
import { TradingApiFailure } from '@/api/clientTradingError.js';
import { EbayApiError } from '@/api/shared/request.js';
import { getBaseUrl, getTradingSiteId } from '@/config/environment.js';
import { getErrorMessage } from '@/utils/errors.js';
import { httpRequestEffect } from '@/utils/http.js';
import { apiLogger } from '@/utils/logger.js';
import { isRecord } from '@/utils/typeGuards.js';
import { Effect } from 'effect';

const COMPAT_LEVEL = '1451';
const TRADING_ENDPOINT_PATH = '/ws/api.dll';
const TRADING_XMLNS = 'urn:ebay:apis:eBLBaseComponents';

/** Context required to report a failed Trading API call. */
interface TradingFailureContext {
  /** Trading API call name, such as GetItem. */
  readonly callName: string;
  /** Absolute Trading API request URL. */
  readonly path: string;
}

/** Values required to create an authorized Trading API header set. */
interface TradingAuthContext extends TradingFailureContext {
  /** REST client that owns OAuth configuration for the seller account. */
  readonly restClient: EbayApiClient;
  /** Base Trading API headers before optional OAuth injection. */
  readonly headers: Record<string, string>;
}

/** Values required to send one Trading API XML request. */
interface TradingPostContext extends TradingFailureContext {
  /** Request headers sent to the Trading API endpoint. */
  readonly headers: Record<string, string>;
  /** XML request body. */
  readonly xmlBody: string;
}

/** Binary image attached to a multipart Trading API upload. */
export interface TradingUploadImage {
  /** Raw image bytes sent as the multipart binary part. */
  readonly data: Buffer;
  /** MIME type of the image, such as `image/jpeg`. */
  readonly contentType: string;
  /** File name reported in the multipart part's Content-Disposition. */
  readonly fileName: string;
}

/** Values required to send one multipart Trading API upload (XML payload + binary image). */
interface TradingMultipartContext extends TradingFailureContext {
  /** Request headers, including the multipart Content-Type and OAuth token. */
  readonly headers: Record<string, string>;
  /** XML request payload sent as the first multipart part. */
  readonly xmlBody: string;
  /** Binary image sent as the second multipart part. */
  readonly image: TradingUploadImage;
}

/** Values required to parse a Trading API XML response. */
interface TradingParseContext extends TradingFailureContext {
  /** XML parser configured for Trading API response shapes. */
  readonly parser: XMLParser;
  /** XML response body returned by the Trading API endpoint. */
  readonly responseText: string;
}

const buildTradingPath = (baseUrl: string): string => `${baseUrl}${TRADING_ENDPOINT_PATH}`;

const buildTradingHeaders = (callName: string): Record<string, string> => ({
  'X-EBAY-API-SITEID': getTradingSiteId(),
  'X-EBAY-API-COMPATIBILITY-LEVEL': COMPAT_LEVEL,
  'X-EBAY-API-CALL-NAME': callName,
  'Content-Type': 'text/xml',
});

const buildTradingXmlBody = (
  builder: XmlBuilderInstance,
  requestTag: string,
  params: Record<string, unknown>,
): string => {
  const xmlObject: Record<string, unknown> = {
    [requestTag]: {
      '@_xmlns': TRADING_XMLNS,
      ...params,
    },
  };

  return `<?xml version="1.0" encoding="utf-8"?>\n${builder.build(xmlObject)}`;
};

const createTradingApiError = (
  { callName, path }: TradingFailureContext,
  message: string,
  cause?: unknown,
): EbayApiError =>
  new EbayApiError({
    method: 'POST',
    path,
    cause: new TradingApiFailure({
      callName,
      path,
      message: `Trading API ${callName} ${message}`,
      ...(cause === undefined ? {} : { cause }),
    }),
  });

const authorizeTradingHeaders = ({
  restClient,
  headers,
  callName,
  path,
}: TradingAuthContext): Effect.Effect<Record<string, string>, EbayApiError> => {
  if (restClient.getConfig().disableAuthHeader) {
    return Effect.succeed(headers);
  }

  return restClient
    .getOAuthClient()
    .getAccessToken()
    .pipe(
      Effect.mapError((error) =>
        createTradingApiError(
          { callName, path },
          `token acquisition failed: ${getErrorMessage(error)}`,
        ),
      ),
      Effect.map((token) => ({ ...headers, 'X-EBAY-API-IAF-TOKEN': token })),
    );
};

const postTradingXml = ({
  path,
  headers,
  xmlBody,
  callName,
}: TradingPostContext): Effect.Effect<{ readonly data: string }, EbayApiError> =>
  httpRequestEffect<string>({
    method: 'POST',
    url: path,
    headers,
    body: xmlBody,
    timeoutMs: 30_000,
    responseType: 'text',
  }).pipe(
    Effect.mapError((error) =>
      createTradingApiError({ callName, path }, `request failed: ${getErrorMessage(error)}`),
    ),
  );

const CRLF = '\r\n';

/**
 * Strip characters that would break the multipart `Content-Disposition` header:
 * control characters including CR/LF (which could inject headers or multipart
 * delimiters) plus the double-quote and backslash that close or escape the
 * quoted `filename` value. Falls back to a safe default if nothing usable remains.
 */
const sanitizeMultipartFileName = (fileName: string): string => {
  const cleaned = fileName.replace(/[\u0000-\u001f\u007f"\\]/g, '').trim();
  return cleaned.length > 0 ? cleaned : 'image.jpg';
};

/**
 * Assemble the multipart/form-data body eBay's UploadSiteHostedPictures expects:
 * the XML request as the first part, the raw image bytes as the second. The XML
 * part must come first so eBay reads the call parameters before the binary.
 */
const buildMultipartBody = (
  boundary: string,
  xmlBody: string,
  image: TradingUploadImage,
): Buffer => {
  const head =
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="XML Payload"${CRLF}` +
    `Content-Type: text/xml; charset=utf-8${CRLF}${CRLF}` +
    `${xmlBody}${CRLF}` +
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="image"; filename="${sanitizeMultipartFileName(image.fileName)}"${CRLF}` +
    `Content-Type: ${image.contentType}${CRLF}${CRLF}`;
  const tail = `${CRLF}--${boundary}--${CRLF}`;

  return Buffer.concat([Buffer.from(head, 'utf8'), image.data, Buffer.from(tail, 'utf8')]);
};

const postTradingMultipart = ({
  path,
  headers,
  xmlBody,
  image,
  callName,
}: TradingMultipartContext): Effect.Effect<{ readonly data: string }, EbayApiError> => {
  const boundary = `----ebayMcp${randomUUID().replace(/-/g, '')}`;
  const body = buildMultipartBody(boundary, xmlBody, image);

  return httpRequestEffect<string>({
    method: 'POST',
    url: path,
    headers: { ...headers, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body,
    timeoutMs: 60_000,
    responseType: 'text',
  }).pipe(
    Effect.mapError((error) =>
      createTradingApiError({ callName, path }, `upload failed: ${getErrorMessage(error)}`),
    ),
  );
};

const parseTradingXml = ({
  parser,
  responseText,
  callName,
  path,
}: TradingParseContext): Effect.Effect<Record<string, unknown>, EbayApiError> =>
  Effect.try({
    try: () => parser.parse(responseText),
    catch: (error) =>
      new EbayApiError({
        method: 'POST',
        path,
        cause: new TradingApiFailure({
          callName,
          path,
          message: `Failed to parse Trading API ${callName} response: ${getErrorMessage(error)}`,
          cause: error,
        }),
      }),
  }).pipe(
    Effect.flatMap((parsedValue) => {
      if (isRecord(parsedValue)) {
        return Effect.succeed(parsedValue);
      }

      return Effect.fail(createTradingApiError({ callName, path }, 'response must be an object'));
    }),
  );

const readTradingPayload = (
  parsed: Record<string, unknown>,
  responseTag: string,
  { callName, path }: TradingFailureContext,
): Effect.Effect<Record<string, unknown>, EbayApiError> => {
  const resultValue = parsed[responseTag] === undefined ? parsed : parsed[responseTag];

  if (isRecord(resultValue)) {
    return Effect.succeed(resultValue);
  }

  return Effect.fail(
    createTradingApiError({ callName, path }, 'response payload is not an object'),
  );
};

const extractTradingErrorMessage = (errors: unknown): string => {
  const firstError = Array.isArray(errors) ? errors[0] : errors;

  if (!isRecord(firstError)) {
    return 'Trading API returned a failure without an error message';
  }

  const shortMessage = firstError.ShortMessage;
  if (typeof shortMessage === 'string' && shortMessage !== '') {
    return shortMessage;
  }

  const longMessage = firstError.LongMessage;
  if (typeof longMessage === 'string' && longMessage !== '') {
    return longMessage;
  }

  return 'Trading API returned a failure without an error message';
};

const validateTradingAck = (
  result: Record<string, unknown>,
  { callName, path }: TradingFailureContext,
): Effect.Effect<Record<string, unknown>, EbayApiError> => {
  if (result.Ack === 'Warning') {
    apiLogger.warn(`Trading API ${callName} returned warnings`, {
      errors: result.Errors,
    });
  }

  if (result.Ack === 'Failure' || result.Ack === 'PartialFailure') {
    return Effect.fail(
      new EbayApiError({
        method: 'POST',
        path,
        cause: new TradingApiFailure({
          callName,
          path,
          message: extractTradingErrorMessage(result.Errors),
          cause: result.Errors,
        }),
      }),
    );
  }

  return Effect.succeed(result);
};

/**
 * XML-based client for eBay Trading API calls that are not covered by REST APIs.
 */
export class TradingApiClient {
  private readonly restClient: EbayApiClient;
  private readonly baseUrl: string;
  private readonly parser: XMLParser;
  private readonly builder: XmlBuilderInstance;

  constructor(restClient: EbayApiClient) {
    this.restClient = restClient;
    const config = restClient.getConfig();
    this.baseUrl = getBaseUrl(config.environment, config.apiBaseUrl);

    this.parser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
      parseTagValue: true,
      isArray: (_name: string) => {
        const arrayTags = [
          'Item',
          'Errors',
          'Error',
          'NameValueList',
          'Value',
          'ShippingServiceOptions',
          'InternationalShippingServiceOption',
          'PaymentMethods',
          'PictureURL',
          'CompatibilityList',
          'Variation',
        ];
        return arrayTags.includes(_name);
      },
    });

    this.builder = new XmlBuilder({
      ignoreAttributes: false,
      format: true,
      suppressEmptyNode: true,
    });
  }

  /**
   * Return the Trading API base URL for the configured eBay environment.
   *
   * @returns The Trading API base URL derived from the configured environment.
   *
   * @example
   * ```ts
   * const baseUrl = tradingClient.getTradingBaseUrl();
   * ```
   */
  getTradingBaseUrl = (): string => this.baseUrl;

  /**
   * Return the fully-qualified Trading API endpoint URL (`<baseUrl>/ws/api.dll`)
   * that {@link execute} and {@link uploadPicture} post to.
   *
   * @returns The absolute Trading API endpoint URL for the configured environment.
   *
   * @example
   * ```ts
   * const endpoint = tradingClient.getTradingEndpoint();
   * ```
   */
  getTradingEndpoint = (): string => buildTradingPath(this.baseUrl);

  /**
   * Execute a named Trading API call with XML request/response conversion.
   *
   * @param callName - Trading API call name, such as GetItem or AddFixedPriceItem.
   * @param params - XML request payload fields nested under the generated request tag.
   * @returns An Effect that succeeds with the parsed response payload.
   *
   * @example
   * ```ts
   * const result = await Effect.runPromise(
   *   tradingClient.execute('GetItem', { ItemID: '12345' }),
   * );
   * ```
   */
  execute = (
    callName: string,
    params: Record<string, unknown>,
  ): Effect.Effect<Record<string, unknown>, EbayApiError> => {
    const tradingClient = this;
    const requestTag = `${callName}Request`;
    const responseTag = `${callName}Response`;
    const path = buildTradingPath(tradingClient.baseUrl);
    const headers = buildTradingHeaders(callName);
    const xmlBody = buildTradingXmlBody(tradingClient.builder, requestTag, params);

    apiLogger.debug(`Trading API ${callName}`, { xmlBody });

    return Effect.gen(function* () {
      const authorizedHeaders = yield* authorizeTradingHeaders({
        restClient: tradingClient.restClient,
        headers,
        callName,
        path,
      });
      const response = yield* postTradingXml({
        path,
        headers: authorizedHeaders,
        xmlBody,
        callName,
      });
      const parsed = yield* parseTradingXml({
        parser: tradingClient.parser,
        responseText: response.data,
        callName,
        path,
      });
      const result = yield* readTradingPayload(parsed, responseTag, { callName, path });

      return yield* validateTradingAck(result, { callName, path });
    });
  };

  /**
   * Execute a Trading API call that uploads a binary image via multipart/form-data.
   *
   * Unlike {@link execute}, the request body is a multipart envelope: the XML
   * request as the first part and the raw image bytes as the second. Used by
   * UploadSiteHostedPictures to push a local image to eBay Picture Services (EPS).
   *
   * @param callName - Trading API call name, such as UploadSiteHostedPictures.
   * @param params - XML request fields nested under the generated request tag.
   * @param image - Raw image bytes, MIME type, and file name for the binary part.
   * @returns An Effect that succeeds with the parsed response payload.
   *
   * @example
   * ```ts
   * const result = await Effect.runPromise(
   *   tradingClient.uploadPicture('UploadSiteHostedPictures', { PictureName: 'front' }, image),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/uploadsitehostedpictures.html
   */
  uploadPicture = (
    callName: string,
    params: Record<string, unknown>,
    image: TradingUploadImage,
  ): Effect.Effect<Record<string, unknown>, EbayApiError> => {
    const tradingClient = this;
    const requestTag = `${callName}Request`;
    const responseTag = `${callName}Response`;
    const path = buildTradingPath(tradingClient.baseUrl);
    const headers = buildTradingHeaders(callName);
    const xmlBody = buildTradingXmlBody(tradingClient.builder, requestTag, params);

    apiLogger.debug(`Trading API ${callName} (multipart)`, {
      fileName: image.fileName,
      contentType: image.contentType,
      bytes: image.data.length,
    });

    return Effect.gen(function* () {
      const authorizedHeaders = yield* authorizeTradingHeaders({
        restClient: tradingClient.restClient,
        headers,
        callName,
        path,
      });
      const response = yield* postTradingMultipart({
        path,
        headers: authorizedHeaders,
        xmlBody,
        image,
        callName,
      });
      const parsed = yield* parseTradingXml({
        parser: tradingClient.parser,
        responseText: response.data,
        callName,
        path,
      });
      const result = yield* readTradingPayload(parsed, responseTag, { callName, path });

      return yield* validateTradingAck(result, { callName, path });
    });
  };
}
