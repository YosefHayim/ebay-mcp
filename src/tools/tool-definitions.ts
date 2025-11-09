export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
};

export const chatGptTools: ToolDefinition[] = [
  {
    name: 'search',
    description: 'Search for eBay inventory items',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results'
        }
      }
    }
  },
  {
    name: 'fetch',
    description: 'Fetch a specific eBay inventory item by SKU',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Item SKU'
        }
      },
      required: ['id']
    }
  }
];

export const accountTools: ToolDefinition[] = [
  {
    name: 'ebay_get_custom_policies',
    description: 'Retrieve custom policies defined for the seller account',
    inputSchema: {
      type: 'object',
      properties: {
        policyTypes: {
          type: 'string',
          description: 'Comma-delimited list of policy types to retrieve'
        }
      }
    }
  },
  {
    name: 'ebay_get_fulfillment_policies',
    description: 'Get fulfillment policies for the seller',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'eBay marketplace ID (e.g., EBAY_US)'
        }
      }
    }
  },
  {
    name: 'ebay_get_payment_policies',
    description: 'Get payment policies for the seller',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'eBay marketplace ID (e.g., EBAY_US)'
        }
      }
    }
  },
  {
    name: 'ebay_get_return_policies',
    description: 'Get return policies for the seller',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'eBay marketplace ID (e.g., EBAY_US)'
        }
      }
    }
  },
  // Fulfillment Policy CRUD
  {
    name: 'ebay_create_fulfillment_policy',
    description: 'Create a new fulfillment policy',
    inputSchema: {
      type: 'object',
      properties: {
        policy: {
          type: 'object',
          description: 'Fulfillment policy details'
        }
      },
      required: ['policy']
    }
  },
  {
    name: 'ebay_get_fulfillment_policy',
    description: 'Get a specific fulfillment policy by ID',
    inputSchema: {
      type: 'object',
      properties: {
        fulfillmentPolicyId: {
          type: 'string',
          description: 'The fulfillment policy ID'
        }
      },
      required: ['fulfillmentPolicyId']
    }
  },
  {
    name: 'ebay_get_fulfillment_policy_by_name',
    description: 'Get a fulfillment policy by name',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'eBay marketplace ID (e.g., EBAY_US)'
        },
        name: {
          type: 'string',
          description: 'Policy name'
        }
      },
      required: ['marketplaceId', 'name']
    }
  },
  {
    name: 'ebay_update_fulfillment_policy',
    description: 'Update an existing fulfillment policy',
    inputSchema: {
      type: 'object',
      properties: {
        fulfillmentPolicyId: {
          type: 'string',
          description: 'The fulfillment policy ID'
        },
        policy: {
          type: 'object',
          description: 'Updated fulfillment policy details'
        }
      },
      required: ['fulfillmentPolicyId', 'policy']
    }
  },
  {
    name: 'ebay_delete_fulfillment_policy',
    description: 'Delete a fulfillment policy',
    inputSchema: {
      type: 'object',
      properties: {
        fulfillmentPolicyId: {
          type: 'string',
          description: 'The fulfillment policy ID'
        }
      },
      required: ['fulfillmentPolicyId']
    }
  },
  // Payment Policy CRUD
  {
    name: 'ebay_create_payment_policy',
    description: 'Create a new payment policy',
    inputSchema: {
      type: 'object',
      properties: {
        policy: {
          type: 'object',
          description: 'Payment policy details'
        }
      },
      required: ['policy']
    }
  },
  {
    name: 'ebay_get_payment_policy',
    description: 'Get a specific payment policy by ID',
    inputSchema: {
      type: 'object',
      properties: {
        paymentPolicyId: {
          type: 'string',
          description: 'The payment policy ID'
        }
      },
      required: ['paymentPolicyId']
    }
  },
  {
    name: 'ebay_get_payment_policy_by_name',
    description: 'Get a payment policy by name',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'eBay marketplace ID (e.g., EBAY_US)'
        },
        name: {
          type: 'string',
          description: 'Policy name'
        }
      },
      required: ['marketplaceId', 'name']
    }
  },
  {
    name: 'ebay_update_payment_policy',
    description: 'Update an existing payment policy',
    inputSchema: {
      type: 'object',
      properties: {
        paymentPolicyId: {
          type: 'string',
          description: 'The payment policy ID'
        },
        policy: {
          type: 'object',
          description: 'Updated payment policy details'
        }
      },
      required: ['paymentPolicyId', 'policy']
    }
  },
  {
    name: 'ebay_delete_payment_policy',
    description: 'Delete a payment policy',
    inputSchema: {
      type: 'object',
      properties: {
        paymentPolicyId: {
          type: 'string',
          description: 'The payment policy ID'
        }
      },
      required: ['paymentPolicyId']
    }
  },
  // Return Policy CRUD
  {
    name: 'ebay_create_return_policy',
    description: 'Create a new return policy',
    inputSchema: {
      type: 'object',
      properties: {
        policy: {
          type: 'object',
          description: 'Return policy details'
        }
      },
      required: ['policy']
    }
  },
  {
    name: 'ebay_get_return_policy',
    description: 'Get a specific return policy by ID',
    inputSchema: {
      type: 'object',
      properties: {
        returnPolicyId: {
          type: 'string',
          description: 'The return policy ID'
        }
      },
      required: ['returnPolicyId']
    }
  },
  {
    name: 'ebay_get_return_policy_by_name',
    description: 'Get a return policy by name',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'eBay marketplace ID (e.g., EBAY_US)'
        },
        name: {
          type: 'string',
          description: 'Policy name'
        }
      },
      required: ['marketplaceId', 'name']
    }
  },
  {
    name: 'ebay_update_return_policy',
    description: 'Update an existing return policy',
    inputSchema: {
      type: 'object',
      properties: {
        returnPolicyId: {
          type: 'string',
          description: 'The return policy ID'
        },
        policy: {
          type: 'object',
          description: 'Updated return policy details'
        }
      },
      required: ['returnPolicyId', 'policy']
    }
  },
  {
    name: 'ebay_delete_return_policy',
    description: 'Delete a return policy',
    inputSchema: {
      type: 'object',
      properties: {
        returnPolicyId: {
          type: 'string',
          description: 'The return policy ID'
        }
      },
      required: ['returnPolicyId']
    }
  },
  // Custom Policy CRUD
  {
    name: 'ebay_create_custom_policy',
    description: 'Create a new custom policy',
    inputSchema: {
      type: 'object',
      properties: {
        policy: {
          type: 'object',
          description: 'Custom policy details'
        }
      },
      required: ['policy']
    }
  },
  {
    name: 'ebay_get_custom_policy',
    description: 'Get a specific custom policy by ID',
    inputSchema: {
      type: 'object',
      properties: {
        customPolicyId: {
          type: 'string',
          description: 'The custom policy ID'
        }
      },
      required: ['customPolicyId']
    }
  },
  {
    name: 'ebay_update_custom_policy',
    description: 'Update an existing custom policy',
    inputSchema: {
      type: 'object',
      properties: {
        customPolicyId: {
          type: 'string',
          description: 'The custom policy ID'
        },
        policy: {
          type: 'object',
          description: 'Updated custom policy details'
        }
      },
      required: ['customPolicyId', 'policy']
    }
  },
  {
    name: 'ebay_delete_custom_policy',
    description: 'Delete a custom policy',
    inputSchema: {
      type: 'object',
      properties: {
        customPolicyId: {
          type: 'string',
          description: 'The custom policy ID'
        }
      },
      required: ['customPolicyId']
    }
  },
  // KYC, Payments, Programs, Sales Tax, Subscription
  {
    name: 'ebay_get_kyc',
    description: 'Get seller KYC (Know Your Customer) status',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'ebay_opt_in_to_payments_program',
    description: 'Opt-in to a payments program',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'eBay marketplace ID (e.g., EBAY_US)'
        },
        paymentsProgramType: {
          type: 'string',
          description: 'Payments program type'
        }
      },
      required: ['marketplaceId', 'paymentsProgramType']
    }
  },
  {
    name: 'ebay_get_payments_program_status',
    description: 'Get payments program status',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'eBay marketplace ID (e.g., EBAY_US)'
        },
        paymentsProgramType: {
          type: 'string',
          description: 'Payments program type'
        }
      },
      required: ['marketplaceId', 'paymentsProgramType']
    }
  },
  {
    name: 'ebay_get_rate_tables',
    description: 'Get seller rate tables',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'ebay_create_or_replace_sales_tax',
    description: 'Create or replace sales tax table for a jurisdiction',
    inputSchema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'Two-letter ISO 3166 country code'
        },
        jurisdictionId: {
          type: 'string',
          description: 'Tax jurisdiction ID'
        },
        salesTaxBase: {
          type: 'object',
          description: 'Sales tax details'
        }
      },
      required: ['countryCode', 'jurisdictionId', 'salesTaxBase']
    }
  },
  {
    name: 'ebay_bulk_create_or_replace_sales_tax',
    description: 'Bulk create or replace sales tax tables',
    inputSchema: {
      type: 'object',
      properties: {
        requests: {
          type: 'array',
          description: 'Array of sales tax requests'
        }
      },
      required: ['requests']
    }
  },
  {
    name: 'ebay_delete_sales_tax',
    description: 'Delete sales tax table for a jurisdiction',
    inputSchema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'Two-letter ISO 3166 country code'
        },
        jurisdictionId: {
          type: 'string',
          description: 'Tax jurisdiction ID'
        }
      },
      required: ['countryCode', 'jurisdictionId']
    }
  },
  {
    name: 'ebay_get_sales_tax',
    description: 'Get sales tax table for a jurisdiction',
    inputSchema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'Two-letter ISO 3166 country code'
        },
        jurisdictionId: {
          type: 'string',
          description: 'Tax jurisdiction ID'
        }
      },
      required: ['countryCode', 'jurisdictionId']
    }
  },
  {
    name: 'ebay_get_sales_taxes',
    description: 'Get all sales tax tables',
    inputSchema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'Optional country code to filter by'
        }
      }
    }
  },
  {
    name: 'ebay_get_subscription',
    description: 'Get seller subscription information',
    inputSchema: {
      type: 'object',
      properties: {
        limitType: {
          type: 'string',
          description: 'Optional limit type filter'
        }
      }
    }
  },
  {
    name: 'ebay_opt_in_to_program',
    description: 'Opt-in to a seller program',
    inputSchema: {
      type: 'object',
      properties: {
        request: {
          type: 'object',
          description: 'Program opt-in request'
        }
      },
      required: ['request']
    }
  },
  {
    name: 'ebay_opt_out_of_program',
    description: 'Opt-out of a seller program',
    inputSchema: {
      type: 'object',
      properties: {
        request: {
          type: 'object',
          description: 'Program opt-out request'
        }
      },
      required: ['request']
    }
  },
  {
    name: 'ebay_get_opted_in_programs',
    description: 'Get seller programs the account is opted into',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

export const inventoryTools: ToolDefinition[] = [
  {
    name: 'ebay_get_inventory_items',
    description: 'Retrieve all inventory items for the seller',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of items to return (max 100)'
        },
        offset: {
          type: 'number',
          description: 'Number of items to skip'
        }
      }
    }
  },
  {
    name: 'ebay_get_inventory_item',
    description: 'Get a specific inventory item by SKU',
    inputSchema: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'The seller-defined SKU'
        }
      },
      required: ['sku']
    }
  },
  {
    name: 'ebay_create_inventory_item',
    description: 'Create or replace an inventory item',
    inputSchema: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'The seller-defined SKU'
        },
        inventoryItem: {
          type: 'object',
          description: 'Inventory item details'
        }
      },
      required: ['sku', 'inventoryItem']
    }
  },
  {
    name: 'ebay_get_offers',
    description: 'Get all offers for the seller',
    inputSchema: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'Filter by SKU'
        },
        marketplaceId: {
          type: 'string',
          description: 'Filter by marketplace ID'
        },
        limit: {
          type: 'number',
          description: 'Number of offers to return'
        }
      }
    }
  },
  {
    name: 'ebay_create_offer',
    description: 'Create a new offer for an inventory item',
    inputSchema: {
      type: 'object',
      properties: {
        offer: {
          type: 'object',
          description: 'Offer details including SKU, marketplace, pricing, and policies'
        }
      },
      required: ['offer']
    }
  },
  {
    name: 'ebay_publish_offer',
    description: 'Publish an offer to create a listing',
    inputSchema: {
      type: 'object',
      properties: {
        offerId: {
          type: 'string',
          description: 'The offer ID to publish'
        }
      },
      required: ['offerId']
    }
  },
  // Bulk Operations
  {
    name: 'ebay_bulk_create_or_replace_inventory_item',
    description: 'Bulk create or replace multiple inventory items',
    inputSchema: {
      type: 'object',
      properties: {
        requests: {
          type: 'object',
          description: 'Bulk inventory item requests'
        }
      },
      required: ['requests']
    }
  },
  {
    name: 'ebay_bulk_get_inventory_item',
    description: 'Bulk get multiple inventory items',
    inputSchema: {
      type: 'object',
      properties: {
        requests: {
          type: 'object',
          description: 'Bulk inventory item get requests with SKU list'
        }
      },
      required: ['requests']
    }
  },
  {
    name: 'ebay_bulk_update_price_quantity',
    description: 'Bulk update price and quantity for multiple offers',
    inputSchema: {
      type: 'object',
      properties: {
        requests: {
          type: 'object',
          description: 'Bulk price and quantity update requests'
        }
      },
      required: ['requests']
    }
  },
  // Product Compatibility
  {
    name: 'ebay_get_product_compatibility',
    description: 'Get product compatibility information for an inventory item',
    inputSchema: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'The seller-defined SKU'
        }
      },
      required: ['sku']
    }
  },
  {
    name: 'ebay_create_or_replace_product_compatibility',
    description: 'Create or replace product compatibility for an inventory item',
    inputSchema: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'The seller-defined SKU'
        },
        compatibility: {
          type: 'object',
          description: 'Product compatibility details'
        }
      },
      required: ['sku', 'compatibility']
    }
  },
  {
    name: 'ebay_delete_product_compatibility',
    description: 'Delete product compatibility for an inventory item',
    inputSchema: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'The seller-defined SKU'
        }
      },
      required: ['sku']
    }
  },
  // Inventory Item Groups
  {
    name: 'ebay_get_inventory_item_group',
    description: 'Get an inventory item group (variation group)',
    inputSchema: {
      type: 'object',
      properties: {
        inventoryItemGroupKey: {
          type: 'string',
          description: 'The inventory item group key'
        }
      },
      required: ['inventoryItemGroupKey']
    }
  },
  {
    name: 'ebay_create_or_replace_inventory_item_group',
    description: 'Create or replace an inventory item group',
    inputSchema: {
      type: 'object',
      properties: {
        inventoryItemGroupKey: {
          type: 'string',
          description: 'The inventory item group key'
        },
        inventoryItemGroup: {
          type: 'object',
          description: 'Inventory item group details'
        }
      },
      required: ['inventoryItemGroupKey', 'inventoryItemGroup']
    }
  },
  {
    name: 'ebay_delete_inventory_item_group',
    description: 'Delete an inventory item group',
    inputSchema: {
      type: 'object',
      properties: {
        inventoryItemGroupKey: {
          type: 'string',
          description: 'The inventory item group key'
        }
      },
      required: ['inventoryItemGroupKey']
    }
  },
  // Location Management
  {
    name: 'ebay_get_inventory_locations',
    description: 'Get all inventory locations',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of locations to return'
        },
        offset: {
          type: 'number',
          description: 'Number of locations to skip'
        }
      }
    }
  },
  {
    name: 'ebay_get_inventory_location',
    description: 'Get a specific inventory location',
    inputSchema: {
      type: 'object',
      properties: {
        merchantLocationKey: {
          type: 'string',
          description: 'The merchant location key'
        }
      },
      required: ['merchantLocationKey']
    }
  },
  {
    name: 'ebay_create_or_replace_inventory_location',
    description: 'Create or replace an inventory location',
    inputSchema: {
      type: 'object',
      properties: {
        merchantLocationKey: {
          type: 'string',
          description: 'The merchant location key'
        },
        location: {
          type: 'object',
          description: 'Location details'
        }
      },
      required: ['merchantLocationKey', 'location']
    }
  },
  {
    name: 'ebay_delete_inventory_location',
    description: 'Delete an inventory location',
    inputSchema: {
      type: 'object',
      properties: {
        merchantLocationKey: {
          type: 'string',
          description: 'The merchant location key'
        }
      },
      required: ['merchantLocationKey']
    }
  },
  {
    name: 'ebay_disable_inventory_location',
    description: 'Disable an inventory location',
    inputSchema: {
      type: 'object',
      properties: {
        merchantLocationKey: {
          type: 'string',
          description: 'The merchant location key'
        }
      },
      required: ['merchantLocationKey']
    }
  },
  {
    name: 'ebay_enable_inventory_location',
    description: 'Enable an inventory location',
    inputSchema: {
      type: 'object',
      properties: {
        merchantLocationKey: {
          type: 'string',
          description: 'The merchant location key'
        }
      },
      required: ['merchantLocationKey']
    }
  },
  {
    name: 'ebay_update_location_details',
    description: 'Update location details for an inventory location',
    inputSchema: {
      type: 'object',
      properties: {
        merchantLocationKey: {
          type: 'string',
          description: 'The merchant location key'
        },
        locationDetails: {
          type: 'object',
          description: 'Location detail updates'
        }
      },
      required: ['merchantLocationKey', 'locationDetails']
    }
  },
  // Offer Management
  {
    name: 'ebay_get_offer',
    description: 'Get a specific offer by ID',
    inputSchema: {
      type: 'object',
      properties: {
        offerId: {
          type: 'string',
          description: 'The offer ID'
        }
      },
      required: ['offerId']
    }
  },
  {
    name: 'ebay_update_offer',
    description: 'Update an existing offer',
    inputSchema: {
      type: 'object',
      properties: {
        offerId: {
          type: 'string',
          description: 'The offer ID'
        },
        offer: {
          type: 'object',
          description: 'Updated offer details'
        }
      },
      required: ['offerId', 'offer']
    }
  },
  {
    name: 'ebay_delete_offer',
    description: 'Delete an offer',
    inputSchema: {
      type: 'object',
      properties: {
        offerId: {
          type: 'string',
          description: 'The offer ID to delete'
        }
      },
      required: ['offerId']
    }
  },
  {
    name: 'ebay_withdraw_offer',
    description: 'Withdraw a published offer',
    inputSchema: {
      type: 'object',
      properties: {
        offerId: {
          type: 'string',
          description: 'The offer ID to withdraw'
        }
      },
      required: ['offerId']
    }
  },
  {
    name: 'ebay_bulk_create_offer',
    description: 'Bulk create multiple offers',
    inputSchema: {
      type: 'object',
      properties: {
        requests: {
          type: 'object',
          description: 'Bulk offer creation requests'
        }
      },
      required: ['requests']
    }
  },
  {
    name: 'ebay_bulk_publish_offer',
    description: 'Bulk publish multiple offers',
    inputSchema: {
      type: 'object',
      properties: {
        requests: {
          type: 'object',
          description: 'Bulk offer publish requests'
        }
      },
      required: ['requests']
    }
  },
  {
    name: 'ebay_get_listing_fees',
    description: 'Get listing fees for offers before publishing',
    inputSchema: {
      type: 'object',
      properties: {
        offers: {
          type: 'object',
          description: 'Offers to calculate listing fees for'
        }
      },
      required: ['offers']
    }
  },
  // Listing Migration
  {
    name: 'ebay_bulk_migrate_listing',
    description: 'Bulk migrate listings to the inventory model',
    inputSchema: {
      type: 'object',
      properties: {
        requests: {
          type: 'object',
          description: 'Bulk listing migration requests'
        }
      },
      required: ['requests']
    }
  }
];

export const fulfillmentTools: ToolDefinition[] = [
  {
    name: 'ebay_get_orders',
    description: 'Retrieve orders for the seller',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Filter criteria (e.g., orderfulfillmentstatus:{NOT_STARTED})'
        },
        limit: {
          type: 'number',
          description: 'Number of orders to return'
        },
        offset: {
          type: 'number',
          description: 'Number of orders to skip'
        }
      }
    }
  },
  {
    name: 'ebay_get_order',
    description: 'Get details of a specific order',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: 'The unique order ID'
        }
      },
      required: ['orderId']
    }
  },
  {
    name: 'ebay_create_shipping_fulfillment',
    description: 'Create a shipping fulfillment for an order',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: 'The order ID'
        },
        fulfillment: {
          type: 'object',
          description: 'Shipping fulfillment details including tracking number'
        }
      },
      required: ['orderId', 'fulfillment']
    }
  }
];

export const marketingTools: ToolDefinition[] = [
  {
    name: 'ebay_get_campaigns',
    description: 'Get marketing campaigns for the seller',
    inputSchema: {
      type: 'object',
      properties: {
        campaignStatus: {
          type: 'string',
          description: 'Filter by campaign status (RUNNING, PAUSED, ENDED)'
        },
        marketplaceId: {
          type: 'string',
          description: 'Filter by marketplace ID'
        },
        limit: {
          type: 'number',
          description: 'Number of campaigns to return'
        }
      }
    }
  },
  {
    name: 'ebay_get_promotions',
    description: 'Get promotions for the seller',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Filter by marketplace ID'
        },
        limit: {
          type: 'number',
          description: 'Number of promotions to return'
        }
      }
    }
  },
  {
    name: 'ebay_find_listing_recommendations',
    description: 'Find listing recommendations for items',
    inputSchema: {
      type: 'object',
      properties: {
        listingIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of listing IDs to get recommendations for'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        },
        limit: {
          type: 'number',
          description: 'Number of recommendations to return'
        },
        offset: {
          type: 'number',
          description: 'Number to skip'
        },
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        }
      }
    }
  }
];

export const analyticsTools: ToolDefinition[] = [
  {
    name: 'ebay_get_traffic_report',
    description: 'Get traffic report for listings',
    inputSchema: {
      type: 'object',
      properties: {
        dimension: {
          type: 'string',
          description: 'Dimension for the report (e.g., LISTING, DAY)'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        },
        metric: {
          type: 'string',
          description: 'Metrics to retrieve (e.g., CLICK_THROUGH_RATE, IMPRESSION)'
        },
        sort: {
          type: 'string',
          description: 'Sort order'
        }
      },
      required: ['dimension', 'filter', 'metric']
    }
  },
  {
    name: 'ebay_find_seller_standards_profiles',
    description: 'Find all seller standards profiles',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'ebay_get_seller_standards_profile',
    description: 'Get a specific seller standards profile',
    inputSchema: {
      type: 'object',
      properties: {
        program: {
          type: 'string',
          description: 'The program (e.g., CUSTOMER_SERVICE)'
        },
        cycle: {
          type: 'string',
          description: 'The cycle (e.g., CURRENT)'
        }
      },
      required: ['program', 'cycle']
    }
  },
  {
    name: 'ebay_get_customer_service_metric',
    description: 'Get customer service metrics',
    inputSchema: {
      type: 'object',
      properties: {
        customerServiceMetricType: {
          type: 'string',
          description: 'Type of metric'
        },
        evaluationType: {
          type: 'string',
          description: 'Evaluation type'
        },
        evaluationMarketplaceId: {
          type: 'string',
          description: 'Marketplace ID for evaluation'
        }
      },
      required: ['customerServiceMetricType', 'evaluationType', 'evaluationMarketplaceId']
    }
  }
];

export const metadataTools: ToolDefinition[] = [
  {
    name: 'ebay_get_automotive_parts_compatibility_policies',
    description: 'Get automotive parts compatibility policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_category_policies',
    description: 'Get category policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_extended_producer_responsibility_policies',
    description: 'Get extended producer responsibility policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_hazardous_materials_labels',
    description: 'Get hazardous materials labels for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_item_condition_policies',
    description: 'Get item condition policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_listing_structure_policies',
    description: 'Get listing structure policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_negotiated_price_policies',
    description: 'Get negotiated price policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_product_safety_labels',
    description: 'Get product safety labels for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_regulatory_policies',
    description: 'Get regulatory policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },

  {
    name: 'ebay_get_shipping_cost_type_policies',
    description: 'Get shipping cost type policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_classified_ad_policies',
    description: 'Get classified ad policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_currencies',
    description: 'Get currencies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_listing_type_policies',
    description: 'Get listing type policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_motors_listing_policies',
    description: 'Get motors listing policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_shipping_policies',
    description: 'Get shipping policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_site_visibility_policies',
    description: 'Get site visibility policies for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID'
        },
        filter: {
          type: 'string',
          description: 'Filter criteria'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_compatibilities_by_specification',
    description: 'Get compatibilities by specification',
    inputSchema: {
      type: 'object',
      properties: {
        specification: {
          type: 'object',
          description: 'Compatibility specification object'
        }
      },
      required: ['specification']
    }
  },
  {
    name: 'ebay_get_compatibility_property_names',
    description: 'Get compatibility property names',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Request data for getting compatibility property names'
        }
      },
      required: ['data']
    }
  },
  {
    name: 'ebay_get_compatibility_property_values',
    description: 'Get compatibility property values',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Request data for getting compatibility property values'
        }
      },
      required: ['data']
    }
  },
  {
    name: 'ebay_get_multi_compatibility_property_values',
    description: 'Get multiple compatibility property values',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Request data for getting multi compatibility property values'
        }
      },
      required: ['data']
    }
  },
  {
    name: 'ebay_get_product_compatibilities',
    description: 'Get product compatibilities',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Request data for getting product compatibilities'
        }
      },
      required: ['data']
    }
  },
  {
    name: 'ebay_get_sales_tax_jurisdictions',
    description: 'Get sales tax jurisdictions for a country',
    inputSchema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'Country code (e.g., US)'
        }
      },
      required: ['countryCode']
    }
  }
];

export const taxonomyTools: ToolDefinition[] = [
  {
    name: 'ebay_get_default_category_tree_id',
    description: 'Get the default category tree ID for a marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        marketplaceId: {
          type: 'string',
          description: 'Marketplace ID (e.g., EBAY_US)'
        }
      },
      required: ['marketplaceId']
    }
  },
  {
    name: 'ebay_get_category_tree',
    description: 'Get category tree by ID',
    inputSchema: {
      type: 'object',
      properties: {
        categoryTreeId: {
          type: 'string',
          description: 'Category tree ID'
        }
      },
      required: ['categoryTreeId']
    }
  },
  {
    name: 'ebay_get_category_suggestions',
    description: 'Get category suggestions based on query',
    inputSchema: {
      type: 'object',
      properties: {
        categoryTreeId: {
          type: 'string',
          description: 'Category tree ID'
        },
        query: {
          type: 'string',
          description: 'Search query for category suggestions'
        }
      },
      required: ['categoryTreeId', 'query']
    }
  },
  {
    name: 'ebay_get_item_aspects_for_category',
    description: 'Get item aspects for a specific category',
    inputSchema: {
      type: 'object',
      properties: {
        categoryTreeId: {
          type: 'string',
          description: 'Category tree ID'
        },
        categoryId: {
          type: 'string',
          description: 'Category ID'
        }
      },
      required: ['categoryTreeId', 'categoryId']
    }
  }
];

export const communicationTools: ToolDefinition[] = [
  // Negotiation API
  {
    name: 'ebay_get_offers_to_buyers',
    description: 'Get offers to buyers (Best Offers) for the seller',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Filter criteria for offers'
        },
        limit: {
          type: 'number',
          description: 'Number of offers to return'
        },
        offset: {
          type: 'number',
          description: 'Number of offers to skip'
        }
      }
    }
  },
  {
    name: 'ebay_send_offer_to_interested_buyers',
    description: 'Send offer to interested buyers',
    inputSchema: {
      type: 'object',
      properties: {
        offerId: {
          type: 'string',
          description: 'The offer ID'
        },
        offerData: {
          type: 'object',
          description: 'Offer details to send to buyers'
        }
      },
      required: ['offerId', 'offerData']
    }
  },
  // Message API
  {
    name: 'ebay_search_messages',
    description: 'Search for buyer-seller messages',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Filter criteria for messages'
        },
        limit: {
          type: 'number',
          description: 'Number of messages to return'
        },
        offset: {
          type: 'number',
          description: 'Number of messages to skip'
        }
      }
    }
  },
  {
    name: 'ebay_get_message',
    description: 'Get a specific message by ID',
    inputSchema: {
      type: 'object',
      properties: {
        messageId: {
          type: 'string',
          description: 'The message ID'
        }
      },
      required: ['messageId']
    }
  },
  {
    name: 'ebay_reply_to_message',
    description: 'Reply to a buyer message',
    inputSchema: {
      type: 'object',
      properties: {
        messageId: {
          type: 'string',
          description: 'The message ID to reply to'
        },
        messageContent: {
          type: 'string',
          description: 'The reply message content'
        }
      },
      required: ['messageId', 'messageContent']
    }
  },
  // Notification API
  {
    name: 'ebay_get_notification_config',
    description: 'Get notification configuration',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'ebay_update_notification_config',
    description: 'Update notification configuration',
    inputSchema: {
      type: 'object',
      properties: {
        config: {
          type: 'object',
          description: 'Notification configuration settings'
        }
      },
      required: ['config']
    }
  },
  {
    name: 'ebay_create_notification_destination',
    description: 'Create a notification destination',
    inputSchema: {
      type: 'object',
      properties: {
        destination: {
          type: 'object',
          description: 'Destination configuration'
        }
      },
      required: ['destination']
    }
  },
  // Feedback API
  {
    name: 'ebay_get_feedback',
    description: 'Get feedback for a transaction',
    inputSchema: {
      type: 'object',
      properties: {
        transactionId: {
          type: 'string',
          description: 'The transaction ID'
        }
      },
      required: ['transactionId']
    }
  },
  {
    name: 'ebay_leave_feedback_for_buyer',
    description: 'Leave feedback for a buyer',
    inputSchema: {
      type: 'object',
      properties: {
        feedbackData: {
          type: 'object',
          description: 'Feedback details including rating and comment'
        }
      },
      required: ['feedbackData']
    }
  },
  {
    name: 'ebay_get_feedback_summary',
    description: 'Get feedback summary for the seller',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

export const otherApiTools: ToolDefinition[] = [
  // Identity API
  {
    name: 'ebay_get_user',
    description: 'Get user identity information',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  // Compliance API
  {
    name: 'ebay_get_listing_violations',
    description: 'Get listing violations for the seller',
    inputSchema: {
      type: 'object',
      properties: {
        complianceType: {
          type: 'string',
          description: 'Type of compliance violation'
        },
        offset: {
          type: 'number',
          description: 'Number of violations to skip'
        },
        limit: {
          type: 'number',
          description: 'Number of violations to return'
        }
      }
    }
  },
  {
    name: 'ebay_get_listing_violations_summary',
    description: 'Get summary of listing violations',
    inputSchema: {
      type: 'object',
      properties: {
        complianceType: {
          type: 'string',
          description: 'Type of compliance violation'
        }
      }
    }
  },
  {
    name: 'ebay_suppress_violation',
    description: 'Suppress a listing violation',
    inputSchema: {
      type: 'object',
      properties: {
        listingViolationId: {
          type: 'string',
          description: 'The violation ID to suppress'
        }
      },
      required: ['listingViolationId']
    }
  },
  // VERO API
  {
    name: 'ebay_report_infringement',
    description: 'Report intellectual property infringement',
    inputSchema: {
      type: 'object',
      properties: {
        infringementData: {
          type: 'object',
          description: 'Infringement report details'
        }
      },
      required: ['infringementData']
    }
  },
  {
    name: 'ebay_get_reported_items',
    description: 'Get reported items',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Filter criteria'
        },
        limit: {
          type: 'number',
          description: 'Number of items to return'
        },
        offset: {
          type: 'number',
          description: 'Number of items to skip'
        }
      }
    }
  },
  // Translation API
  {
    name: 'ebay_translate',
    description: 'Translate listing text',
    inputSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Source language code'
        },
        to: {
          type: 'string',
          description: 'Target language code'
        },
        translationContext: {
          type: 'string',
          description: 'Translation context (e.g., ITEM_TITLE, ITEM_DESCRIPTION)'
        },
        text: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of text to translate'
        }
      },
      required: ['from', 'to', 'translationContext', 'text']
    }
  },
  // eDelivery API
  {
    name: 'ebay_create_shipping_quote',
    description: 'Create a shipping quote for international shipping',
    inputSchema: {
      type: 'object',
      properties: {
        shippingQuoteRequest: {
          type: 'object',
          description: 'Shipping quote request details'
        }
      },
      required: ['shippingQuoteRequest']
    }
  },
  {
    name: 'ebay_get_shipping_quote',
    description: 'Get a shipping quote by ID',
    inputSchema: {
      type: 'object',
      properties: {
        shippingQuoteId: {
          type: 'string',
          description: 'The shipping quote ID'
        }
      },
      required: ['shippingQuoteId']
    }
  }
];
