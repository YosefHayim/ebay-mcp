import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  EndpointInputError,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  components,
  operations,
} from '@/types/sell-apps/order-management/sellFulfillmentV1Oas3.js';
import { isRecord } from '@/utils/typeGuards.js';
import { Effect } from 'effect';

/**
 * Response returned by eBay Fulfillment API getPaymentDisputeSummaries.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/getPaymentDisputeSummaries
 */
export type DisputeSummaryResponse = components['schemas']['DisputeSummaryResponse'];

/**
 * Response returned by eBay Fulfillment API getPaymentDispute.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/getPaymentDispute
 */
export type PaymentDispute = components['schemas']['PaymentDispute'];

/**
 * Response returned by eBay Fulfillment API getActivities.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/getActivities
 */
export type PaymentDisputeActivityHistory = components['schemas']['PaymentDisputeActivityHistory'];

/**
 * Binary content returned by eBay Fulfillment API fetchEvidenceContent.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/fetchEvidenceContent
 */
export type FetchEvidenceContentResponse = Buffer;

/**
 * Request payload accepted by eBay Fulfillment API acceptPaymentDispute.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/acceptPaymentDispute
 */
export type AcceptPaymentDisputeRequest = components['schemas']['AcceptPaymentDisputeRequest'];

/**
 * Request payload accepted by eBay Fulfillment API contestPaymentDispute.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/contestPaymentDispute
 */
export type ContestPaymentDisputeRequest = components['schemas']['ContestPaymentDisputeRequest'];

/**
 * Response returned by eBay Fulfillment API uploadEvidenceFile.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/uploadEvidenceFile
 */
export type FileEvidence = components['schemas']['FileEvidence'];

/**
 * Request payload accepted by eBay Fulfillment API addEvidence.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/addEvidence
 */
export type AddEvidencePaymentDisputeRequest =
  components['schemas']['AddEvidencePaymentDisputeRequest'];

/**
 * Response returned by eBay Fulfillment API addEvidence.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/addEvidence
 */
export type AddEvidencePaymentDisputeResponse =
  components['schemas']['AddEvidencePaymentDisputeResponse'];

/**
 * Request payload accepted by eBay Fulfillment API updateEvidence.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/updateEvidence
 */
export type UpdateEvidencePaymentDisputeRequest =
  components['schemas']['UpdateEvidencePaymentDisputeRequest'];

/**
 * Generated success payload for eBay Fulfillment API updateEvidence.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/updateEvidence
 */
export type UpdateEvidenceResponse = operations['updateEvidence']['responses'][204]['content'];

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
  readonly orderId?: string;
  /** Buyer username used to find disputes opened by one buyer. */
  readonly buyerUsername?: string;
  /** ISO-8601 lower bound for the dispute open date. */
  readonly openDateFrom?: string;
  /** ISO-8601 upper bound for the dispute open date. */
  readonly openDateTo?: string;
  /** Dispute status filter such as OPEN, ACTION_NEEDED, or CLOSED. */
  readonly paymentDisputeStatus?: string;
  /** Maximum number of disputes to return. */
  readonly limit?: number;
  /** Number of disputes to skip before returning the first result. */
  readonly offset?: number;
}

/** Input accepted by acceptPaymentDispute. */
export interface AcceptPaymentDisputeInput {
  /** eBay payment dispute identifier to accept. */
  readonly paymentDisputeId: string;
  /** Optional generated request payload for accepting the dispute. */
  readonly body?: AcceptPaymentDisputeRequest;
}

/** Input accepted by contestPaymentDispute. */
export interface ContestPaymentDisputeInput {
  /** eBay payment dispute identifier to contest. */
  readonly paymentDisputeId: string;
  /** Optional generated request payload for contesting the dispute. */
  readonly body?: ContestPaymentDisputeRequest;
}

/** Multipart-compatible body accepted by uploadEvidenceFile. */
export type UploadEvidenceFileBody = ArrayBuffer | Uint8Array | Record<string, unknown>;

/** Input accepted by uploadEvidenceFile. */
export interface UploadEvidenceFileInput {
  /** eBay payment dispute identifier that owns the uploaded file. */
  readonly paymentDisputeId: string;
  /** Binary or multipart-compatible body passed to the request adapter. */
  readonly body: UploadEvidenceFileBody;
}

/** Input accepted by addEvidence. */
export interface AddEvidenceInput {
  /** eBay payment dispute identifier receiving the evidence. */
  readonly paymentDisputeId: string;
  /** Generated request payload describing the evidence set to add. */
  readonly body: AddEvidencePaymentDisputeRequest;
}

/** Input accepted by updateEvidence. */
export interface UpdateEvidenceInput {
  /** eBay payment dispute identifier whose evidence set is updated. */
  readonly paymentDisputeId: string;
  /** Generated request payload describing the evidence set update. */
  readonly body: UpdateEvidencePaymentDisputeRequest;
}

const requireUploadEvidenceFileBodyEffect = (
  value: unknown,
): Effect.Effect<UploadEvidenceFileBody, EndpointInputError> => {
  if (value instanceof ArrayBuffer || value instanceof Uint8Array || isRecord(value)) {
    return Effect.succeed(value);
  }

  return Effect.fail(
    new EndpointInputError({
      parameter: 'body',
      message: 'body is required and must be binary data or a multipart-compatible object',
    }),
  );
};

/** eBay Fulfillment payment dispute endpoints. */
export class DisputeApi {
  private readonly basePath = '/sell/fulfillment/v1';

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
  public getPaymentDispute = (
    input: GetPaymentDisputeInput,
  ): Effect.Effect<PaymentDispute, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const paymentDisputeId = yield* requireStringEffect(
        input.paymentDisputeId,
        'paymentDisputeId',
      );
      const path = `${this.basePath}/payment_dispute/${paymentDisputeId}`;

      return yield* requestGetEffect<PaymentDispute>(this.client, path);
    });

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
  public fetchEvidenceContent = (
    input: FetchEvidenceContentInput,
  ): Effect.Effect<FetchEvidenceContentResponse, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const paymentDisputeId = yield* requireStringEffect(
        input.paymentDisputeId,
        'paymentDisputeId',
      );
      const evidenceId = yield* requireStringEffect(input.evidenceId, 'evidenceId');
      const fileId = yield* requireStringEffect(input.fileId, 'fileId');
      const path = `${this.basePath}/payment_dispute/${paymentDisputeId}/fetch_evidence_content`;
      const params = buildEndpointParams({
        evidenceId: { wireName: 'evidence_id', value: evidenceId },
        fileId: { wireName: 'file_id', value: fileId },
      });

      return yield* requestGetEffect<FetchEvidenceContentResponse>(this.client, path, params, {
        headers: { Accept: 'application/octet-stream' },
        responseType: 'arraybuffer',
      });
    });

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
  public getActivities = (
    input: GetActivitiesInput,
  ): Effect.Effect<PaymentDisputeActivityHistory, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const paymentDisputeId = yield* requireStringEffect(
        input.paymentDisputeId,
        'paymentDisputeId',
      );
      const path = `${this.basePath}/payment_dispute/${paymentDisputeId}/activity`;

      return yield* requestGetEffect<PaymentDisputeActivityHistory>(this.client, path);
    });

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
  public getPaymentDisputeSummaries = (
    input: GetPaymentDisputeSummariesInput = {},
  ): Effect.Effect<DisputeSummaryResponse, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const orderId = yield* optionalStringEffect(input.orderId, 'orderId');
      const buyerUsername = yield* optionalStringEffect(input.buyerUsername, 'buyerUsername');
      const openDateFrom = yield* optionalStringEffect(input.openDateFrom, 'openDateFrom');
      const openDateTo = yield* optionalStringEffect(input.openDateTo, 'openDateTo');
      const paymentDisputeStatus = yield* optionalStringEffect(
        input.paymentDisputeStatus,
        'paymentDisputeStatus',
      );
      const limit = yield* optionalPositiveNumberEffect(input.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(input.offset, 'offset');
      const path = `${this.basePath}/payment_dispute_summary`;
      const params = buildEndpointParams({
        orderId: { wireName: 'order_id', value: orderId },
        buyerUsername: { wireName: 'buyer_username', value: buyerUsername },
        openDateFrom: { wireName: 'open_date_from', value: openDateFrom },
        openDateTo: { wireName: 'open_date_to', value: openDateTo },
        paymentDisputeStatus: {
          wireName: 'payment_dispute_status',
          value: paymentDisputeStatus,
        },
        limit: { wireName: 'limit', value: limit === undefined ? undefined : String(limit) },
        offset: { wireName: 'offset', value: offset === undefined ? undefined : String(offset) },
      });

      return yield* requestGetEffect<DisputeSummaryResponse>(this.client, path, params);
    });

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
  public acceptPaymentDispute = (
    input: AcceptPaymentDisputeInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const paymentDisputeId = yield* requireStringEffect(
        input.paymentDisputeId,
        'paymentDisputeId',
      );
      const path = `${this.basePath}/payment_dispute/${paymentDisputeId}/accept`;

      return yield* requestPostEffect<void>(this.client, path, input.body);
    });

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
  public contestPaymentDispute = (
    input: ContestPaymentDisputeInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const paymentDisputeId = yield* requireStringEffect(
        input.paymentDisputeId,
        'paymentDisputeId',
      );
      const path = `${this.basePath}/payment_dispute/${paymentDisputeId}/contest`;

      return yield* requestPostEffect<void>(this.client, path, input.body);
    });

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
  public uploadEvidenceFile = (
    input: UploadEvidenceFileInput,
  ): Effect.Effect<FileEvidence, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const paymentDisputeId = yield* requireStringEffect(
        input.paymentDisputeId,
        'paymentDisputeId',
      );
      const body = yield* requireUploadEvidenceFileBodyEffect(input.body);
      const path = `${this.basePath}/payment_dispute/${paymentDisputeId}/upload_evidence_file`;

      return yield* requestPostEffect<FileEvidence>(this.client, path, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });

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
  public addEvidence = (
    input: AddEvidenceInput,
  ): Effect.Effect<AddEvidencePaymentDisputeResponse, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const paymentDisputeId = yield* requireStringEffect(
        input.paymentDisputeId,
        'paymentDisputeId',
      );
      const body = yield* requireObjectEffect<AddEvidencePaymentDisputeRequest>(input.body, 'body');
      const path = `${this.basePath}/payment_dispute/${paymentDisputeId}/add_evidence`;

      return yield* requestPostEffect<AddEvidencePaymentDisputeResponse>(this.client, path, body);
    });

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
  public updateEvidence = (
    input: UpdateEvidenceInput,
  ): Effect.Effect<UpdateEvidenceResponse, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const paymentDisputeId = yield* requireStringEffect(
        input.paymentDisputeId,
        'paymentDisputeId',
      );
      const body = yield* requireObjectEffect<UpdateEvidencePaymentDisputeRequest>(
        input.body,
        'body',
      );
      const path = `${this.basePath}/payment_dispute/${paymentDisputeId}/update_evidence`;

      return yield* requestPostEffect<UpdateEvidenceResponse>(this.client, path, body);
    });
}
