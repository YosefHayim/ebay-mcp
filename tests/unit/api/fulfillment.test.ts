import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Effect } from 'effect';
import {
  FulfillmentApi,
  type IssueRefundRequest,
  type Order,
  type OrderSearchPagedCollection,
  type Refund,
  type ShippingFulfillment,
  type ShippingFulfillmentDetails,
  type ShippingFulfillmentPagedCollection,
} from '@/api/order-management/fulfillment.js';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';

describe('FulfillmentApi', () => {
  let fulfillmentApi: FulfillmentApi;
  let mockClient: EbayApiClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as EbayApiClient;

    fulfillmentApi = new FulfillmentApi(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrders', () => {
    it('gets all orders without filters', async () => {
      const mockResponse: OrderSearchPagedCollection = {
        total: 10,
        orders: [
          {
            orderId: '12345-67890',
            lineItems: [],
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const orderPage = await Effect.runPromise(fulfillmentApi.getOrders());

      expect(mockClient.get).toHaveBeenCalledWith('/sell/fulfillment/v1/order');
      expect(orderPage).toEqual(mockResponse);
    });

    it('maps order filters to eBay query names', async () => {
      const mockResponse: OrderSearchPagedCollection = {
        total: 50,
        limit: 10,
        offset: 20,
        orders: [],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(
        fulfillmentApi.getOrders({
          fieldGroups: 'TAX_BREAKDOWN',
          filter: 'orderfulfillmentstatus:{NOT_STARTED}',
          limit: 10,
          offset: 20,
          orderIds: 'ORDER-1,ORDER-2',
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/fulfillment/v1/order', {
        fieldGroups: 'TAX_BREAKDOWN',
        filter: 'orderfulfillmentstatus:{NOT_STARTED}',
        limit: '10',
        offset: '20',
        orderIds: 'ORDER-1,ORDER-2',
      });
    });
  });

  describe('getOrder', () => {
    it('gets a specific order by ID', async () => {
      const mockOrder: Order = {
        orderId: '12345-67890',
        orderFulfillmentStatus: 'NOT_STARTED',
        lineItems: [
          {
            lineItemId: '1',
            sku: 'TEST-SKU-001',
            quantity: 1,
          },
        ],
        buyer: {
          username: 'testbuyer',
        },
        pricingSummary: {
          total: {
            value: '99.99',
            currency: 'USD',
          },
        },
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockOrder);

      const order = await Effect.runPromise(fulfillmentApi.getOrder({ orderId: '12345-67890' }));

      expect(mockClient.get).toHaveBeenCalledWith('/sell/fulfillment/v1/order/12345-67890');
      expect(order).toEqual(mockOrder);
    });

    it('passes fieldGroups when requested', async () => {
      vi.mocked(mockClient.get).mockResolvedValue({ orderId: '12345-67890' });

      await Effect.runPromise(
        fulfillmentApi.getOrder({ orderId: '12345-67890', fieldGroups: 'TAX_BREAKDOWN' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/fulfillment/v1/order/12345-67890', {
        fieldGroups: 'TAX_BREAKDOWN',
      });
    });

    it('fails with a tagged input error when orderId is missing', async () => {
      const error = await Effect.runPromise(Effect.flip(fulfillmentApi.getOrder({ orderId: '' })));

      expect(error._tag).toBe('EndpointInputError');
      expect(error.parameter).toBe('orderId');
    });
  });

  describe('createShippingFulfillment', () => {
    it('creates a shipping fulfillment for an order', async () => {
      const fulfillmentDetails: ShippingFulfillmentDetails = {
        lineItems: [
          {
            lineItemId: '1',
            quantity: 1,
          },
        ],
        shippingCarrierCode: 'USPS',
        trackingNumber: '9400123456789012345678',
      };

      vi.mocked(mockClient.post).mockResolvedValue({});

      const createdFulfillment = await Effect.runPromise(
        fulfillmentApi.createShippingFulfillment({
          orderId: '12345-67890',
          body: fulfillmentDetails,
        }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/order/12345-67890/shipping_fulfillment',
        fulfillmentDetails,
      );
      expect(createdFulfillment).toEqual({});
    });

    it('fails with a tagged input error when body is missing', async () => {
      const error = await Effect.runPromise(
        Effect.flip(
          fulfillmentApi.createShippingFulfillment({
            orderId: '12345-67890',
            body: undefined as unknown as ShippingFulfillmentDetails,
          }),
        ),
      );

      expect(error._tag).toBe('EndpointInputError');
      expect(error.parameter).toBe('body');
    });
  });

  describe('getShippingFulfillments', () => {
    it('gets all shipping fulfillments for an order', async () => {
      const mockResponse: ShippingFulfillmentPagedCollection = {
        total: 1,
        fulfillments: [
          {
            fulfillmentId: 'FUL-001',
            lineItems: [{ lineItemId: '1', quantity: 1 }],
            shipmentTrackingNumber: '9400123456789012345678',
            shippingCarrierCode: 'USPS',
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const fulfillments = await Effect.runPromise(
        fulfillmentApi.getShippingFulfillments({ orderId: '12345-67890' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/order/12345-67890/shipping_fulfillment',
      );
      expect(fulfillments).toEqual(mockResponse);
    });
  });

  describe('getShippingFulfillment', () => {
    it('gets a specific shipping fulfillment', async () => {
      const mockFulfillment: ShippingFulfillment = {
        fulfillmentId: 'FUL-001',
        lineItems: [
          {
            lineItemId: '1',
            quantity: 1,
          },
        ],
        shipmentTrackingNumber: '9400123456789012345678',
        shippingCarrierCode: 'USPS',
        shippedDate: '2025-01-15T10:30:00.000Z',
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockFulfillment);

      const fulfillment = await Effect.runPromise(
        fulfillmentApi.getShippingFulfillment({
          orderId: '12345-67890',
          fulfillmentId: 'FUL-001',
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/order/12345-67890/shipping_fulfillment/FUL-001',
      );
      expect(fulfillment).toEqual(mockFulfillment);
    });
  });

  describe('issueRefund', () => {
    it('issues a full refund', async () => {
      const refundRequest: IssueRefundRequest = {
        reasonForRefund: 'BUYER_CANCEL',
        orderLevelRefundAmount: {
          value: '99.99',
          currency: 'USD',
        },
      };

      const mockRefund: Refund = {
        refundId: 'REF-001',
        refundStatus: 'PENDING',
        refundAmount: {
          value: '99.99',
          currency: 'USD',
        },
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockRefund);

      const refund = await Effect.runPromise(
        fulfillmentApi.issueRefund({ orderId: '12345-67890', body: refundRequest }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/order/12345-67890/issue_refund',
        refundRequest,
      );
      expect(refund).toEqual(mockRefund);
    });

    it('issues a partial refund with line items', async () => {
      const refundRequest: IssueRefundRequest = {
        reasonForRefund: 'ITEM_DAMAGED',
        refundItems: [
          {
            lineItemId: '1',
            refundAmount: {
              value: '25.00',
              currency: 'USD',
            },
          },
        ],
      };

      const mockRefund: Refund = {
        refundId: 'REF-002',
        refundStatus: 'PENDING',
        refundAmount: {
          value: '25.00',
          currency: 'USD',
        },
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockRefund);

      const refund = await Effect.runPromise(
        fulfillmentApi.issueRefund({ orderId: '12345-67890', body: refundRequest }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/order/12345-67890/issue_refund',
        refundRequest,
      );
      expect(refund).toEqual(mockRefund);
    });
  });
});
