import XmlBuilder, { type XMLBuilder as XmlBuilderInstance } from 'fast-xml-builder';
import { XMLParser } from 'fast-xml-parser';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { TradingApiFailure } from '@/api/client/tradingApiFailure.js';
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
  const responsePayload = parsed[responseTag] === undefined ? parsed : parsed[responseTag];

  if (isRecord(responsePayload)) {
    return Effect.succeed(responsePayload);
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
  tradingPayload: Record<string, unknown>,
  { callName, path }: TradingFailureContext,
): Effect.Effect<Record<string, unknown>, EbayApiError> => {
  if (tradingPayload.Ack === 'Warning') {
    apiLogger.warn(`Trading API ${callName} returned warnings`, {
      errors: tradingPayload.Errors,
    });
  }

  if (tradingPayload.Ack === 'Failure' || tradingPayload.Ack === 'PartialFailure') {
    return Effect.fail(
      new EbayApiError({
        method: 'POST',
        path,
        cause: new TradingApiFailure({
          callName,
          path,
          message: extractTradingErrorMessage(tradingPayload.Errors),
          cause: tradingPayload.Errors,
        }),
      }),
    );
  }

  return Effect.succeed(tradingPayload);
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
   * Execute a named Trading API call with XML request/response conversion.
   *
   * @param callName - Trading API call name, such as GetItem or AddFixedPriceItem.
   * @param params - XML request payload fields nested under the generated request tag.
   * @returns An Effect that succeeds with the parsed response payload.
   *
   * @example
   * ```ts
   * const tradingReply = await Effect.runPromise(
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
      const xmlResponse = yield* postTradingXml({
        path,
        headers: authorizedHeaders,
        xmlBody,
        callName,
      });
      const parsed = yield* parseTradingXml({
        parser: tradingClient.parser,
        responseText: xmlResponse.data,
        callName,
        path,
      });
      const tradingPayload = yield* readTradingPayload(parsed, responseTag, { callName, path });

      return yield* validateTradingAck(tradingPayload, { callName, path });
    });
  };
}
