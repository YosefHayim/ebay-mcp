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
export type OrderTaskCollection = components["schemas"]["OrderTaskCollection"];
export type OrderTask = components["schemas"]["OrderTask"];
export type InventoryTaskCollection =
	components["schemas"]["InventoryTaskCollection"];
export type InventoryTask = components["schemas"]["InventoryTask"];
export type CustomerServiceMetricTaskCollection =
	components["schemas"]["CustomerServiceMetricTaskCollection"];
export type ServiceMetricsTask = components["schemas"]["ServiceMetricsTask"];

export function createFeedReportTaskMethods(client: EbayApiClient) {
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

	const createOrderTask = async (
		input: CreateOrderTaskInput,
	): Promise<CreatedFeedTask> => {
		const { task } = decodeEndpointInputEffect(
			createOrderTaskInputSchema,
			input,
		);

		return postFeedTask(client, "/order_task", task);
	};

	const getOrderTask = async (input: FeedTaskIdInput): Promise<OrderTask> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);

		return requestGetEffect<OrderTask>(
			client,
			feedResourcePath("/order_task", taskId),
		);
	};

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

	const createInventoryTask = async (
		input: CreateInventoryTaskInput,
	): Promise<CreatedFeedTask> => {
		const { task } = decodeEndpointInputEffect(
			createInventoryTaskInputSchema,
			input,
		);

		return postFeedTask(client, "/inventory_task", task);
	};

	const getInventoryTask = async (
		input: FeedTaskIdInput,
	): Promise<InventoryTask> => {
		const { taskId } = decodeEndpointInputEffect(feedTaskIdInputSchema, input);

		return requestGetEffect<InventoryTask>(
			client,
			feedResourcePath("/inventory_task", taskId),
		);
	};

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
}
