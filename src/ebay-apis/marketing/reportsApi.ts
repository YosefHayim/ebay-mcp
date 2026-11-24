import type { z } from "zod";
import type {
	createReportTaskInputSchema,
	deleteReportTaskInputSchema,
	getReportInputSchema,
	getReportMetadataForReportTypeInputSchema,
	getReportMetadataInputSchema,
	getReportTaskInputSchema,
	getReportTasksInputSchema,
} from "@/ebay-apis/marketing/marketingSchemas.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	requestDeleteEffect,
	requestGetEffect,
	requestPostEffect,
} from "@/ebay-client/request.js";
import {
	MARKETING_BASE_PATH,
	type MarketingOperationResponse,
} from "./marketingSharedApi.js";

type GetReportInput = z.infer<typeof getReportInputSchema>;
type GetReportMetadataInput = z.infer<typeof getReportMetadataInputSchema>;
type GetReportMetadataForReportTypeInput = z.infer<
	typeof getReportMetadataForReportTypeInputSchema
>;
type GetReportTasksInput = z.infer<typeof getReportTasksInputSchema>;
type CreateReportTaskInput = z.infer<typeof createReportTaskInputSchema>;
type GetReportTaskInput = z.infer<typeof getReportTaskInputSchema>;
type DeleteReportTaskInput = z.infer<typeof deleteReportTaskInputSchema>;

export type GetReportResponse = MarketingOperationResponse<"getReport">;

export type GetReportMetadataResponse =
	MarketingOperationResponse<"getReportMetadata">;

export type GetReportMetadataForReportTypeResponse =
	MarketingOperationResponse<"getReportMetadataForReportType">;

export type GetReportTasksResponse =
	MarketingOperationResponse<"getReportTasks">;

export type CreateReportTaskResponse =
	MarketingOperationResponse<"createReportTask">;

export type GetReportTaskResponse = MarketingOperationResponse<"getReportTask">;

export type DeleteReportTaskResponse =
	MarketingOperationResponse<"deleteReportTask">;

export function createMarketingReportsMethods(client: EbayApiClient) {
	return {
		getReport: (input: GetReportInput): Promise<GetReportResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_report/${input.reportId}`;
			return requestGetEffect<GetReportResponse>(client, path);
		},

		getReportMetadata: (
			input: GetReportMetadataInput = {},
		): Promise<GetReportMetadataResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_report_metadata`;
			const params = buildEndpointParams({
				fundingModel: { wireName: "funding_model", value: input.fundingModel },
				channel: { wireName: "channel", value: input.channel },
			});
			return requestGetEffect<GetReportMetadataResponse>(client, path, params);
		},

		getReportMetadataForReportType: (
			input: GetReportMetadataForReportTypeInput,
		): Promise<GetReportMetadataForReportTypeResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_report_metadata/${input.reportType}`;
			const params = buildEndpointParams({
				fundingModel: { wireName: "funding_model", value: input.fundingModel },
				channel: { wireName: "channel", value: input.channel },
			});
			return requestGetEffect<GetReportMetadataForReportTypeResponse>(
				client,
				path,
				params,
			);
		},

		getReportTasks: (
			input: GetReportTasksInput = {},
		): Promise<GetReportTasksResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_report_task`;
			const params = buildEndpointParams({
				limit: { wireName: "limit", value: input.limit },
				offset: { wireName: "offset", value: input.offset },
				reportTaskStatuses: {
					wireName: "report_task_statuses",
					value: input.reportTaskStatuses,
				},
			});
			return requestGetEffect<GetReportTasksResponse>(client, path, params);
		},

		createReportTask: (
			input: CreateReportTaskInput,
		): Promise<CreateReportTaskResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_report_task`;
			return requestPostEffect<CreateReportTaskResponse>(
				client,
				path,
				input.request,
			);
		},

		getReportTask: (
			input: GetReportTaskInput,
		): Promise<GetReportTaskResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_report_task/${input.reportTaskId}`;
			return requestGetEffect<GetReportTaskResponse>(client, path);
		},

		deleteReportTask: (
			input: DeleteReportTaskInput,
		): Promise<DeleteReportTaskResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_report_task/${input.reportTaskId}`;
			return requestDeleteEffect<DeleteReportTaskResponse>(client, path);
		},
	};
}
