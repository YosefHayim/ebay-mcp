import {
	BUY_IT_NOW_MARGIN_LABEL,
	meetsBuyItNowMargin,
} from "@/ebay-client/auctionPricing.js";

import { FormatType } from "@/shared/ebayEnums.js";
import { isRecord } from "@/shared/typeGuards.js";

export const TRADING_AUCTION_LISTING_TYPE = "Chinese";
const TRADING_GTC_DURATION = "GTC";
const SELL_TO_HIGH_BIDDER_REASON = "SellToHighBidder";

export type TradingListingOperation = "create" | "revise" | "end" | "relist";

const TRADING_CALL_NAMES: Record<
	TradingListingOperation,
	Record<FormatType, string>
> = {
	create: { AUCTION: "AddItem", FIXED_PRICE: "AddFixedPriceItem" },
	revise: { AUCTION: "ReviseItem", FIXED_PRICE: "ReviseFixedPriceItem" },
	end: { AUCTION: "EndItem", FIXED_PRICE: "EndFixedPriceItem" },
	relist: { AUCTION: "RelistItem", FIXED_PRICE: "RelistFixedPriceItem" },
};

export type TradingItemFields = Record<string, unknown>;

function inputError(parameter: string, message: string): Error {
	return new Error(`${parameter}: ${message}`);
}

function parseTradingAmount(rawAmount: unknown): number | undefined {
	const amount = isRecord(rawAmount) ? rawAmount["#text"] : rawAmount;
	if (amount === undefined || amount === null || amount === "") {
		return;
	}
	const parsed = Number(amount);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function isBestOfferEnabled(tradingItem: TradingItemFields): boolean {
	const details = tradingItem["BestOfferDetails"];
	if (!isRecord(details)) {
		return false;
	}
	return (
		details["BestOfferEnabled"] === true ||
		details["BestOfferEnabled"] === "true"
	);
}

function auctionViolation(
	tradingItem: TradingItemFields,
	parameter: string,
): Error | undefined {
	if (
		tradingItem["ListingType"] !== undefined &&
		tradingItem["ListingType"] !== TRADING_AUCTION_LISTING_TYPE
	) {
		return inputError(
			`${parameter}.ListingType`,
			`AUCTION listings use ListingType ${TRADING_AUCTION_LISTING_TYPE}; omit it or pass format FIXED_PRICE for ${String(tradingItem["ListingType"])}`,
		);
	}
	if (tradingItem["ListingDuration"] === TRADING_GTC_DURATION) {
		return inputError(
			`${parameter}.ListingDuration`,
			"AUCTION listings need a day-count ListingDuration such as Days_7; GTC is only valid for FIXED_PRICE listings",
		);
	}
	if (
		tradingItem["Quantity"] !== undefined &&
		Number(tradingItem["Quantity"]) != 1
	) {
		return inputError(
			`${parameter}.Quantity`,
			"AUCTION listings sell a single unit; omit Quantity or set it to 1",
		);
	}
	if (
		isBestOfferEnabled(tradingItem) &&
		tradingItem["BuyItNowPrice"] !== undefined
	) {
		return inputError(
			`${parameter}.BestOfferDetails.BestOfferEnabled`,
			"an AUCTION listing can carry Best Offer or a BuyItNowPrice, not both",
		);
	}

	return undefined;
}

function auctionCreateViolation(
	tradingItem: TradingItemFields,
	parameter: string,
): Error | undefined {
	if (tradingItem["ListingDuration"] === undefined) {
		return inputError(
			`${parameter}.ListingDuration`,
			"ListingDuration is required for AUCTION listings (a day count such as Days_7)",
		);
	}
	if (parseTradingAmount(tradingItem["StartPrice"]) === undefined) {
		return inputError(
			`${parameter}.StartPrice`,
			"StartPrice (the opening bid) is required for AUCTION listings",
		);
	}

	return undefined;
}

function fixedPriceViolation(
	tradingItem: TradingItemFields,
	parameter: string,
): Error | undefined {
	if (tradingItem["ListingType"] === TRADING_AUCTION_LISTING_TYPE) {
		return inputError(
			`${parameter}.ListingType`,
			`ListingType ${TRADING_AUCTION_LISTING_TYPE} is an auction; pass format AUCTION instead`,
		);
	}
	if (
		tradingItem["ListingDuration"] !== undefined &&
		tradingItem["ListingDuration"] !== TRADING_GTC_DURATION
	) {
		return inputError(
			`${parameter}.ListingDuration`,
			`FIXED_PRICE listings must use ListingDuration ${TRADING_GTC_DURATION} (the only duration eBay accepts for fixed-price listings); day counts such as Days_7 are for AUCTION listings`,
		);
	}
	if (tradingItem["ReservePrice"] !== undefined) {
		return inputError(
			`${parameter}.ReservePrice`,
			"ReservePrice only applies to AUCTION listings",
		);
	}
	if (tradingItem["BuyItNowPrice"] !== undefined) {
		return inputError(
			`${parameter}.BuyItNowPrice`,
			"BuyItNowPrice only applies to AUCTION listings; FIXED_PRICE listings use StartPrice",
		);
	}

	return undefined;
}

function auctionPriceViolation(
	tradingItem: TradingItemFields,
	parameter: string,
): Error | undefined {
	const start = parseTradingAmount(tradingItem["StartPrice"]);
	if (start === undefined) {
		return;
	}
	const reserve = parseTradingAmount(tradingItem["ReservePrice"]);
	if (reserve !== undefined && reserve <= start) {
		return inputError(
			`${parameter}.ReservePrice`,
			"ReservePrice must be higher than StartPrice (the opening bid)",
		);
	}
	const buyItNow = parseTradingAmount(tradingItem["BuyItNowPrice"]);
	if (buyItNow !== undefined && !meetsBuyItNowMargin(start, buyItNow)) {
		return inputError(
			`${parameter}.BuyItNowPrice`,
			`BuyItNowPrice must be at least ${BUY_IT_NOW_MARGIN_LABEL} higher than StartPrice (the opening bid)`,
		);
	}

	return undefined;
}

export interface TradingListingFormatCheck {
	readonly item: TradingItemFields;
	readonly format: FormatType;
	readonly parameter: string;
	readonly isCreate: boolean;
}

export function findTradingListingFormatViolation({
	item: tradingItem,
	format,
	parameter,
	isCreate,
}: TradingListingFormatCheck): Error | undefined {
	if (format == FormatType.FIXED_PRICE) {
		return fixedPriceViolation(tradingItem, parameter);
	}
	return (
		auctionViolation(tradingItem, parameter) ??
		(isCreate ? auctionCreateViolation(tradingItem, parameter) : undefined) ??
		auctionPriceViolation(tradingItem, parameter)
	);
}

export function validateTradingListingFormatEffect(
	check: TradingListingFormatCheck,
): void {
	const violation = findTradingListingFormatViolation(check);

	if (violation !== undefined) {
		throw violation;
	}
}

export function validateTradingEndingReasonEffect(
	reason: string | undefined,
	format: FormatType,
	parameter: string,
): void {
	const isAnotherReason = reason != SELL_TO_HIGH_BIDDER_REASON;

	if (isAnotherReason) {
		return;
	}

	const isAuction = format != FormatType.FIXED_PRICE;

	if (isAuction) {
		return;
	}

	throw inputError(
		parameter,
		`${SELL_TO_HIGH_BIDDER_REASON} only ends AUCTION listings; pass format AUCTION or another reason`,
	);
}

export function tradingCallName(
	operation: TradingListingOperation,
	format: FormatType,
): string {
	return TRADING_CALL_NAMES[operation][format];
}

export function resolveTradingFormat(
	format: FormatType | undefined,
): FormatType {
	return format ?? FormatType.FIXED_PRICE;
}
