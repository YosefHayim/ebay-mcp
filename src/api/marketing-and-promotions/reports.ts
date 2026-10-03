import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  type EbayApiError,
  buildEndpointParams,
  requestDeleteEffect,
  requestGetEffect,
  requestPostEffect,
} from '@/api/shared/request.js';
import type {
  getReportInputSchema,
  getReportMetadataInputSchema,
  getReportMetadataForReportTypeInputSchema,
  getReportTasksInputSchema,
  createReportTaskInputSchema,
  getReportTaskInputSchema,
  deleteReportTaskInputSchema,
} from '@/schemas/marketing/marketing.js';
import type { Effect } from 'effect';
import type { z } from 'zod';
import { MARKETING_BASE_PATH, type MarketingOperationResponse } from './shared.js';

type GetReportInput = z.infer<typeof getReportInputSchema>;
type GetReportMetadataInput = z.infer<typeof getReportMetadataInputSchema>;
type GetReportMetadataForReportTypeInput = z.infer<
  typeof getReportMetadataForReportTypeInputSchema
>;
type GetReportTasksInput = z.infer<typeof getReportTasksInputSchema>;
type CreateReportTaskInput = z.infer<typeof createReportTaskInputSchema>;
type GetReportTaskInput = z.infer<typeof getReportTaskInputSchema>;
type DeleteReportTaskInput = z.infer<typeof deleteReportTaskInputSchema>;

/**
 * Response returned by eBay Marketing API getReport.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report/methods/getReport
 */
export type GetReportResponse = MarketingOperationResponse<'getReport'>;

/**
 * Response returned by eBay Marketing API getReportMetadata.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_metadata/methods/getReportMetadata
 */
export type GetReportMetadataResponse = MarketingOperationResponse<'getReportMetadata'>;

/**
 * Response returned by eBay Marketing API getReportMetadataForReportType.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_metadata/methods/getReportMetadataForReportType
 */
export type GetReportMetadataForReportTypeResponse =
  MarketingOperationResponse<'getReportMetadataForReportType'>;

/**
 * Response returned by eBay Marketing API getReportTasks.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_task/methods/getReportTasks
 */
export type GetReportTasksResponse = MarketingOperationResponse<'getReportTasks'>;

/**
 * Response returned by eBay Marketing API createReportTask.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_task/methods/createReportTask
 */
export type CreateReportTaskResponse = MarketingOperationResponse<'createReportTask'>;

/**
 * Response returned by eBay Marketing API getReportTask.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_task/methods/getReportTask
 */
export type GetReportTaskResponse = MarketingOperationResponse<'getReportTask'>;

/**
 * Response returned by eBay Marketing API deleteReportTask.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_task/methods/deleteReportTask
 */
export type DeleteReportTaskResponse = MarketingOperationResponse<'deleteReportTask'>;

/** Marketing API — reports methods closed over a shared client. */
export const createMarketingReportsMethods = (client: EbayApiClient) => ({
  /**
   * Get report through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getReport.
   * @returns An Effect that succeeds with eBay's generated getReport response DTO.
   *
   * @example
   * ```ts
   * const report = await Effect.runPromise(marketingApi.getReport({ reportId: 'report-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report/methods/getReport
   */
  getReport: (input: GetReportInput): Effect.Effect<GetReportResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_report/${input.reportId}`;
    return requestGetEffect<GetReportResponse>(client, path);
  },

  /**
   * Get report metadata through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getReportMetadata.
   * @returns An Effect that succeeds with eBay's generated getReportMetadata response DTO.
   *
   * @example
   * ```ts
   * const reportMetadata = await Effect.runPromise(marketingApi.getReportMetadata());
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_metadata/methods/getReportMetadata
   */
  getReportMetadata: (
    input: GetReportMetadataInput = {},
  ): Effect.Effect<GetReportMetadataResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_report_metadata`;
    const params = buildEndpointParams({
      fundingModel: { wireName: 'funding_model', value: input.fundingModel },
      channel: { wireName: 'channel', value: input.channel },
    });
    return requestGetEffect<GetReportMetadataResponse>(client, path, params);
  },

  /**
   * Get report metadata for report type through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getReportMetadataForReportType.
   * @returns An Effect that succeeds with eBay's generated getReportMetadataForReportType response DTO.
   *
   * @example
   * ```ts
   * const reportMetadata = await Effect.runPromise(marketingApi.getReportMetadataForReportType({ reportType: 'reportType-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_metadata/methods/getReportMetadataForReportType
   */
  getReportMetadataForReportType: (
    input: GetReportMetadataForReportTypeInput,
  ): Effect.Effect<GetReportMetadataForReportTypeResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_report_metadata/${input.reportType}`;
    const params = buildEndpointParams({
      fundingModel: { wireName: 'funding_model', value: input.fundingModel },
      channel: { wireName: 'channel', value: input.channel },
    });
    return requestGetEffect<GetReportMetadataForReportTypeResponse>(client, path, params);
  },

  /**
   * Get report tasks through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getReportTasks.
   * @returns An Effect that succeeds with eBay's generated getReportTasks response DTO.
   *
   * @example
   * ```ts
   * const reportTasks = await Effect.runPromise(marketingApi.getReportTasks());
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_task/methods/getReportTasks
   */
  getReportTasks: (
    input: GetReportTasksInput = {},
  ): Effect.Effect<GetReportTasksResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_report_task`;
    const params = buildEndpointParams({
      limit: { wireName: 'limit', value: input.limit },
      offset: { wireName: 'offset', value: input.offset },
      reportTaskStatuses: { wireName: 'report_task_statuses', value: input.reportTaskStatuses },
    });
    return requestGetEffect<GetReportTasksResponse>(client, path, params);
  },

  /**
   * Create report task through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for createReportTask.
   * @returns An Effect that succeeds with eBay's generated createReportTask response DTO.
   *
   * @example
   * ```ts
   * const createdReportTask = await Effect.runPromise(marketingApi.createReportTask({ request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_task/methods/createReportTask
   */
  createReportTask: (
    input: CreateReportTaskInput,
  ): Effect.Effect<CreateReportTaskResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_report_task`;
    return requestPostEffect<CreateReportTaskResponse>(client, path, input.request);
  },

  /**
   * Get report task through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getReportTask.
   * @returns An Effect that succeeds with eBay's generated getReportTask response DTO.
   *
   * @example
   * ```ts
   * const reportTask = await Effect.runPromise(marketingApi.getReportTask({ reportTaskId: 'reportTask-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_task/methods/getReportTask
   */
  getReportTask: (
    input: GetReportTaskInput,
  ): Effect.Effect<GetReportTaskResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_report_task/${input.reportTaskId}`;
    return requestGetEffect<GetReportTaskResponse>(client, path);
  },

  /**
   * Delete report task through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for deleteReportTask.
   * @returns An Effect that succeeds with eBay's generated deleteReportTask response DTO.
   *
   * @example
   * ```ts
   * await Effect.runPromise(marketingApi.deleteReportTask({ reportTaskId: 'reportTask-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_report_task/methods/deleteReportTask
   */
  deleteReportTask: (
    input: DeleteReportTaskInput,
  ): Effect.Effect<DeleteReportTaskResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_report_task/${input.reportTaskId}`;
    return requestDeleteEffect<DeleteReportTaskResponse>(client, path);
  },
});
