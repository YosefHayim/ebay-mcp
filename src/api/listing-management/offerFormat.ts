import { BUY_IT_NOW_MARGIN_LABEL, meetsBuyItNowMargin } from '@/api/shared/auctionPricing.js';
import { EndpointInputError } from '@/api/shared/request.js';
import { FormatType, ListingDuration } from '@/types/ebayEnums.js';
import type { components } from '@/types/sell-apps/listing-management/sellInventoryV1Oas3.js';
import { Effect } from 'effect';

type OfferDetails = components['schemas']['EbayOfferDetailsWithId'];
type OfferWithKeys = components['schemas']['EbayOfferDetailsWithKeys'];
type Amount = components['schemas']['Amount'];

/** The only `availableQuantity` eBay accepts on an auction offer. */
const AUCTION_QUANTITY = 1;

/**
 * Offer fields the listing-format rules read. Both create (with keys) and update
 * (without keys) bodies satisfy it; `format` is simply absent on update.
 */
export type OfferFormatFields = Pick<OfferWithKeys, 'format'> &
  Pick<
    OfferDetails,
    | 'availableQuantity'
    | 'listingDuration'
    | 'listingPolicies'
    | 'pricingSummary'
    | 'quantityLimitPerBuyer'
  >;

const inputError = (parameter: string, message: string): EndpointInputError =>
  new EndpointInputError({ parameter, message: `${parameter}: ${message}` });

const parseAmount = (amount: Amount | undefined): number | undefined => {
  if (amount?.value === undefined) {
    return;
  }
  const parsed = Number(amount.value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const auctionViolation = (
  offer: OfferFormatFields,
  parameter: string,
): EndpointInputError | undefined => {
  if (offer.listingDuration === ListingDuration.GTC) {
    return inputError(
      `${parameter}.listingDuration`,
      'AUCTION offers need a day-count listingDuration such as DAYS_7; GTC is only valid for FIXED_PRICE offers',
    );
  }
  if (offer.availableQuantity !== undefined && offer.availableQuantity !== AUCTION_QUANTITY) {
    return inputError(
      `${parameter}.availableQuantity`,
      'AUCTION offers list a single unit; omit availableQuantity or set it to 1',
    );
  }
  if (offer.listingPolicies?.eBayPlusIfEligible === true) {
    return inputError(
      `${parameter}.listingPolicies.eBayPlusIfEligible`,
      'eBayPlusIfEligible is not applicable for AUCTION offers',
    );
  }
  if (offer.quantityLimitPerBuyer !== undefined) {
    return inputError(
      `${parameter}.quantityLimitPerBuyer`,
      'quantityLimitPerBuyer does not apply to AUCTION offers',
    );
  }
  if (
    offer.listingPolicies?.bestOfferTerms?.bestOfferEnabled === true &&
    offer.pricingSummary?.price !== undefined
  ) {
    return inputError(
      `${parameter}.listingPolicies.bestOfferTerms.bestOfferEnabled`,
      'an AUCTION offer can carry Best Offer or a Buy It Now price (pricingSummary.price), not both',
    );
  }
};

const fixedPriceViolation = (
  offer: OfferFormatFields,
  parameter: string,
): EndpointInputError | undefined => {
  if (offer.listingDuration !== undefined && offer.listingDuration !== ListingDuration.GTC) {
    return inputError(
      `${parameter}.listingDuration`,
      'FIXED_PRICE offers must use listingDuration GTC; day-count durations are for AUCTION offers',
    );
  }
  const pricing = offer.pricingSummary;
  if (pricing?.auctionStartPrice !== undefined || pricing?.auctionReservePrice !== undefined) {
    return inputError(
      `${parameter}.pricingSummary`,
      'auctionStartPrice and auctionReservePrice only apply to AUCTION offers; FIXED_PRICE offers use pricingSummary.price',
    );
  }
};

/** Fields eBay requires when an AUCTION offer is created (its createOffer error catalogue). */
const auctionCreateViolation = (
  offer: OfferFormatFields,
  parameter: string,
): EndpointInputError | undefined => {
  if (offer.listingDuration === undefined) {
    return inputError(
      `${parameter}.listingDuration`,
      'listingDuration is required for AUCTION offers (a day count such as DAYS_7)',
    );
  }
  if (offer.pricingSummary?.auctionStartPrice === undefined) {
    return inputError(
      `${parameter}.pricingSummary.auctionStartPrice`,
      'auctionStartPrice is required for AUCTION offers',
    );
  }
};

/** Price relations that hold for any body carrying an opening bid, with or without a format. */
const auctionPriceViolation = (
  offer: OfferFormatFields,
  parameter: string,
): EndpointInputError | undefined => {
  const start = parseAmount(offer.pricingSummary?.auctionStartPrice);
  if (start === undefined) {
    return;
  }
  const reserve = parseAmount(offer.pricingSummary?.auctionReservePrice);
  if (reserve !== undefined && reserve <= start) {
    return inputError(
      `${parameter}.pricingSummary.auctionReservePrice`,
      'auctionReservePrice must be higher than auctionStartPrice',
    );
  }
  const buyItNow = parseAmount(offer.pricingSummary?.price);
  if (buyItNow !== undefined && !meetsBuyItNowMargin(start, buyItNow)) {
    return inputError(
      `${parameter}.pricingSummary.price`,
      `the Buy It Now price (pricingSummary.price) must be at least ${BUY_IT_NOW_MARGIN_LABEL} higher than auctionStartPrice`,
    );
  }
};

/**
 * Finds the first eBay listing-format rule an offer body breaks, if any.
 *
 * AUCTION offers need a day-count listingDuration and an auctionStartPrice, list a
 * single unit (availableQuantity omitted or 1), cannot carry per-buyer limits or
 * eBay Plus, and cannot combine Best Offer with a Buy It Now price; FIXED_PRICE
 * offers must use GTC and cannot carry auction prices. A reserve must exceed the
 * opening bid and a Buy It Now price must be at least 30% above it. Update bodies
 * carry no format, so only the format-free rules apply to them.
 *
 * @param offer - Create or update offer body.
 * @param parameter - Parameter path used to label the failing field (for example `body`).
 * @returns The tagged input error describing the violation, or undefined when the body is consistent.
 *
 * @example
 * ```ts
 * const violation = findOfferFormatViolation({ format: 'AUCTION', listingDuration: 'GTC' }, 'body');
 * ```
 */
export const findOfferFormatViolation = (
  offer: OfferFormatFields,
  parameter: string,
): EndpointInputError | undefined => {
  let formatViolation: EndpointInputError | undefined;
  if (offer.format === FormatType.AUCTION) {
    formatViolation =
      auctionViolation(offer, parameter) ?? auctionCreateViolation(offer, parameter);
  } else if (offer.format === FormatType.FIXED_PRICE) {
    formatViolation = fixedPriceViolation(offer, parameter);
  }
  return formatViolation ?? auctionPriceViolation(offer, parameter);
};

/**
 * Rejects an offer body that mixes AUCTION and FIXED_PRICE fields before it reaches eBay.
 *
 * @param offer - Create or update offer body.
 * @param parameter - Parameter path used to label the failing field (for example `body`).
 * @returns An Effect that succeeds when the body is consistent and fails with `EndpointInputError` otherwise.
 *
 * @example
 * ```ts
 * yield* validateOfferFormatEffect(body, 'body');
 * ```
 */
export const validateOfferFormatEffect = (
  offer: OfferFormatFields,
  parameter: string,
): Effect.Effect<void, EndpointInputError> => {
  const violation = findOfferFormatViolation(offer, parameter);
  return violation ? Effect.fail(violation) : Effect.void;
};
