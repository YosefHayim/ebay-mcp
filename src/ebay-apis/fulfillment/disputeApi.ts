import type { z } from "zod";
import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
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
import type {
	components,
	operations,
} from "@/ebay-openapi-types/sellFulfillmentV1Oas3.js";
import { getIdentityBaseUrl } from "@/shared/environment.js";
import { isRecord } from "@/shared/typeGuards.js";
import type {
	acceptPaymentDisputeInputSchema,
	addEvidenceInputSchema,
	contestPaymentDisputeInputSchema,
	updateEvidenceInputSchema,
} from "./ordersSchemas.js";

export type DisputeSummaryResponse =
	components["schemas"]["DisputeSummaryResponse"];

export type PaymentDispute = components["schemas"]["PaymentDispute"];

export type PaymentDisputeActivityHistory =
	components["schemas"]["PaymentDisputeActivityHistory"];

export type FetchEvidenceContentResponse = Buffer;

export type FileEvidence = components["schemas"]["FileEvidence"];

export type AddEvidencePaymentDisputeRequest =
	components["schemas"]["AddEvidencePaymentDisputeRequest"];

export type AddEvidencePaymentDisputeResponse =
	components["schemas"]["AddEvidencePaymentDisputeResponse"];

export type UpdateEvidencePaymentDisputeRequest =
	components["schemas"]["UpdateEvidencePaymentDisputeRequest"];

export type UpdateEvidenceResponse =
	operations["updateEvidence"]["responses"][204]["content"];

export interface GetPaymentDisputeInput {
	readonly paymentDisputeId: string;
}

export interface FetchEvidenceContentInput {
	readonly paymentDisputeId: string;
	readonly evidenceId: string;
	readonly fileId: string;
}

export interface GetActivitiesInput {
	readonly paymentDisputeId: string;
}

export interface GetPaymentDisputeSummariesInput {
	readonly orderId?: string | undefined;
	readonly buyerUsername?: string | undefined;
	readonly openDateFrom?: string | undefined;
	readonly openDateTo?: string | undefined;
	readonly paymentDisputeStatus?: string | undefined;
	readonly limit?: number | undefined;
	readonly offset?: number | undefined;
}

export type AcceptPaymentDisputeInput = z.infer<
	typeof acceptPaymentDisputeInputSchema
>;

export type ContestPaymentDisputeInput = z.infer<
	typeof contestPaymentDisputeInputSchema
>;

export type UploadEvidenceFileBody =
	| ArrayBuffer
	| Uint8Array
	| Record<string, unknown>;

export interface UploadEvidenceFileInput {
	readonly paymentDisputeId: string;
	readonly body: UploadEvidenceFileBody;
}

export type AddEvidenceInput = z.infer<typeof addEvidenceInputSchema>;

export type UpdateEvidenceInput = z.infer<typeof updateEvidenceInputSchema>;

function requireUploadEvidenceFileBody(
	evidenceFile: unknown,
): UploadEvidenceFileBody {
	const isArrayBuffer = evidenceFile instanceof ArrayBuffer;

	if (isArrayBuffer) {
		return evidenceFile;
	}

	const isByteArray = evidenceFile instanceof Uint8Array;

	if (isByteArray) {
		return evidenceFile;
	}

	const isMultipartObject = isRecord(evidenceFile);

	if (isMultipartObject) {
		return evidenceFile;
	}

	throw new Error(
		"body is required and must be binary data or a multipart-compatible object",
	);
}

const FULFILLMENT_BASE_PATH = "/sell/fulfillment/v1";

const APIZ_REQUEST: EbayRequestConfig = { absolute: true };

function apizUrl(client: EbayApiClient, path: string): string {
	const { environment, apiBaseUrl } = client.getConfig();
	const apizBaseUrl = getIdentityBaseUrl(environment, apiBaseUrl);
	return `${apizBaseUrl}${FULFILLMENT_BASE_PATH}${path}`;
}

export class DisputeApi {
	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	public getPaymentDispute = async (
		input: GetPaymentDisputeInput,
	): Promise<PaymentDispute> => {
		const paymentDisputeId = requireStringEffect(
			input.paymentDisputeId,
			"paymentDisputeId",
		);
		const url = apizUrl(this.client, `/payment_dispute/${paymentDisputeId}`);

		return await requestGetEffect<PaymentDispute>(
			this.client,
			url,
			undefined,
			APIZ_REQUEST,
		);
	};

	public fetchEvidenceContent = async (
		input: FetchEvidenceContentInput,
	): Promise<FetchEvidenceContentResponse> => {
		const paymentDisputeId = requireStringEffect(
			input.paymentDisputeId,
			"paymentDisputeId",
		);
		const evidenceId = requireStringEffect(input.evidenceId, "evidenceId");
		const fileId = requireStringEffect(input.fileId, "fileId");
		const url = apizUrl(
			this.client,
			`/payment_dispute/${paymentDisputeId}/fetch_evidence_content`,
		);
		const params = buildEndpointParams({
			evidenceId: { wireName: "evidence_id", value: evidenceId },
			fileId: { wireName: "file_id", value: fileId },
		});

		return await requestGetEffect<FetchEvidenceContentResponse>(
			this.client,
			url,
			params,
			{
				absolute: true,
				headers: { Accept: "application/octet-stream" },
				responseType: "arraybuffer",
			},
		);
	};

	public getActivities = async (
		input: GetActivitiesInput,
	): Promise<PaymentDisputeActivityHistory> => {
		const paymentDisputeId = requireStringEffect(
			input.paymentDisputeId,
			"paymentDisputeId",
		);
		const url = apizUrl(
			this.client,
			`/payment_dispute/${paymentDisputeId}/activity`,
		);

		return await requestGetEffect<PaymentDisputeActivityHistory>(
			this.client,
			url,
			undefined,
			APIZ_REQUEST,
		);
	};

	public getPaymentDisputeSummaries = async (
		input: GetPaymentDisputeSummariesInput = {},
	): Promise<DisputeSummaryResponse> => {
		const orderId = optionalStringEffect(input.orderId, "orderId");
		const buyerUsername = optionalStringEffect(
			input.buyerUsername,
			"buyerUsername",
		);
		const openDateFrom = optionalStringEffect(
			input.openDateFrom,
			"openDateFrom",
		);
		const openDateTo = optionalStringEffect(input.openDateTo, "openDateTo");
		const paymentDisputeStatus = optionalStringEffect(
			input.paymentDisputeStatus,
			"paymentDisputeStatus",
		);
		const limit = optionalPositiveNumberEffect(input.limit, "limit");
		const offset = optionalNonNegativeNumberEffect(input.offset, "offset");
		const url = apizUrl(this.client, "/payment_dispute_summary");
		const params = buildEndpointParams({
			orderId: { wireName: "order_id", value: orderId },
			buyerUsername: { wireName: "buyer_username", value: buyerUsername },
			openDateFrom: { wireName: "open_date_from", value: openDateFrom },
			openDateTo: { wireName: "open_date_to", value: openDateTo },
			paymentDisputeStatus: {
				wireName: "payment_dispute_status",
				value: paymentDisputeStatus,
			},
			limit: {
				wireName: "limit",
				value: limit === undefined ? undefined : String(limit),
			},
			offset: {
				wireName: "offset",
				value: offset === undefined ? undefined : String(offset),
			},
		});

		return await requestGetEffect<DisputeSummaryResponse>(
			this.client,
			url,
			params,
			APIZ_REQUEST,
		);
	};

	public acceptPaymentDispute = async (
		input: AcceptPaymentDisputeInput,
	): Promise<void> => {
		const paymentDisputeId = requireStringEffect(
			input.paymentDisputeId,
			"paymentDisputeId",
		);
		const url = apizUrl(
			this.client,
			`/payment_dispute/${paymentDisputeId}/accept`,
		);

		return await requestPostEffect<void>(
			this.client,
			url,
			input.body,
			APIZ_REQUEST,
		);
	};

	public contestPaymentDispute = async (
		input: ContestPaymentDisputeInput,
	): Promise<void> => {
		const paymentDisputeId = requireStringEffect(
			input.paymentDisputeId,
			"paymentDisputeId",
		);
		const url = apizUrl(
			this.client,
			`/payment_dispute/${paymentDisputeId}/contest`,
		);

		return await requestPostEffect<void>(
			this.client,
			url,
			input.body,
			APIZ_REQUEST,
		);
	};

	public uploadEvidenceFile = async (
		input: UploadEvidenceFileInput,
	): Promise<FileEvidence> => {
		const paymentDisputeId = requireStringEffect(
			input.paymentDisputeId,
			"paymentDisputeId",
		);
		const evidenceFile = requireUploadEvidenceFileBody(input.body);
		const url = apizUrl(
			this.client,
			`/payment_dispute/${paymentDisputeId}/upload_evidence_file`,
		);

		return await requestPostEffect<FileEvidence>(
			this.client,
			url,
			evidenceFile,
			{
				absolute: true,
				headers: { "Content-Type": "multipart/form-data" },
			},
		);
	};

	public addEvidence = async (
		input: AddEvidenceInput,
	): Promise<AddEvidencePaymentDisputeResponse> => {
		const paymentDisputeId = requireStringEffect(
			input.paymentDisputeId,
			"paymentDisputeId",
		);
		const addEvidenceRequest =
			requireObjectEffect<AddEvidencePaymentDisputeRequest>(input.body, "body");
		const url = apizUrl(
			this.client,
			`/payment_dispute/${paymentDisputeId}/add_evidence`,
		);

		return await requestPostEffect<AddEvidencePaymentDisputeResponse>(
			this.client,
			url,
			addEvidenceRequest,
			APIZ_REQUEST,
		);
	};

	public updateEvidence = async (
		input: UpdateEvidenceInput,
	): Promise<UpdateEvidenceResponse> => {
		const paymentDisputeId = requireStringEffect(
			input.paymentDisputeId,
			"paymentDisputeId",
		);
		const updateEvidenceRequest =
			requireObjectEffect<UpdateEvidencePaymentDisputeRequest>(
				input.body,
				"body",
			);
		const url = apizUrl(
			this.client,
			`/payment_dispute/${paymentDisputeId}/update_evidence`,
		);

		return await requestPostEffect<UpdateEvidenceResponse>(
			this.client,
			url,
			updateEvidenceRequest,
			APIZ_REQUEST,
		);
	};
}
