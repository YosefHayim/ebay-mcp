import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  EbayApiError,
  EndpointInputError,
  optionalPositiveNumberEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type { EbayEnvironment } from '@/config/environment.js';
import { isRecord } from '@/utils/typeGuards.js';
import { Effect } from 'effect';

/** Finding Service API version used for findCompletedItems. */
const FINDING_SERVICE_VERSION = '1.13.0';

/** Default page size when maxResults is omitted. */
const DEFAULT_MAX_RESULTS = 20;

/** Hard upper bound for paginationInput.entriesPerPage. */
const MAX_ENTRIES_PER_PAGE = 100;

/** Hard upper bound for the EndTimeFrom days-back window. */
const MAX_DAYS_BACK = 90;

/** Input accepted by findCompletedItems. */
export interface FindCompletedItemsInput {
  /** Free-text keywords that match sold/completed listing titles. */
  readonly keywords: string;
  /** Maximum number of sold items to return (1–100). Defaults to 20. */
  readonly maxResults?: number;
  /** Restrict results to items that ended within this many days (1–90). */
  readonly daysBack?: number;
}

/** Monetary amount extracted from a Finding API price field. */
export interface CompletedItemMoney {
  /** Currency code such as USD. */
  readonly currency: string;
  /** Amount as a decimal string. */
  readonly value: string;
}

/** One sold/completed listing cleaned for pricing research. */
export interface CompletedItem {
  /** eBay item identifier. */
  readonly itemId: string;
  /** Listing title. */
  readonly title: string;
  /** Final sold price when present. */
  readonly price?: CompletedItemMoney;
  /** Shipping cost when present. */
  readonly shippingCost?: CompletedItemMoney;
  /** Listing end / sold timestamp when present. */
  readonly soldDate?: string;
  /** Condition display name when present. */
  readonly condition?: string;
  /** Public view-item URL when present. */
  readonly listingUrl?: string;
}

/** Cleaned findCompletedItems result returned to tool callers. */
export interface FindCompletedItemsResult {
  /** Sold/completed items matched by the query. */
  readonly items: CompletedItem[];
  /** Total matching entries reported by Finding, when available. */
  readonly totalEntries?: number;
  /** Keywords used for the search. */
  readonly keywords: string;
}

/**
 * Resolve the Finding Service base URL for the configured environment.
 *
 * Finding lives on the `svcs` host, not the Sell REST `api` host. When a proxy
 * base URL is configured, the Finding path is appended so the proxy can route it.
 *
 * @param environment - eBay environment used when no override is configured.
 * @param overrideBaseUrl - Optional base URL override from `EBAY_MCP_API_BASE_URL`.
 * @returns Absolute Finding Service URL (no trailing slash).
 *
 * @example
 * ```ts
 * const url = getFindingServiceBaseUrl('production');
 * // https://svcs.ebay.com/services/search/FindingService/v1
 * ```
 */
export const getFindingServiceBaseUrl = (
  environment: EbayEnvironment,
  overrideBaseUrl?: string,
): string => {
  if (overrideBaseUrl) {
    return `${overrideBaseUrl.replace(/\/$/, '')}/services/search/FindingService/v1`;
  }

  return environment === 'production'
    ? 'https://svcs.ebay.com/services/search/FindingService/v1'
    : 'https://svcs.sandbox.ebay.com/services/search/FindingService/v1';
};

/**
 * Build query parameters for Finding API findCompletedItems.
 *
 * Finding authenticates primarily via `SECURITY-APPNAME` (the app client id).
 * Results are limited to sold listings through the `SoldItemsOnly` item filter.
 *
 * @param input - Validated search input plus the app client id.
 * @returns Wire query params for the Finding Service GET request.
 *
 * @example
 * ```ts
 * const params = buildFindCompletedItemsParams({
 *   keywords: 'iphone 14',
 *   maxResults: 20,
 *   appId: 'client-id',
 * });
 * ```
 */
export const buildFindCompletedItemsParams = (input: {
  readonly keywords: string;
  readonly maxResults: number;
  readonly daysBack?: number;
  readonly appId: string;
}): Record<string, string | number> => {
  const params: Record<string, string | number> = {
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': FINDING_SERVICE_VERSION,
    'SECURITY-APPNAME': input.appId,
    'RESPONSE-DATA-FORMAT': 'JSON',
    'REST-PAYLOAD': '',
    keywords: input.keywords,
    'paginationInput.entriesPerPage': input.maxResults,
    'itemFilter(0).name': 'SoldItemsOnly',
    'itemFilter(0).value': 'true',
  };

  if (input.daysBack !== undefined) {
    const endTimeFrom = new Date();
    endTimeFrom.setUTCDate(endTimeFrom.getUTCDate() - input.daysBack);
    params['itemFilter(1).name'] = 'EndTimeFrom';
    params['itemFilter(1).value'] = endTimeFrom.toISOString();
  }

  return params;
};

/** Read the first string from a Finding JSON array-or-string field. */
const firstString = (rawField: unknown): string | undefined => {
  if (typeof rawField === 'string' && rawField.length > 0) {
    return rawField;
  }
  if (Array.isArray(rawField) && typeof rawField[0] === 'string' && rawField[0].length > 0) {
    return rawField[0];
  }
};

/** Read the first object from a Finding JSON array-or-object field. */
const firstRecord = (rawField: unknown): Record<string, unknown> | undefined => {
  if (isRecord(rawField)) {
    return rawField;
  }
  if (Array.isArray(rawField) && isRecord(rawField[0])) {
    return rawField[0];
  }
};

/** Parse a Finding API money field (`@currencyId` + `__value__`). */
const parseMoney = (rawMoney: unknown): CompletedItemMoney | undefined => {
  const money = firstRecord(rawMoney);
  if (!money) {
    return;
  }

  const currency =
    typeof money['@currencyId'] === 'string'
      ? money['@currencyId']
      : typeof money.currencyId === 'string'
        ? money.currencyId
        : undefined;
  const amount =
    typeof money.__value__ === 'string'
      ? money.__value__
      : typeof money.value === 'string'
        ? money.value
        : undefined;

  if (!(currency && amount)) {
    return;
  }

  return { currency, value: amount };
};

/**
 * Map one raw Finding item into a cleaned {@link CompletedItem}.
 *
 * @param raw - One item object from `searchResult.item`.
 * @returns Cleaned item, or undefined when itemId/title are missing.
 */
export const mapFindingItem = (raw: unknown): CompletedItem | undefined => {
  if (!isRecord(raw)) {
    return;
  }

  const itemId = firstString(raw.itemId);
  const title = firstString(raw.title);
  if (!(itemId && title)) {
    return;
  }

  const sellingStatus = firstRecord(raw.sellingStatus);
  const shippingInfo = firstRecord(raw.shippingInfo);
  const listingInfo = firstRecord(raw.listingInfo);
  const condition = firstRecord(raw.condition);

  const price = parseMoney(sellingStatus?.currentPrice);
  const shippingCost = parseMoney(shippingInfo?.shippingServiceCost);
  const soldDate = firstString(listingInfo?.endTime);
  const conditionName = firstString(condition?.conditionDisplayName);
  const listingUrl = firstString(raw.viewItemURL);

  return {
    itemId,
    title,
    ...(price === undefined ? {} : { price }),
    ...(shippingCost === undefined ? {} : { shippingCost }),
    ...(soldDate === undefined ? {} : { soldDate }),
    ...(conditionName === undefined ? {} : { condition: conditionName }),
    ...(listingUrl === undefined ? {} : { listingUrl }),
  };
};

/**
 * Map a raw Finding findCompletedItems JSON response into cleaned sold comps.
 *
 * Finding wraps most nodes in single-element arrays (XML→JSON conversion).
 *
 * @param raw - Full JSON body returned by the Finding Service.
 * @param keywords - Keywords used for the request (echoed in the result).
 * @returns Cleaned items plus optional total entry count.
 *
 * @example
 * ```ts
 * const soldListings = mapFindCompletedItemsResponse(rawJson, 'iphone 14');
 * ```
 */
export const mapFindCompletedItemsResponse = (
  raw: unknown,
  keywords: string,
): FindCompletedItemsResult => {
  if (!isRecord(raw)) {
    return { items: [], keywords };
  }

  const responseRoot = firstRecord(raw.findCompletedItemsResponse);
  if (!responseRoot) {
    return { items: [], keywords };
  }

  const searchResult = firstRecord(responseRoot.searchResult);
  const rawItems = searchResult?.item;
  const itemList = Array.isArray(rawItems) ? rawItems : rawItems === undefined ? [] : [rawItems];

  const items: CompletedItem[] = [];
  for (const entry of itemList) {
    const mapped = mapFindingItem(entry);
    if (mapped) {
      items.push(mapped);
    }
  }

  const pagination = firstRecord(responseRoot.paginationOutput);
  const totalRaw = firstString(pagination?.totalEntries);
  const totalEntries =
    totalRaw !== undefined && Number.isFinite(Number(totalRaw)) ? Number(totalRaw) : undefined;

  return {
    items,
    keywords,
    ...(totalEntries === undefined ? {} : { totalEntries }),
  };
};

/**
 * Validate maxResults falls within Finding's supported range.
 *
 * @param maxResults - Positive page size already validated as > 0.
 * @returns The same value when in range, or a tagged input error.
 */
const requireMaxResultsInRange = (
  maxResults: number,
): Effect.Effect<number, EndpointInputError> => {
  if (maxResults > MAX_ENTRIES_PER_PAGE) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'maxResults',
        message: `maxResults must be between 1 and ${MAX_ENTRIES_PER_PAGE}`,
      }),
    );
  }

  return Effect.succeed(maxResults);
};

/**
 * Validate daysBack falls within the supported window when provided.
 *
 * @param daysBack - Optional positive day count.
 * @returns The same value (or undefined) when valid, or a tagged input error.
 */
const requireDaysBackInRange = (
  daysBack: number | undefined,
): Effect.Effect<number | undefined, EndpointInputError> => {
  if (daysBack === undefined) {
    return Effect.succeed(undefined);
  }

  if (daysBack > MAX_DAYS_BACK) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'daysBack',
        message: `daysBack must be between 1 and ${MAX_DAYS_BACK}`,
      }),
    );
  }

  return Effect.succeed(daysBack);
};

/** Finding API - sold/completed listing search for pricing research. */
export class FindingApi {
  public constructor(private readonly client: EbayApiClient) {}

  /**
   * Search sold and completed eBay listings for pricing comps.
   *
   * Uses the legacy Finding API (`findCompletedItems`) with app credentials
   * (`SECURITY-APPNAME`). Useful for market price research; sold listings only.
   *
   * @param input - Keywords plus optional result cap and days-back window.
   * @returns An Effect that succeeds with cleaned sold-item comps.
   *
   * @example
   * ```ts
   * const comps = await Effect.runPromise(
   *   findingApi.findCompletedItems({ keywords: 'nike dunk low', maxResults: 25, daysBack: 30 }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/finding/callref/findCompletedItems.html
   */
  public findCompletedItems = (
    input: FindCompletedItemsInput,
  ): Effect.Effect<FindCompletedItemsResult, EbayApiError | EndpointInputError> => {
    const client = this.client;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<FindCompletedItemsInput>(input, 'input');
      const keywords = yield* requireStringEffect(validatedInput.keywords, 'keywords');
      const maxResultsRaw = yield* optionalPositiveNumberEffect(
        validatedInput.maxResults,
        'maxResults',
      );
      const daysBackRaw = yield* optionalPositiveNumberEffect(validatedInput.daysBack, 'daysBack');
      const maxResults = yield* requireMaxResultsInRange(maxResultsRaw ?? DEFAULT_MAX_RESULTS);
      const daysBack = yield* requireDaysBackInRange(daysBackRaw);

      const config = client.getConfig();
      const appId = config.clientId;
      if (!appId) {
        return yield* Effect.fail(
          new EndpointInputError({
            parameter: 'clientId',
            message:
              'EBAY_CLIENT_ID is required for Finding API requests (SECURITY-APPNAME). Set it in your environment.',
          }),
        );
      }

      const baseUrl = getFindingServiceBaseUrl(config.environment, config.apiBaseUrl);
      const params = buildFindCompletedItemsParams({
        keywords,
        maxResults,
        ...(daysBack === undefined ? {} : { daysBack }),
        appId,
      });

      const raw = yield* Effect.tryPromise({
        try: () => client.getWithFullUrl<unknown>(baseUrl, params),
        catch: (cause) =>
          new EbayApiError({
            method: 'GET',
            path: baseUrl,
            cause,
          }),
      });

      return mapFindCompletedItemsResponse(raw, keywords);
    });
  };
}
