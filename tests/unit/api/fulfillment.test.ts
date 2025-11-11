import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { FulfillmentApi } from "../../../src/api/order-management/fulfillment.js";
import type { EbayApiClient } from "../../../src/api/client.js";
import type { components } from "../../../src/types/sell_fulfillment_v1_oas3.js";

type Order = components["schemas"]["Order"];
type OrderSearchPagedCollection = components["schemas"]["OrderSearchPagedCollection"];
type ShippingFulfillmentDetails = components["schemas"]["ShippingFulfillmentDetails"];
type ShippingFulfillment = components["schemas"]["ShippingFulfillment"];
type ShippingFulfillmentPagedCollection = components["schemas"]["ShippingFulfillmentPagedCollection"];
type IssueRefundRequest = components["schemas"]["IssueRefundRequest"];
type Refund = components["schemas"]["Refund"];

describe("FulfillmentApi", () => {
  let fulfillmentApi: FulfillmentApi;
  let mockClient: EbayApiClient;

  beforeEach(() => {
    // Create mock client with spy methods
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

  describe("getOrders", () => {
    it("should get all orders without filters", async () => {
      const mockResponse: OrderSearchPagedCollection = {
        total: 10,
        orders: [
          {
            orderId: "12345-67890",
            lineItems: [],
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await fulfillmentApi.getOrders();

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order",
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get orders with filter parameter", async () => {
      const mockResponse: OrderSearchPagedCollection = {
        total: 5,
        orders: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      await fulfillmentApi.getOrders("orderfulfillmentstatus:{NOT_STARTED}");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order",
        { filter: "orderfulfillmentstatus:{NOT_STARTED}" }
      );
    });

    it("should get orders with limit parameter", async () => {
      const mockResponse: OrderSearchPagedCollection = {
        total: 100,
        limit: 10,
        orders: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      await fulfillmentApi.getOrders(undefined, 10);

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order",
        { limit: 10 }
      );
    });

    it("should get orders with offset parameter", async () => {
      const mockResponse: OrderSearchPagedCollection = {
        total: 100,
        offset: 20,
        orders: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      await fulfillmentApi.getOrders(undefined, undefined, 20);

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order",
        { offset: 20 }
      );
    });

    it("should get orders with all parameters", async () => {
      const mockResponse: OrderSearchPagedCollection = {
        total: 50,
        limit: 10,
        offset: 20,
        orders: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      await fulfillmentApi.getOrders(
        "orderfulfillmentstatus:{NOT_STARTED}",
        10,
        20
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order",
        {
          filter: "orderfulfillmentstatus:{NOT_STARTED}",
          limit: 10,
          offset: 20,
        }
      );
    });
  });

  describe("getOrder", () => {
    it("should get a specific order by ID", async () => {
      const mockOrder: Order = {
        orderId: "12345-67890",
        orderFulfillmentStatus: "NOT_STARTED",
        lineItems: [
          {
            lineItemId: "1",
            sku: "TEST-SKU-001",
            quantity: 1,
          },
        ],
        buyer: {
          username: "testbuyer",
        },
        pricingSummary: {
          total: {
            value: "99.99",
            currency: "USD",
          },
        },
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockOrder);

      const result = await fulfillmentApi.getOrder("12345-67890");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order/12345-67890"
      );
      expect(result).toEqual(mockOrder);
      expect(result.orderId).toBe("12345-67890");
    });
  });

  describe("createShippingFulfillment", () => {
    it("should create a shipping fulfillment for an order", async () => {
      const fulfillmentDetails: ShippingFulfillmentDetails = {
        lineItems: [
          {
            lineItemId: "1",
            quantity: 1,
          },
        ],
        shippingCarrierCode: "USPS",
        trackingNumber: "9400123456789012345678",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await fulfillmentApi.createShippingFulfillment(
        "12345-67890",
        fulfillmentDetails
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order/12345-67890/shipping_fulfillment",
        fulfillmentDetails
      );
    });

    it("should create fulfillment with multiple line items", async () => {
      const fulfillmentDetails: ShippingFulfillmentDetails = {
        lineItems: [
          { lineItemId: "1", quantity: 1 },
          { lineItemId: "2", quantity: 2 },
        ],
        shippingCarrierCode: "FEDEX",
        trackingNumber: "123456789012",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await fulfillmentApi.createShippingFulfillment(
        "12345-67890",
        fulfillmentDetails
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order/12345-67890/shipping_fulfillment",
        fulfillmentDetails
      );
    });

    it("should create fulfillment with shipped date", async () => {
      const fulfillmentDetails: ShippingFulfillmentDetails = {
        lineItems: [{ lineItemId: "1", quantity: 1 }],
        shippingCarrierCode: "UPS",
        trackingNumber: "1Z999AA10123456784",
        shippedDate: "2025-01-15T10:30:00.000Z",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await fulfillmentApi.createShippingFulfillment(
        "12345-67890",
        fulfillmentDetails
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order/12345-67890/shipping_fulfillment",
        fulfillmentDetails
      );
    });
  });

  describe("getShippingFulfillments", () => {
    it("should get all shipping fulfillments for an order", async () => {
      const mockResponse: ShippingFulfillmentPagedCollection = {
        total: 1,
        fulfillments: [
          {
            fulfillmentId: "FUL-001",
            lineItems: [{ lineItemId: "1", quantity: 1 }],
            shipmentTrackingNumber: "9400123456789012345678",
            shippingCarrierCode: "USPS",
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await fulfillmentApi.getShippingFulfillments(
        "12345-67890"
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order/12345-67890/shipping_fulfillment"
      );
      expect(result).toEqual(mockResponse);
      expect(result.fulfillments).toHaveLength(1);
    });

    it("should handle empty fulfillments list", async () => {
      const mockResponse: ShippingFulfillmentPagedCollection = {
        total: 0,
        fulfillments: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await fulfillmentApi.getShippingFulfillments(
        "12345-67890"
      );

      expect(result.total).toBe(0);
      expect(result.fulfillments).toHaveLength(0);
    });
  });

  describe("getShippingFulfillment", () => {
    it("should get a specific shipping fulfillment", async () => {
      const mockFulfillment: ShippingFulfillment = {
        fulfillmentId: "FUL-001",
        lineItems: [
          {
            lineItemId: "1",
            quantity: 1,
          },
        ],
        shipmentTrackingNumber: "9400123456789012345678",
        shippingCarrierCode: "USPS",
        shippedDate: "2025-01-15T10:30:00.000Z",
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockFulfillment);

      const result = await fulfillmentApi.getShippingFulfillment(
        "12345-67890",
        "FUL-001"
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order/12345-67890/shipping_fulfillment/FUL-001"
      );
      expect(result).toEqual(mockFulfillment);
      expect(result.fulfillmentId).toBe("FUL-001");
    });

    it("should get fulfillment with complete tracking information", async () => {
      const mockFulfillment: ShippingFulfillment = {
        fulfillmentId: "FUL-002",
        lineItems: [{ lineItemId: "1", quantity: 1 }],
        shipmentTrackingNumber: "1Z999AA10123456784",
        shippingCarrierCode: "UPS",
        shippedDate: "2025-01-15T10:30:00.000Z",
        fulfillmentStartInstructions: [
          {
            ebaySupportedFulfillment: true,
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockFulfillment);

      const result = await fulfillmentApi.getShippingFulfillment(
        "12345-67890",
        "FUL-002"
      );

      expect(result.shippingCarrierCode).toBe("UPS");
      expect(result.shipmentTrackingNumber).toBe("1Z999AA10123456784");
    });
  });

  describe("issueRefund", () => {
    it("should issue a full refund", async () => {
      const refundRequest: IssueRefundRequest = {
        reasonForRefund: "BUYER_CANCEL",
        orderLevelRefundAmount: {
          value: "99.99",
          currency: "USD",
        },
      };

      const mockRefund: Refund = {
        refundId: "REF-001",
        refundStatus: "PENDING",
        refundAmount: {
          value: "99.99",
          currency: "USD",
        },
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockRefund);

      const result = await fulfillmentApi.issueRefund(
        "12345-67890",
        refundRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order/12345-67890/issue_refund",
        refundRequest
      );
      expect(result).toEqual(mockRefund);
      expect(result.refundId).toBe("REF-001");
    });

    it("should issue a partial refund with line items", async () => {
      const refundRequest: IssueRefundRequest = {
        reasonForRefund: "ITEM_DAMAGED",
        refundItems: [
          {
            lineItemId: "1",
            refundAmount: {
              value: "25.00",
              currency: "USD",
            },
          },
        ],
      };

      const mockRefund: Refund = {
        refundId: "REF-002",
        refundStatus: "PENDING",
        refundAmount: {
          value: "25.00",
          currency: "USD",
        },
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockRefund);

      const result = await fulfillmentApi.issueRefund(
        "12345-67890",
        refundRequest
      );

      expect(result.refundAmount?.value).toBe("25.00");
    });

    it("should issue refund with comment", async () => {
      const refundRequest: IssueRefundRequest = {
        reasonForRefund: "OUT_OF_STOCK",
        orderLevelRefundAmount: {
          value: "50.00",
          currency: "USD",
        },
        comment: "Item is temporarily out of stock",
      };

      const mockRefund: Refund = {
        refundId: "REF-003",
        refundStatus: "PENDING",
        refundAmount: {
          value: "50.00",
          currency: "USD",
        },
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockRefund);

      await fulfillmentApi.issueRefund("12345-67890", refundRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order/12345-67890/issue_refund",
        expect.objectContaining({
          comment: "Item is temporarily out of stock",
        })
      );
    });

    it("should issue refund for multiple line items", async () => {
      const refundRequest: IssueRefundRequest = {
        reasonForRefund: "ITEM_DEFECTIVE",
        refundItems: [
          {
            lineItemId: "1",
            refundAmount: { value: "15.00", currency: "USD" },
          },
          {
            lineItemId: "2",
            refundAmount: { value: "10.00", currency: "USD" },
          },
        ],
      };

      const mockRefund: Refund = {
        refundId: "REF-004",
        refundStatus: "PENDING",
        refundAmount: {
          value: "25.00",
          currency: "USD",
        },
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockRefund);

      const result = await fulfillmentApi.issueRefund(
        "12345-67890",
        refundRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/fulfillment/v1/order/12345-67890/issue_refund",
        expect.objectContaining({
          refundItems: expect.arrayContaining([
            expect.objectContaining({ lineItemId: "1" }),
            expect.objectContaining({ lineItemId: "2" }),
          ]),
        })
      );
    });
  });
});
