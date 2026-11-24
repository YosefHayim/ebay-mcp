import type { z } from "zod";
import {
	createFeedTaskInputSchema,
	feedTaskIdInputSchema,
	getFeedTasksInputSchema,
} from "@/ebay-apis/feed/feedSchemas.js";
import type { DownloadedFile } from "@/ebay-client/download.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	decodeEndpointInputEffect,
	requestGetEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type {
	components,
	operations,
} from "@/ebay-openapi-types/sellFeedV1Oas3.js";
import type { MediaUpload } from "../inventory/mediaApi.js";
import {
	type CreatedFeedTask,
	downloadFeedFile,
	exclusiveFeedFilters,
	FEED_BASE_PATH,
	feedListParams,
	feedResourcePath,
	postFeedTask,
} from "./feedRequestApi.js";

/** Feed files can be up to 15 MB, far larger than JSON calls. */
const UPLOAD_TIMEOUT_MS = 10 * 60_000;

type GetFeedTasksInput = z.infer<typeof getFeedTasksInputSchema>;
type CreateFeedTaskInput = z.infer<typeof createFeedTaskInputSchema>;
type FeedTaskIdInput = z.infer<typeof feedTaskIdInputSchema>;
type CreateTaskRequest = components["schemas"]["CreateTaskRequest"];

/** Multipart body documented for uploadFile: fileName, name=file, type=form-data, then the file. */
const feedFileForm = (file: MediaUpload): FormData => {
	const form = new FormData();
	form.append("fileName", file.fileName);
	form.append("name", "file");
	form.append("type", "form-data");
	// Copy into a fresh ArrayBuffer-backed view: Blob rejects Node's ArrayBufferLike-typed views.
	form.append(
		"file",
		new Blob([new Uint8Array(file.bytes)], { type: file.mimeType }),
		file.fileName,
	);
	return form;
};

/** Feed tasks page. @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getTasks */
export type FeedTaskCollection = components["schemas"]["TaskCollection"];
/** Feed task status and upload summary. @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getTask */
export type FeedTask = components["schemas"]["Task"];
/** Empty uploadFile acknowledgement. @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/uploadFile */
export type UploadFeedFileResponse =
	operations["uploadFile"]["responses"][200]["content"]["application/json"];

/**
 * Creates the Feed API `task` resource endpoints: upload and download tasks without filter
 * criteria, their input/result files, and feed file uploads.
 * @param client - Shared authenticated HTTP client.
 * @returns Endpoint methods composed into FeedApi.
 */
export const createFeedTaskMethods = (client: EbayApiClient) => {
	/**
	 * Lists feed tasks by feed type or schedule, with creation-date filters and pagination.
	 * @param input - feedType or scheduleId (not both), dateRange or lookBackDays, limit, offset.
	 * @returns Generated TaskCollection.
	 * @example feed.getTasks({ feedType: 'LMS_ORDER_ACK', lookBackDays: 7 })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getTasks
	 */
	const getTasks = async (
		input: GetFeedTasksInput = {},
	): Promise<FeedTaskCollection> => {
		const parsedInput = decodeEndpointInputEffect(
			getFeedTasksInputSchema,
			input,
		);
		const query = exclusiveFeedFilters(parsedInput);

		return requestGetEffect<FeedTaskCollection>(
			client,
			`${FEED_BASE_PATH}/task`,
			feedListParams(query),
		);
	};

	/**
	 * Creates an upload or download task for a feed type; eBay answers 202 with only a Location.
	 * @param input - CreateTaskRequest body plus optional marketplace and Accept-Language headers.
	 * @returns The new task ID and Location.
	 * @example feed.createTask({ task: { feedType: 'LMS_ADD_FIXED_PRICE_ITEM', schemaVersion: '1423' } })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/createTask
	 */
	const createTask = async (
		input: CreateFeedTaskInput,
	): Promise<CreatedFeedTask> => {
		const { task, marketplaceId, acceptLanguage } = decodeEndpointInputEffect(
			createFeedTaskInputSchema,
			input,
		);
		const taskRequest: CreateTaskRequest = task;
		const headers: Record<string, string> = {};

		if (marketplaceId !== undefined) {
			headers["X-EBAY-C-MARKETPLACE-ID"] = marketplaceId;
		}

		if (acceptLanguage !== undefined) {
			headers["Accept-Language"] = acceptLanguage;
		}

		return postFeedTask(client, "/task", taskRequest, headers);
	};

	/**
	 * Retrieves a feed task's status and upload summary.
	 * @param input - Task identifier.
	 * @returns Generated Task.
	 * @example feed.getTask({ taskId: 'TASK-1' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getTask
	 */
	const getTask = async (input: FeedTaskIdInput): Promise<FeedTask> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);

		return requestGetEffect<FeedTask>(
			client,
			feedResourcePath("/task", taskId),
		);
	};

	/**
	 * Downloads the file previously uploaded to a task (not for LMS_ORDER_REPORT or
	 * LMS_ACTIVE_INVENTORY_REPORT tasks).
	 * @param input - Task identifier.
	 * @returns File bytes with eBay's content type and file name.
	 * @example feed.getInputFile({ taskId: 'TASK-1' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getInputFile
	 */
	const getInputFile = async (
		input: FeedTaskIdInput,
	): Promise<DownloadedFile> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);

		return downloadFeedFile(
			client,
			feedResourcePath("/task", taskId, "/download_input_file"),
		);
	};

	/**
	 * Downloads a task's generated result file once it is COMPLETED or COMPLETED_WITH_ERROR.
	 * @param input - Task identifier.
	 * @returns File bytes (often csv.gz or zipped XML) with eBay's content type and file name.
	 * @example feed.getResultFile({ taskId: 'TASK-1' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/getResultFile
	 */
	const getResultFile = async (
		input: FeedTaskIdInput,
	): Promise<DownloadedFile> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);

		return downloadFeedFile(
			client,
			feedResourcePath("/task", taskId, "/download_result_file"),
		);
	};

	/**
	 * Uploads the feed file of an upload task as multipart/form-data; eBay then processes it
	 * asynchronously (QUEUED, IN_PROCESS, COMPLETED or COMPLETED_WITH_ERROR).
	 * @param input - Task identifier and a validated local feed file.
	 * @returns eBay's (empty) acknowledgement.
	 * @example feed.uploadFile({ taskId: 'TASK-1', file })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/task/methods/uploadFile
	 */
	const uploadFile = async (
		input: FeedTaskIdInput & { file: MediaUpload },
	): Promise<UploadFeedFileResponse> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);
		const file = requireObjectEffect<MediaUpload>(input.file, "file");
		requireStringEffect(file.fileName, "file.fileName");

		return requestPostEffect<UploadFeedFileResponse>(
			client,
			feedResourcePath("/task", taskId, "/upload_file"),
			feedFileForm(file),
			{ timeoutMs: UPLOAD_TIMEOUT_MS },
		);
	};

	return {
		getTasks,
		createTask,
		getTask,
		getInputFile,
		getResultFile,
		uploadFile,
	};
};
