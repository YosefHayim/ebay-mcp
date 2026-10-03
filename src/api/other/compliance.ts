import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { EbayApiError, type EndpointInputError } from '@/api/shared/request.js';
import type { SellComplianceComponents } from '@/types/sell-apps/other-apis/sellComplianceV1Oas3.js';
import { Effect } from 'effect';

/**
 * eBay decommissioned the Sell Compliance API on 2026-03-30 with no API
 * replacement. Seller Hub → Performance → Issue Resolution Center is the UI path.
 *
 * @see https://developer.ebay.com/develop/guides/api-deprecation-status
 */
const COMPLIANCE_API_DECOMMISSIONED_MESSAGE =
  'eBay decommissioned the Sell Compliance API on 2026-03-30. There is no API equivalent; use Seller Hub → Performance → Issue Resolution Center instead.';

const failDecommissioned = <A>(path: string): Effect.Effect<A, EbayApiError | EndpointInputError> =>
  Effect.fail(
    new EbayApiError({
      method: 'GET',
      path,
      cause: new Error(COMPLIANCE_API_DECOMMISSIONED_MESSAGE),
    }),
  );

/** Input accepted by getListingViolations (kept for call-site compatibility). */
export interface GetListingViolationsInput {
  /** Compliance type filter, sent as compliance_type. */
  readonly complianceType?: string;
  /** Compliance state filter expression, sent as filter. */
  readonly filter?: string;
  /** Number of violations to skip. */
  readonly offset?: number;
  /** Number of violations to return. */
  readonly limit?: number;
}

/** Input accepted by getListingViolationsSummary (kept for call-site compatibility). */
export interface GetListingViolationsSummaryInput {
  /** Compliance type filter, sent as compliance_type. */
  readonly complianceType?: string;
}

/**
 * Response returned by getListingViolations.
 *
 * @see https://developer.ebay.com/api-docs/sell/compliance/resources/listing_violation/methods/getListingViolations
 */
export type ListingViolationsResponse =
  SellComplianceComponents['schemas']['PagedComplianceViolationCollection'];

/**
 * Response returned by getListingViolationsSummary.
 *
 * @see https://developer.ebay.com/api-docs/sell/compliance/resources/listing_violation_summary/methods/getListingViolationsSummary
 */
export type ListingViolationsSummaryResponse =
  SellComplianceComponents['schemas']['ComplianceSummary'];

/** Clear error copy exported for tests and callers that match on the message. */
export { COMPLIANCE_API_DECOMMISSIONED_MESSAGE };

/** Compliance API - listing policy violation checks (decommissioned by eBay). */
export class ComplianceApi {
  private readonly basePath = '/sell/compliance/v1';

  public constructor(_client: EbayApiClient) {
    // Client is unused: eBay decommissioned this API, so methods never call the network.
    void _client;
  }

  /**
   * Always fails: eBay decommissioned the Sell Compliance API on 2026-03-30.
   *
   * @param _input - Ignored; retained so existing call sites type-check.
   * @returns An Effect that always fails with a clear decommission message.
   *
   * @example
   * ```ts
   * // Rejects with COMPLIANCE_API_DECOMMISSIONED_MESSAGE — no network call.
   * await Effect.runPromise(complianceApi.getListingViolations({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/compliance/resources/listing_violation/methods/getListingViolations
   */
  public getListingViolations = (
    _input: GetListingViolationsInput = {},
  ): Effect.Effect<ListingViolationsResponse, EbayApiError | EndpointInputError> => {
    void _input;
    return failDecommissioned(`${this.basePath}/listing_violation`);
  };

  /**
   * Always fails: eBay decommissioned the Sell Compliance API on 2026-03-30.
   *
   * @param _input - Ignored; retained so existing call sites type-check.
   * @returns An Effect that always fails with a clear decommission message.
   *
   * @example
   * ```ts
   * // Rejects with COMPLIANCE_API_DECOMMISSIONED_MESSAGE — no network call.
   * await Effect.runPromise(complianceApi.getListingViolationsSummary({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/compliance/resources/listing_violation_summary/methods/getListingViolationsSummary
   */
  public getListingViolationsSummary = (
    _input: GetListingViolationsSummaryInput = {},
  ): Effect.Effect<ListingViolationsSummaryResponse, EbayApiError | EndpointInputError> => {
    void _input;
    return failDecommissioned(`${this.basePath}/listing_violation_summary`);
  };
}
