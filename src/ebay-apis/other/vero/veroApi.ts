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

/** Generated request body for createVeroReport. */
type CreateVeroReportRequest = components["schemas"]["VeroReportItemsRequest"];
type CreateVeroReportInput = z.infer<typeof createVeroReportInputSchema>;
type GetVeroReportInput = z.infer<typeof getVeroReportInputSchema>;
type GetVeroReportItemsInput = z.infer<typeof getVeroReportItemsInputSchema>;
type GetVeroReasonCodeInput = z.infer<typeof getVeroReasonCodeInputSchema>;
type GetVeroReasonCodesInput = z.infer<typeof getVeroReasonCodesInputSchema>;

/**
 * Response returned by createVeroReport.
 *
 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_report/methods/createVeroReport
 */
export type CreateVeroReportResponse =
	components["schemas"]["VeroReportItemsResponse"];

/**
 * Response returned by getVeroReport.
 *
 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_report/methods/getVeroReport
 */
export type VeroReportResponse = components["schemas"]["ReportStatusResponse"];

/**
 * Response returned by getVeroReportItems.
 *
 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_report_items/methods/getVeroReportItems
 */
export type VeroReportItemsResponse =
	components["schemas"]["VeroReportStatusResponse"];

/**
 * Response returned by getVeroReasonCode.
 *
 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_reason_code/methods/getVeroReasonCode
 */
export type VeroReasonCodeResponse =
	components["schemas"]["VeroReasonCodeResponse"];

/**
 * Response returned by getVeroReasonCodes.
 *
 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_reason_code/methods/getVeroReasonCodes
 */
export type VeroReasonCodesResponse =
	components["schemas"]["VeroReasonCodeDetailResponse"];

/** VeRO API - Verified Rights Owner reporting and reason-code metadata. */
export class VeroApi {
	private readonly basePath = "/commerce/vero/v1";

	public constructor(private readonly client: EbayApiClient) {}

	/**
	 * Creates a VeRO report for one or more allegedly infringing listings.
	 *
	 * @param input - Generated VeroReportItemsRequest body.
	 * @returns A promise of eBay's VeroReportItemsResponse.
	 *
	 * @example
	 * ```ts
	 * const report = await veroApi.createVeroReport({
	 *   reportData: {
	 *     reportItems: [
	 *       { itemId: "110000000000", veroReasonCodeId: "CODE123" },
	 *     ],
	 *   },
	 * });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_report/methods/createVeroReport
	 */
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

	/**
	 * Retrieves a VeRO report by ID.
	 *
	 * @param input - VeRO report identifier returned by createVeroReport.
	 * @returns A promise of eBay's ReportStatusResponse.
	 *
	 * @example
	 * ```ts
	 * const report = await veroApi.getVeroReport({ veroReportId: 'REPORT123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_report/methods/getVeroReport
	 */
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

	/**
	 * Retrieves reported VeRO items with optional filtering and pagination.
	 *
	 * @param input - Optional filter, limit, and offset query parameters.
	 * @returns A promise of eBay's VeroReportStatusResponse.
	 *
	 * @example
	 * ```ts
	 * const items = await veroApi.getVeroReportItems({ limit: 10 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_report_items/methods/getVeroReportItems
	 */
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

	/**
	 * Retrieves one VeRO reason code by ID.
	 *
	 * @param input - VeRO reason-code identifier.
	 * @returns A promise of eBay's VeroReasonCodeResponse.
	 *
	 * @example
	 * ```ts
	 * const reason = await veroApi.getVeroReasonCode({ veroReasonCodeId: 'CODE123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_reason_code/methods/getVeroReasonCode
	 */
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

	/**
	 * Retrieves all available VeRO reason codes.
	 *
	 * @param input - Empty endpoint input object.
	 * @returns A promise of eBay's VeroReasonCodeDetailResponse.
	 *
	 * @example
	 * ```ts
	 * const reasonCodes = await veroApi.getVeroReasonCodes({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_reason_code/methods/getVeroReasonCodes
	 */
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
