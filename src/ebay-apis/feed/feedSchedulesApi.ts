import type { z } from "zod";
import {
	createFeedScheduleInputSchema,
	feedScheduleIdInputSchema,
	feedScheduleTemplateIdInputSchema,
	feedTypePageInputSchema,
	updateFeedScheduleInputSchema,
} from "@/ebay-apis/feed/feedSchemas.js";
import type { DownloadedFile } from "@/ebay-client/download.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	decodeEndpointInputEffect,
	requestDeleteEffect,
	requestGetEffect,
	requestPutEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellFeedV1Oas3.js";
import {
	downloadFeedFile,
	FEED_BASE_PATH,
	feedListParams,
	feedResourcePath,
	postFeedResource,
} from "./feedRequestApi.js";

type FeedTypePageInput = z.infer<typeof feedTypePageInputSchema>;
type FeedScheduleIdInput = z.infer<typeof feedScheduleIdInputSchema>;
type FeedScheduleTemplateIdInput = z.infer<
	typeof feedScheduleTemplateIdInputSchema
>;
type CreateFeedScheduleInput = z.infer<typeof createFeedScheduleInputSchema>;
type UpdateFeedScheduleInput = z.infer<typeof updateFeedScheduleInputSchema>;

export type UserScheduleCollection =
	components["schemas"]["UserScheduleCollection"];
export type UserScheduleResponse =
	components["schemas"]["UserScheduleResponse"];
export type ScheduleTemplateCollection =
	components["schemas"]["ScheduleTemplateCollection"];
export type ScheduleTemplateResponse =
	components["schemas"]["ScheduleTemplateResponse"];

interface CreatedFeedSchedule {
	readonly scheduleId: string;
	readonly location: string;
}

export function createFeedScheduleMethods(client: EbayApiClient) {
	const getSchedules = async (
		input: FeedTypePageInput,
	): Promise<UserScheduleCollection> => {
		const query = decodeEndpointInputEffect(feedTypePageInputSchema, input);

		return requestGetEffect<UserScheduleCollection>(
			client,
			`${FEED_BASE_PATH}/schedule`,
			feedListParams(query),
		);
	};

	const createSchedule = async (
		input: CreateFeedScheduleInput,
	): Promise<CreatedFeedSchedule> => {
		const { schedule } = decodeEndpointInputEffect(
			createFeedScheduleInputSchema,
			input,
		);
		const located = await postFeedResource(client, "/schedule", schedule);

		return { scheduleId: located.id, location: located.location };
	};

	const getSchedule = async (
		input: FeedScheduleIdInput,
	): Promise<UserScheduleResponse> => {
		const { scheduleId } = decodeEndpointInputEffect(
			feedScheduleIdInputSchema,
			input,
		);

		return requestGetEffect<UserScheduleResponse>(
			client,
			feedResourcePath("/schedule", scheduleId),
		);
	};

	const updateSchedule = async (
		input: UpdateFeedScheduleInput,
	): Promise<void> => {
		const { scheduleId, schedule } = decodeEndpointInputEffect(
			updateFeedScheduleInputSchema,
			input,
		);
		const hasNoScheduleFields = Object.keys(schedule).length == 0;

		if (hasNoScheduleFields) {
			throw new Error("Provide at least one schedule field to update");
		}

		return requestPutEffect<void>(
			client,
			feedResourcePath("/schedule", scheduleId),
			schedule,
		);
	};

	const deleteSchedule = async (input: FeedScheduleIdInput): Promise<void> => {
		const { scheduleId } = decodeEndpointInputEffect(
			feedScheduleIdInputSchema,
			input,
		);

		return requestDeleteEffect<void>(
			client,
			feedResourcePath("/schedule", scheduleId),
		);
	};

	const getLatestResultFile = async (
		input: FeedScheduleIdInput,
	): Promise<DownloadedFile> => {
		const { scheduleId } = decodeEndpointInputEffect(
			feedScheduleIdInputSchema,
			input,
		);

		return downloadFeedFile(
			client,
			feedResourcePath("/schedule", scheduleId, "/download_result_file"),
		);
	};

	const getScheduleTemplate = async (
		input: FeedScheduleTemplateIdInput,
	): Promise<ScheduleTemplateResponse> => {
		const { scheduleTemplateId } = decodeEndpointInputEffect(
			feedScheduleTemplateIdInputSchema,
			input,
		);

		return requestGetEffect<ScheduleTemplateResponse>(
			client,
			feedResourcePath("/schedule_template", scheduleTemplateId),
		);
	};

	const getScheduleTemplates = async (
		input: FeedTypePageInput,
	): Promise<ScheduleTemplateCollection> => {
		const query = decodeEndpointInputEffect(feedTypePageInputSchema, input);

		return requestGetEffect<ScheduleTemplateCollection>(
			client,
			`${FEED_BASE_PATH}/schedule_template`,
			feedListParams(query),
		);
	};

	return {
		getSchedules,
		createSchedule,
		getSchedule,
		updateSchedule,
		deleteSchedule,
		getLatestResultFile,
		getScheduleTemplate,
		getScheduleTemplates,
	};
}
