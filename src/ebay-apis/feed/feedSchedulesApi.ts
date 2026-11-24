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
	EndpointInputError,
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

/** Schedules page for a feed type. @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getSchedules */
export type UserScheduleCollection =
	components["schemas"]["UserScheduleCollection"];
/** One schedule. @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getSchedule */
export type UserScheduleResponse =
	components["schemas"]["UserScheduleResponse"];
/** Schedule templates page. @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getScheduleTemplates */
export type ScheduleTemplateCollection =
	components["schemas"]["ScheduleTemplateCollection"];
/** One schedule template. @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getScheduleTemplate */
export type ScheduleTemplateResponse =
	components["schemas"]["ScheduleTemplateResponse"];

/** Schedule created by createSchedule; eBay reports its ID only in `Location`. */
interface CreatedFeedSchedule {
	readonly scheduleId: string;
	readonly location: string;
}

/**
 * Creates the Feed API `schedule` resource endpoints: recurring report schedules, their
 * latest result file, and the templates schedules subscribe to.
 * @param client - Shared authenticated HTTP client.
 * @returns Endpoint methods composed into FeedApi.
 */
export const createFeedScheduleMethods = (client: EbayApiClient) => {
	/**
	 * Lists the seller's schedules for a feed type.
	 * @param input - feedType (required), limit, offset.
	 * @returns Generated UserScheduleCollection.
	 * @example feed.getSchedules({ feedType: 'LMS_ORDER_REPORT' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getSchedules
	 */
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

	/**
	 * Subscribes to a schedule template; eBay answers 201 with the new ID only in Location.
	 * @param input - CreateUserScheduleRequest body.
	 * @returns The new schedule ID and Location.
	 * @example feed.createSchedule({ schedule: { feedType: 'LMS_ORDER_REPORT', scheduleTemplateId: 'T-1' } })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/createSchedule
	 */
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

	/**
	 * Retrieves one schedule's details and status.
	 * @param input - Schedule identifier.
	 * @returns Generated UserScheduleResponse.
	 * @example feed.getSchedule({ scheduleId: 'S-1' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getSchedule
	 */
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

	/**
	 * Updates a schedule; the input is validated against its (possibly changed) template.
	 * @param input - Schedule identifier and UpdateUserScheduleRequest body with at least one field.
	 * @returns Completes on eBay's empty HTTP 204 response.
	 * @example feed.updateSchedule({ scheduleId: 'S-1', schedule: { preferredTriggerHour: '11Z' } })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/updateSchedule
	 */
	const updateSchedule = async (
		input: UpdateFeedScheduleInput,
	): Promise<void> => {
		const { scheduleId, schedule } = decodeEndpointInputEffect(
			updateFeedScheduleInputSchema,
			input,
		);
		const hasNoScheduleFields = Object.keys(schedule).length === 0;

		if (hasNoScheduleFields) {
			throw new EndpointInputError({
				parameter: "schedule",
				message: "Provide at least one schedule field to update",
			});
		}

		return requestPutEffect<void>(
			client,
			feedResourcePath("/schedule", scheduleId),
			schedule,
		);
	};

	/**
	 * Deletes a schedule; it stops generating reports.
	 * @param input - Schedule identifier.
	 * @returns Completes on eBay's empty HTTP 204 response.
	 * @example feed.deleteSchedule({ scheduleId: 'S-1' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/deleteSchedule
	 */
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

	/**
	 * Downloads the latest report a schedule generated.
	 * @param input - Schedule identifier.
	 * @returns File bytes (compressed or plain CSV, XML or JSON) with eBay's type and name.
	 * @example feed.getLatestResultFile({ scheduleId: 'S-1' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getLatestResultFile
	 */
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

	/**
	 * Retrieves one schedule template, including the fields a schedule must supply.
	 * @param input - Schedule template identifier.
	 * @returns Generated ScheduleTemplateResponse.
	 * @example feed.getScheduleTemplate({ scheduleTemplateId: 'T-1' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getScheduleTemplate
	 */
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

	/**
	 * Lists the schedule templates for a feed type.
	 * @param input - feedType (required), limit, offset.
	 * @returns Generated ScheduleTemplateCollection.
	 * @example feed.getScheduleTemplates({ feedType: 'LMS_ORDER_REPORT' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getScheduleTemplates
	 */
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
};
