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

export type GetTrafficReportResponse = components["schemas"]["Report"];

export type GetSellerStandardsProfileResponse =
	components["schemas"]["StandardsProfile"];

export type FindSellerStandardsProfilesResponse =
	components["schemas"]["FindSellerStandardsProfilesResponse"];

export type GetCustomerServiceMetricResponse =
	components["schemas"]["GetCustomerServiceMetricResponse"];

export class AnalyticsApi {
	private readonly basePath = "/sell/analytics/v1";
	private readonly client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.client = client;
	}

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

	findSellerStandardsProfiles = (
		input: FindSellerStandardsProfilesInput = {},
	): Promise<FindSellerStandardsProfilesResponse> => {
		void input;
		return requestGetEffect<FindSellerStandardsProfilesResponse>(
			this.client,
			`${this.basePath}/seller_standards_profile`,
		);
	};

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
