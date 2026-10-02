import { getMediaAccessConfig } from '@/config/mediaAccess.js';
import {
  createCustomerServiceMetricTaskInputSchema,
  createFeedScheduleInputSchema,
  createFeedTaskInputSchema,
  createInventoryTaskInputSchema,
  createOrderTaskInputSchema,
  feedScheduleIdInputSchema,
  feedScheduleTemplateIdInputSchema,
  feedTaskIdInputSchema,
  feedTypePageInputSchema,
  getCustomerServiceMetricTasksInputSchema,
  getFeedTasksInputSchema,
  getInventoryTasksInputSchema,
  getOrderTasksInputSchema,
  updateFeedScheduleInputSchema,
  uploadFeedFileInputSchema,
} from '@/schemas/inventory-management/feed.js';
import { defineTool } from '@/tools/defineTool.js';
import { formatFileResult } from '@/tools/fileResult.js';
import type { ToolEntry } from '@/tools/registry.js';
import { loadLocalMedia } from '@/utils/localMedia.js';
import { Effect } from 'effect';

const TASK_SCOPE_NOTE =
  'The OAuth scope depends on the feed type: sell.inventory for LMS listing and inventory feeds, sell.fulfillment for LMS_ORDER_ACK and LMS_ORDER_REPORT (sell.marketing and commerce.catalog.readonly feed types are reserved by eBay).';
const SCHEDULE_SCOPE_NOTE =
  'Schedules exist only for LMS_ORDER_REPORT, which requires sell.fulfillment.';
const DOWNLOAD_NOTE =
  'Returned as an embedded resource carrying the content type and file name eBay sent; files above 25 MiB are refused.';
const FEED_FILE_ACCESS_NOTE =
  'Local file access is opt-in: the file must sit inside a directory listed in EBAY_MCP_MEDIA_DIRS (or under EBAY_MCP_MEDIA_ROOT, which also anchors media://<relative-path> references). Symlinks are resolved before the check.';

const taskUri = (taskId: string, file: 'input' | 'result'): string =>
  `ebay-feed://task/${encodeURIComponent(taskId)}/${file}`;

/** Feed API tools for order, inventory, and customer service metric tasks, schedules, and feed files. */
export const feedEntries: ToolEntry[] = [
  // order_task
  defineTool({
    name: 'ebay_get_order_tasks',
    description:
      'List Feed API order report tasks (LMS_ORDER_REPORT) by feedType or scheduleId (not both), filtered by dateRange or lookBackDays (not both), with limit/offset paging. Requires sell.fulfillment.',
    inputSchema: getOrderTasksInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getOrderTasks(args)),
  }),
  defineTool({
    name: 'ebay_create_order_task',
    description:
      'Create an asynchronous Feed API order report task: feedType LMS_ORDER_REPORT, schemaVersion (1113 or higher) and optional filterCriteria (creationDateRange of at most 10 days, orderStatus ACTIVE or COMPLETED). eBay answers 202; returns taskId and Location. Poll ebay_get_order_task until COMPLETED or COMPLETED_WITH_ERROR, then download with ebay_get_feed_task_result_file. Requires sell.fulfillment.',
    inputSchema: createOrderTaskInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.feed.createOrderTask(args)),
  }),
  defineTool({
    name: 'ebay_get_order_task',
    description:
      'Get one Feed API order report task by taskId: status (QUEUED, IN_PROCESS, then COMPLETED or COMPLETED_WITH_ERROR when the file is ready), filter criteria and timestamps. Requires sell.fulfillment.',
    inputSchema: feedTaskIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getOrderTask(args)),
  }),

  // inventory_task
  defineTool({
    name: 'ebay_get_inventory_tasks',
    description:
      'List Feed API active inventory report tasks (LMS_ACTIVE_INVENTORY_REPORT), filtered by dateRange or lookBackDays (not both), with limit/offset paging. Requires sell.inventory.',
    inputSchema: getInventoryTasksInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getInventoryTasks(args)),
  }),
  defineTool({
    name: 'ebay_create_inventory_task',
    description:
      'Create an asynchronous Feed API ActiveInventoryReport task (price and quantity of every active listing): feedType LMS_ACTIVE_INVENTORY_REPORT, schemaVersion 1.0, optional filterCriteria.listingFormat AUCTION or FIXED_PRICE. eBay answers 202; returns taskId and Location. Poll ebay_get_inventory_task, then download with ebay_get_feed_task_result_file. Requires sell.inventory.',
    inputSchema: createInventoryTaskInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.feed.createInventoryTask(args)),
  }),
  defineTool({
    name: 'ebay_get_inventory_task',
    description:
      'Get one Feed API active inventory report task by taskId: status, filter criteria and timestamps. Requires sell.inventory.',
    inputSchema: feedTaskIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getInventoryTask(args)),
  }),

  // schedule and schedule_template
  defineTool({
    name: 'ebay_get_feed_schedules',
    description: `List the seller's Feed API report schedules for a feedType (required), with limit/offset paging. ${SCHEDULE_SCOPE_NOTE}`,
    inputSchema: feedTypePageInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getSchedules(args)),
  }),
  defineTool({
    name: 'ebay_create_feed_schedule',
    description: `Create a recurring Feed API report schedule that subscribes to an ACTIVE schedule template: feedType and scheduleTemplateId, plus scheduleName, preferredTriggerHour/DayOfWeek/DayOfMonth, scheduleStartDate/EndDate and schemaVersion as the template requires (read it with ebay_get_feed_schedule_template). eBay answers 201; returns scheduleId and Location. Schedules per feed type are limited (error 160031). ${SCHEDULE_SCOPE_NOTE}`,
    inputSchema: createFeedScheduleInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.feed.createSchedule(args)),
  }),
  defineTool({
    name: 'ebay_get_feed_schedule',
    description: `Get one Feed API schedule by scheduleId: template, trigger settings, status and last run. ${SCHEDULE_SCOPE_NOTE}`,
    inputSchema: feedScheduleIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getSchedule(args)),
  }),
  defineTool({
    name: 'ebay_update_feed_schedule',
    description: `Update a Feed API schedule's name, trigger hour/day, start/end dates or schemaVersion. eBay validates the fields against the schedule's current template and returns 204. ${SCHEDULE_SCOPE_NOTE}`,
    inputSchema: updateFeedScheduleInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.feed.updateSchedule(args)),
  }),
  defineTool({
    name: 'ebay_delete_feed_schedule',
    description: `Delete a Feed API schedule so it stops generating reports. This cannot be undone. ${SCHEDULE_SCOPE_NOTE}`,
    inputSchema: feedScheduleIdInputSchema.shape,
    annotations: { readOnlyHint: false, destructiveHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.deleteSchedule(args)),
  }),
  defineTool({
    name: 'ebay_get_feed_schedule_result_file',
    description: `Download the latest report a Feed API schedule generated (compressed or plain CSV, XML or JSON). ${DOWNLOAD_NOTE} ${SCHEDULE_SCOPE_NOTE}`,
    inputSchema: feedScheduleIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getLatestResultFile(args)),
    formatResult: (file, args) =>
      formatFileResult(
        file,
        `ebay-feed://schedule/${encodeURIComponent(args.scheduleId)}/result`,
        `Feed schedule ${args.scheduleId} latest result file`,
      ),
  }),
  defineTool({
    name: 'ebay_get_feed_schedule_template',
    description: `Get one Feed API schedule template by scheduleTemplateId: feed type, frequency and which schedule fields are required or optional (with defaults). ${SCHEDULE_SCOPE_NOTE}`,
    inputSchema: feedScheduleTemplateIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getScheduleTemplate(args)),
  }),
  defineTool({
    name: 'ebay_get_feed_schedule_templates',
    description: `List the Feed API schedule templates for a feedType (required), with limit/offset paging; use a template ID with ebay_create_feed_schedule. ${SCHEDULE_SCOPE_NOTE}`,
    inputSchema: feedTypePageInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getScheduleTemplates(args)),
  }),

  // task
  defineTool({
    name: 'ebay_get_feed_tasks',
    description: `List Feed API tasks (uploads and downloads, on-demand and scheduled) by feedType or scheduleId (not both), filtered by dateRange or lookBackDays (not both), with limit/offset paging. ${TASK_SCOPE_NOTE}`,
    inputSchema: getFeedTasksInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getTasks(args)),
  }),
  defineTool({
    name: 'ebay_create_feed_task',
    description: `Create a Feed API upload or download task without filter criteria (feedType and schemaVersion), e.g. an LMS listing upload (LMS_ADD_FIXED_PRICE_ITEM), LMS_ORDER_ACK or a Seller Hub feed. eBay answers 202; returns taskId and Location. For upload feed types send the file with ebay_upload_feed_task_file, then poll ebay_get_feed_task. Optional marketplaceId and acceptLanguage set X-EBAY-C-MARKETPLACE-ID and Accept-Language (fr-CA with EBAY_CA, fr-BE with EBAY_BE). ${TASK_SCOPE_NOTE}`,
    inputSchema: createFeedTaskInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.feed.createTask(args)),
  }),
  defineTool({
    name: 'ebay_get_feed_task_input_file',
    description: `Download the file previously uploaded to a Feed API task (not available for LMS_ORDER_REPORT or LMS_ACTIVE_INVENTORY_REPORT tasks). ${DOWNLOAD_NOTE} ${TASK_SCOPE_NOTE}`,
    inputSchema: feedTaskIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getInputFile(args)),
    formatResult: (file, args) =>
      formatFileResult(file, taskUri(args.taskId, 'input'), `Feed task ${args.taskId} input file`),
  }),
  defineTool({
    name: 'ebay_get_feed_task_result_file',
    description: `Download the result file of a Feed API task once it is COMPLETED or COMPLETED_WITH_ERROR: the generated report (order, inventory or customer service metric task IDs work too) or an upload's processing results, often csv.gz or zipped XML. ${DOWNLOAD_NOTE} ${TASK_SCOPE_NOTE}`,
    inputSchema: feedTaskIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getResultFile(args)),
    formatResult: (file, args) =>
      formatFileResult(
        file,
        taskUri(args.taskId, 'result'),
        `Feed task ${args.taskId} result file`,
      ),
  }),
  defineTool({
    name: 'ebay_get_feed_task',
    description: `Get one Feed API task by taskId: feed type, status (QUEUED, IN_PROCESS, then COMPLETED or COMPLETED_WITH_ERROR when the file is ready), timestamps and the upload summary (success and failure counts). ${TASK_SCOPE_NOTE}`,
    inputSchema: feedTaskIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getTask(args)),
  }),
  defineTool({
    name: 'ebay_upload_feed_task_file',
    description: `Upload a local feed file to a Feed API upload task from ebay_create_feed_task: XML or zipped XML for LMS feed types, CSV for Seller Hub feed types (.xml, .zip, .gz or .csv, UTF-8 text, up to 15 MiB, eBay's data file limit). Sent as multipart/form-data; eBay then processes it asynchronously, so poll ebay_get_feed_task until COMPLETED or COMPLETED_WITH_ERROR and read per-record errors with ebay_get_feed_task_result_file. Not for LMS_ORDER_REPORT or LMS_ACTIVE_INVENTORY_REPORT. ${TASK_SCOPE_NOTE} ${FEED_FILE_ACCESS_NOTE}`,
    inputSchema: uploadFeedFileInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) =>
      Effect.runPromise(
        loadLocalMedia(args.path, 'feedFile', getMediaAccessConfig()).pipe(
          Effect.flatMap((file) => api.feed.uploadFile({ taskId: args.taskId, file })),
        ),
      ),
  }),

  // customer_service_metric_task
  defineTool({
    name: 'ebay_get_customer_service_metric_tasks',
    description:
      'List Feed API customer service metric report tasks (CUSTOMER_SERVICE_METRICS_REPORT), filtered by dateRange or lookBackDays (not both), with limit/offset paging. Requires sell.analytics.readonly.',
    inputSchema: getCustomerServiceMetricTasksInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getCustomerServiceMetricTasks(args)),
  }),
  defineTool({
    name: 'ebay_create_customer_service_metric_task',
    description:
      'Create an asynchronous Feed API customer service metrics report task: feedType CUSTOMER_SERVICE_METRICS_REPORT, schemaVersion 1.0, filterCriteria with customerServiceMetricType (ITEM_NOT_AS_DESCRIBED or ITEM_NOT_RECEIVED) and evaluationMarketplaceId, optionally listingCategories or shippingRegions. Only CURRENT evaluations are supported; check ebay_get_customer_service_metric first to avoid tasks with no evaluation. acceptLanguage (eBay-required Accept-Language) defaults to EBAY_CONTENT_LANGUAGE. eBay answers 202; returns taskId and Location. Poll ebay_get_customer_service_metric_task, then download with ebay_get_feed_task_result_file. Requires sell.analytics.readonly.',
    inputSchema: createCustomerServiceMetricTaskInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.feed.createCustomerServiceMetricTask(args)),
  }),
  defineTool({
    name: 'ebay_get_customer_service_metric_task',
    description:
      'Get one Feed API customer service metric report task by taskId: status, filter criteria and timestamps. Requires sell.analytics.readonly.',
    inputSchema: feedTaskIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.feed.getCustomerServiceMetricTask(args)),
  }),
];
