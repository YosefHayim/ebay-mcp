import { describe, it, expect } from 'vitest';
import type { Order } from '@/ebay-apis/fulfillment/fulfillmentApi.js';
import {
  filterOrdersWithCancellationRequests,
  filterRefundedOrders,
  hasCancellationRequest,
  hasOrderRefunds,
} from '@/ebay-apis/fulfillment/orderIssueHelpers.js';

const order = (partial: Order): Order => partial;

describe('orderIssueHelpers', () => {
  describe('hasCancellationRequest', () => {
    it('returns false for NONE_REQUESTED with empty requests', () => {
      expect(
        hasCancellationRequest(
          order({
            cancelStatus: { cancelState: 'NONE_REQUESTED', cancelRequests: [] },
          }),
        ),
      ).toBe(false);
    });

    it('returns true when cancelState is not NONE_REQUESTED', () => {
      expect(
        hasCancellationRequest(
          order({
            cancelStatus: { cancelState: 'CANCEL_REQUESTED' },
          }),
        ),
      ).toBe(true);
      expect(
        hasCancellationRequest(
          order({
            cancelStatus: { cancelState: 'CANCELED' },
          }),
        ),
      ).toBe(true);
    });

    it('returns true when cancelRequests is non-empty even if state is missing', () => {
      expect(
        hasCancellationRequest(
          order({
            cancelStatus: {
              cancelRequests: [{ cancelRequestId: 'CR-1' }],
            },
          }),
        ),
      ).toBe(true);
    });

    it('returns false when cancelStatus is absent', () => {
      expect(hasCancellationRequest(order({}))).toBe(false);
    });
  });

  describe('hasOrderRefunds', () => {
    it('returns false when refunds are missing or empty', () => {
      expect(hasOrderRefunds(order({}))).toBe(false);
      expect(hasOrderRefunds(order({ paymentSummary: {} }))).toBe(false);
      expect(hasOrderRefunds(order({ paymentSummary: { refunds: [] } }))).toBe(false);
    });

    it('returns true when paymentSummary.refunds has entries', () => {
      expect(
        hasOrderRefunds(
          order({
            paymentSummary: {
              refunds: [{ refundId: 'R-1', refundStatus: 'REFUNDED' }],
            },
          }),
        ),
      ).toBe(true);
    });
  });

  describe('filter helpers', () => {
    const orders: Order[] = [
      order({
        orderId: 'none',
        cancelStatus: { cancelState: 'NONE_REQUESTED', cancelRequests: [] },
        paymentSummary: { refunds: [] },
      }),
      order({
        orderId: 'cancel-only',
        cancelStatus: { cancelState: 'CANCEL_REQUESTED' },
        paymentSummary: { refunds: [] },
      }),
      order({
        orderId: 'refund-only',
        cancelStatus: { cancelState: 'NONE_REQUESTED' },
        paymentSummary: {
          refunds: [{ refundId: 'R-9' }],
        },
      }),
      order({
        orderId: 'both',
        cancelStatus: { cancelState: 'CANCELED' },
        paymentSummary: {
          refunds: [{ refundId: 'R-2' }],
        },
      }),
    ];

    it('filters cancellation requests', () => {
      const matches = filterOrdersWithCancellationRequests(orders);
      expect(matches.map((entry) => entry.orderId)).toEqual(['cancel-only', 'both']);
    });

    it('filters refunded orders', () => {
      const matches = filterRefundedOrders(orders);
      expect(matches.map((entry) => entry.orderId)).toEqual(['refund-only', 'both']);
    });
  });
});
