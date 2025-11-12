# Example Workflows & Use Cases

This document provides practical examples and workflows for common eBay seller operations using the MCP server.

## Table of Contents

- [Getting Started](#getting-started)
- [Inventory Management](#inventory-management)
- [Order Fulfillment](#order-fulfillment)
- [Marketing & Promotions](#marketing--promotions)
- [Analytics & Reports](#analytics--reports)
- [Advanced Workflows](#advanced-workflows)
- [Integration Examples](#integration-examples)

---

## Getting Started

### 1. Initial Setup and Authentication

```typescript
// Check current token status
await use_mcp_tool("ebay_get_token_status", {});
// Response: { hasUserToken: false, hasAppToken: true, ... }

// Generate OAuth URL for user authorization
const { authUrl } = await use_mcp_tool("ebay_get_oauth_url", {
  scope: "https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.fulfillment"
});
// authUrl: "https://auth.sandbox.ebay.com/oauth2/authorize?..."

// After user authorizes and you receive the code:
// Set user tokens (external exchange required first)
await use_mcp_tool("ebay_set_user_tokens_with_expiry", {
  accessToken: "v^1.1#...",
  refreshToken: "v^1.1#...",
  accessTokenExpiry: Date.now() + 7200000,  // 2 hours
  refreshTokenExpiry: Date.now() + 47304000000,  // ~18 months
  scope: "https://api.ebay.com/oauth/api_scope/sell.inventory ..."
});
```

### 2. Verify User Identity

```typescript
// Get authenticated user information
const user = await use_mcp_tool("ebay_get_user", {});
// Response: { username: "testuser_seller1", registrationDate: "2020-01-01", ... }
```

---

## Inventory Management

### Complete Listing Creation Workflow

This example shows how to create a complete eBay listing from scratch.

#### Step 1: Create Inventory Location (One-time setup)

```typescript
// Create a shipping location
await use_mcp_tool("ebay_create_inventory_location", {
  merchantLocationKey: "warehouse-001",
  name: "Main Warehouse",
  location: {
    address: {
      addressLine1: "123 Shipping St",
      city: "San Jose",
      stateOrProvince: "CA",
      postalCode: "95131",
      country: "US"
    }
  },
  locationTypes: ["WAREHOUSE"],
  locationWebUrl: "https://mystore.com/locations/warehouse-001"
});
```

#### Step 2: Create Fulfillment Policy (One-time setup)

```typescript
await use_mcp_tool("ebay_create_fulfillment_policy", {
  name: "Standard Shipping",
  marketplaceId: "EBAY_US",
  categoryTypes: [{ name: "ALL_EXCLUDING_MOTORS_VEHICLES" }],
  handlingTime: { value: 1, unit: "DAY" },
  shippingOptions: [
    {
      optionType: "DOMESTIC",
      costType: "FLAT_RATE",
      shippingServices: [
        {
          shippingCarrierCode: "USPS",
          shippingServiceCode: "USPSPriority",
          shippingCost: { value: "8.99", currency: "USD" },
          sortOrder: 1
        }
      ]
    }
  ],
  shipToLocations: {
    regionIncluded: [{ regionName: "Worldwide" }]
  }
});
// Response: { fulfillmentPolicyId: "12345678910", ... }
```

#### Step 3: Create Payment Policy (One-time setup)

```typescript
await use_mcp_tool("ebay_create_payment_policy", {
  name: "Immediate Payment",
  marketplaceId: "EBAY_US",
  categoryTypes: [{ name: "ALL_EXCLUDING_MOTORS_VEHICLES" }],
  paymentMethods: [
    {
      paymentMethodType: "PAYPAL",
      recipientAccountReference: {
        referenceId: "seller@example.com",
        referenceType: "PAYPAL_EMAIL"
      }
    }
  ],
  immediatePay: true
});
// Response: { paymentPolicyId: "98765432110", ... }
```

#### Step 4: Create Return Policy (One-time setup)

```typescript
await use_mcp_tool("ebay_create_return_policy", {
  name: "30 Day Returns",
  marketplaceId: "EBAY_US",
  categoryTypes: [{ name: "ALL_EXCLUDING_MOTORS_VEHICLES" }],
  returnsAccepted: true,
  returnPeriod: { value: 30, unit: "DAY" },
  returnMethod: "REPLACEMENT",
  returnShippingCostPayer: "BUYER",
  refundMethod: "MONEY_BACK"
});
// Response: { returnPolicyId: "45678901230", ... }
```

#### Step 5: Create Inventory Item

```typescript
await use_mcp_tool("ebay_create_inventory_item", {
  sku: "WIDGET-001",
  product: {
    title: "Premium Widget - Red",
    description: "High-quality widget for all your needs. Brand new, never used.",
    brand: "WidgetCo",
    mpn: "WDG-RED-001",
    aspects: {
      "Color": ["Red"],
      "Material": ["Plastic"],
      "Size": ["Medium"]
    },
    imageUrls: [
      "https://example.com/images/widget-red-1.jpg",
      "https://example.com/images/widget-red-2.jpg"
    ]
  },
  condition: "NEW",
  availability: {
    shipToLocationAvailability: {
      quantity: 50,
      merchantLocationKey: "warehouse-001"
    }
  }
});
```

#### Step 6: Create Offer

```typescript
await use_mcp_tool("ebay_create_offer", {
  sku: "WIDGET-001",
  marketplaceId: "EBAY_US",
  format: "FIXED_PRICE",
  listingDescription: "Premium Widget in vibrant red color. Perfect for home or office use.",
  pricingSummary: {
    price: {
      value: "29.99",
      currency: "USD"
    }
  },
  quantityLimitPerBuyer: 5,
  listingPolicies: {
    fulfillmentPolicyId: "12345678910",
    paymentPolicyId: "98765432110",
    returnPolicyId: "45678901230"
  },
  categoryId: "12345",  // Electronics > Widgets (example)
  merchantLocationKey: "warehouse-001"
});
// Response: { offerId: "11111111111", status: "UNPUBLISHED", ... }
```

#### Step 7: Publish Offer

```typescript
await use_mcp_tool("ebay_publish_offer", {
  offerId: "11111111111"
});
// Response: { listingId: "110123456789", status: "PUBLISHED", ... }
```

### Bulk Listing Creation

```typescript
// Create multiple inventory items at once (up to 25)
const bulkResponse = await use_mcp_tool("ebay_bulk_create_or_replace_inventory_item", {
  requests: [
    {
      sku: "WIDGET-002",
      product: { title: "Widget - Blue", /* ... */ },
      condition: "NEW",
      availability: { /* ... */ }
    },
    {
      sku: "WIDGET-003",
      product: { title: "Widget - Green", /* ... */ },
      condition: "NEW",
      availability: { /* ... */ }
    }
    // ... up to 25 items
  ]
});

// Check results
bulkResponse.responses.forEach((item, index) => {
  if (item.statusCode === 200 || item.statusCode === 201) {
    console.log(`✓ ${item.sku} created successfully`);
  } else {
    console.error(`✗ ${item.sku} failed:`, item.errors);
  }
});
```

### Update Inventory Quantity

```typescript
// Update stock quantity for a single SKU
await use_mcp_tool("ebay_update_inventory_item", {
  sku: "WIDGET-001",
  availability: {
    shipToLocationAvailability: {
      quantity: 25  // Updated from 50 to 25
    }
  }
});
```

### Manage Product Compatibility (eBay Motors)

```typescript
// Add compatible vehicle makes/models
await use_mcp_tool("ebay_create_or_replace_product_compatibility", {
  sku: "BRAKE-PAD-001",
  compatibility: {
    compatibleProducts: [
      {
        productFamilyProperties: {
          make: "Toyota",
          model: "Camry",
          year: "2018"
        },
        notes: "Fits front axle only"
      },
      {
        productFamilyProperties: {
          make: "Honda",
          model: "Accord",
          year: "2019"
        }
      }
    ]
  }
});
```

---

## Order Fulfillment

### Complete Order Fulfillment Workflow

#### Step 1: Get Orders Awaiting Shipment

```typescript
// Get all orders that need to be fulfilled
const orders = await use_mcp_tool("ebay_get_orders", {
  filter: "orderfulfillmentstatus:{NOT_STARTED|IN_PROGRESS}",
  limit: 50
});

// Process each order
for (const order of orders.orders) {
  console.log(`Order ${order.orderId}: ${order.lineItems.length} items`);
}
```

#### Step 2: Get Shipping Fulfillment for Order

```typescript
const order = await use_mcp_tool("ebay_get_order", {
  orderId: "12-34567-89012"
});

// Check line items
order.lineItems.forEach(item => {
  console.log(`- ${item.title}: Qty ${item.quantity}, SKU: ${item.sku}`);
});
```

#### Step 3: Create Shipping Fulfillment

```typescript
await use_mcp_tool("ebay_create_shipping_fulfillment", {
  orderId: "12-34567-89012",
  lineItems: [
    {
      lineItemId: "10123456789",  // From order.lineItems[0].lineItemId
      quantity: 1
    }
  ],
  shippedDate: new Date().toISOString(),
  shippingCarrierCode: "USPS",
  trackingNumber: "9400111899223344556677"
});
// Response: { fulfillmentId: "98765432109876543210", ... }
```

#### Step 4: Mark Order as Shipped (Alternative Method)

```typescript
// For orders without tracking
await use_mcp_tool("ebay_mark_order_as_shipped", {
  orderId: "12-34567-89012",
  shippedDate: new Date().toISOString()
});
```

### Handle Order Cancellation

```typescript
// Cancel buyer request (if buyer requests cancellation)
await use_mcp_tool("ebay_approve_cancellation_request", {
  cancellationId: "5012345678901",
  shipmentTracking: null,  // No shipment tracking since not shipped
  comments: "Approved per buyer request"
});
```

### Issue Refund

```typescript
// Issue full refund
await use_mcp_tool("ebay_issue_order_refund", {
  orderId: "12-34567-89012",
  reasonForRefund: "BUYER_CANCELLED",
  refundItems: [
    {
      lineItemId: "10123456789",
      refundAmount: {
        value: "29.99",
        currency: "USD"
      }
    }
  ]
});
```

---

## Marketing & Promotions

### Create Item Promotion

```typescript
// Create a 20% off promotion
await use_mcp_tool("ebay_create_item_promotion", {
  name: "Summer Sale 2025",
  marketplaceId: "EBAY_US",
  status: "SCHEDULED",
  startDate: "2025-06-01T00:00:00.000Z",
  endDate: "2025-08-31T23:59:59.999Z",
  discountRules: [
    {
      discountBenefit: {
        percentageOffItem: "20"
      },
      ruleOrder: 1,
      discountSpecification: {
        minAmount: {
          value: "50.00",
          currency: "USD"
        }
      }
    }
  ],
  inventoryCriterion: {
    inventoryCriterionType: "INVENTORY_BY_RULE",
    ruleCriteria: [
      {
        selectionRules: [
          {
            brands: ["WidgetCo"],
            categoryIds: ["12345"],
            listingConditionIds: ["NEW"]
          }
        ]
      }
    ]
  }
});
```

### Create Ad Campaign (Promoted Listings)

```typescript
// Create campaign for promoted listings
await use_mcp_tool("ebay_create_campaign", {
  campaignName: "Widget Promotion Campaign",
  marketplaceId: "EBAY_US",
  fundingStrategy: {
    fundingModel: "COST_PER_SALE",
    bidPercentage: "5.0"  // 5% ad fee rate
  },
  startDate: "2025-01-01T00:00:00.000Z",
  endDate: "2025-12-31T23:59:59.999Z",
  campaignCriterion: {
    criterionType: "INVENTORY_PARTITION",
    selectionRules: [
      {
        brands: ["WidgetCo"],
        categoryIds: ["12345"]
      }
    ]
  }
});
// Response: { campaignId: "500123456789", ... }
```

### Pause/Resume Campaign

```typescript
// Pause campaign temporarily
await use_mcp_tool("ebay_pause_campaign", {
  campaignId: "500123456789"
});

// Resume campaign later
await use_mcp_tool("ebay_resume_campaign", {
  campaignId: "500123456789"
});
```

---

## Analytics & Reports

### Get Traffic Report

```typescript
// Get daily traffic for last 30 days
const trafficReport = await use_mcp_tool("ebay_get_traffic_report", {
  filter: "lastAccessDate:[2025-01-01T00:00:00.000Z..2025-01-30T23:59:59.999Z]",
  dimension: "DAY",
  metric: "LISTING_IMPRESSION_SEARCH_RESULTS_PAGE"
});

// Analyze traffic data
trafficReport.records.forEach(record => {
  console.log(`${record.dimensionValues[0].value}: ${record.metricValues[0].value} impressions`);
});
```

### Get Seller Standards Profile

```typescript
// Check current seller performance
const standards = await use_mcp_tool("ebay_get_seller_standards_profile", {
  program: "PROGRAM_DE",  // Or PROGRAM_US, PROGRAM_UK, etc.
  cycle: "CURRENT"
});

console.log(`Status: ${standards.standardsProfile[0].evaluationCycle.evaluationStatus}`);
console.log(`eBay Top Rated: ${standards.standardsProfile[0].metrics.find(m => m.name === 'TOP_RATED_SELLER').level}`);
```

### Get Customer Service Metrics

```typescript
const metrics = await use_mcp_tool("ebay_get_customer_service_metric", {
  evaluationType: "CURRENT",
  marketplaceId: "EBAY_US"
});

// Check key metrics
console.log(`Cases closed w/o escalation: ${metrics.dimensionMetrics[0].metrics.casesClosedWithoutEscalationCount}`);
console.log(`Avg response time: ${metrics.dimensionMetrics[0].metrics.averageResponseTimeInMinutes} min`);
```

---

## Advanced Workflows

### Complete Multi-SKU Order Processing

This workflow handles orders with multiple items, partial shipments, and tracking updates.

```typescript
async function processMultiItemOrder(orderId: string) {
  // 1. Get order details
  const order = await use_mcp_tool("ebay_get_order", { orderId });

  // 2. Group line items by warehouse location
  const itemsByLocation = new Map();
  for (const item of order.lineItems) {
    const sku = item.sku;
    const inventory = await use_mcp_tool("ebay_get_inventory_item", { sku });
    const location = inventory.availability.shipToLocationAvailability.merchantLocationKey;

    if (!itemsByLocation.has(location)) {
      itemsByLocation.set(location, []);
    }
    itemsByLocation.get(location).push(item);
  }

  // 3. Create separate fulfillments for each location
  const fulfillments = [];
  for (const [location, items] of itemsByLocation.entries()) {
    const fulfillment = await use_mcp_tool("ebay_create_shipping_fulfillment", {
      orderId,
      lineItems: items.map(item => ({
        lineItemId: item.lineItemId,
        quantity: item.quantity
      })),
      shippedDate: new Date().toISOString(),
      shippingCarrierCode: "USPS",
      trackingNumber: generateTrackingNumber(location)  // Custom function
    });
    fulfillments.push(fulfillment);
  }

  return fulfillments;
}
```

### Automated Inventory Replenishment

```typescript
async function autoReplenishInventory(threshold: number = 10) {
  // 1. Get all inventory items
  const inventory = await use_mcp_tool("ebay_get_inventory_items", {
    limit: 200
  });

  // 2. Find items below threshold
  const lowStock = inventory.inventoryItems.filter(item => {
    const qty = item.availability?.shipToLocationAvailability?.quantity || 0;
    return qty < threshold;
  });

  // 3. Update quantities (integrate with your inventory system)
  for (const item of lowStock) {
    const newQuantity = await checkSupplierInventory(item.sku);  // Custom function

    if (newQuantity > 0) {
      await use_mcp_tool("ebay_update_inventory_item", {
        sku: item.sku,
        availability: {
          shipToLocationAvailability: {
            quantity: newQuantity
          }
        }
      });
      console.log(`✓ Replenished ${item.sku}: ${newQuantity} units`);
    }
  }
}
```

### Bulk Price Update

```typescript
async function updatePricesWithDiscount(category: string, discountPercent: number) {
  // 1. Get all offers in category
  const offers = await use_mcp_tool("ebay_get_offers", {
    limit: 200,
    sku: "*"  // All SKUs
  });

  // 2. Filter by category and update prices
  const updates = [];
  for (const offer of offers.offers) {
    if (offer.categoryId === category) {
      const currentPrice = parseFloat(offer.pricingSummary.price.value);
      const newPrice = (currentPrice * (1 - discountPercent / 100)).toFixed(2);

      const updated = await use_mcp_tool("ebay_update_offer", {
        offerId: offer.offerId,
        pricingSummary: {
          price: {
            value: newPrice,
            currency: "USD"
          }
        }
      });
      updates.push(updated);
    }
  }

  return updates;
}
```

---

## Integration Examples

### Webhook Integration (Order Notifications)

```typescript
// Express.js webhook endpoint
app.post('/webhooks/ebay/orders', async (req, res) => {
  const notification = req.body;

  if (notification.eventType === 'ORDER_CREATED') {
    const orderId = notification.order.orderId;

    // Fetch full order details
    const order = await use_mcp_tool("ebay_get_order", { orderId });

    // Process order in your system
    await processNewOrder(order);

    res.status(200).send('OK');
  }
});
```

### Sync with External Inventory System

```typescript
// Sync eBay inventory with external database
async function syncInventoryWithDatabase() {
  // 1. Get all eBay inventory
  const ebayInventory = await use_mcp_tool("ebay_get_inventory_items", {
    limit: 200
  });

  // 2. Get inventory from your database
  const dbInventory = await db.query('SELECT sku, quantity FROM inventory');

  // 3. Compare and update differences
  for (const dbItem of dbInventory) {
    const ebayItem = ebayInventory.inventoryItems.find(i => i.sku === dbItem.sku);

    if (ebayItem) {
      const ebayQty = ebayItem.availability?.shipToLocationAvailability?.quantity || 0;

      if (ebayQty !== dbItem.quantity) {
        // Update eBay to match database
        await use_mcp_tool("ebay_update_inventory_item", {
          sku: dbItem.sku,
          availability: {
            shipToLocationAvailability: {
              quantity: dbItem.quantity
            }
          }
        });
        console.log(`✓ Synced ${dbItem.sku}: ${dbItem.quantity}`);
      }
    }
  }
}
```

### Automated Repricing Based on Competitors

```typescript
async function repriceToBeatCompetitors(competitorPrices: Map<string, number>) {
  for (const [sku, competitorPrice] of competitorPrices.entries()) {
    // Get current offer
    const offers = await use_mcp_tool("ebay_get_offers", { sku });
    const offer = offers.offers[0];

    if (offer) {
      const currentPrice = parseFloat(offer.pricingSummary.price.value);

      // Price 5% below competitor, but maintain minimum margin
      const minPrice = calculateMinPrice(sku);  // Custom function
      const newPrice = Math.max(minPrice, competitorPrice * 0.95);

      if (newPrice !== currentPrice) {
        await use_mcp_tool("ebay_update_offer", {
          offerId: offer.offerId,
          pricingSummary: {
            price: {
              value: newPrice.toFixed(2),
              currency: "USD"
            }
          }
        });
        console.log(`✓ Repriced ${sku}: $${currentPrice} → $${newPrice}`);
      }
    }
  }
}
```

---

## Best Practices

### Error Handling

Always wrap MCP tool calls in try-catch blocks:

```typescript
try {
  const result = await use_mcp_tool("ebay_create_inventory_item", { /* ... */ });
  console.log('✓ Success:', result);
} catch (error) {
  if (error.message.includes('Rate limit exceeded')) {
    // Wait and retry
    await delay(60000);  // 1 minute
    return retry();
  } else if (error.message.includes('Invalid access token')) {
    // Token expired, will auto-refresh
    console.log('Token refreshed, retrying...');
  } else {
    console.error('✗ Error:', error.message);
    throw error;
  }
}
```

### Batching Operations

Use bulk APIs when available:

```typescript
// ✅ Good: Bulk create (25 items in 1 request)
await use_mcp_tool("ebay_bulk_create_or_replace_inventory_item", {
  requests: [ /* 25 items */ ]
});

// ❌ Bad: Individual creates (25 requests)
for (const item of items) {
  await use_mcp_tool("ebay_create_inventory_item", item);
}
```

### Pagination

Handle large result sets with pagination:

```typescript
let offset = 0;
const limit = 100;
let hasMore = true;

while (hasMore) {
  const result = await use_mcp_tool("ebay_get_inventory_items", {
    limit,
    offset
  });

  processItems(result.inventoryItems);

  hasMore = result.inventoryItems.length === limit;
  offset += limit;
}
```

---

## Related Documentation

- [README.md](README.md) - Main documentation
- [OAUTH-SETUP.md](OAUTH-SETUP.md) - Authentication setup
- [PERFORMANCE.md](PERFORMANCE.md) - Performance optimization
- [API Tool Reference](README.md#-available-tools) - Complete tool list

---

**Last Updated**: 2025-11-12
**Version**: 1.1.7
