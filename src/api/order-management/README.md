# Order Management API

This directory contains the implementation of eBay's Sell Fulfillment API v1, which manages orders, shipping fulfillment, refunds, and payment disputes.

## Implementation Status

✅ **COMPLETE** - All 14 OpenAPI endpoints implemented across 2 API classes (15 total methods)

## Files

- **`fulfillment.ts`** - FulfillmentApi class for order and shipping management (6 methods)
- **`dispute.ts`** - DisputeApi class for payment dispute management (9 methods)
- **`TODO.md`** - Legacy todo file (can be removed)

## API Coverage

### Order Management (FulfillmentApi)

#### Orders
- ✅ `getOrders(params)` - Get all orders with filters (status, date range, etc.)
- ✅ `getOrder(orderId)` - Get specific order details
- ✅ `issueRefund(orderId, refund)` - Issue full or partial refund for order

#### Shipping Fulfillment
- ✅ `createShippingFulfillment(orderId, fulfillment)` - Create shipping fulfillment record
- ✅ `getShippingFulfillments(orderId)` - Get all shipping fulfillments for order
- ✅ `getShippingFulfillment(orderId, fulfillmentId)` - Get specific shipping fulfillment

### Payment Dispute Management (DisputeApi)

#### Dispute Information
- ✅ `getPaymentDispute(disputeId)` - Get payment dispute details
- ✅ `getPaymentDisputeSummaries(params)` - Get all payment disputes with filters
- ✅ `getActivities(disputeId)` - Get activity history for dispute

#### Dispute Actions
- ✅ `contestPaymentDispute(disputeId, data)` - Contest a payment dispute
- ✅ `acceptPaymentDispute(disputeId, data)` - Accept payment dispute and issue refund

#### Evidence Management
- ✅ `fetchEvidenceContent(disputeId, evidenceId)` - Download evidence file
- ✅ `uploadEvidenceFile(disputeId, file)` - Upload evidence file (document, tracking, etc.)
- ✅ `addEvidence(disputeId, evidence)` - Add evidence to dispute case
- ✅ `updateEvidence(disputeId, evidence)` - Update existing evidence

## OpenAPI Specification

Source: `docs/sell-apps/order-management/sell_fulfillment_v1_oas3.json`

## OAuth Scopes Required

### Fulfillment
- `https://api.ebay.com/oauth/api_scope/sell.fulfillment` - Manage orders and fulfillment
- `https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly` - Read-only access to orders

### Disputes
- `https://api.ebay.com/oauth/api_scope/sell.payment.dispute` - Manage payment disputes

## Key Concepts

### Order Lifecycle
1. **Order Placed** - Buyer completes purchase
2. **Payment Confirmed** - Payment processed
3. **Fulfillment Created** - Seller creates shipping fulfillment
4. **Shipped** - Package sent to carrier
5. **Delivered** - Buyer receives item

### Shipping Fulfillment
Record of shipment details including:
- Tracking number
- Carrier
- Shipped items (quantity)
- Ship date

### Payment Disputes
Buyer-initiated disputes for:
- **Item Not Received (INR)**
- **Significantly Not As Described (SNAD)**
- **Unauthorized Transactions**

### Dispute Resolution Process
1. **Open** - Dispute filed by buyer
2. **Seller Response** - Contest or accept within timeframe
3. **Evidence Submission** - Upload proof (tracking, photos, etc.)
4. **eBay Decision** - Case closed in favor of buyer or seller

## Usage Examples

### Order Fulfillment

```typescript
import { EbaySellerApi } from '@/api/index.js';

const api = new EbaySellerApi(config);
await api.initialize();

// Get all orders awaiting shipment
const orders = await api.fulfillment.getOrders({
  filter: 'orderfulfillmentstatus:{NOT_STARTED|IN_PROGRESS}',
  limit: 50
});

// Create shipping fulfillment
await api.fulfillment.createShippingFulfillment('order-id', {
  lineItems: [{
    lineItemId: 'line-item-id',
    quantity: 1
  }],
  shippingCarrierCode: 'USPS',
  trackingNumber: '1234567890'
});

// Issue refund
await api.fulfillment.issueRefund('order-id', {
  reasonForRefund: 'BUYER_CANCEL',
  refundItems: [{
    lineItemId: 'line-item-id',
    refundAmount: {
      value: '29.99',
      currency: 'USD'
    }
  }]
});
```

### Payment Disputes

```typescript
// Get all open disputes
const disputes = await api.dispute.getPaymentDisputeSummaries({
  payment_dispute_status: 'OPEN'
});

// Contest a dispute
await api.dispute.contestPaymentDispute('dispute-id', {
  returnAddress: {
    addressLine1: '123 Main St',
    city: 'San Jose',
    stateOrProvince: 'CA',
    postalCode: '95101',
    countryCode: 'US'
  }
});

// Upload evidence (tracking info)
await api.dispute.uploadEvidenceFile('dispute-id', {
  evidenceType: 'TRACKING_NUMBER',
  files: [{
    fileId: 'file-id',
    fileName: 'tracking.pdf'
  }]
});

// Add text evidence
await api.dispute.addEvidence('dispute-id', {
  evidenceType: 'PROOF_OF_DELIVERY',
  lineItems: [{
    itemId: 'item-id',
    evidenceId: 'evidence-id'
  }]
});
```

## Order Filters

The `getOrders()` method supports powerful filtering:

```typescript
// Orders from last 7 days
filter: 'creationdaterange:[2024-01-01T00:00:00.000Z..2024-01-07T23:59:59.999Z]'

// Orders awaiting shipment
filter: 'orderfulfillmentstatus:{NOT_STARTED|IN_PROGRESS}'

// Orders by buyer
filter: 'buyerusername:buyer123'

// Combine filters
filter: 'orderfulfillmentstatus:NOT_STARTED,creationdaterange:[2024-01-01T00:00:00.000Z..NOW]'
```

## Dispute Evidence Types

Supported evidence types for disputes:
- `TRACKING_NUMBER` - Shipping tracking information
- `PROOF_OF_DELIVERY` - Delivery confirmation
- `PROOF_OF_AUTHENTICATION` - Item authentication certificate
- `WRITTEN_COMMUNICATION` - Messages with buyer
- `PROOF_OF_REFUND` - Refund documentation
- `IMAGE` - Photos of item/packaging
- `OTHER` - Additional supporting evidence

## Related Tools

All methods are exposed as MCP tools with the prefix `ebay_`:

### Fulfillment Tools
- `ebay_get_orders`
- `ebay_get_order`
- `ebay_create_shipping_fulfillment`
- `ebay_get_shipping_fulfillments`
- `ebay_get_shipping_fulfillment`
- `ebay_issue_refund`

### Dispute Tools
- `ebay_get_payment_dispute`
- `ebay_get_payment_dispute_summaries`
- `ebay_get_payment_dispute_activities`
- `ebay_contest_payment_dispute`
- `ebay_accept_payment_dispute`
- `ebay_fetch_dispute_evidence_content`
- `ebay_upload_dispute_evidence_file`
- `ebay_add_dispute_evidence`
- `ebay_update_dispute_evidence`

See `src/tools/definitions/fulfillment.ts` for complete tool definitions.

## Best Practices

### Order Management
- Always create shipping fulfillment records with tracking
- Mark items as shipped within handling time
- Issue refunds promptly when appropriate

### Dispute Management
- Respond to disputes within eBay's timeframe (typically 3 business days)
- Provide tracking numbers for INR claims
- Upload clear photos/documentation for SNAD claims
- Keep communication professional and fact-based
- Accept disputes when appropriate to maintain seller metrics
