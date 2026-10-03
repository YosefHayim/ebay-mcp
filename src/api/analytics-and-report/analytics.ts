import type { components } from '@/types/sell-apps/analytics-and-report/sellAnalyticsV1Oas3.js';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  type EndpointInputError,
  optionalStringEffect,
  requestGetEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  findSellerStandardsProfilesInputSchema,
  getCustomerServiceMetricInputSchema,
  getSellerStandardsProfileInputSchema,
  getTrafficReportInputSchema,
} from '@/schemas/analytics/analytics.js';
import { Effect } from 'effect';
import type { InferEffectSchema } from '@/utils/effectSchemaTypes.js';

type GetTrafficReportInput = InferEffectSchema<typeof getTrafficReportInputSchema>;
type FindSellerStandardsProfilesInput = InferEffectSchema<
  typeof findSellerStandardsProfilesInputSchema
>;
type GetSellerStandardsProfileInput = InferEffectSchema<
  typeof getSellerStandardsProfileInputSchema
>;
type GetCustomerServiceMetricInput = InferEffectSchema<typeof getCustomerServiceMetricInputSchema>;

/**
 * Traffic report response returned by eBay Analytics getTrafficReport.
 *
 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/traffic_report/methods/getTrafficReport
 */
export type GetTrafficReportResponse = components['schemas']['Report'];

/**
 * Seller standards profile response returned by eBay Analytics getSellerStandardsProfile.
 *
 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/seller_standards_profile/methods/getSellerStandardsProfile
 */
export type GetSellerStandardsProfileResponse = components['schemas']['StandardsProfile'];

/**
 * Seller standards profile collection returned by eBay Analytics findSellerStandardsProfiles.
 *
 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/seller_standards_profile/methods/findSellerStandardsProfiles
 */
export type FindSellerStandardsProfilesResponse =
  components['schemas']['FindSellerStandardsProfilesResponse'];

/**
 * Customer service metric response returned by eBay Analytics getCustomerServiceMetric.
 *
 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/customer_service_metric/methods/getCustomerServiceMetric
 */
export type GetCustomerServiceMetricResponse =
  components['schemas']['GetCustomerServiceMetricResponse'];

/**
 * Analytics API - Sales and traffic analytics
 * Based on: sell_analytics_v1_oas3.json
 */
export class AnalyticsApi {
  private readonly basePath = '/sell/analytics/v1';
  private readonly client: EbayApiClient;

  constructor(client: EbayApiClient) {
    this.client = client;
  }

  /**
   * Retrieves listing traffic report metrics.
   *
   * @param input - Traffic report dimension, filter, metric, and optional sort expression.
   * @returns An Effect that succeeds with eBay's generated traffic report response.
   *
   * @example
   * ```ts
   * const report = await Effect.runPromise(
   *   analyticsApi.getTrafficReport({
   *     dimension: 'LISTING',
   *     filter: 'listing_ids:{123}',
   *     metric: 'IMPRESSION',
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/analytics/resources/traffic_report/methods/getTrafficReport
   */
  getTrafficReport = (
    input: GetTrafficReportInput,
  ): Effect.Effect<GetTrafficReportResponse, EbayApiError | EndpointInputError> => {
    const { basePath, client } = this;
    const path = `${basePath}/traffic_report`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetTrafficReportInput>(input, 'input');
      const validatedDimension = yield* requireStringEffect(validatedInput.dimension, 'dimension');
      const validatedFilter = yield* requireStringEffect(validatedInput.filter, 'filter');
      const validatedMetric = yield* requireStringEffect(validatedInput.metric, 'metric');
      const validatedSort = yield* optionalStringEffect(validatedInput.sort, 'sort');
      const params = buildEndpointParams({
        dimension: { wireName: 'dimension', value: validatedDimension },
        filter: { wireName: 'filter', value: validatedFilter },
        metric: { wireName: 'metric', value: validatedMetric },
        sort: { wireName: 'sort', value: validatedSort },
      });

      return yield* requestGetEffect<GetTrafficReportResponse>(client, path, params);
    });
  };

  /**
   * Retrieves every seller standards profile available for the seller.
   *
   * @param input - Empty endpoint input object.
   * @returns An Effect that succeeds with eBay's generated seller standards profile collection.
   *
   * @example
   * ```ts
   * const profiles = await Effect.runPromise(analyticsApi.findSellerStandardsProfiles({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/analytics/resources/seller_standards_profile/methods/findSellerStandardsProfiles
   */
  findSellerStandardsProfiles = (
    input: FindSellerStandardsProfilesInput = {},
  ): Effect.Effect<FindSellerStandardsProfilesResponse, EbayApiError> => {
    void input;
    return requestGetEffect<FindSellerStandardsProfilesResponse>(
      this.client,
      `${this.basePath}/seller_standards_profile`,
    );
  };

  /**
   * Retrieves one seller standards profile by program and cycle.
   *
   * @param input - Seller standards program identifier and cycle.
   * @returns An Effect that succeeds with eBay's generated StandardsProfile response.
   *
   * @example
   * ```ts
   * const profile = await Effect.runPromise(
   *   analyticsApi.getSellerStandardsProfile({
   *     program: 'CUSTOMER_SERVICE',
   *     cycle: 'CURRENT',
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/analytics/resources/seller_standards_profile/methods/getSellerStandardsProfile
   */
  getSellerStandardsProfile = (
    input: GetSellerStandardsProfileInput,
  ): Effect.Effect<GetSellerStandardsProfileResponse, EbayApiError | EndpointInputError> => {
    const { basePath, client } = this;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetSellerStandardsProfileInput>(
        input,
        'input',
      );
      const validatedProgram = yield* requireStringEffect(validatedInput.program, 'program');
      const validatedCycle = yield* requireStringEffect(validatedInput.cycle, 'cycle');

      return yield* requestGetEffect<GetSellerStandardsProfileResponse>(
        client,
        `${basePath}/seller_standards_profile/${validatedProgram}/${validatedCycle}`,
      );
    });
  };

  /**
   * Retrieves customer service metric benchmarks for a marketplace.
   *
   * @param input - Metric type, evaluation type, and marketplace identifier.
   * @returns An Effect that succeeds with eBay's generated customer service metric response.
   *
   * @example
   * ```ts
   * const metric = await Effect.runPromise(
   *   analyticsApi.getCustomerServiceMetric({
   *     customerServiceMetricType: 'ITEM_NOT_AS_DESCRIBED',
   *     evaluationType: 'CURRENT',
   *     evaluationMarketplaceId: 'EBAY_US',
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/analytics/resources/customer_service_metric/methods/getCustomerServiceMetric
   */
  getCustomerServiceMetric = (
    input: GetCustomerServiceMetricInput,
  ): Effect.Effect<GetCustomerServiceMetricResponse, EbayApiError | EndpointInputError> => {
    const { basePath, client } = this;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetCustomerServiceMetricInput>(
        input,
        'input',
      );
      const validatedMetricType = yield* requireStringEffect(
        validatedInput.customerServiceMetricType,
        'customerServiceMetricType',
      );
      const validatedEvaluationType = yield* requireStringEffect(
        validatedInput.evaluationType,
        'evaluationType',
      );
      const validatedMarketplaceId = yield* requireStringEffect(
        validatedInput.evaluationMarketplaceId,
        'evaluationMarketplaceId',
      );
      const params = buildEndpointParams({
        evaluationMarketplaceId: {
          wireName: 'evaluation_marketplace_id',
          value: validatedMarketplaceId,
        },
      });

      return yield* requestGetEffect<GetCustomerServiceMetricResponse>(
        client,
        `${basePath}/customer_service_metric/${validatedMetricType}/${validatedEvaluationType}`,
        params,
      );
    });
  };
}
