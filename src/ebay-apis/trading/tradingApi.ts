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

type GetActiveListingsInput = z.infer<typeof getActiveListingsSchema>;
type GetListingInput = z.infer<typeof getListingSchema>;
type CreateListingInput = z.infer<typeof createListingSchema>;
type ReviseListingInput = z.infer<typeof reviseListingSchema>;
type EndListingInput = z.infer<typeof endListingSchema>;
type RelistItemInput = z.infer<typeof relistItemSchema>;

function asRecordArray(rawField: unknown): Record<string, unknown>[] {
	if (!Array.isArray(rawField)) {
		return [];
	}

	return rawField.filter(isRecord);
}

export type TradingRecordResponse = Record<string, unknown>;

export class TradingApi {
	private readonly client: TradingApiClient;

	constructor(client: TradingApiClient) {
		this.client = client;
	}

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
		const isAuction = format == FormatType.AUCTION;
		const auctionItem = {
			...tradingItem,
			ListingType: TRADING_AUCTION_LISTING_TYPE,
		};
		const listingItem = isAuction ? auctionItem : tradingItem;

		return await this.client.execute(tradingCallName("create", format), {
			Item: listingItem,
		});
	};

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
