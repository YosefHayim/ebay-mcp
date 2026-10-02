import type { EbayApiClient } from '@/api/client.js';
import { createFeedReportTaskMethods } from './feedReportTasks.js';
import { createFeedScheduleMethods } from './feedSchedules.js';
import { createFeedTaskMethods } from './feedTasks.js';

type FeedTaskMethods = ReturnType<typeof createFeedTaskMethods>;
type FeedReportTaskMethods = ReturnType<typeof createFeedReportTaskMethods>;
type FeedScheduleMethods = ReturnType<typeof createFeedScheduleMethods>;

/**
 * Feed API - asynchronous order, inventory, and customer service metric feed tasks and
 * schedules. Every member is the eBay operation of the same name; the endpoints live in
 * `feedTasks.ts`, `feedReportTasks.ts` and `feedSchedules.ts` by resource.
 */
export class FeedApi {
  // task resource: feed tasks without filter criteria, their files and uploads.
  public readonly getTasks: FeedTaskMethods['getTasks'];
  public readonly createTask: FeedTaskMethods['createTask'];
  public readonly getTask: FeedTaskMethods['getTask'];
  public readonly getInputFile: FeedTaskMethods['getInputFile'];
  public readonly getResultFile: FeedTaskMethods['getResultFile'];
  public readonly uploadFile: FeedTaskMethods['uploadFile'];

  // order_task, inventory_task and customer_service_metric_task: filtered report tasks.
  public readonly getOrderTasks: FeedReportTaskMethods['getOrderTasks'];
  public readonly createOrderTask: FeedReportTaskMethods['createOrderTask'];
  public readonly getOrderTask: FeedReportTaskMethods['getOrderTask'];
  public readonly getInventoryTasks: FeedReportTaskMethods['getInventoryTasks'];
  public readonly createInventoryTask: FeedReportTaskMethods['createInventoryTask'];
  public readonly getInventoryTask: FeedReportTaskMethods['getInventoryTask'];
  public readonly getCustomerServiceMetricTasks: FeedReportTaskMethods['getCustomerServiceMetricTasks'];
  public readonly createCustomerServiceMetricTask: FeedReportTaskMethods['createCustomerServiceMetricTask'];
  public readonly getCustomerServiceMetricTask: FeedReportTaskMethods['getCustomerServiceMetricTask'];

  // schedule resource: recurring reports and the templates they subscribe to.
  public readonly getSchedules: FeedScheduleMethods['getSchedules'];
  public readonly createSchedule: FeedScheduleMethods['createSchedule'];
  public readonly getSchedule: FeedScheduleMethods['getSchedule'];
  public readonly updateSchedule: FeedScheduleMethods['updateSchedule'];
  public readonly deleteSchedule: FeedScheduleMethods['deleteSchedule'];
  public readonly getLatestResultFile: FeedScheduleMethods['getLatestResultFile'];
  public readonly getScheduleTemplate: FeedScheduleMethods['getScheduleTemplate'];
  public readonly getScheduleTemplates: FeedScheduleMethods['getScheduleTemplates'];

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
