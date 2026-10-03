import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  decodeEndpointInputEffect,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import {
  createFeedTaskInputSchema,
  feedTaskIdInputSchema,
  getFeedTasksInputSchema,
} from '@/schemas/inventory-management/feed.js';
import type {
  components,
  operations,
} from '@/types/sell-apps/listing-management/sellFeedV1Oas3.js';
import type { z } from 'zod';
import { Effect } from 'effect';
import {
  downloadFeedFile,
  exclusiveFeedFilters,
  FEED_BASE_PATH,
  feedListParams,
  feedResourcePath,
  postFeedTask,
} from './feedRequest.js';
import type { MediaUpload } from './media.js';

/** Feed files can be up to 15 MB, far larger than JSON calls. */
const UPLOAD_TIMEOUT_MS = 10 * 60_000;

type GetFeedTasksInput = z.infer<typeof getFeedTasksInputSchema>;
type CreateFeedTaskInput = z.infer<typeof createFeedTaskInputSchema>;
type FeedTaskIdInput = z.infer<typeof feedTaskIdInputSchema>;
type CreateTaskRequest = components['schemas']['CreateTaskRequest'];

/** Multipart body documented for uploadFile: fileName, name=file, type=form-data, then the file. */
const feedFileForm = (file: MediaUpload): FormData => {
  const form = new FormData();
  form.append('fileName', file.fileName);
  form.append('name', 'file');
  form.append('type', 'form-data');
  // Copy into a fresh ArrayBuffer-backed view: Blob rejects Node's ArrayBufferLike-typed views.
  form.append(
    'file',
    new Blob([new Uint8Array(file.bytes)], { type: file.mimeType }),
    file.fileName,
  );
  return form;
};

/** Feed tasks page. @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getTasks */
export type FeedTaskCollection = components['schemas']['TaskCollection'];
/** Feed task status and upload summary. @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getTask */
export type FeedTask = components['schemas']['Task'];
/** Empty uploadFile acknowledgement. @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/uploadFile */
export type UploadFeedFileResponse =
  operations['uploadFile']['responses'][200]['content']['application/json'];

/**
 * Creates the Feed API `task` resource endpoints: upload and download tasks without filter
 * criteria, their input/result files, and feed file uploads.
 * @param client - Shared authenticated HTTP client.
 * @returns Endpoint Effects composed into FeedApi.
 */
export const createFeedTaskMethods = (client: EbayApiClient) => {
  /**
   * Lists feed tasks by feed type or schedule, with creation-date filters and pagination.
   * @param input - feedType or scheduleId (not both), dateRange or lookBackDays, limit, offset.
   * @returns Generated TaskCollection.
   * @example feed.getTasks({ feedType: 'LMS_ORDER_ACK', lookBackDays: 7 })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getTasks
   */
  const getTasks = (input: GetFeedTasksInput = {}) =>
    decodeEndpointInputEffect(getFeedTasksInputSchema, input).pipe(
      Effect.flatMap(exclusiveFeedFilters),
      Effect.flatMap((query) =>
        requestGetEffect<FeedTaskCollection>(
          client,
          `${FEED_BASE_PATH}/task`,
          feedListParams(query),
        ),
      ),
    );

  /**
   * Creates an upload or download task for a feed type; eBay answers 202 with only a Location.
   * @param input - CreateTaskRequest body plus optional marketplace and Accept-Language headers.
   * @returns The new task ID and Location.
   * @example feed.createTask({ task: { feedType: 'LMS_ADD_FIXED_PRICE_ITEM', schemaVersion: '1423' } })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/createTask
   */
  const createTask = (input: CreateFeedTaskInput) =>
    Effect.gen(function* () {
      const { task, marketplaceId, acceptLanguage } = yield* decodeEndpointInputEffect(
        createFeedTaskInputSchema,
        input,
      );
      const body: CreateTaskRequest = task;
      const headers: Record<string, string> = {};
      if (marketplaceId) {
        headers['X-EBAY-C-MARKETPLACE-ID'] = marketplaceId;
      }
      if (acceptLanguage) {
        headers['Accept-Language'] = acceptLanguage;
      }
      return yield* postFeedTask(client, '/task', body, headers);
    });

  /**
   * Retrieves a feed task's status and upload summary.
   * @param input - Task identifier.
   * @returns Generated Task.
   * @example feed.getTask({ taskId: 'TASK-1' })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getTask
   */
  const getTask = (input: FeedTaskIdInput) =>
    decodeEndpointInputEffect(feedTaskIdInputSchema, input).pipe(
      Effect.flatMap(({ taskId }) =>
        requestGetEffect<FeedTask>(client, feedResourcePath('/task', taskId)),
      ),
    );

  /**
   * Downloads the file previously uploaded to a task (not for LMS_ORDER_REPORT or
   * LMS_ACTIVE_INVENTORY_REPORT tasks).
   * @param input - Task identifier.
   * @returns File bytes with eBay's content type and file name.
   * @example feed.getInputFile({ taskId: 'TASK-1' })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getInputFile
   */
  const getInputFile = (input: FeedTaskIdInput) =>
    decodeEndpointInputEffect(feedTaskIdInputSchema, input).pipe(
      Effect.flatMap(({ taskId }) =>
        downloadFeedFile(client, feedResourcePath('/task', taskId, '/download_input_file')),
      ),
    );

  /**
   * Downloads a task's generated result file once it is COMPLETED or COMPLETED_WITH_ERROR.
   * @param input - Task identifier.
   * @returns File bytes (often csv.gz or zipped XML) with eBay's content type and file name.
   * @example feed.getResultFile({ taskId: 'TASK-1' })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getResultFile
   */
  const getResultFile = (input: FeedTaskIdInput) =>
    decodeEndpointInputEffect(feedTaskIdInputSchema, input).pipe(
      Effect.flatMap(({ taskId }) =>
        downloadFeedFile(client, feedResourcePath('/task', taskId, '/download_result_file')),
      ),
    );

  /**
   * Uploads the feed file of an upload task as multipart/form-data; eBay then processes it
   * asynchronously (QUEUED, IN_PROCESS, COMPLETED or COMPLETED_WITH_ERROR).
   * @param input - Task identifier and a validated local feed file.
   * @returns eBay's (empty) acknowledgement.
   * @example feed.uploadFile({ taskId: 'TASK-1', file })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/uploadFile
   */
  const uploadFile = (input: FeedTaskIdInput & { file: MediaUpload }) =>
    Effect.gen(function* () {
      const { taskId } = yield* decodeEndpointInputEffect(feedTaskIdInputSchema, input);
      const file = yield* requireObjectEffect<MediaUpload>(input.file, 'file');
      yield* requireStringEffect(file.fileName, 'file.fileName');
      return yield* requestPostEffect<UploadFeedFileResponse>(
        client,
        feedResourcePath('/task', taskId, '/upload_file'),
        feedFileForm(file),
        { timeoutMs: UPLOAD_TIMEOUT_MS },
      );
    });

  return { getTasks, createTask, getTask, getInputFile, getResultFile, uploadFile };
};
