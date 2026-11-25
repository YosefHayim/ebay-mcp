import type { Order } from "@/ebay-apis/fulfillment/fulfillmentApi.js";

function hasRequestedCancelState(cancelState: string | undefined): boolean {
	const isCancelStateMissing = cancelState === undefined;

	if (isCancelStateMissing) {
		return false;
	}

	const isCancelRequested = cancelState != "NONE_REQUESTED";

	return isCancelRequested;
}

function hasEntries(entries: readonly unknown[] | undefined): boolean {
	const isArray = Array.isArray(entries);

	if (isArray) {
		const hasItems = entries.length > 0;

		return hasItems;
	}

	return false;
}

export function hasCancellationRequest(order: Order): boolean {
	const cancelState = order.cancelStatus?.cancelState;
	const isCancelRequested = hasRequestedCancelState(cancelState);

	if (isCancelRequested) {
		return true;
	}

	const requests = order.cancelStatus?.cancelRequests;

	return hasEntries(requests);
}

export function hasOrderRefunds(order: Order): boolean {
	const refunds = order.paymentSummary?.refunds;

	return hasEntries(refunds);
}

export function filterOrdersWithCancellationRequests(
	orders: readonly Order[],
): Order[] {
	return orders.filter(hasCancellationRequest);
}

export function filterRefundedOrders(orders: readonly Order[]): Order[] {
	return orders.filter(hasOrderRefunds);
}
