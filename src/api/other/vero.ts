import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  type EndpointInputError,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  createVeroReportInputSchema,
  getVeroReasonCodeInputSchema,
  getVeroReasonCodesInputSchema,
  getVeroReportInputSchema,
  getVeroReportItemsInputSchema,
} from '@/schemas/other/otherApis.js';
import type { components } from '@/types/sell-apps/other-apis/commerceVeroV1Oas3.js';
import { Effect } from 'effect';
import type { z } from 'zod';

/** Generated request body for createVeroReport. */
type CreateVeroReportRequest = components['schemas']['VeroReportItemsRequest'];
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
export type CreateVeroReportResponse = components['schemas']['VeroReportItemsResponse'];

/**
 * Response returned by getVeroReport.
 *
 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_report/methods/getVeroReport
 */
export type VeroReportResponse = components['schemas']['ReportStatusResponse'];

/**
 * Response returned by getVeroReportItems.
 *
 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_report_items/methods/getVeroReportItems
 */
export type VeroReportItemsResponse = components['schemas']['VeroReportStatusResponse'];

/**
 * Response returned by getVeroReasonCode.
 *
 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_reason_code/methods/getVeroReasonCode
 */
export type VeroReasonCodeResponse = components['schemas']['VeroReasonCodeResponse'];

/**
 * Response returned by getVeroReasonCodes.
 *
 * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_reason_code/methods/getVeroReasonCodes
 */
export type VeroReasonCodesResponse = components['schemas']['VeroReasonCodeDetailResponse'];

/** VeRO API - Verified Rights Owner reporting and reason-code metadata. */
export class VeroApi {
  private readonly basePath = '/commerce/vero/v1';

  public constructor(private readonly client: EbayApiClient) {}

  /**
   * Creates a VeRO report for one or more allegedly infringing listings.
   *
   * @param input - Generated VeroReportItemsRequest body.
   * @returns An Effect that succeeds with eBay's VeroReportItemsResponse.
   *
   * @example
   * ```ts
   * const report = await Effect.runPromise(
   *   veroApi.createVeroReport({
   *     reportData: {
   *       reportItems: [{ itemId: '110000000000', veroReasonCodeId: 'CODE123' }],
   *     },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_report/methods/createVeroReport
   */
  public createVeroReport = (
    input: CreateVeroReportInput,
  ): Effect.Effect<CreateVeroReportResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/vero_report`;

    return Effect.gen(function* () {
      const endpointInput = yield* requireObjectEffect<CreateVeroReportInput>(input, 'input');
      const body = yield* requireObjectEffect<CreateVeroReportRequest>(
        endpointInput.reportData,
        'reportData',
      );

      return yield* requestPostEffect<CreateVeroReportResponse>(client, path, body);
    });
  };

  /**
   * Retrieves a VeRO report by ID.
   *
   * @param input - VeRO report identifier returned by createVeroReport.
   * @returns An Effect that succeeds with eBay's ReportStatusResponse.
   *
   * @example
   * ```ts
   * const report = await Effect.runPromise(veroApi.getVeroReport({ veroReportId: 'REPORT123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_report/methods/getVeroReport
   */
  public getVeroReport = (
    input: GetVeroReportInput,
  ): Effect.Effect<VeroReportResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const endpointInput = yield* requireObjectEffect<GetVeroReportInput>(input, 'input');
      const veroReportId = yield* requireStringEffect(endpointInput.veroReportId, 'veroReportId');

      return yield* requestGetEffect<VeroReportResponse>(
        client,
        `${basePath}/vero_report/${veroReportId}`,
      );
    });
  };

  /**
   * Retrieves reported VeRO items with optional filtering and pagination.
   *
   * @param input - Optional filter, limit, and offset query parameters.
   * @returns An Effect that succeeds with eBay's VeroReportStatusResponse.
   *
   * @example
   * ```ts
   * const items = await Effect.runPromise(veroApi.getVeroReportItems({ limit: 10 }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_report_items/methods/getVeroReportItems
   */
  public getVeroReportItems = (
    input: GetVeroReportItemsInput = {},
  ): Effect.Effect<VeroReportItemsResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetVeroReportItemsInput>(input, 'input');
      const filter = yield* optionalStringEffect(validatedInput.filter, 'filter');
      const limit = yield* optionalPositiveNumberEffect(validatedInput.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(validatedInput.offset, 'offset');
      const params = buildEndpointParams({
        filter: { wireName: 'filter', value: filter },
        limit: { wireName: 'limit', value: limit },
        offset: { wireName: 'offset', value: offset },
      });

      return yield* requestGetEffect<VeroReportItemsResponse>(
        client,
        `${basePath}/vero_report_items`,
        params,
      );
    });
  };

  /**
   * Retrieves one VeRO reason code by ID.
   *
   * @param input - VeRO reason-code identifier.
   * @returns An Effect that succeeds with eBay's VeroReasonCodeResponse.
   *
   * @example
   * ```ts
   * const reason = await Effect.runPromise(
   *   veroApi.getVeroReasonCode({ veroReasonCodeId: 'CODE123' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_reason_code/methods/getVeroReasonCode
   */
  public getVeroReasonCode = (
    input: GetVeroReasonCodeInput,
  ): Effect.Effect<VeroReasonCodeResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const endpointInput = yield* requireObjectEffect<GetVeroReasonCodeInput>(input, 'input');
      const veroReasonCodeId = yield* requireStringEffect(
        endpointInput.veroReasonCodeId,
        'veroReasonCodeId',
      );

      return yield* requestGetEffect<VeroReasonCodeResponse>(
        client,
        `${basePath}/vero_reason_code/${veroReasonCodeId}`,
      );
    });
  };

  /**
   * Retrieves all available VeRO reason codes.
   *
   * @param input - Empty endpoint input object.
   * @returns An Effect that succeeds with eBay's VeroReasonCodeDetailResponse.
   *
   * @example
   * ```ts
   * const reasonCodes = await Effect.runPromise(veroApi.getVeroReasonCodes({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/vero/resources/vero_reason_code/methods/getVeroReasonCodes
   */
  public getVeroReasonCodes = (
    input: GetVeroReasonCodesInput = {},
  ): Effect.Effect<VeroReasonCodesResponse, EbayApiError> => {
    void input;
    return requestGetEffect<VeroReasonCodesResponse>(
      this.client,
      `${this.basePath}/vero_reason_code`,
    );
  };
}
