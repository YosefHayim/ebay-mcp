import {
	BUY_IT_NOW_MARGIN_LABEL,
	meetsBuyItNowMargin,
} from "@/ebay-client/auctionPricing.js";

import type { components } from "@/ebay-openapi-types/sellInventoryV1Oas3.js";
import { FormatType, ListingDuration } from "@/shared/ebayEnums.js";

type OfferDetails = components["schemas"]["EbayOfferDetailsWithId"];
type OfferWithKeys = components["schemas"]["EbayOfferDetailsWithKeys"];
type Amount = components["schemas"]["Amount"];

const AUCTION_QUANTITY = 1;

export type OfferFormatFields = Pick<OfferWithKeys, "format"> &
	Pick<
		OfferDetails,
		| "availableQuantity"
		| "listingDuration"
		| "listingPolicies"
		| "pricingSummary"
		| "quantityLimitPerBuyer"
	>;

function inputError(parameter: string, message: string): Error {
	return new Error(`${parameter}: ${message}`);
}

function parseAmount(amount: Amount | undefined): number | undefined {
	if (amount?.value === undefined) {
		return;
	}
	const parsed = Number(amount.value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function findAuctionQuantityViolation(
	offer: OfferFormatFields,
	parameter: string,
): Error | undefined {
	const isQuantityOmitted = offer.availableQuantity === undefined;

	if (isQuantityOmitted) {
		return undefined;
	}

	const isSingleUnit = offer.availableQuantity == AUCTION_QUANTITY;

	if (isSingleUnit) {
		return undefined;
	}

	return inputError(
		`${parameter}.availableQuantity`,
		"AUCTION offers list a single unit; omit availableQuantity or set it to 1",
	);
}

function findAuctionBestOfferPriceConflict(
	offer: OfferFormatFields,
	parameter: string,
): Error | undefined {
	const isBestOfferOff =
		offer.listingPolicies?.bestOfferTerms?.bestOfferEnabled != true;

	if (isBestOfferOff) {
		return undefined;
	}

	const hasBuyItNowPrice = offer.pricingSummary?.price !== undefined;

	if (hasBuyItNowPrice) {
		return inputError(
			`${parameter}.listingPolicies.bestOfferTerms.bestOfferEnabled`,
			"an AUCTION offer can carry Best Offer or a Buy It Now price (pricingSummary.price), not both",
		);
	}

	return undefined;
}

function auctionViolation(
	offer: OfferFormatFields,
	parameter: string,
): Error | undefined {
	if (offer.listingDuration == ListingDuration.GTC) {
		return inputError(
			`${parameter}.listingDuration`,
			"AUCTION offers need a day-count listingDuration such as DAYS_7; GTC is only valid for FIXED_PRICE offers",
		);
	}

	const quantityViolation = findAuctionQuantityViolation(offer, parameter);
	const hasQuantityViolation = quantityViolation !== undefined;

	if (hasQuantityViolation) {
		return quantityViolation;
	}

	if (offer.listingPolicies?.eBayPlusIfEligible == true) {
		return inputError(
			`${parameter}.listingPolicies.eBayPlusIfEligible`,
			"eBayPlusIfEligible is not applicable for AUCTION offers",
		);
	}
	if (offer.quantityLimitPerBuyer !== undefined) {
		return inputError(
			`${parameter}.quantityLimitPerBuyer`,
			"quantityLimitPerBuyer does not apply to AUCTION offers",
		);
	}

	return findAuctionBestOfferPriceConflict(offer, parameter);
}

function findFixedPriceDurationViolation(
	offer: OfferFormatFields,
	parameter: string,
): Error | undefined {
	const isDurationOmitted = offer.listingDuration === undefined;

	if (isDurationOmitted) {
		return undefined;
	}

	const isGtcDuration = offer.listingDuration == ListingDuration.GTC;

	if (isGtcDuration) {
		return undefined;
	}

	return inputError(
		`${parameter}.listingDuration`,
		"FIXED_PRICE offers must use listingDuration GTC; day-count durations are for AUCTION offers",
	);
}

function findFixedPriceAuctionPriceViolation(
	offer: OfferFormatFields,
	parameter: string,
): Error | undefined {
	const pricing = offer.pricingSummary;
	const hasAuctionStartPrice = pricing?.auctionStartPrice !== undefined;

	if (hasAuctionStartPrice) {
		return inputError(
			`${parameter}.pricingSummary`,
			"auctionStartPrice and auctionReservePrice only apply to AUCTION offers; FIXED_PRICE offers use pricingSummary.price",
		);
	}

	const hasAuctionReservePrice = pricing?.auctionReservePrice !== undefined;

	if (hasAuctionReservePrice) {
		return inputError(
			`${parameter}.pricingSummary`,
			"auctionStartPrice and auctionReservePrice only apply to AUCTION offers; FIXED_PRICE offers use pricingSummary.price",
		);
	}

	return undefined;
}

function fixedPriceViolation(
	offer: OfferFormatFields,
	parameter: string,
): Error | undefined {
	const durationViolation = findFixedPriceDurationViolation(offer, parameter);
	const hasDurationViolation = durationViolation !== undefined;

	if (hasDurationViolation) {
		return durationViolation;
	}

	return findFixedPriceAuctionPriceViolation(offer, parameter);
}

function auctionCreateViolation(
	offer: OfferFormatFields,
	parameter: string,
): Error | undefined {
	if (offer.listingDuration === undefined) {
		return inputError(
			`${parameter}.listingDuration`,
			"listingDuration is required for AUCTION offers (a day count such as DAYS_7)",
		);
	}
	if (offer.pricingSummary?.auctionStartPrice === undefined) {
		return inputError(
			`${parameter}.pricingSummary.auctionStartPrice`,
			"auctionStartPrice is required for AUCTION offers",
		);
	}

	return undefined;
}

function auctionPriceViolation(
	offer: OfferFormatFields,
	parameter: string,
): Error | undefined {
	const start = parseAmount(offer.pricingSummary?.auctionStartPrice);
	const isStartMissing = start === undefined;

	if (isStartMissing) {
		return;
	}

	const reserve = parseAmount(offer.pricingSummary?.auctionReservePrice);
	const reserveViolation = findReserveAboveStartViolation(
		reserve,
		start,
		parameter,
	);
	const hasReserveViolation = reserveViolation !== undefined;

	if (hasReserveViolation) {
		return reserveViolation;
	}

	const buyItNow = parseAmount(offer.pricingSummary?.price);

	return findBuyItNowMarginViolation(buyItNow, start, parameter);
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
			`${parameter}.pricingSummary.auctionReservePrice`,
			"auctionReservePrice must be higher than auctionStartPrice",
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
			`${parameter}.pricingSummary.price`,
			`the Buy It Now price (pricingSummary.price) must be at least ${BUY_IT_NOW_MARGIN_LABEL} higher than auctionStartPrice`,
		);
	}

	return undefined;
}

export function findOfferFormatViolation(
	offer: OfferFormatFields,
	parameter: string,
): Error | undefined {
	let formatViolation: Error | undefined;
	if (offer.format == FormatType.AUCTION) {
		formatViolation =
			auctionViolation(offer, parameter) ??
			auctionCreateViolation(offer, parameter);
	} else if (offer.format == FormatType.FIXED_PRICE) {
		formatViolation = fixedPriceViolation(offer, parameter);
	}
	return formatViolation ?? auctionPriceViolation(offer, parameter);
}

export function validateOfferFormatEffect(
	offer: OfferFormatFields,
	parameter: string,
): void {
	const violation = findOfferFormatViolation(offer, parameter);

	if (violation) {
		throw violation;
	}
}
