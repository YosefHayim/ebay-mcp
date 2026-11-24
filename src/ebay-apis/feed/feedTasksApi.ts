import type { z } from "zod";
import {
	createFeedTaskInputSchema,
	feedTaskIdInputSchema,
	getFeedTasksInputSchema,
} from "@/ebay-apis/feed/feedSchemas.js";
import type { MediaUpload } from "@/ebay-apis/inventory/mediaApi.js";
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
import {
	type CreatedFeedTask,
	downloadFeedFile,
	exclusiveFeedFilters,
	FEED_BASE_PATH,
	feedListParams,
	feedResourcePath,
	postFeedTask,
} from "./feedRequestApi.js";

const UPLOAD_TIMEOUT_MS = 10 * 60_000;

type GetFeedTasksInput = z.infer<typeof getFeedTasksInputSchema>;
type CreateFeedTaskInput = z.infer<typeof createFeedTaskInputSchema>;
type FeedTaskIdInput = z.infer<typeof feedTaskIdInputSchema>;
type CreateTaskRequest = components["schemas"]["CreateTaskRequest"];

function feedFileForm(file: MediaUpload): FormData {
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
}

export type FeedTaskCollection = components["schemas"]["TaskCollection"];
export type FeedTask = components["schemas"]["Task"];
export type UploadFeedFileResponse =
	operations["uploadFile"]["responses"][200]["content"]["application/json"];

export function createFeedTaskMethods(client: EbayApiClient) {
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

	const getTask = async (input: FeedTaskIdInput): Promise<FeedTask> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);

		return requestGetEffect<FeedTask>(
			client,
			feedResourcePath("/task", taskId),
		);
	};

	const getInputFile = async (
		input: FeedTaskIdInput,
	): Promise<DownloadedFile> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);

		return downloadFeedFile(
			client,
			feedResourcePath("/task", taskId, "/download_input_file"),
		);
	};

	const getResultFile = async (
		input: FeedTaskIdInput,
	): Promise<DownloadedFile> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);

		return downloadFeedFile(
			client,
			feedResourcePath("/task", taskId, "/download_result_file"),
		);
	};

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
}
