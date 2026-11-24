import type { z } from "zod";
import type {
	createListingSchema,
	endListingSchema,
	getActiveListingsSchema,
	getListingSchema,
	relistItemSchema,
	reviseListingSchema,
} from "@/ebay-apis/trading/tradingHelpers.js";
import {
	optionalPositiveNumberEffect,
	optionalStringEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { TradingApiClient } from "@/ebay-client/tradingApiClient.js";
import { FormatType } from "@/shared/ebayEnums.js";
import { isRecord } from "@/shared/typeGuards.js";
import {
	resolveTradingFormat,
	TRADING_AUCTION_LISTING_TYPE,
	type TradingItemFields,
	tradingCallName,
	validateTradingEndingReasonEffect,
	validateTradingListingFormatEffect,
} from "./listingFormatHelpers.js";

/** Input accepted by getActiveListings. */
type GetActiveListingsInput = z.infer<typeof getActiveListingsSchema>;
/** Input accepted by getListing. */
type GetListingInput = z.infer<typeof getListingSchema>;
/** Input accepted by createListing. */
type CreateListingInput = z.infer<typeof createListingSchema>;
/** Input accepted by reviseListing. */
type ReviseListingInput = z.infer<typeof reviseListingSchema>;
/** Input accepted by endListing. */
type EndListingInput = z.infer<typeof endListingSchema>;
/** Input accepted by relistItem. */
type RelistItemInput = z.infer<typeof relistItemSchema>;

const asRecordArray = (rawField: unknown): Record<string, unknown>[] => {
	if (!Array.isArray(rawField)) {
		return [];
	}

	return rawField.filter(isRecord);
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
	 * @returns The parsed GetMyeBaySelling response payload.
	 *
	 * @example
	 * ```ts
	 * const tradingRecord = await tradingApi.getActiveListings({
	 *   page: 2,
	 *   entriesPerPage: 25,
	 * });
	 * ```
	 *
	 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/getmyebayselling.html
	 */
	getActiveListings = async (
		input: GetActiveListingsInput = {},
	): Promise<TradingRecordResponse> => {
		const validatedInput = requireObjectEffect<GetActiveListingsInput>(
			input,
			"input",
		);
		const inputPage = optionalPositiveNumberEffect(validatedInput.page, "page");
		const inputEntriesPerPage = optionalPositiveNumberEffect(
			validatedInput.entriesPerPage,
			"entriesPerPage",
		);
		const page = inputPage ?? 1;
		const entriesPerPage = inputEntriesPerPage ?? 50;

		return await this.client.execute("GetMyeBaySelling", {
			ActiveList: {
				Sort: "TimeLeft",
				Pagination: {
					EntriesPerPage: entriesPerPage,
					PageNumber: page,
				},
			},
		});
	};

	/**
	 * Fetches a single listing by eBay item ID with full Trading API detail.
	 *
	 * @param input - eBay item identifier.
	 * @returns The parsed Trading API item payload.
	 *
	 * @example
	 * ```ts
	 * const listing = await tradingApi.getListing({ itemId: '12345' });
	 * ```
	 *
	 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/getitem.html
	 */
	getListing = async (
		input: GetListingInput,
	): Promise<TradingRecordResponse> => {
		const validatedInput = requireObjectEffect<GetListingInput>(input, "input");
		const itemId = requireStringEffect(validatedInput.itemId, "itemId");
		const getItemResponse = await this.client.execute("GetItem", {
			ItemID: itemId,
			DetailLevel: "ReturnAll",
		});
		const items = asRecordArray(getItemResponse["Item"]);
		const firstItem = items[0];

		return firstItem ?? getItemResponse;
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
	 * @returns The parsed AddFixedPriceItem or AddItem response.
	 *
	 * @example
	 * ```ts
	 * const auction = await tradingApi.createListing({
	 *   format: FormatType.AUCTION,
	 *   item: { Title: 'Rare coin', StartPrice: 9.99, ListingDuration: 'Days_7' },
	 * });
	 * ```
	 *
	 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/AddFixedPriceItem.html
	 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/AddItem.html
	 */
	createListing = async (
		input: CreateListingInput,
	): Promise<TradingRecordResponse> => {
		const validatedInput = requireObjectEffect<CreateListingInput>(
			input,
			"input",
		);
		const format = resolveTradingFormat(validatedInput.format);
		const tradingItem = requireObjectEffect<TradingItemFields>(
			validatedInput.item,
			"item",
		);
		validateTradingListingFormatEffect({
			item: tradingItem,
			format,
			parameter: "item",
			isCreate: true,
		});
		const isAuction = format === FormatType.AUCTION;
		const auctionItem = {
			...tradingItem,
			ListingType: TRADING_AUCTION_LISTING_TYPE,
		};
		const listingItem = isAuction ? auctionItem : tradingItem;

		return await this.client.execute(tradingCallName("create", format), {
			Item: listingItem,
		});
	};

	/**
	 * Revises a listing by merging changes with the eBay item ID.
	 *
	 * Fixed-price listings go through ReviseFixedPriceItem; auctions go through
	 * ReviseItem after the auction field rules pass.
	 *
	 * @param input - eBay item identifier plus Trading API Item fields to update and the optional listing format.
	 * @returns The parsed ReviseFixedPriceItem or ReviseItem response.
	 *
	 * @example
	 * ```ts
	 * const listing = await tradingApi.reviseListing({
	 *   itemId: '12345',
	 *   fields: { Quantity: 10 },
	 * });
	 * ```
	 *
	 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/ReviseFixedPriceItem.html
	 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/ReviseItem.html
	 */
	reviseListing = async (
		input: ReviseListingInput,
	): Promise<TradingRecordResponse> => {
		const validatedInput = requireObjectEffect<ReviseListingInput>(
			input,
			"input",
		);
		const format = resolveTradingFormat(validatedInput.format);
		const itemId = requireStringEffect(validatedInput.itemId, "itemId");
		const fields = requireObjectEffect<TradingItemFields>(
			validatedInput.fields,
			"fields",
		);
		validateTradingListingFormatEffect({
			item: fields,
			format,
			parameter: "fields",
			isCreate: false,
		});

		return await this.client.execute(tradingCallName("revise", format), {
			Item: { ...fields, ItemID: itemId },
		});
	};

	/**
	 * Ends a listing with the provided Trading API ending reason.
	 *
	 * Fixed-price listings go through EndFixedPriceItem; auctions go through EndItem,
	 * the only call that accepts the SellToHighBidder reason.
	 *
	 * @param input - eBay item identifier plus optional Trading API ending reason and listing format.
	 * @returns The parsed EndFixedPriceItem or EndItem response.
	 *
	 * @example
	 * ```ts
	 * await tradingApi.endListing({ itemId: '12345', reason: 'NotAvailable' });
	 * ```
	 *
	 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/endfixedpriceitem.html
	 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/EndItem.html
	 */
	endListing = async (
		input: EndListingInput,
	): Promise<TradingRecordResponse> => {
		const validatedInput = requireObjectEffect<EndListingInput>(input, "input");
		const format = resolveTradingFormat(validatedInput.format);
		const itemId = requireStringEffect(validatedInput.itemId, "itemId");
		const inputReason = optionalStringEffect(validatedInput.reason, "reason");
		validateTradingEndingReasonEffect(inputReason, format, "reason");
		const reason = inputReason ?? "NotAvailable";

		return await this.client.execute(tradingCallName("end", format), {
			ItemID: itemId,
			EndingReason: reason,
		});
	};

	/**
	 * Relists an ended item with optional listing modifications.
	 *
	 * Fixed-price listings go through RelistFixedPriceItem; auctions go through
	 * RelistItem after the auction field rules pass on the modifications.
	 *
	 * @param input - eBay item identifier plus optional Trading API Item modifications and listing format.
	 * @returns The parsed RelistFixedPriceItem or RelistItem response.
	 *
	 * @example
	 * ```ts
	 * const listing = await tradingApi.relistItem({
	 *   itemId: '12345',
	 *   modifications: { Quantity: 20 },
	 * });
	 * ```
	 *
	 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/relistfixedpriceitem.html
	 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/RelistItem.html
	 */
	relistItem = async (
		input: RelistItemInput,
	): Promise<TradingRecordResponse> => {
		const validatedInput = requireObjectEffect<RelistItemInput>(input, "input");
		const format = resolveTradingFormat(validatedInput.format);
		const itemId = requireStringEffect(validatedInput.itemId, "itemId");
		let modifications: TradingItemFields = {};
		const hasModifications = validatedInput.modifications !== undefined;

		if (hasModifications) {
			modifications = requireObjectEffect<TradingItemFields>(
				validatedInput.modifications,
				"modifications",
			);
		}

		validateTradingListingFormatEffect({
			item: modifications,
			format,
			parameter: "modifications",
			isCreate: false,
		});

		return await this.client.execute(tradingCallName("relist", format), {
			Item: { ...modifications, ItemID: itemId },
		});
	};
}
