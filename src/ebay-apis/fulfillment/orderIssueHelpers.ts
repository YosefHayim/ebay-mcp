import type { Order } from "@/ebay-apis/fulfillment/fulfillmentApi.js";

export function hasCancellationRequest(order: Order): boolean {
	const cancelState = order.cancelStatus?.cancelState;
	if (cancelState !== undefined && cancelState != "NONE_REQUESTED") {
		return true;
	}

	const requests = order.cancelStatus?.cancelRequests;
	return Array.isArray(requests) && requests.length > 0;
}

export function hasOrderRefunds(order: Order): boolean {
	const refunds = order.paymentSummary?.refunds;
	return Array.isArray(refunds) && refunds.length > 0;
}

export function filterOrdersWithCancellationRequests(
	orders: readonly Order[],
): Order[] {
	return orders.filter(hasCancellationRequest);
}

export function filterRefundedOrders(orders: readonly Order[]): Order[] {
	return orders.filter(hasOrderRefunds);
}
