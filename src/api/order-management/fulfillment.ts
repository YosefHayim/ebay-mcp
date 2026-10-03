import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  type EndpointInputError,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  components,
  operations,
} from '@/types/sell-apps/order-management/sellFulfillmentV1Oas3.js';
import { Effect } from 'effect';

/**
 * Response returned by eBay Fulfillment API getOrders.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrders
 */
export type OrderSearchPagedCollection = components['schemas']['OrderSearchPagedCollection'];

/**
 * Response returned by eBay Fulfillment API getOrder.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrder
 */
export type Order = components['schemas']['Order'];

/**
 * Request payload accepted by eBay Fulfillment API createShippingFulfillment.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/shipping_fulfillment/methods/createShippingFulfillment
 */
export type ShippingFulfillmentDetails = components['schemas']['ShippingFulfillmentDetails'];

/**
 * Response returned by eBay Fulfillment API createShippingFulfillment.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/shipping_fulfillment/methods/createShippingFulfillment
 */
export type CreateShippingFulfillmentResponse =
  operations['createShippingFulfillment']['responses'][201]['content']['application/json'];

/**
 * Response returned by eBay Fulfillment API getShippingFulfillments.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/shipping_fulfillment/methods/getShippingFulfillments
 */
export type ShippingFulfillmentPagedCollection =
  components['schemas']['ShippingFulfillmentPagedCollection'];

/**
 * Response returned by eBay Fulfillment API getShippingFulfillment.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/shipping_fulfillment/methods/getShippingFulfillment
 */
export type ShippingFulfillment = components['schemas']['ShippingFulfillment'];

/**
 * Request payload accepted by eBay Fulfillment API issueRefund.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/issueRefund
 */
export type IssueRefundRequest = components['schemas']['IssueRefundRequest'];

/**
 * Response returned by eBay Fulfillment API issueRefund.
 *
 * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/issueRefund
 */
export type Refund = components['schemas']['Refund'];

/** Filters and pagination accepted by getOrders. */
export interface GetOrdersInput {
  /** Response field group requested from eBay, such as TAX_BREAKDOWN. */
  readonly fieldGroups?: string;
  /** eBay filter expression used to narrow returned orders. */
  readonly filter?: string;
  /** Maximum number of orders to return. */
  readonly limit?: number;
  /** Number of orders to skip before returning the first result. */
  readonly offset?: number;
  /** Comma-separated order IDs; when present, other filters are ignored by eBay. */
  readonly orderIds?: string;
}

/** Input required to retrieve one order. */
export interface GetOrderInput {
  /** eBay order identifier from getOrders. */
  readonly orderId: string;
  /** Response field group requested from eBay, such as TAX_BREAKDOWN. */
  readonly fieldGroups?: string;
}

/** Input accepted by createShippingFulfillment. */
export interface CreateShippingFulfillmentInput {
  /** eBay order identifier receiving the shipping fulfillment. */
  readonly orderId: string;
  /** Generated request payload describing the shipment. */
  readonly body: ShippingFulfillmentDetails;
}

/** Input required to retrieve all shipping fulfillments for one order. */
export interface GetShippingFulfillmentsInput {
  /** eBay order identifier whose shipping fulfillments are requested. */
  readonly orderId: string;
}

/** Input required to retrieve one shipping fulfillment. */
export interface GetShippingFulfillmentInput {
  /** eBay order identifier that owns the shipping fulfillment. */
  readonly orderId: string;
  /** eBay shipping fulfillment identifier to retrieve. */
  readonly fulfillmentId: string;
}

/** Input accepted by issueRefund. */
export interface IssueRefundInput {
  /** eBay order identifier receiving the refund. */
  readonly orderId: string;
  /** Generated request payload describing the refund. */
  readonly body: IssueRefundRequest;
}

/** eBay Fulfillment order, shipping fulfillment, and refund endpoints. */
export class FulfillmentApi {
  private readonly basePath = '/sell/fulfillment/v1';

  public constructor(private readonly client: EbayApiClient) {}

  /**
   * Retrieves seller orders.
   *
   * @param input - Optional order filters, field groups, and pagination controls.
   * @returns An Effect that succeeds with eBay's generated OrderSearchPagedCollection.
   *
   * @example
   * ```ts
   * const orders = await Effect.runPromise(
   *   fulfillmentApi.getOrders({
   *     filter: 'orderfulfillmentstatus:{NOT_STARTED|IN_PROGRESS}',
   *     limit: 50,
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrders
   */
  public getOrders = (
    input: GetOrdersInput = {},
  ): Effect.Effect<OrderSearchPagedCollection, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const fieldGroups = yield* optionalStringEffect(input.fieldGroups, 'fieldGroups');
      const filter = yield* optionalStringEffect(input.filter, 'filter');
      const limit = yield* optionalPositiveNumberEffect(input.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(input.offset, 'offset');
      const orderIds = yield* optionalStringEffect(input.orderIds, 'orderIds');
      const path = `${this.basePath}/order`;
      const params = buildEndpointParams({
        fieldGroups: { wireName: 'fieldGroups', value: fieldGroups },
        filter: { wireName: 'filter', value: filter },
        limit: { wireName: 'limit', value: limit === undefined ? undefined : String(limit) },
        offset: { wireName: 'offset', value: offset === undefined ? undefined : String(offset) },
        orderIds: { wireName: 'orderIds', value: orderIds },
      });

      return yield* requestGetEffect<OrderSearchPagedCollection>(this.client, path, params);
    });

  /**
   * Retrieves one order.
   *
   * @param input - Order identifier and optional field group.
   * @returns An Effect that succeeds with eBay's generated Order response.
   *
   * @example
   * ```ts
   * const order = await Effect.runPromise(
   *   fulfillmentApi.getOrder({ orderId: '01-12345-67890' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrder
   */
  public getOrder = (
    input: GetOrderInput,
  ): Effect.Effect<Order, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const orderId = yield* requireStringEffect(input.orderId, 'orderId');
      const fieldGroups = yield* optionalStringEffect(input.fieldGroups, 'fieldGroups');
      const path = `${this.basePath}/order/${orderId}`;
      const params = buildEndpointParams({
        fieldGroups: { wireName: 'fieldGroups', value: fieldGroups },
      });

      return yield* requestGetEffect<Order>(this.client, path, params);
    });

  /**
   * Creates a shipping fulfillment for one order.
   *
   * @param input - Order identifier and generated shipping fulfillment payload.
   * @returns An Effect that succeeds with eBay's generated create response object.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   fulfillmentApi.createShippingFulfillment({
   *     orderId: '01-12345-67890',
   *     body: { lineItems: [{ lineItemId: 'LINE-1', quantity: 1 }] },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/shipping_fulfillment/methods/createShippingFulfillment
   */
  public createShippingFulfillment = (
    input: CreateShippingFulfillmentInput,
  ): Effect.Effect<CreateShippingFulfillmentResponse, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const orderId = yield* requireStringEffect(input.orderId, 'orderId');
      const body = yield* requireObjectEffect<ShippingFulfillmentDetails>(input.body, 'body');
      const path = `${this.basePath}/order/${orderId}/shipping_fulfillment`;

      return yield* requestPostEffect<CreateShippingFulfillmentResponse>(this.client, path, body);
    });

  /**
   * Retrieves all shipping fulfillments for one order.
   *
   * @param input - Order identifier whose shipping fulfillments are requested.
   * @returns An Effect that succeeds with eBay's generated ShippingFulfillmentPagedCollection.
   *
   * @example
   * ```ts
   * const fulfillments = await Effect.runPromise(
   *   fulfillmentApi.getShippingFulfillments({ orderId: '01-12345-67890' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/shipping_fulfillment/methods/getShippingFulfillments
   */
  public getShippingFulfillments = (
    input: GetShippingFulfillmentsInput,
  ): Effect.Effect<ShippingFulfillmentPagedCollection, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const orderId = yield* requireStringEffect(input.orderId, 'orderId');
      const path = `${this.basePath}/order/${orderId}/shipping_fulfillment`;

      return yield* requestGetEffect<ShippingFulfillmentPagedCollection>(this.client, path);
    });

  /**
   * Retrieves one shipping fulfillment for one order.
   *
   * @param input - Order identifier and shipping fulfillment identifier.
   * @returns An Effect that succeeds with eBay's generated ShippingFulfillment response.
   *
   * @example
   * ```ts
   * const fulfillment = await Effect.runPromise(
   *   fulfillmentApi.getShippingFulfillment({
   *     orderId: '01-12345-67890',
   *     fulfillmentId: '9405509699937003457459',
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/shipping_fulfillment/methods/getShippingFulfillment
   */
  public getShippingFulfillment = (
    input: GetShippingFulfillmentInput,
  ): Effect.Effect<ShippingFulfillment, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const orderId = yield* requireStringEffect(input.orderId, 'orderId');
      const fulfillmentId = yield* requireStringEffect(input.fulfillmentId, 'fulfillmentId');
      const path = `${this.basePath}/order/${orderId}/shipping_fulfillment/${fulfillmentId}`;

      return yield* requestGetEffect<ShippingFulfillment>(this.client, path);
    });

  /**
   * Issues a full or partial refund for one order.
   *
   * @param input - Order identifier and generated refund request payload.
   * @returns An Effect that succeeds with eBay's generated Refund response.
   *
   * @example
   * ```ts
   * const refund = await Effect.runPromise(
   *   fulfillmentApi.issueRefund({
   *     orderId: '01-12345-67890',
   *     body: {
   *       reasonForRefund: 'BUYER_CANCEL',
   *       orderLevelRefundAmount: { value: '10.00', currency: 'USD' },
   *     },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/issueRefund
   */
  public issueRefund = (
    input: IssueRefundInput,
  ): Effect.Effect<Refund, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const orderId = yield* requireStringEffect(input.orderId, 'orderId');
      const body = yield* requireObjectEffect<IssueRefundRequest>(input.body, 'body');
      const path = `${this.basePath}/order/${orderId}/issue_refund`;

      return yield* requestPostEffect<Refund>(this.client, path, body);
    });
}
