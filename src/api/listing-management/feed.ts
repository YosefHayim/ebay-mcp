import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { createFeedReportTaskMethods } from './feedReportTasks.js';
import { createFeedScheduleMethods } from './feedSchedules.js';
import { createFeedTaskMethods } from './feedTasks.js';

type FeedTaskMethods = ReturnType<typeof createFeedTaskMethods>;
type FeedReportTaskMethods = ReturnType<typeof createFeedReportTaskMethods>;
type FeedScheduleMethods = ReturnType<typeof createFeedScheduleMethods>;

export type {
  OrderTaskCollection,
  OrderTask,
  InventoryTaskCollection,
  InventoryTask,
  CustomerServiceMetricTaskCollection,
  ServiceMetricsTask,
} from './feedReportTasks.js';
export type {
  UserScheduleCollection,
  UserScheduleResponse,
  ScheduleTemplateCollection,
  ScheduleTemplateResponse,
} from './feedSchedules.js';
export type { FeedTaskCollection, FeedTask, UploadFeedFileResponse } from './feedTasks.js';

/**
 * Feed API - asynchronous order, inventory, and customer service metric feed tasks and
 * schedules. Every member is the eBay operation of the same name; the endpoints live in
 * `feedTasks.ts`, `feedReportTasks.ts` and `feedSchedules.ts` by resource.
 */
export class FeedApi {
  // task resource: feed tasks without filter criteria, their files and uploads.
  /** Feed API getTasks endpoint; see createFeedTaskMethods. */
  public readonly getTasks: FeedTaskMethods['getTasks'];
  /** Feed API createTask endpoint; see createFeedTaskMethods. */
  public readonly createTask: FeedTaskMethods['createTask'];
  /** Feed API getTask endpoint; see createFeedTaskMethods. */
  public readonly getTask: FeedTaskMethods['getTask'];
  /** Feed API getInputFile endpoint; see createFeedTaskMethods. */
  public readonly getInputFile: FeedTaskMethods['getInputFile'];
  /** Feed API getResultFile endpoint; see createFeedTaskMethods. */
  public readonly getResultFile: FeedTaskMethods['getResultFile'];
  /** Feed API uploadFile endpoint; see createFeedTaskMethods. */
  public readonly uploadFile: FeedTaskMethods['uploadFile'];

  // order_task, inventory_task and customer_service_metric_task: filtered report tasks.
  /** Feed API getOrderTasks endpoint; see createFeedReportTaskMethods. */
  public readonly getOrderTasks: FeedReportTaskMethods['getOrderTasks'];
  /** Feed API createOrderTask endpoint; see createFeedReportTaskMethods. */
  public readonly createOrderTask: FeedReportTaskMethods['createOrderTask'];
  /** Feed API getOrderTask endpoint; see createFeedReportTaskMethods. */
  public readonly getOrderTask: FeedReportTaskMethods['getOrderTask'];
  /** Feed API getInventoryTasks endpoint; see createFeedReportTaskMethods. */
  public readonly getInventoryTasks: FeedReportTaskMethods['getInventoryTasks'];
  /** Feed API createInventoryTask endpoint; see createFeedReportTaskMethods. */
  public readonly createInventoryTask: FeedReportTaskMethods['createInventoryTask'];
  /** Feed API getInventoryTask endpoint; see createFeedReportTaskMethods. */
  public readonly getInventoryTask: FeedReportTaskMethods['getInventoryTask'];
  /** Feed API getCustomerServiceMetricTasks endpoint; see createFeedReportTaskMethods. */
  public readonly getCustomerServiceMetricTasks: FeedReportTaskMethods['getCustomerServiceMetricTasks'];
  /** Feed API createCustomerServiceMetricTask endpoint; see createFeedReportTaskMethods. */
  public readonly createCustomerServiceMetricTask: FeedReportTaskMethods['createCustomerServiceMetricTask'];
  /** Feed API getCustomerServiceMetricTask endpoint; see createFeedReportTaskMethods. */
  public readonly getCustomerServiceMetricTask: FeedReportTaskMethods['getCustomerServiceMetricTask'];

  // schedule resource: recurring reports and the templates they subscribe to.
  /** Feed API getSchedules endpoint; see createFeedScheduleMethods. */
  public readonly getSchedules: FeedScheduleMethods['getSchedules'];
  /** Feed API createSchedule endpoint; see createFeedScheduleMethods. */
  public readonly createSchedule: FeedScheduleMethods['createSchedule'];
  /** Feed API getSchedule endpoint; see createFeedScheduleMethods. */
  public readonly getSchedule: FeedScheduleMethods['getSchedule'];
  /** Feed API updateSchedule endpoint; see createFeedScheduleMethods. */
  public readonly updateSchedule: FeedScheduleMethods['updateSchedule'];
  /** Feed API deleteSchedule endpoint; see createFeedScheduleMethods. */
  public readonly deleteSchedule: FeedScheduleMethods['deleteSchedule'];
  /** Feed API getLatestResultFile endpoint; see createFeedScheduleMethods. */
  public readonly getLatestResultFile: FeedScheduleMethods['getLatestResultFile'];
  /** Feed API getScheduleTemplate endpoint; see createFeedScheduleMethods. */
  public readonly getScheduleTemplate: FeedScheduleMethods['getScheduleTemplate'];
  /** Feed API getScheduleTemplates endpoint; see createFeedScheduleMethods. */
  public readonly getScheduleTemplates: FeedScheduleMethods['getScheduleTemplates'];

  /**
   * Builds every Feed API endpoint over one shared client.
   * @param client - Shared authenticated HTTP client.
   */
  public constructor(client: EbayApiClient) {
    const tasks = createFeedTaskMethods(client);
    this.getTasks = tasks.getTasks;
    this.createTask = tasks.createTask;
    this.getTask = tasks.getTask;
    this.getInputFile = tasks.getInputFile;
    this.getResultFile = tasks.getResultFile;
    this.uploadFile = tasks.uploadFile;

    const reports = createFeedReportTaskMethods(client);
    this.getOrderTasks = reports.getOrderTasks;
    this.createOrderTask = reports.createOrderTask;
    this.getOrderTask = reports.getOrderTask;
    this.getInventoryTasks = reports.getInventoryTasks;
    this.createInventoryTask = reports.createInventoryTask;
    this.getInventoryTask = reports.getInventoryTask;
    this.getCustomerServiceMetricTasks = reports.getCustomerServiceMetricTasks;
    this.createCustomerServiceMetricTask = reports.createCustomerServiceMetricTask;
    this.getCustomerServiceMetricTask = reports.getCustomerServiceMetricTask;

    const schedules = createFeedScheduleMethods(client);
    this.getSchedules = schedules.getSchedules;
    this.createSchedule = schedules.createSchedule;
    this.getSchedule = schedules.getSchedule;
    this.updateSchedule = schedules.updateSchedule;
    this.deleteSchedule = schedules.deleteSchedule;
    this.getLatestResultFile = schedules.getLatestResultFile;
    this.getScheduleTemplate = schedules.getScheduleTemplate;
    this.getScheduleTemplates = schedules.getScheduleTemplates;
  }
}
