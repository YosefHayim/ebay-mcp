import type { z } from "zod";
import {
	createCustomerServiceMetricTaskInputSchema,
	createInventoryTaskInputSchema,
	createOrderTaskInputSchema,
	feedTaskIdInputSchema,
	getCustomerServiceMetricTasksInputSchema,
	getInventoryTasksInputSchema,
	getOrderTasksInputSchema,
} from "@/ebay-apis/feed/feedSchemas.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	decodeEndpointInputEffect,
	requestGetEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellFeedV1Oas3.js";
import {
	type CreatedFeedTask,
	exclusiveFeedFilters,
	FEED_BASE_PATH,
	feedListParams,
	feedResourcePath,
	postFeedTask,
} from "./feedRequestApi.js";

type FeedTaskIdInput = z.infer<typeof feedTaskIdInputSchema>;
type GetOrderTasksInput = z.infer<typeof getOrderTasksInputSchema>;
type CreateOrderTaskInput = z.infer<typeof createOrderTaskInputSchema>;
type GetInventoryTasksInput = z.infer<typeof getInventoryTasksInputSchema>;
type CreateInventoryTaskInput = z.infer<typeof createInventoryTaskInputSchema>;
type GetServiceMetricTasksInput = z.infer<
	typeof getCustomerServiceMetricTasksInputSchema
>;
type CreateServiceMetricTaskInput = z.infer<
	typeof createCustomerServiceMetricTaskInputSchema
>;
/** Order report tasks page. @see https://developer.ebay.com/api-docs/sell/feed/resources/order_task/methods/getOrderTasks */
export type OrderTaskCollection = components["schemas"]["OrderTaskCollection"];
/** Order report task. @see https://developer.ebay.com/api-docs/sell/feed/resources/order_task/methods/getOrderTask */
export type OrderTask = components["schemas"]["OrderTask"];
/** Inventory report tasks page. @see https://developer.ebay.com/api-docs/sell/feed/resources/inventory_task/methods/getInventoryTasks */
export type InventoryTaskCollection =
	components["schemas"]["InventoryTaskCollection"];
/** Inventory report task. @see https://developer.ebay.com/api-docs/sell/feed/resources/inventory_task/methods/getInventoryTask */
export type InventoryTask = components["schemas"]["InventoryTask"];
/** Customer service metric tasks page. @see https://developer.ebay.com/api-docs/sell/feed/resources/customer_service_metric_task/methods/getCustomerServiceMetricTasks */
export type CustomerServiceMetricTaskCollection =
	components["schemas"]["CustomerServiceMetricTaskCollection"];
/** Customer service metric task. @see https://developer.ebay.com/api-docs/sell/feed/resources/customer_service_metric_task/methods/getCustomerServiceMetricTask */
export type ServiceMetricsTask = components["schemas"]["ServiceMetricsTask"];

/**
 * Creates the Feed API report-task endpoints that take filter criteria: order reports
 * (`order_task`), active inventory reports (`inventory_task`) and customer service metric
 * reports (`customer_service_metric_task`).
 * @param client - Shared authenticated HTTP client.
 * @returns Endpoint methods composed into FeedApi.
 */
export const createFeedReportTaskMethods = (client: EbayApiClient) => {
	/**
	 * Lists order report tasks by feed type or schedule.
	 * @param input - feedType or scheduleId (not both), dateRange or lookBackDays, limit, offset.
	 * @returns Generated OrderTaskCollection.
	 * @example feed.getOrderTasks({ feedType: 'LMS_ORDER_REPORT', lookBackDays: 10 })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/order_task/methods/getOrderTasks
	 */
	const getOrderTasks = async (
		input: GetOrderTasksInput = {},
	): Promise<OrderTaskCollection> => {
		const parsedInput = decodeEndpointInputEffect(
			getOrderTasksInputSchema,
			input,
		);
		const query = exclusiveFeedFilters(parsedInput);

		return requestGetEffect<OrderTaskCollection>(
			client,
			`${FEED_BASE_PATH}/order_task`,
			feedListParams(query),
		);
	};

	/**
	 * Creates an LMS_ORDER_REPORT download task; eBay answers 202 with only a Location.
	 * @param input - CreateOrderTaskRequest body.
	 * @returns The new task ID and Location.
	 * @example feed.createOrderTask({ task: { feedType: 'LMS_ORDER_REPORT', schemaVersion: '1235' } })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/order_task/methods/createOrderTask
	 */
	const createOrderTask = async (
		input: CreateOrderTaskInput,
	): Promise<CreatedFeedTask> => {
		const { task } = decodeEndpointInputEffect(
			createOrderTaskInputSchema,
			input,
		);

		return postFeedTask(client, "/order_task", task);
	};

	/**
	 * Retrieves one order report task.
	 * @param input - Task identifier.
	 * @returns Generated OrderTask.
	 * @example feed.getOrderTask({ taskId: 'TASK-1' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/order_task/methods/getOrderTask
	 */
	const getOrderTask = async (input: FeedTaskIdInput): Promise<OrderTask> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);

		return requestGetEffect<OrderTask>(
			client,
			feedResourcePath("/order_task", taskId),
		);
	};

	/**
	 * Lists active inventory report tasks.
	 * @param input - feedType, dateRange or lookBackDays, limit, offset.
	 * @returns Generated InventoryTaskCollection.
	 * @example feed.getInventoryTasks({ feedType: 'LMS_ACTIVE_INVENTORY_REPORT' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/inventory_task/methods/getInventoryTasks
	 */
	const getInventoryTasks = async (
		input: GetInventoryTasksInput = {},
	): Promise<InventoryTaskCollection> => {
		const parsedInput = decodeEndpointInputEffect(
			getInventoryTasksInputSchema,
			input,
		);
		const query = exclusiveFeedFilters(parsedInput);

		return requestGetEffect<InventoryTaskCollection>(
			client,
			`${FEED_BASE_PATH}/inventory_task`,
			feedListParams(query),
		);
	};

	/**
	 * Creates an LMS_ACTIVE_INVENTORY_REPORT download task; eBay answers 202 with only a Location.
	 * @param input - CreateInventoryTaskRequest body.
	 * @returns The new task ID and Location.
	 * @example feed.createInventoryTask({ task: { feedType: 'LMS_ACTIVE_INVENTORY_REPORT', schemaVersion: '1.0' } })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/inventory_task/methods/createInventoryTask
	 */
	const createInventoryTask = async (
		input: CreateInventoryTaskInput,
	): Promise<CreatedFeedTask> => {
		const { task } = decodeEndpointInputEffect(
			createInventoryTaskInputSchema,
			input,
		);

		return postFeedTask(client, "/inventory_task", task);
	};

	/**
	 * Retrieves one active inventory report task.
	 * @param input - Task identifier.
	 * @returns Generated InventoryTask.
	 * @example feed.getInventoryTask({ taskId: 'TASK-1' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/inventory_task/methods/getInventoryTask
	 */
	const getInventoryTask = async (
		input: FeedTaskIdInput,
	): Promise<InventoryTask> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);

		return requestGetEffect<InventoryTask>(
			client,
			feedResourcePath("/inventory_task", taskId),
		);
	};

	/**
	 * Lists customer service metric report tasks.
	 * @param input - feedType, dateRange or lookBackDays, limit, offset.
	 * @returns Generated CustomerServiceMetricTaskCollection.
	 * @example feed.getCustomerServiceMetricTasks({ lookBackDays: 30 })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/customer_service_metric_task/methods/getCustomerServiceMetricTasks
	 */
	const getCustomerServiceMetricTasks = async (
		input: GetServiceMetricTasksInput = {},
	): Promise<CustomerServiceMetricTaskCollection> => {
		const parsedInput = decodeEndpointInputEffect(
			getCustomerServiceMetricTasksInputSchema,
			input,
		);
		const query = exclusiveFeedFilters(parsedInput);

		return requestGetEffect<CustomerServiceMetricTaskCollection>(
			client,
			`${FEED_BASE_PATH}/customer_service_metric_task`,
			feedListParams(query),
		);
	};

	/**
	 * Creates a CUSTOMER_SERVICE_METRICS_REPORT download task; eBay answers 202 with only a
	 * Location. Accept-Language is required by eBay and defaults to the configured language.
	 * @param input - CreateServiceMetricsTaskRequest body and optional Accept-Language.
	 * @returns The new task ID and Location.
	 * @example feed.createCustomerServiceMetricTask({ task: { feedType: 'CUSTOMER_SERVICE_METRICS_REPORT', schemaVersion: '1.0', filterCriteria: { customerServiceMetricType: 'ITEM_NOT_RECEIVED', evaluationMarketplaceId: 'EBAY_US' } } })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/customer_service_metric_task/methods/createCustomerServiceMetricTask
	 */
	const createCustomerServiceMetricTask = async (
		input: CreateServiceMetricTaskInput,
	): Promise<CreatedFeedTask> => {
		const { task, acceptLanguage } = decodeEndpointInputEffect(
			createCustomerServiceMetricTaskInputSchema,
			input,
		);
		let headers: Record<string, string> | undefined;

		if (acceptLanguage !== undefined) {
			headers = { "Accept-Language": acceptLanguage };
		}

		return postFeedTask(client, "/customer_service_metric_task", task, headers);
	};

	/**
	 * Retrieves one customer service metric report task.
	 * @param input - Task identifier.
	 * @returns Generated ServiceMetricsTask.
	 * @example feed.getCustomerServiceMetricTask({ taskId: 'TASK-1' })
	 * @see https://developer.ebay.com/api-docs/sell/feed/resources/customer_service_metric_task/methods/getCustomerServiceMetricTask
	 */
	const getCustomerServiceMetricTask = async (
		input: FeedTaskIdInput,
	): Promise<ServiceMetricsTask> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);

		return requestGetEffect<ServiceMetricsTask>(
			client,
			feedResourcePath("/customer_service_metric_task", taskId),
		);
	};

	return {
		getOrderTasks,
		createOrderTask,
		getOrderTask,
		getInventoryTasks,
		createInventoryTask,
		getInventoryTask,
		getCustomerServiceMetricTasks,
		createCustomerServiceMetricTask,
		getCustomerServiceMetricTask,
	};
};
