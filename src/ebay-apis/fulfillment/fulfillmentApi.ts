import type { z } from "zod";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	optionalStringEffect,
	requestGetEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type {
	components,
	operations,
} from "@/ebay-openapi-types/sellFulfillmentV1Oas3.js";
import type {
	createShippingFulfillmentInputSchema,
	issueRefundInputSchema,
} from "./ordersSchemas.js";

export type OrderSearchPagedCollection =
	components["schemas"]["OrderSearchPagedCollection"];

export type Order = components["schemas"]["Order"];

export type ShippingFulfillmentDetails =
	components["schemas"]["ShippingFulfillmentDetails"];

export type CreateShippingFulfillmentResponse =
	operations["createShippingFulfillment"]["responses"][201]["content"]["application/json"];

export type ShippingFulfillmentPagedCollection =
	components["schemas"]["ShippingFulfillmentPagedCollection"];

export type ShippingFulfillment = components["schemas"]["ShippingFulfillment"];

export type IssueRefundRequest = components["schemas"]["IssueRefundRequest"];

export type Refund = components["schemas"]["Refund"];

export interface GetOrdersInput {
	readonly fieldGroups?: string | undefined;
	readonly filter?: string | undefined;
	readonly limit?: number | undefined;
	readonly offset?: number | undefined;
	readonly orderIds?: string | undefined;
}

export interface GetOrderInput {
	readonly orderId: string;
	readonly fieldGroups?: string | undefined;
}

export type CreateShippingFulfillmentInput = z.infer<
	typeof createShippingFulfillmentInputSchema
>;

export interface GetShippingFulfillmentsInput {
	readonly orderId: string;
}

export interface GetShippingFulfillmentInput {
	readonly orderId: string;
	readonly fulfillmentId: string;
}

export type IssueRefundInput = z.infer<typeof issueRefundInputSchema>;

export class FulfillmentApi {
	private readonly basePath = "/sell/fulfillment/v1";

	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	public getOrders = async (
		input: GetOrdersInput = {},
	): Promise<OrderSearchPagedCollection> => {
		const fieldGroups = optionalStringEffect(input.fieldGroups, "fieldGroups");
		const filter = optionalStringEffect(input.filter, "filter");
		const limit = optionalPositiveNumberEffect(input.limit, "limit");
		const offset = optionalNonNegativeNumberEffect(input.offset, "offset");
		const orderIds = optionalStringEffect(input.orderIds, "orderIds");
		const path = `${this.basePath}/order`;
		const params = buildEndpointParams({
			fieldGroups: { wireName: "fieldGroups", value: fieldGroups },
			filter: { wireName: "filter", value: filter },
			limit: {
				wireName: "limit",
				value: limit === undefined ? undefined : String(limit),
			},
			offset: {
				wireName: "offset",
				value: offset === undefined ? undefined : String(offset),
			},
			orderIds: { wireName: "orderIds", value: orderIds },
		});

		return await requestGetEffect<OrderSearchPagedCollection>(
			this.client,
			path,
			params,
		);
	};

	public getOrder = async (input: GetOrderInput): Promise<Order> => {
		const orderId = requireStringEffect(input.orderId, "orderId");
		const fieldGroups = optionalStringEffect(input.fieldGroups, "fieldGroups");
		const path = `${this.basePath}/order/${orderId}`;
		const params = buildEndpointParams({
			fieldGroups: { wireName: "fieldGroups", value: fieldGroups },
		});

		return await requestGetEffect<Order>(this.client, path, params);
	};

	public createShippingFulfillment = async (
		input: CreateShippingFulfillmentInput,
	): Promise<CreateShippingFulfillmentResponse> => {
		const orderId = requireStringEffect(input.orderId, "orderId");
		const fulfillmentDetails = requireObjectEffect<ShippingFulfillmentDetails>(
			input.body,
			"body",
		);
		const path = `${this.basePath}/order/${orderId}/shipping_fulfillment`;

		return await requestPostEffect<CreateShippingFulfillmentResponse>(
			this.client,
			path,
			fulfillmentDetails,
		);
	};

	public getShippingFulfillments = async (
		input: GetShippingFulfillmentsInput,
	): Promise<ShippingFulfillmentPagedCollection> => {
		const orderId = requireStringEffect(input.orderId, "orderId");
		const path = `${this.basePath}/order/${orderId}/shipping_fulfillment`;

		return await requestGetEffect<ShippingFulfillmentPagedCollection>(
			this.client,
			path,
		);
	};

	public getShippingFulfillment = async (
		input: GetShippingFulfillmentInput,
	): Promise<ShippingFulfillment> => {
		const orderId = requireStringEffect(input.orderId, "orderId");
		const fulfillmentId = requireStringEffect(
			input.fulfillmentId,
			"fulfillmentId",
		);
		const path = `${this.basePath}/order/${orderId}/shipping_fulfillment/${fulfillmentId}`;

		return await requestGetEffect<ShippingFulfillment>(this.client, path);
	};

	public issueRefund = async (input: IssueRefundInput): Promise<Refund> => {
		const orderId = requireStringEffect(input.orderId, "orderId");
		const refundRequest = requireObjectEffect<IssueRefundRequest>(
			input.body,
			"body",
		);
		const path = `${this.basePath}/order/${orderId}/issue_refund`;

		// eBay requires a digital signature on issueRefund for EU/UK sellers.
		return await requestPostEffect<Refund>(this.client, path, refundRequest, {
			signed: true,
		});
	};
}
