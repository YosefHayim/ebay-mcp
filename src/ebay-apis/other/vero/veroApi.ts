import type { z } from "zod";
import type {
	createVeroReportInputSchema,
	getVeroReasonCodeInputSchema,
	getVeroReasonCodesInputSchema,
	getVeroReportInputSchema,
	getVeroReportItemsInputSchema,
} from "@/ebay-apis/other/otherApisSchemas.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	optionalStringEffect,
	requestGetEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/commerceVeroV1Oas3.js";

type CreateVeroReportRequest = components["schemas"]["VeroReportItemsRequest"];
type CreateVeroReportInput = z.infer<typeof createVeroReportInputSchema>;
type GetVeroReportInput = z.infer<typeof getVeroReportInputSchema>;
type GetVeroReportItemsInput = z.infer<typeof getVeroReportItemsInputSchema>;
type GetVeroReasonCodeInput = z.infer<typeof getVeroReasonCodeInputSchema>;
type GetVeroReasonCodesInput = z.infer<typeof getVeroReasonCodesInputSchema>;

export type CreateVeroReportResponse =
	components["schemas"]["VeroReportItemsResponse"];

export type VeroReportResponse = components["schemas"]["ReportStatusResponse"];

export type VeroReportItemsResponse =
	components["schemas"]["VeroReportStatusResponse"];

export type VeroReasonCodeResponse =
	components["schemas"]["VeroReasonCodeResponse"];

export type VeroReasonCodesResponse =
	components["schemas"]["VeroReasonCodeDetailResponse"];

export class VeroApi {
	private readonly basePath = "/commerce/vero/v1";

	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	public createVeroReport = async (
		input: CreateVeroReportInput,
	): Promise<CreateVeroReportResponse> => {
		const client = this.client;
		const path = `${this.basePath}/vero_report`;

		const endpointInput = requireObjectEffect<CreateVeroReportInput>(
			input,
			"input",
		);
		const veroReport = requireObjectEffect<CreateVeroReportRequest>(
			endpointInput.reportData,
			"reportData",
		);

		return requestPostEffect<CreateVeroReportResponse>(
			client,
			path,
			veroReport,
		);
	};

	public getVeroReport = async (
		input: GetVeroReportInput,
	): Promise<VeroReportResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const endpointInput = requireObjectEffect<GetVeroReportInput>(
			input,
			"input",
		);
		const veroReportId = requireStringEffect(
			endpointInput.veroReportId,
			"veroReportId",
		);

		return requestGetEffect<VeroReportResponse>(
			client,
			`${basePath}/vero_report/${veroReportId}`,
		);
	};

	public getVeroReportItems = async (
		input: GetVeroReportItemsInput = {},
	): Promise<VeroReportItemsResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const validatedInput = requireObjectEffect<GetVeroReportItemsInput>(
			input,
			"input",
		);
		const filter = optionalStringEffect(validatedInput.filter, "filter");
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const offset = optionalNonNegativeNumberEffect(
			validatedInput.offset,
			"offset",
		);
		const params = buildEndpointParams({
			filter: { wireName: "filter", value: filter },
			limit: { wireName: "limit", value: limit },
			offset: { wireName: "offset", value: offset },
		});

		return requestGetEffect<VeroReportItemsResponse>(
			client,
			`${basePath}/vero_report_items`,
			params,
		);
	};

	public getVeroReasonCode = async (
		input: GetVeroReasonCodeInput,
	): Promise<VeroReasonCodeResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const endpointInput = requireObjectEffect<GetVeroReasonCodeInput>(
			input,
			"input",
		);
		const veroReasonCodeId = requireStringEffect(
			endpointInput.veroReasonCodeId,
			"veroReasonCodeId",
		);

		return requestGetEffect<VeroReasonCodeResponse>(
			client,
			`${basePath}/vero_reason_code/${veroReasonCodeId}`,
		);
	};

	public getVeroReasonCodes = async (
		input: GetVeroReasonCodesInput = {},
	): Promise<VeroReasonCodesResponse> => {
		void input;
		return requestGetEffect<VeroReasonCodesResponse>(
			this.client,
			`${this.basePath}/vero_reason_code`,
		);
	};
}
