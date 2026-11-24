import type { z } from "zod";
import type {
	findSellerStandardsProfilesInputSchema,
	getCustomerServiceMetricInputSchema,
	getSellerStandardsProfileInputSchema,
	getTrafficReportInputSchema,
} from "@/ebay-apis/analytics/analyticsSchemas.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	optionalStringEffect,
	requestGetEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellAnalyticsV1Oas3.js";

type GetTrafficReportInput = z.infer<typeof getTrafficReportInputSchema>;
type FindSellerStandardsProfilesInput = z.infer<
	typeof findSellerStandardsProfilesInputSchema
>;
type GetSellerStandardsProfileInput = z.infer<
	typeof getSellerStandardsProfileInputSchema
>;
type GetCustomerServiceMetricInput = z.infer<
	typeof getCustomerServiceMetricInputSchema
>;

/**
 * Traffic report response returned by eBay Analytics getTrafficReport.
 *
 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/traffic_report/methods/getTrafficReport
 */
export type GetTrafficReportResponse = components["schemas"]["Report"];

/**
 * Seller standards profile response returned by eBay Analytics getSellerStandardsProfile.
 *
 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/seller_standards_profile/methods/getSellerStandardsProfile
 */
export type GetSellerStandardsProfileResponse =
	components["schemas"]["StandardsProfile"];

/**
 * Seller standards profile collection returned by eBay Analytics findSellerStandardsProfiles.
 *
 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/seller_standards_profile/methods/findSellerStandardsProfiles
 */
export type FindSellerStandardsProfilesResponse =
	components["schemas"]["FindSellerStandardsProfilesResponse"];

/**
 * Customer service metric response returned by eBay Analytics getCustomerServiceMetric.
 *
 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/customer_service_metric/methods/getCustomerServiceMetric
 */
export type GetCustomerServiceMetricResponse =
	components["schemas"]["GetCustomerServiceMetricResponse"];

/**
 * Analytics API - Sales and traffic analytics
 * Based on: sell_analytics_v1_oas3.json
 */
export class AnalyticsApi {
	private readonly basePath = "/sell/analytics/v1";
	private readonly client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.client = client;
	}

	/**
	 * Retrieves listing traffic report metrics.
	 *
	 * @param input - Traffic report dimension, filter, metric, and optional sort expression.
	 * @returns A promise that resolves with eBay's generated traffic report response.
	 *
	 * @example
	 * ```ts
	 * const report = await analyticsApi.getTrafficReport({
	 *     dimension: 'LISTING',
	 *     filter: 'listing_ids:{123}',
	 *     metric: 'IMPRESSION',
	 *   });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/traffic_report/methods/getTrafficReport
	 */
	getTrafficReport = async (
		input: GetTrafficReportInput,
	): Promise<GetTrafficReportResponse> => {
		const { basePath, client } = this;
		const path = `${basePath}/traffic_report`;
		const validatedInput = requireObjectEffect<GetTrafficReportInput>(
			input,
			"input",
		);
		const validatedDimension = requireStringEffect(
			validatedInput.dimension,
			"dimension",
		);
		const validatedFilter = requireStringEffect(
			validatedInput.filter,
			"filter",
		);
		const validatedMetric = requireStringEffect(
			validatedInput.metric,
			"metric",
		);
		const validatedSort = optionalStringEffect(validatedInput.sort, "sort");
		const params = buildEndpointParams({
			dimension: { wireName: "dimension", value: validatedDimension },
			filter: { wireName: "filter", value: validatedFilter },
			metric: { wireName: "metric", value: validatedMetric },
			sort: { wireName: "sort", value: validatedSort },
		});

		return requestGetEffect<GetTrafficReportResponse>(client, path, params);
	};

	/**
	 * Retrieves every seller standards profile available for the seller.
	 *
	 * @param input - Empty endpoint input object.
	 * @returns A promise that resolves with eBay's generated seller standards profile collection.
	 *
	 * @example
	 * ```ts
	 * const profiles = await analyticsApi.findSellerStandardsProfiles({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/seller_standards_profile/methods/findSellerStandardsProfiles
	 */
	findSellerStandardsProfiles = (
		input: FindSellerStandardsProfilesInput = {},
	): Promise<FindSellerStandardsProfilesResponse> => {
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
	 * @returns A promise that resolves with eBay's generated StandardsProfile response.
	 *
	 * @example
	 * ```ts
	 * const profile = await analyticsApi.getSellerStandardsProfile({
	 *     program: 'CUSTOMER_SERVICE',
	 *     cycle: 'CURRENT',
	 *   });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/seller_standards_profile/methods/getSellerStandardsProfile
	 */
	getSellerStandardsProfile = async (
		input: GetSellerStandardsProfileInput,
	): Promise<GetSellerStandardsProfileResponse> => {
		const { basePath, client } = this;
		const validatedInput = requireObjectEffect<GetSellerStandardsProfileInput>(
			input,
			"input",
		);
		const validatedProgram = requireStringEffect(
			validatedInput.program,
			"program",
		);
		const validatedCycle = requireStringEffect(validatedInput.cycle, "cycle");

		return requestGetEffect<GetSellerStandardsProfileResponse>(
			client,
			`${basePath}/seller_standards_profile/${validatedProgram}/${validatedCycle}`,
		);
	};

	/**
	 * Retrieves customer service metric benchmarks for a marketplace.
	 *
	 * @param input - Metric type, evaluation type, and marketplace identifier.
	 * @returns A promise that resolves with eBay's generated customer service metric response.
	 *
	 * @example
	 * ```ts
	 * const metric = await analyticsApi.getCustomerServiceMetric({
	 *     customerServiceMetricType: 'ITEM_NOT_AS_DESCRIBED',
	 *     evaluationType: 'CURRENT',
	 *     evaluationMarketplaceId: 'EBAY_US',
	 *   });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/analytics/resources/customer_service_metric/methods/getCustomerServiceMetric
	 */
	getCustomerServiceMetric = async (
		input: GetCustomerServiceMetricInput,
	): Promise<GetCustomerServiceMetricResponse> => {
		const { basePath, client } = this;
		const validatedInput = requireObjectEffect<GetCustomerServiceMetricInput>(
			input,
			"input",
		);
		const validatedMetricType = requireStringEffect(
			validatedInput.customerServiceMetricType,
			"customerServiceMetricType",
		);
		const validatedEvaluationType = requireStringEffect(
			validatedInput.evaluationType,
			"evaluationType",
		);
		const validatedMarketplaceId = requireStringEffect(
			validatedInput.evaluationMarketplaceId,
			"evaluationMarketplaceId",
		);
		const params = buildEndpointParams({
			evaluationMarketplaceId: {
				wireName: "evaluation_marketplace_id",
				value: validatedMarketplaceId,
			},
		});

		return requestGetEffect<GetCustomerServiceMetricResponse>(
			client,
			`${basePath}/customer_service_metric/${validatedMetricType}/${validatedEvaluationType}`,
			params,
		);
	};
}
