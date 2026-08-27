import type { TradingApiClient } from '@/api/clientTrading.js';
import {
  type EbayApiError,
  type EndpointInputError,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  createListingSchema,
  endListingSchema,
  getActiveListingsSchema,
  getListingSchema,
  relistItemSchema,
  reviseListingSchema,
} from '@/utils/trading/trading.js';
import { FormatType } from '@/types/ebayEnums.js';
import { isRecord } from '@/utils/typeGuards.js';
import { Effect } from 'effect';
import type { InferEffectSchema } from '@/utils/effectSchemaTypes.js';
import {
  TRADING_AUCTION_LISTING_TYPE,
  type TradingItemFields,
  resolveTradingFormat,
  tradingCallName,
  validateTradingEndingReasonEffect,
  validateTradingListingFormatEffect,
} from './listingFormat.js';

/** Input accepted by getActiveListings. */
type GetActiveListingsInput = InferEffectSchema<typeof getActiveListingsSchema>;
/** Input accepted by getListing. */
type GetListingInput = InferEffectSchema<typeof getListingSchema>;
/** Input accepted by createListing. */
type CreateListingInput = InferEffectSchema<typeof createListingSchema>;
/** Input accepted by reviseListing. */
type ReviseListingInput = InferEffectSchema<typeof reviseListingSchema>;
/** Input accepted by endListing. */
type EndListingInput = InferEffectSchema<typeof endListingSchema>;
/** Input accepted by relistItem. */
type RelistItemInput = InferEffectSchema<typeof relistItemSchema>;

const asRecordArray = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord);
};

/**
 * Parsed Trading API object payload returned unchanged from XML calls.
 *
 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/index.html
 */
export type TradingRecordResponse = Record<string, unknown>;

/**
 * High-level wrapper for seller listing operations backed by eBay Trading API calls.
 */
export class TradingApi {
  private readonly client: TradingApiClient;

  constructor(client: TradingApiClient) {
    this.client = client;
  }

  /**
   * Fetches active seller listings with Trading API pagination metadata.
   *
   * @param input - Optional page number and entries-per-page values.
   * @returns An Effect that succeeds with the parsed GetMyeBaySelling response payload.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(
   *   tradingApi.getActiveListings({ page: 2, entriesPerPage: 25 }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/getmyebayselling.html
   */
  getActiveListings = (
    input: GetActiveListingsInput = {},
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetActiveListingsInput>(input, 'input');
      const inputPage = yield* optionalPositiveNumberEffect(request.page, 'page');
      const inputEntriesPerPage = yield* optionalPositiveNumberEffect(
        request.entriesPerPage,
        'entriesPerPage',
      );
      const page = inputPage === undefined ? 1 : inputPage;
      const entriesPerPage = inputEntriesPerPage === undefined ? 50 : inputEntriesPerPage;

      return yield* tradingClient.execute('GetMyeBaySelling', {
        ActiveList: {
          Sort: 'TimeLeft',
          Pagination: {
            EntriesPerPage: entriesPerPage,
            PageNumber: page,
          },
        },
      });
    });
  };

  /**
   * Fetches a single listing by eBay item ID with full Trading API detail.
   *
   * @param input - eBay item identifier.
   * @returns An Effect that succeeds with the parsed Trading API item payload.
   *
   * @example
   * ```ts
   * const listing = await Effect.runPromise(tradingApi.getListing({ itemId: '12345' }));
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/getitem.html
   */
  getListing = (
    input: GetListingInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetListingInput>(input, 'input');
      const itemId = yield* requireStringEffect(request.itemId, 'itemId');
      const result = yield* tradingClient.execute('GetItem', {
        ItemID: itemId,
        DetailLevel: 'ReturnAll',
      });
      const items = asRecordArray(result.Item);

      return items.length > 0 ? items[0] : result;
    });
  };

  /**
   * Creates a listing using the supplied Trading API item payload.
   *
   * Fixed-price listings go through AddFixedPriceItem (with `ListingDuration` GTC
   * when supplied). Auctions go through AddItem with `ListingType` Chinese added to
   * the item, after the auction rules pass: a day-count `ListingDuration`, a
   * `StartPrice` opening bid, a single unit, a reserve above the opening bid, a Buy
   * It Now price at least 30% above it, and Best Offer only without Buy It Now.
   *
   * @param input - Trading API Item payload nested under `item`, plus the optional listing format.
   * @returns An Effect that succeeds with the parsed AddFixedPriceItem or AddItem response.
   *
   * @example
   * ```ts
   * const auction = await Effect.runPromise(
   *   tradingApi.createListing({
   *     format: FormatType.AUCTION,
   *     item: { Title: 'Rare coin', StartPrice: 9.99, ListingDuration: 'Days_7' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/AddFixedPriceItem.html
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/AddItem.html
   */
  createListing = (
    input: CreateListingInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<CreateListingInput>(input, 'input');
      const format = resolveTradingFormat(request.format);
      const item = yield* requireObjectEffect<TradingItemFields>(request.item, 'item');
      yield* validateTradingListingFormatEffect({
        item,
        format,
        parameter: 'item',
        isCreate: true,
      });
      const payload =
        format === FormatType.AUCTION
          ? { ...item, ListingType: TRADING_AUCTION_LISTING_TYPE }
          : item;

      return yield* tradingClient.execute(tradingCallName('create', format), { Item: payload });
    });
  };

  /**
   * Revises a listing by merging changes with the eBay item ID.
   *
   * Fixed-price listings go through ReviseFixedPriceItem; auctions go through
   * ReviseItem after the auction field rules pass.
   *
   * @param input - eBay item identifier plus Trading API Item fields to update and the optional listing format.
   * @returns An Effect that succeeds with the parsed ReviseFixedPriceItem or ReviseItem response.
   *
   * @example
   * ```ts
   * const listing = await Effect.runPromise(
   *   tradingApi.reviseListing({ itemId: '12345', fields: { Quantity: 10 } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/ReviseFixedPriceItem.html
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/ReviseItem.html
   */
  reviseListing = (
    input: ReviseListingInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<ReviseListingInput>(input, 'input');
      const format = resolveTradingFormat(request.format);
      const itemId = yield* requireStringEffect(request.itemId, 'itemId');
      const fields = yield* requireObjectEffect<TradingItemFields>(request.fields, 'fields');
      yield* validateTradingListingFormatEffect({
        item: fields,
        format,
        parameter: 'fields',
        isCreate: false,
      });

      return yield* tradingClient.execute(tradingCallName('revise', format), {
        Item: { ...fields, ItemID: itemId },
      });
    });
  };

  /**
   * Ends a listing with the provided Trading API ending reason.
   *
   * Fixed-price listings go through EndFixedPriceItem; auctions go through EndItem,
   * the only call that accepts the SellToHighBidder reason.
   *
   * @param input - eBay item identifier plus optional Trading API ending reason and listing format.
   * @returns An Effect that succeeds with the parsed EndFixedPriceItem or EndItem response.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   tradingApi.endListing({ itemId: '12345', reason: 'NotAvailable' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/endfixedpriceitem.html
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/EndItem.html
   */
  endListing = (
    input: EndListingInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<EndListingInput>(input, 'input');
      const format = resolveTradingFormat(request.format);
      const itemId = yield* requireStringEffect(request.itemId, 'itemId');
      const inputReason = yield* optionalStringEffect(request.reason, 'reason');
      yield* validateTradingEndingReasonEffect(inputReason, format, 'reason');
      const reason = inputReason === undefined ? 'NotAvailable' : inputReason;

      return yield* tradingClient.execute(tradingCallName('end', format), {
        ItemID: itemId,
        EndingReason: reason,
      });
    });
  };

  /**
   * Relists an ended item with optional listing modifications.
   *
   * Fixed-price listings go through RelistFixedPriceItem; auctions go through
   * RelistItem after the auction field rules pass on the modifications.
   *
   * @param input - eBay item identifier plus optional Trading API Item modifications and listing format.
   * @returns An Effect that succeeds with the parsed RelistFixedPriceItem or RelistItem response.
   *
   * @example
   * ```ts
   * const listing = await Effect.runPromise(
   *   tradingApi.relistItem({ itemId: '12345', modifications: { Quantity: 20 } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/relistfixedpriceitem.html
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/RelistItem.html
   */
  relistItem = (
    input: RelistItemInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<RelistItemInput>(input, 'input');
      const format = resolveTradingFormat(request.format);
      const itemId = yield* requireStringEffect(request.itemId, 'itemId');
      let modifications: TradingItemFields = {};

      if (request.modifications !== undefined) {
        modifications = yield* requireObjectEffect<TradingItemFields>(
          request.modifications,
          'modifications',
        );
      }
      yield* validateTradingListingFormatEffect({
        item: modifications,
        format,
        parameter: 'modifications',
        isCreate: false,
      });

      return yield* tradingClient.execute(tradingCallName('relist', format), {
        Item: { ...modifications, ItemID: itemId },
      });
    });
  };
}
