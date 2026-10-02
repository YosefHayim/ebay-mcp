import type { EbayApiClient } from '@/api/client.js';
import {
  decodeEndpointInputEffect,
  EndpointInputError,
  requestDeleteEffect,
  requestGetEffect,
  requestPutEffect,
} from '@/api/shared/request.js';
import {
  createFeedScheduleInputSchema,
  feedScheduleIdInputSchema,
  feedScheduleTemplateIdInputSchema,
  feedTypePageInputSchema,
  updateFeedScheduleInputSchema,
} from '@/schemas/inventory-management/feed.js';
import type { components } from '@/types/sell-apps/listing-management/sellFeedV1Oas3.js';
import type { InferEffectSchema } from '@/utils/effectSchemaTypes.js';
import { Effect } from 'effect';
import {
  downloadFeedFile,
  FEED_BASE_PATH,
  feedListParams,
  feedResourcePath,
  postFeedResource,
} from './feedRequest.js';

type FeedTypePageInput = InferEffectSchema<typeof feedTypePageInputSchema>;
type FeedScheduleIdInput = InferEffectSchema<typeof feedScheduleIdInputSchema>;
type FeedScheduleTemplateIdInput = InferEffectSchema<typeof feedScheduleTemplateIdInputSchema>;
type CreateFeedScheduleInput = InferEffectSchema<typeof createFeedScheduleInputSchema>;
type UpdateFeedScheduleInput = InferEffectSchema<typeof updateFeedScheduleInputSchema>;
type CreateUserScheduleRequest = components['schemas']['CreateUserScheduleRequest'];
type UpdateUserScheduleRequest = components['schemas']['UpdateUserScheduleRequest'];

/** Schedules page for a feed type. @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getSchedules */
export type UserScheduleCollection = components['schemas']['UserScheduleCollection'];
/** One schedule. @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getSchedule */
export type UserScheduleResponse = components['schemas']['UserScheduleResponse'];
/** Schedule templates page. @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getScheduleTemplates */
export type ScheduleTemplateCollection = components['schemas']['ScheduleTemplateCollection'];
/** One schedule template. @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getScheduleTemplate */
export type ScheduleTemplateResponse = components['schemas']['ScheduleTemplateResponse'];

/**
 * Creates the Feed API `schedule` resource endpoints: recurring report schedules, their
 * latest result file, and the templates schedules subscribe to.
 * @param client - Shared authenticated HTTP client.
 * @returns Endpoint Effects composed into FeedApi.
 */
export const createFeedScheduleMethods = (client: EbayApiClient) => {
  /**
   * Lists the seller's schedules for a feed type.
   * @param input - feedType (required), limit, offset.
   * @returns Generated UserScheduleCollection.
   * @example feed.getSchedules({ feedType: 'LMS_ORDER_REPORT' })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getSchedules
   */
  const getSchedules = (input: FeedTypePageInput) =>
    decodeEndpointInputEffect(feedTypePageInputSchema, input).pipe(
      Effect.flatMap((query) =>
        requestGetEffect<UserScheduleCollection>(
          client,
          `${FEED_BASE_PATH}/schedule`,
          feedListParams(query),
        ),
      ),
    );

  /**
   * Subscribes to a schedule template; eBay answers 201 with the new ID only in Location.
   * @param input - CreateUserScheduleRequest body.
   * @returns The new schedule ID and Location.
   * @example feed.createSchedule({ schedule: { feedType: 'LMS_ORDER_REPORT', scheduleTemplateId: 'T-1' } })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/createSchedule
   */
  const createSchedule = (input: CreateFeedScheduleInput) =>
    decodeEndpointInputEffect(createFeedScheduleInputSchema, input).pipe(
      Effect.flatMap(({ schedule }) => {
        const body: CreateUserScheduleRequest = schedule;
        return postFeedResource(client, '/schedule', body);
      }),
      Effect.map(({ id, location }) => ({ scheduleId: id, location })),
    );

  /**
   * Retrieves one schedule's details and status.
   * @param input - Schedule identifier.
   * @returns Generated UserScheduleResponse.
   * @example feed.getSchedule({ scheduleId: 'S-1' })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getSchedule
   */
  const getSchedule = (input: FeedScheduleIdInput) =>
    decodeEndpointInputEffect(feedScheduleIdInputSchema, input).pipe(
      Effect.flatMap(({ scheduleId }) =>
        requestGetEffect<UserScheduleResponse>(client, feedResourcePath('/schedule', scheduleId)),
      ),
    );

  /**
   * Updates a schedule; the input is validated against its (possibly changed) template.
   * @param input - Schedule identifier and UpdateUserScheduleRequest body with at least one field.
   * @returns An Effect completing on eBay's empty HTTP 204 response.
   * @example feed.updateSchedule({ scheduleId: 'S-1', schedule: { preferredTriggerHour: '11Z' } })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/updateSchedule
   */
  const updateSchedule = (input: UpdateFeedScheduleInput) =>
    decodeEndpointInputEffect(updateFeedScheduleInputSchema, input).pipe(
      Effect.filterOrFail(
        ({ schedule }) => Object.keys(schedule).length > 0,
        () =>
          new EndpointInputError({
            parameter: 'schedule',
            message: 'Provide at least one schedule field to update',
          }),
      ),
      Effect.flatMap(({ scheduleId, schedule }) => {
        const body: UpdateUserScheduleRequest = schedule;
        return requestPutEffect<void>(client, feedResourcePath('/schedule', scheduleId), body);
      }),
    );

  /**
   * Deletes a schedule; it stops generating reports.
   * @param input - Schedule identifier.
   * @returns An Effect completing on eBay's empty HTTP 204 response.
   * @example feed.deleteSchedule({ scheduleId: 'S-1' })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/deleteSchedule
   */
  const deleteSchedule = (input: FeedScheduleIdInput) =>
    decodeEndpointInputEffect(feedScheduleIdInputSchema, input).pipe(
      Effect.flatMap(({ scheduleId }) =>
        requestDeleteEffect<void>(client, feedResourcePath('/schedule', scheduleId)),
      ),
    );

  /**
   * Downloads the latest report a schedule generated.
   * @param input - Schedule identifier.
   * @returns File bytes (compressed or plain CSV, XML or JSON) with eBay's type and name.
   * @example feed.getLatestResultFile({ scheduleId: 'S-1' })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getLatestResultFile
   */
  const getLatestResultFile = (input: FeedScheduleIdInput) =>
    decodeEndpointInputEffect(feedScheduleIdInputSchema, input).pipe(
      Effect.flatMap(({ scheduleId }) =>
        downloadFeedFile(
          client,
          feedResourcePath('/schedule', scheduleId, '/download_result_file'),
        ),
      ),
    );

  /**
   * Retrieves one schedule template, including the fields a schedule must supply.
   * @param input - Schedule template identifier.
   * @returns Generated ScheduleTemplateResponse.
   * @example feed.getScheduleTemplate({ scheduleTemplateId: 'T-1' })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getScheduleTemplate
   */
  const getScheduleTemplate = (input: FeedScheduleTemplateIdInput) =>
    decodeEndpointInputEffect(feedScheduleTemplateIdInputSchema, input).pipe(
      Effect.flatMap(({ scheduleTemplateId }) =>
        requestGetEffect<ScheduleTemplateResponse>(
          client,
          feedResourcePath('/schedule_template', scheduleTemplateId),
        ),
      ),
    );

  /**
   * Lists the schedule templates for a feed type.
   * @param input - feedType (required), limit, offset.
   * @returns Generated ScheduleTemplateCollection.
   * @example feed.getScheduleTemplates({ feedType: 'LMS_ORDER_REPORT' })
   * @see https://developer.ebay.com/api-docs/sell/feed/resources/schedule/methods/getScheduleTemplates
   */
  const getScheduleTemplates = (input: FeedTypePageInput) =>
    decodeEndpointInputEffect(feedTypePageInputSchema, input).pipe(
      Effect.flatMap((query) =>
        requestGetEffect<ScheduleTemplateCollection>(
          client,
          `${FEED_BASE_PATH}/schedule_template`,
          feedListParams(query),
        ),
      ),
    );

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
