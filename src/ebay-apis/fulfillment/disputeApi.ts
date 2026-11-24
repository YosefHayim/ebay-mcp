import type { z } from "zod";
import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	EndpointInputError,
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

/**
 * Response returned by eBay Fulfillment API getPaymentDisputeSummaries.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/getPaymentDisputeSummaries
 */
export type DisputeSummaryResponse =
	components["schemas"]["DisputeSummaryResponse"];

/**
 * Response returned by eBay Fulfillment API getPaymentDispute.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/getPaymentDispute
 */
export type PaymentDispute = components["schemas"]["PaymentDispute"];

/**
 * Response returned by eBay Fulfillment API getActivities.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/getActivities
 */
export type PaymentDisputeActivityHistory =
	components["schemas"]["PaymentDisputeActivityHistory"];

/**
 * Binary content returned by eBay Fulfillment API fetchEvidenceContent.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/fetchEvidenceContent
 */
export type FetchEvidenceContentResponse = Buffer;

/**
 * Response returned by eBay Fulfillment API uploadEvidenceFile.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/uploadEvidenceFile
 */
export type FileEvidence = components["schemas"]["FileEvidence"];

/**
 * Request payload accepted by eBay Fulfillment API addEvidence.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/addEvidence
 */
export type AddEvidencePaymentDisputeRequest =
	components["schemas"]["AddEvidencePaymentDisputeRequest"];

/**
 * Response returned by eBay Fulfillment API addEvidence.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/addEvidence
 */
export type AddEvidencePaymentDisputeResponse =
	components["schemas"]["AddEvidencePaymentDisputeResponse"];

/**
 * Request payload accepted by eBay Fulfillment API updateEvidence.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/updateEvidence
 */
export type UpdateEvidencePaymentDisputeRequest =
	components["schemas"]["UpdateEvidencePaymentDisputeRequest"];

/**
 * Generated success payload for eBay Fulfillment API updateEvidence.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/updateEvidence
 */
export type UpdateEvidenceResponse =
	operations["updateEvidence"]["responses"][204]["content"];

/** Input required to retrieve one payment dispute. */
export interface GetPaymentDisputeInput {
	/** eBay payment dispute identifier from getPaymentDisputeSummaries. */
	readonly paymentDisputeId: string;
}

/** Input required to download one payment dispute evidence file. */
export interface FetchEvidenceContentInput {
	/** eBay payment dispute identifier that owns the evidence file. */
	readonly paymentDisputeId: string;
	/** Evidence set identifier from getPaymentDispute. */
	readonly evidenceId: string;
	/** Evidence file identifier from getPaymentDispute. */
	readonly fileId: string;
}

/** Input required to retrieve payment dispute activity. */
export interface GetActivitiesInput {
	/** eBay payment dispute identifier that owns the activity history. */
	readonly paymentDisputeId: string;
}

/** Filters accepted by getPaymentDisputeSummaries. */
export interface GetPaymentDisputeSummariesInput {
	/** eBay order identifier used to find disputes for one order. */
	readonly orderId?: string | undefined;
	/** Buyer username used to find disputes opened by one buyer. */
	readonly buyerUsername?: string | undefined;
	/** ISO-8601 lower bound for the dispute open date. */
	readonly openDateFrom?: string | undefined;
	/** ISO-8601 upper bound for the dispute open date. */
	readonly openDateTo?: string | undefined;
	/** Dispute status filter such as OPEN, ACTION_NEEDED, or CLOSED. */
	readonly paymentDisputeStatus?: string | undefined;
	/** Maximum number of disputes to return. */
	readonly limit?: number | undefined;
	/** Number of disputes to skip before returning the first result. */
	readonly offset?: number | undefined;
}

export type AcceptPaymentDisputeInput = z.infer<
	typeof acceptPaymentDisputeInputSchema
>;

export type ContestPaymentDisputeInput = z.infer<
	typeof contestPaymentDisputeInputSchema
>;

/** Multipart-compatible body accepted by uploadEvidenceFile. */
export type UploadEvidenceFileBody =
	| ArrayBuffer
	| Uint8Array
	| Record<string, unknown>;

/** Input accepted by uploadEvidenceFile. */
export interface UploadEvidenceFileInput {
	/** eBay payment dispute identifier that owns the uploaded file. */
	readonly paymentDisputeId: string;
	/** Binary or multipart-compatible body passed to the request adapter. */
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

	throw new EndpointInputError({
		parameter: "body",
		message:
			"body is required and must be binary data or a multipart-compatible object",
	});
}

const FULFILLMENT_BASE_PATH = "/sell/fulfillment/v1";

const APIZ_REQUEST: EbayRequestConfig = { absolute: true };

const apizUrl = (client: EbayApiClient, path: string): string => {
	const { environment, apiBaseUrl } = client.getConfig();
	const apizBaseUrl = getIdentityBaseUrl(environment, apiBaseUrl);
	return `${apizBaseUrl}${FULFILLMENT_BASE_PATH}${path}`;
};

/** eBay Fulfillment payment dispute endpoints, served from the apiz host only. */
export class DisputeApi {
	public constructor(private readonly client: EbayApiClient) {}

	/**
	 * Retrieves one payment dispute.
	 *
	 * @param input - Payment dispute identifier to retrieve.
	 * @returns An Effect that succeeds with eBay's generated PaymentDispute response.
	 *
	 * @example
	 * ```ts
	 * const dispute = await Effect.runPromise(
	 *   disputeApi.getPaymentDispute({ paymentDisputeId: '5001234567' }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/getPaymentDispute
	 */
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

	/**
	 * Downloads one evidence file attached to a payment dispute.
	 *
	 * @param input - Payment dispute, evidence set, and evidence file identifiers.
	 * @returns An Effect that succeeds with the downloaded binary evidence content.
	 *
	 * @example
	 * ```ts
	 * const content = await Effect.runPromise(
	 *   disputeApi.fetchEvidenceContent({
	 *     paymentDisputeId: '5001234567',
	 *     evidenceId: 'EVIDENCE-1',
	 *     fileId: 'FILE-1',
	 *   }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/fetchEvidenceContent
	 */
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

	/**
	 * Retrieves the activity history for one payment dispute.
	 *
	 * @param input - Payment dispute identifier whose activity history is requested.
	 * @returns An Effect that succeeds with eBay's generated PaymentDisputeActivityHistory.
	 *
	 * @example
	 * ```ts
	 * const activity = await Effect.runPromise(
	 *   disputeApi.getActivities({ paymentDisputeId: '5001234567' }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/getActivities
	 */
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

	/**
	 * Searches payment disputes using the filters supported by eBay.
	 *
	 * @param input - Optional dispute summary filters and pagination controls.
	 * @returns An Effect that succeeds with eBay's generated DisputeSummaryResponse.
	 *
	 * @example
	 * ```ts
	 * const disputes = await Effect.runPromise(
	 *   disputeApi.getPaymentDisputeSummaries({ orderId: 'ORDER-1', limit: 25 }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/getPaymentDisputeSummaries
	 */
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

	/**
	 * Accepts one payment dispute.
	 *
	 * @param input - Payment dispute identifier and optional generated accept payload.
	 * @returns An Effect that succeeds when eBay accepts the dispute action.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   disputeApi.acceptPaymentDispute({
	 *     paymentDisputeId: '5001234567',
	 *     body: { revision: 3 },
	 *   }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/acceptPaymentDispute
	 */
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

	/**
	 * Contests one payment dispute.
	 *
	 * @param input - Payment dispute identifier and optional generated contest payload.
	 * @returns An Effect that succeeds when eBay accepts the contest action.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   disputeApi.contestPaymentDispute({
	 *     paymentDisputeId: '5001234567',
	 *     body: { note: 'Proof of delivery is attached.', revision: 3 },
	 *   }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/contestPaymentDispute
	 */
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

	/**
	 * Uploads one evidence file for a payment dispute.
	 *
	 * @param input - Payment dispute identifier and multipart-compatible evidence file body.
	 * @returns An Effect that succeeds with eBay's generated FileEvidence response.
	 *
	 * @example
	 * ```ts
	 * const file = await Effect.runPromise(
	 *   disputeApi.uploadEvidenceFile({
	 *     paymentDisputeId: '5001234567',
	 *     body: new ArrayBuffer(8),
	 *   }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/uploadEvidenceFile
	 */
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

	/**
	 * Adds evidence to one payment dispute.
	 *
	 * @param input - Payment dispute identifier and generated add-evidence payload.
	 * @returns An Effect that succeeds with eBay's generated AddEvidencePaymentDisputeResponse.
	 *
	 * @example
	 * ```ts
	 * const evidence = await Effect.runPromise(
	 *   disputeApi.addEvidence({
	 *     paymentDisputeId: '5001234567',
	 *     body: { evidenceType: 'PROOF_OF_DELIVERY', files: [{ fileId: 'FILE-1' }] },
	 *   }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/addEvidence
	 */
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

	/**
	 * Updates evidence on one payment dispute.
	 *
	 * @param input - Payment dispute identifier and generated update-evidence payload.
	 * @returns An Effect that succeeds when eBay accepts the evidence update.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   disputeApi.updateEvidence({
	 *     paymentDisputeId: '5001234567',
	 *     body: { evidenceId: 'EVIDENCE-1', files: [{ fileId: 'FILE-2' }] },
	 *   }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/updateEvidence
	 */
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
