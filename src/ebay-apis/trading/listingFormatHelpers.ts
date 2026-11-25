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
	const isAmountMissing = amount == null;

	if (isAmountMissing) {
		return;
	}

	const isAmountEmpty = amount === "";

	if (isAmountEmpty) {
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

	const isEnabledFlag = details["BestOfferEnabled"] === true;

	if (isEnabledFlag) {
		return true;
	}

	const isEnabledString = details["BestOfferEnabled"] === "true";

	return isEnabledString;
}

function findAuctionListingTypeViolation(
	tradingItem: TradingItemFields,
	parameter: string,
): Error | undefined {
	const listingType = tradingItem["ListingType"];
	const isListingTypeOmitted = listingType === undefined;

	if (isListingTypeOmitted) {
		return undefined;
	}

	const isAuctionListingType = listingType === TRADING_AUCTION_LISTING_TYPE;

	if (isAuctionListingType) {
		return undefined;
	}

	return inputError(
		`${parameter}.ListingType`,
		`AUCTION listings use ListingType ${TRADING_AUCTION_LISTING_TYPE}; omit it or pass format FIXED_PRICE for ${String(listingType)}`,
	);
}

function findAuctionQuantityViolation(
	tradingItem: TradingItemFields,
	parameter: string,
): Error | undefined {
	const quantity = tradingItem["Quantity"];
	const isQuantityOmitted = quantity === undefined;

	if (isQuantityOmitted) {
		return undefined;
	}

	const isNotSingleUnit = Number(quantity) != 1;

	if (isNotSingleUnit) {
		return inputError(
			`${parameter}.Quantity`,
			"AUCTION listings sell a single unit; omit Quantity or set it to 1",
		);
	}

	return undefined;
}

function findAuctionBestOfferConflict(
	tradingItem: TradingItemFields,
	parameter: string,
): Error | undefined {
	const hasNoBestOffer = !isBestOfferEnabled(tradingItem);

	if (hasNoBestOffer) {
		return undefined;
	}

	const hasBuyItNowPrice = tradingItem["BuyItNowPrice"] !== undefined;

	if (hasBuyItNowPrice) {
		return inputError(
			`${parameter}.BestOfferDetails.BestOfferEnabled`,
			"an AUCTION listing can carry Best Offer or a BuyItNowPrice, not both",
		);
	}

	return undefined;
}

function auctionViolation(
	tradingItem: TradingItemFields,
	parameter: string,
): Error | undefined {
	const listingTypeViolation = findAuctionListingTypeViolation(
		tradingItem,
		parameter,
	);
	const hasListingTypeViolation = listingTypeViolation !== undefined;

	if (hasListingTypeViolation) {
		return listingTypeViolation;
	}

	if (tradingItem["ListingDuration"] === TRADING_GTC_DURATION) {
		return inputError(
			`${parameter}.ListingDuration`,
			"AUCTION listings need a day-count ListingDuration such as Days_7; GTC is only valid for FIXED_PRICE listings",
		);
	}

	const quantityViolation = findAuctionQuantityViolation(
		tradingItem,
		parameter,
	);
	const hasQuantityViolation = quantityViolation !== undefined;

	if (hasQuantityViolation) {
		return quantityViolation;
	}

	return findAuctionBestOfferConflict(tradingItem, parameter);
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

	const durationViolation = findFixedPriceDurationViolation(
		tradingItem,
		parameter,
	);
	const hasDurationViolation = durationViolation !== undefined;

	if (hasDurationViolation) {
		return durationViolation;
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

function findFixedPriceDurationViolation(
	tradingItem: TradingItemFields,
	parameter: string,
): Error | undefined {
	const listingDuration = tradingItem["ListingDuration"];
	const isDurationOmitted = listingDuration === undefined;

	if (isDurationOmitted) {
		return undefined;
	}

	const isGtcDuration = listingDuration === TRADING_GTC_DURATION;

	if (isGtcDuration) {
		return undefined;
	}

	return inputError(
		`${parameter}.ListingDuration`,
		`FIXED_PRICE listings must use ListingDuration ${TRADING_GTC_DURATION} (the only duration eBay accepts for fixed-price listings); day counts such as Days_7 are for AUCTION listings`,
	);
}

function findReserveAboveStartViolation(
	reserve: number | undefined,
	start: number,
	parameter: string,
): Error | undefined {
	const isReserveMissing = reserve === undefined;

	if (isReserveMissing) {
		return undefined;
	}

	const reserveIsNotAboveStart = reserve <= start;

	if (reserveIsNotAboveStart) {
		return inputError(
			`${parameter}.ReservePrice`,
			"ReservePrice must be higher than StartPrice (the opening bid)",
		);
	}

	return undefined;
}

function findBuyItNowMarginViolation(
	buyItNow: number | undefined,
	start: number,
	parameter: string,
): Error | undefined {
	const isBuyItNowMissing = buyItNow === undefined;

	if (isBuyItNowMissing) {
		return undefined;
	}

	const buyItNowMissesMargin = !meetsBuyItNowMargin(start, buyItNow);

	if (buyItNowMissesMargin) {
		return inputError(
			`${parameter}.BuyItNowPrice`,
			`BuyItNowPrice must be at least ${BUY_IT_NOW_MARGIN_LABEL} higher than StartPrice (the opening bid)`,
		);
	}

	return undefined;
}

function auctionPriceViolation(
	tradingItem: TradingItemFields,
	parameter: string,
): Error | undefined {
	const start = parseTradingAmount(tradingItem["StartPrice"]);
	const isStartMissing = start === undefined;

	if (isStartMissing) {
		return;
	}

	const reserve = parseTradingAmount(tradingItem["ReservePrice"]);
	const reserveViolation = findReserveAboveStartViolation(
		reserve,
		start,
		parameter,
	);
	const hasReserveViolation = reserveViolation !== undefined;

	if (hasReserveViolation) {
		return reserveViolation;
	}

	const buyItNow = parseTradingAmount(tradingItem["BuyItNowPrice"]);

	return findBuyItNowMarginViolation(buyItNow, start, parameter);
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
