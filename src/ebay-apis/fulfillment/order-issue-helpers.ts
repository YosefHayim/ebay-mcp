import type { Order } from '@/ebay-apis/fulfillment/fulfillment-api.js';

/**
 * Return true when an order has a cancellation request (or completed cancel).
 *
 * Fulfillment always returns `cancelStatus`; when nothing was requested,
 * `cancelState` is `NONE_REQUESTED` and `cancelRequests` is empty.
 *
 * @param order - One Fulfillment API order DTO.
 * @returns Whether the order has a non-empty cancellation state.
 *
 * @example
 * ```ts
 * const openCancels = orders.filter(hasCancellationRequest);
 * ```
 */
export const hasCancellationRequest = (order: Order): boolean => {
  const cancelState = order.cancelStatus?.cancelState;
  if (cancelState !== undefined && cancelState !== 'NONE_REQUESTED') {
    return true;
  }

  const requests = order.cancelStatus?.cancelRequests;
  return Array.isArray(requests) && requests.length > 0;
};

/**
 * Return true when an order has one or more refunds in paymentSummary.
 *
 * @param order - One Fulfillment API order DTO.
 * @returns Whether `paymentSummary.refunds` is a non-empty array.
 *
 * @example
 * ```ts
 * const refunded = orders.filter(hasOrderRefunds);
 * ```
 */
export const hasOrderRefunds = (order: Order): boolean => {
  const refunds = order.paymentSummary?.refunds;
  return Array.isArray(refunds) && refunds.length > 0;
};

/**
 * Filter orders that have a cancellation request.
 *
 * @param orders - Orders returned by getOrders.
 * @returns Orders whose cancel state is not NONE_REQUESTED (or that list cancel requests).
 *
 * @example
 * ```ts
 * const matches = filterOrdersWithCancellationRequests(result.orders ?? []);
 * ```
 */
export const filterOrdersWithCancellationRequests = (orders: readonly Order[]): Order[] =>
  orders.filter(hasCancellationRequest);

/**
 * Filter orders that have recorded refunds.
 *
 * @param orders - Orders returned by getOrders.
 * @returns Orders with a non-empty `paymentSummary.refunds` array.
 *
 * @example
 * ```ts
 * const matches = filterRefundedOrders(result.orders ?? []);
 * ```
 */
export const filterRefundedOrders = (orders: readonly Order[]): Order[] =>
  orders.filter(hasOrderRefunds);
