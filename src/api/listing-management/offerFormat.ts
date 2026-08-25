import { EndpointInputError } from '@/api/shared/request.js';
import { FormatType, ListingDuration } from '@/types/ebayEnums.js';
import type { components } from '@/types/sell-apps/listing-management/sellInventoryV1Oas3.js';
import { Effect } from 'effect';

type OfferDetails = components['schemas']['EbayOfferDetailsWithId'];
type OfferWithKeys = components['schemas']['EbayOfferDetailsWithKeys'];
type Amount = components['schemas']['Amount'];

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
  if (offer.availableQuantity !== undefined) {
    return inputError(
      `${parameter}.availableQuantity`,
      'availableQuantity is not applicable for AUCTION offers (eBay error 25762); omit it — the inventory item quantity covers the auction',
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
  if (offer.listingPolicies?.bestOfferTerms?.bestOfferEnabled === true) {
    return inputError(
      `${parameter}.listingPolicies.bestOfferTerms.bestOfferEnabled`,
      'Best Offer cannot be enabled on AUCTION offers',
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

const reserveViolation = (
  offer: OfferFormatFields,
  parameter: string,
): EndpointInputError | undefined => {
  const start = parseAmount(offer.pricingSummary?.auctionStartPrice);
  const reserve = parseAmount(offer.pricingSummary?.auctionReservePrice);
  if (start !== undefined && reserve !== undefined && reserve <= start) {
    return inputError(
      `${parameter}.pricingSummary.auctionReservePrice`,
      'auctionReservePrice must be higher than auctionStartPrice',
    );
  }
};

/**
 * Finds the first eBay listing-format rule an offer body breaks, if any.
 *
 * AUCTION offers need a day-count listingDuration and an auctionStartPrice, cannot
 * carry availableQuantity, per-buyer limits, Best Offer, or eBay Plus; FIXED_PRICE
 * offers must use GTC and cannot carry auction prices; a reserve price must always
 * exceed the starting bid. Update bodies carry no format, so only the format-free
 * rules apply to them.
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
  return formatViolation ?? reserveViolation(offer, parameter);
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
