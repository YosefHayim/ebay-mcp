import { z } from 'zod';
import { MarketplaceId } from '@/types/ebay-enums.js';
import {
  fulfillmentPolicySchema,
  paymentPolicySchema,
  returnPolicySchema,
  customPolicySchema,
  salesTaxBaseSchema,
  programRequestSchema,
  inventoryItemSchema,
  offerSchema,
  productCompatibilitySchema,
  inventoryItemGroupSchema,
  locationSchema,
  shippingFulfillmentSchema,
  bulkInventoryItemRequestSchema,
  bulkPriceQuantityRequestSchema,
  bulkOfferRequestSchema,
  bulkPublishRequestSchema,
  listingFeesRequestSchema,
  bulkMigrateRequestSchema,
  compatibilitySpecificationSchema,
  compatibilityDataSchema,
  offerToBuyersSchema,
  feedbackDataSchema,
  notificationConfigSchema,
  notificationDestinationSchema,
  infringementDataSchema,
  shippingQuoteRequestSchema,
  bulkSalesTaxRequestSchema,
} from './schemas.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
}

export const chatGptTools: ToolDefinition[] = [
  {
    name: 'search',
    description: 'Search for eBay inventory items',
    inputSchema: {
      query: z.string().describe('Search query'),
      limit: z.number().optional().describe('Maximum number of results'),
    },
  },
  {
    name: 'fetch',
    description: 'Fetch a specific eBay inventory item by SKU',
    inputSchema: {
      id: z.string().describe('Item SKU'),
    },
  },
  {
    name: 'ebay_get_oauth_url',
    description:
      'Generate the eBay OAuth authorization URL for user consent. The user should open this URL in a browser to grant permissions to the application. This supports the OAuth 2.0 Authorization Code grant flow. The redirect URI can be provided as a parameter or will be read from EBAY_REDIRECT_URI environment variable.\n\nIMPORTANT: eBay has different OAuth scopes available for production vs sandbox environments:\n- Sandbox includes additional Buy API scopes (e.g., buy.order.readonly, buy.guest.order, buy.shopping.cart) and extended Identity scopes\n- Production includes sell.edelivery, commerce.message (explicit), and commerce.shipping scopes not available in sandbox\n- If you provide custom scopes, they will be validated against the current environment (set via EBAY_ENVIRONMENT). Any scopes not valid for the environment will generate warnings.',
    inputSchema: {
      redirectUri: z
        .string()
        .optional()
        .describe(
          'Optional redirect URI registered with your eBay application (RuName). If not provided, will use EBAY_REDIRECT_URI from .env file.'
        ),
      scopes: z
        .array(z.string())
        .optional()
        .describe(
          'Optional array of OAuth scopes. If not provided, uses environment-specific default scopes (production or sandbox based on EBAY_ENVIRONMENT). Custom scopes will be validated against the environment.'
        ),
      state: z.string().optional().describe('Optional state parameter for CSRF protection'),
    },
  },
  {
    name: 'ebay_set_user_tokens',
    description:
      'Set the user access token and refresh token for authenticated API requests. These tokens should be obtained through the OAuth authorization code flow. Tokens will be persisted to disk and automatically refreshed when needed. User tokens provide higher rate limits (10,000-50,000 requests/day) compared to client credentials (1,000 requests/day).',
    inputSchema: {
      accessToken: z.string().describe('The user access token obtained from OAuth flow'),
      refreshToken: z.string().describe('The refresh token obtained from OAuth flow'),
    },
  },
  {
    name: 'ebay_get_token_status',
    description:
      'Check the current OAuth token status. Returns information about whether user tokens or client credentials are being used, and whether tokens are valid.',
    inputSchema: {},
  },
  {
    name: 'ebay_clear_tokens',
    description:
      'Clear all stored OAuth tokens (both user tokens and client credentials). This will require re-authentication for subsequent API calls.',
    inputSchema: {},
  },
  {
    name: 'ebay_convert_date_to_timestamp',
    description:
      'Convert a date string or number to Unix timestamp (milliseconds). Supports ISO 8601 dates, Unix timestamps (seconds or milliseconds), and relative time (e.g., "in 2 hours", "in 7200 seconds"). Useful when setting token expiry times from user input.',
    inputSchema: {
      dateInput: z
        .union([z.string(), z.number()])
        .describe(
          'Date to convert. Supports ISO 8601 strings (e.g., "2025-01-15T10:30:00Z"), Unix timestamps (seconds or milliseconds), or relative time (e.g., "in 2 hours")'
        ),
    },
  },
  {
    name: 'ebay_validate_token_expiry',
    description:
      'Validate token expiry times and get recommendations. Checks if access/refresh tokens are expired or expiring soon, and provides actionable recommendations (e.g., refresh access token, re-authorize user).',
    inputSchema: {
      accessTokenExpiry: z
        .union([z.string(), z.number()])
        .describe(
          'Access token expiry time. Can be ISO date string, Unix timestamp (seconds or milliseconds), or relative time'
        ),
      refreshTokenExpiry: z
        .union([z.string(), z.number()])
        .describe(
          'Refresh token expiry time. Can be ISO date string, Unix timestamp (seconds or milliseconds), or relative time'
        ),
    },
  },
  {
    name: 'ebay_set_user_tokens_with_expiry',
    description:
      "Set user access and refresh tokens with custom expiry times. This is an enhanced version of ebay_set_user_tokens that accepts expiry times and can automatically refresh the access token if it's expired but the refresh token is valid. Useful when user provides tokens that may already be partially expired.",
    inputSchema: {
      accessToken: z.string().min(1).describe('eBay user access token'),
      refreshToken: z.string().min(1).describe('eBay user refresh token'),
      accessTokenExpiry: z
        .union([z.string(), z.number()])
        .optional()
        .describe(
          'Optional: Access token expiry time. If not provided, defaults to 2 hours from now. Can be ISO date string, Unix timestamp, or relative time (e.g., "in 7200 seconds")'
        ),
      refreshTokenExpiry: z
        .union([z.string(), z.number()])
        .optional()
        .describe(
          'Optional: Refresh token expiry time. If not provided, defaults to 18 months from now. Can be ISO date string, Unix timestamp, or relative time'
        ),
      autoRefresh: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          'If true and access token is expired but refresh token is valid, automatically refresh the access token. Default: true'
        ),
    },
  },
];

export const accountTools: ToolDefinition[] = [
  {
    name: 'ebay_get_custom_policies',
    description: 'Retrieve custom policies defined for the seller account',
    inputSchema: {
      policyTypes: z
        .string()
        .optional()
        .describe('Comma-delimited list of policy types to retrieve'),
    },
  },
  {
    name: 'ebay_get_fulfillment_policies',
    description:
      'Get fulfillment policies for the seller.\n\nRequired OAuth Scope: sell.account.readonly or sell.account\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.account.readonly',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('eBay marketplace ID'),
    },
  },
  {
    name: 'ebay_get_payment_policies',
    description: 'Get payment policies for the seller',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('eBay marketplace ID'),
    },
  },
  {
    name: 'ebay_get_return_policies',
    description: 'Get return policies for the seller',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('eBay marketplace ID'),
    },
  },
  // Fulfillment Policy CRUD
  {
    name: 'ebay_create_fulfillment_policy',
    description:
      'Create a new fulfillment policy.\n\nRequired OAuth Scope: sell.account\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.account',
    inputSchema: {
      policy: fulfillmentPolicySchema.describe('Fulfillment policy details'),
    },
  },
  {
    name: 'ebay_get_fulfillment_policy',
    description: 'Get a specific fulfillment policy by ID',
    inputSchema: {
      fulfillmentPolicyId: z.string().describe('The fulfillment policy ID'),
    },
  },
  {
    name: 'ebay_get_fulfillment_policy_by_name',
    description: 'Get a fulfillment policy by name',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
      name: z.string().describe('Policy name'),
    },
  },
  {
    name: 'ebay_update_fulfillment_policy',
    description: 'Update an existing fulfillment policy',
    inputSchema: {
      fulfillmentPolicyId: z.string().describe('The fulfillment policy ID'),
      policy: fulfillmentPolicySchema.describe('Updated fulfillment policy details'),
    },
  },
  {
    name: 'ebay_delete_fulfillment_policy',
    description: 'Delete a fulfillment policy',
    inputSchema: {
      fulfillmentPolicyId: z.string().describe('The fulfillment policy ID'),
    },
  },
  // Payment Policy CRUD
  {
    name: 'ebay_create_payment_policy',
    description: 'Create a new payment policy',
    inputSchema: {
      policy: paymentPolicySchema.describe('Payment policy details'),
    },
  },
  {
    name: 'ebay_get_payment_policy',
    description: 'Get a specific payment policy by ID',
    inputSchema: {
      paymentPolicyId: z.string().describe('The payment policy ID'),
    },
  },
  {
    name: 'ebay_get_payment_policy_by_name',
    description: 'Get a payment policy by name',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
      name: z.string().describe('Policy name'),
    },
  },
  {
    name: 'ebay_update_payment_policy',
    description: 'Update an existing payment policy',
    inputSchema: {
      paymentPolicyId: z.string().describe('The payment policy ID'),
      policy: paymentPolicySchema.describe('Updated payment policy details'),
    },
  },
  {
    name: 'ebay_delete_payment_policy',
    description: 'Delete a payment policy',
    inputSchema: {
      paymentPolicyId: z.string().describe('The payment policy ID'),
    },
  },
  // Return Policy CRUD
  {
    name: 'ebay_create_return_policy',
    description: 'Create a new return policy',
    inputSchema: {
      policy: returnPolicySchema.describe('Return policy details'),
    },
  },
  {
    name: 'ebay_get_return_policy',
    description: 'Get a specific return policy by ID',
    inputSchema: {
      returnPolicyId: z.string().describe('The return policy ID'),
    },
  },
  {
    name: 'ebay_get_return_policy_by_name',
    description: 'Get a return policy by name',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
      name: z.string().describe('Policy name'),
    },
  },
  {
    name: 'ebay_update_return_policy',
    description: 'Update an existing return policy',
    inputSchema: {
      returnPolicyId: z.string().describe('The return policy ID'),
      policy: returnPolicySchema.describe('Updated return policy details'),
    },
  },
  {
    name: 'ebay_delete_return_policy',
    description: 'Delete a return policy',
    inputSchema: {
      returnPolicyId: z.string().describe('The return policy ID'),
    },
  },
  // Custom Policy CRUD
  {
    name: 'ebay_create_custom_policy',
    description: 'Create a new custom policy',
    inputSchema: {
      policy: customPolicySchema.describe('Custom policy details'),
    },
  },
  {
    name: 'ebay_get_custom_policy',
    description: 'Get a specific custom policy by ID',
    inputSchema: {
      customPolicyId: z.string().describe('The custom policy ID'),
    },
  },
  {
    name: 'ebay_update_custom_policy',
    description: 'Update an existing custom policy',
    inputSchema: {
      customPolicyId: z.string().describe('The custom policy ID'),
      policy: customPolicySchema.describe('Updated custom policy details'),
    },
  },
  {
    name: 'ebay_delete_custom_policy',
    description: 'Delete a custom policy',
    inputSchema: {
      customPolicyId: z.string().describe('The custom policy ID'),
    },
  },
  // KYC, Payments, Programs, Sales Tax, Subscription
  {
    name: 'ebay_get_kyc',
    description: 'Get seller KYC (Know Your Customer) status',
    inputSchema: {},
  },
  {
    name: 'ebay_opt_in_to_payments_program',
    description: 'Opt-in to a payments program',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
      paymentsProgramType: z.string().describe('Payments program type'),
    },
  },
  {
    name: 'ebay_get_payments_program_status',
    description: 'Get payments program status',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
      paymentsProgramType: z.string().describe('Payments program type'),
    },
  },
  {
    name: 'ebay_get_rate_tables',
    description: 'Get seller rate tables',
    inputSchema: {},
  },
  {
    name: 'ebay_create_or_replace_sales_tax',
    description: 'Create or replace sales tax table for a jurisdiction',
    inputSchema: {
      countryCode: z.string().describe('Two-letter ISO 3166 country code'),
      jurisdictionId: z.string().describe('Tax jurisdiction ID'),
      salesTaxBase: salesTaxBaseSchema.describe('Sales tax details'),
    },
  },
  {
    name: 'ebay_bulk_create_or_replace_sales_tax',
    description: 'Bulk create or replace sales tax tables',
    inputSchema: {
      requests: bulkSalesTaxRequestSchema.describe('Array of sales tax requests'),
    },
  },
  {
    name: 'ebay_delete_sales_tax',
    description: 'Delete sales tax table for a jurisdiction',
    inputSchema: {
      countryCode: z.string().describe('Two-letter ISO 3166 country code'),
      jurisdictionId: z.string().describe('Tax jurisdiction ID'),
    },
  },
  {
    name: 'ebay_get_sales_tax',
    description: 'Get sales tax table for a jurisdiction',
    inputSchema: {
      countryCode: z.string().describe('Two-letter ISO 3166 country code'),
      jurisdictionId: z.string().describe('Tax jurisdiction ID'),
    },
  },
  {
    name: 'ebay_get_sales_taxes',
    description: 'Get all sales tax tables',
    inputSchema: {
      countryCode: z.string().optional().describe('Optional country code to filter by'),
    },
  },
  {
    name: 'ebay_get_subscription',
    description: 'Get seller subscription information',
    inputSchema: {
      limitType: z.string().optional().describe('Optional limit type filter'),
    },
  },
  {
    name: 'ebay_opt_in_to_program',
    description: 'Opt-in to a seller program',
    inputSchema: {
      request: programRequestSchema.describe('Program opt-in request'),
    },
  },
  {
    name: 'ebay_opt_out_of_program',
    description: 'Opt-out of a seller program',
    inputSchema: {
      request: programRequestSchema.describe('Program opt-out request'),
    },
  },
  {
    name: 'ebay_get_opted_in_programs',
    description: 'Get seller programs the account is opted into',
    inputSchema: {},
  },
];

export const inventoryTools: ToolDefinition[] = [
  {
    name: 'ebay_get_inventory_items',
    description:
      'Retrieve all inventory items for the seller.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    inputSchema: {
      limit: z.number().optional().describe('Number of items to return (max 100)'),
      offset: z.number().optional().describe('Number of items to skip'),
    },
  },
  {
    name: 'ebay_get_inventory_item',
    description:
      'Get a specific inventory item by SKU.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
    },
  },
  {
    name: 'ebay_create_inventory_item',
    description:
      'Create or replace an inventory item.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
      inventoryItem: inventoryItemSchema.describe('Inventory item details'),
    },
  },
  {
    name: 'ebay_get_offers',
    description: 'Get all offers for the seller',
    inputSchema: {
      sku: z.string().optional().describe('Filter by SKU'),
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter by marketplace ID'),
      limit: z.number().optional().describe('Number of offers to return'),
    },
  },
  {
    name: 'ebay_create_offer',
    description: 'Create a new offer for an inventory item',
    inputSchema: {
      offer: offerSchema.describe(
        'Offer details including SKU, marketplace, pricing, and policies'
      ),
    },
  },
  {
    name: 'ebay_publish_offer',
    description: 'Publish an offer to create a listing',
    inputSchema: {
      offerId: z.string().describe('The offer ID to publish'),
    },
  },
  // Bulk Operations
  {
    name: 'ebay_bulk_create_or_replace_inventory_item',
    description: 'Bulk create or replace multiple inventory items',
    inputSchema: {
      requests: bulkInventoryItemRequestSchema.describe('Bulk inventory item requests'),
    },
  },
  {
    name: 'ebay_bulk_get_inventory_item',
    description: 'Bulk get multiple inventory items',
    inputSchema: {
      requests: z
        .object({
          requests: z.array(
            z
              .object({
                sku: z.string(),
              })
              .passthrough()
          ),
        })
        .passthrough()
        .describe('Bulk inventory item get requests with SKU list'),
    },
  },
  {
    name: 'ebay_bulk_update_price_quantity',
    description: 'Bulk update price and quantity for multiple offers',
    inputSchema: {
      requests: bulkPriceQuantityRequestSchema.describe('Bulk price and quantity update requests'),
    },
  },
  // Product Compatibility
  {
    name: 'ebay_get_product_compatibility',
    description: 'Get product compatibility information for an inventory item',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
    },
  },
  {
    name: 'ebay_create_or_replace_product_compatibility',
    description: 'Create or replace product compatibility for an inventory item',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
      compatibility: productCompatibilitySchema.describe('Product compatibility details'),
    },
  },
  {
    name: 'ebay_delete_product_compatibility',
    description: 'Delete product compatibility for an inventory item',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
    },
  },
  // Inventory Item Groups
  {
    name: 'ebay_get_inventory_item_group',
    description: 'Get an inventory item group (variation group)',
    inputSchema: {
      inventoryItemGroupKey: z.string().describe('The inventory item group key'),
    },
  },
  {
    name: 'ebay_create_or_replace_inventory_item_group',
    description: 'Create or replace an inventory item group',
    inputSchema: {
      inventoryItemGroupKey: z.string().describe('The inventory item group key'),
      inventoryItemGroup: inventoryItemGroupSchema.describe('Inventory item group details'),
    },
  },
  {
    name: 'ebay_delete_inventory_item_group',
    description: 'Delete an inventory item group',
    inputSchema: {
      inventoryItemGroupKey: z.string().describe('The inventory item group key'),
    },
  },
  // Location Management
  {
    name: 'ebay_get_inventory_locations',
    description: 'Get all inventory locations',
    inputSchema: {
      limit: z.number().optional().describe('Number of locations to return'),
      offset: z.number().optional().describe('Number of locations to skip'),
    },
  },
  {
    name: 'ebay_get_inventory_location',
    description: 'Get a specific inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
  },
  {
    name: 'ebay_create_or_replace_inventory_location',
    description: 'Create or replace an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
      location: locationSchema.describe('Location details'),
    },
  },
  {
    name: 'ebay_delete_inventory_location',
    description: 'Delete an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
  },
  {
    name: 'ebay_disable_inventory_location',
    description: 'Disable an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
  },
  {
    name: 'ebay_enable_inventory_location',
    description: 'Enable an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
  },
  {
    name: 'ebay_update_location_details',
    description: 'Update location details for an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
      locationDetails: locationSchema.describe('Location detail updates'),
    },
  },
  // Offer Management
  {
    name: 'ebay_get_offer',
    description: 'Get a specific offer by ID',
    inputSchema: {
      offerId: z.string().describe('The offer ID'),
    },
  },
  {
    name: 'ebay_update_offer',
    description: 'Update an existing offer',
    inputSchema: {
      offerId: z.string().describe('The offer ID'),
      offer: offerSchema.describe('Updated offer details'),
    },
  },
  {
    name: 'ebay_delete_offer',
    description: 'Delete an offer',
    inputSchema: {
      offerId: z.string().describe('The offer ID to delete'),
    },
  },
  {
    name: 'ebay_withdraw_offer',
    description: 'Withdraw a published offer',
    inputSchema: {
      offerId: z.string().describe('The offer ID to withdraw'),
    },
  },
  {
    name: 'ebay_bulk_create_offer',
    description: 'Bulk create multiple offers',
    inputSchema: {
      requests: bulkOfferRequestSchema.describe('Bulk offer creation requests'),
    },
  },
  {
    name: 'ebay_bulk_publish_offer',
    description: 'Bulk publish multiple offers',
    inputSchema: {
      requests: bulkPublishRequestSchema.describe('Bulk offer publish requests'),
    },
  },
  {
    name: 'ebay_get_listing_fees',
    description: 'Get listing fees for offers before publishing',
    inputSchema: {
      offers: listingFeesRequestSchema.describe('Offers to calculate listing fees for'),
    },
  },
  // Listing Migration
  {
    name: 'ebay_bulk_migrate_listing',
    description: 'Bulk migrate listings to the inventory model',
    inputSchema: {
      requests: bulkMigrateRequestSchema.describe('Bulk listing migration requests'),
    },
  },
];

export const fulfillmentTools: ToolDefinition[] = [
  {
    name: 'ebay_get_orders',
    description:
      'Retrieve orders for the seller.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: {
      filter: z
        .string()
        .optional()
        .describe('Filter criteria (e.g., orderfulfillmentstatus:{NOT_STARTED})'),
      limit: z.number().optional().describe('Number of orders to return'),
      offset: z.number().optional().describe('Number of orders to skip'),
    },
  },
  {
    name: 'ebay_get_order',
    description:
      'Get details of a specific order.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: {
      orderId: z.string().describe('The unique order ID'),
    },
  },
  {
    name: 'ebay_create_shipping_fulfillment',
    description:
      'Create a shipping fulfillment for an order.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      orderId: z.string().describe('The order ID'),
      fulfillment: shippingFulfillmentSchema.describe(
        'Shipping fulfillment details including tracking number'
      ),
    },
  },
  {
    name: 'ebay_issue_refund',
    description:
      'Issue a full or partial refund for an eBay order. Use this to refund buyers for orders, including specifying the refund amount and reason.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      orderId: z.string().describe('The unique eBay order ID to refund'),
      refundData: z
        .object({
          reasonForRefund: z
            .string()
            .describe(
              'REQUIRED. Reason code: BUYER_CANCEL, OUT_OF_STOCK, FOUND_CHEAPER_PRICE, INCORRECT_PRICE, ITEM_DAMAGED, ITEM_DEFECTIVE, LOST_IN_TRANSIT, MUTUALLY_AGREED, SELLER_CANCEL'
            ),
          comment: z
            .string()
            .optional()
            .describe('Optional comment to buyer about the refund (max 100 characters)'),
          refundItems: z
            .array(
              z.object({
                lineItemId: z
                  .string()
                  .describe('The unique identifier of the order line item to refund'),
                refundAmount: z
                  .object({
                    value: z.string().describe('The monetary amount (e.g., "25.99")'),
                    currency: z
                      .string()
                      .describe('Three-letter ISO 4217 currency code (e.g., "USD")'),
                  })
                  .optional()
                  .describe('The amount to refund for this line item'),
                legacyReference: z
                  .object({
                    legacyItemId: z.string().optional(),
                    legacyTransactionId: z.string().optional(),
                  })
                  .optional()
                  .describe(
                    'Optional legacy item ID/transaction ID pair for identifying the line item'
                  ),
              })
            )
            .optional()
            .describe(
              'Array of individual line items to refund. Use this for partial refunds of specific items. Each item requires lineItemId and refundAmount.'
            ),
          orderLevelRefundAmount: z
            .object({
              value: z.string().describe('The monetary amount (e.g., "99.99")'),
              currency: z.string().describe('Three-letter ISO 4217 currency code (e.g., "USD")'),
            })
            .optional()
            .describe(
              'Use this to refund the entire order amount. Alternative to refundItems. Include value and currency.'
            ),
        })
        .describe(
          'Refund details including amount, reason, and optional comment. Must include reasonForRefund (required), and either refundItems (for line item refunds) OR orderLevelRefundAmount (for full order refunds).'
        ),
    },
  },
];

export const marketingTools: ToolDefinition[] = [
  {
    name: 'ebay_get_campaigns',
    description: 'Get marketing campaigns for the seller',
    inputSchema: {
      campaignStatus: z
        .string()
        .optional()
        .describe('Filter by campaign status (RUNNING, PAUSED, ENDED)'),
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter by marketplace ID'),
      limit: z.number().optional().describe('Number of campaigns to return'),
    },
  },
  {
    name: 'ebay_get_campaign',
    description: 'Get details of a specific marketing campaign by ID',
    inputSchema: {
      campaignId: z.string().describe('The unique campaign ID'),
    },
  },
  {
    name: 'ebay_pause_campaign',
    description:
      'Pause a running marketing campaign. Use this to temporarily stop a campaign without ending it.',
    inputSchema: {
      campaignId: z.string().describe('The unique campaign ID to pause'),
    },
  },
  {
    name: 'ebay_resume_campaign',
    description:
      'Resume a paused marketing campaign. Use this to restart a campaign that was previously paused.',
    inputSchema: {
      campaignId: z.string().describe('The unique campaign ID to resume'),
    },
  },
  {
    name: 'ebay_end_campaign',
    description: 'Permanently end a marketing campaign. Note: Ended campaigns cannot be restarted.',
    inputSchema: {
      campaignId: z.string().describe('The unique campaign ID to end'),
    },
  },
  {
    name: 'ebay_update_campaign_identification',
    description:
      "Update a campaign's name or other identification details. Note: eBay does not support directly updating campaign budget or duration - you must clone the campaign with new settings.",
    inputSchema: {
      campaignId: z.string().describe('The unique campaign ID'),
      updateData: z
        .object({
          campaignName: z.string().optional().describe('New campaign name'),
        })
        .describe('Campaign identification data to update (e.g., campaign name)'),
    },
  },
  {
    name: 'ebay_clone_campaign',
    description:
      'Clone an existing campaign with new settings. Use this to create a campaign with modified budget or duration, as eBay does not support direct budget/duration updates.',
    inputSchema: {
      campaignId: z.string().describe('The campaign ID to clone'),
      cloneData: z
        .object({
          campaignName: z.string().optional().describe('Name for the new cloned campaign'),
          fundingStrategy: z
            .object({
              fundingModel: z
                .string()
                .optional()
                .describe(
                  'The funding model for the campaign. Valid values: "COST_PER_SALE" (CPS) or "COST_PER_CLICK" (CPC)'
                ),
              bidPercentage: z
                .string()
                .optional()
                .describe(
                  'The bid percentage for CPS campaigns (e.g., "10.5" for 10.5%). Required for COST_PER_SALE funding model.'
                ),
            })
            .optional()
            .describe(
              'Budget settings for the campaign. Includes fundingModel (COST_PER_SALE or COST_PER_CLICK) and bidPercentage.'
            ),
          startDate: z
            .string()
            .optional()
            .describe(
              'Campaign start date in UTC format (yyyy-MM-ddThh:mm:ssZ, e.g., "2025-01-15T00:00:00Z")'
            ),
          endDate: z
            .string()
            .optional()
            .describe(
              'Campaign end date in UTC format (yyyy-MM-ddThh:mm:ssZ, e.g., "2025-12-31T23:59:59Z")'
            ),
        })
        .describe('New campaign settings including name, budget, start/end dates'),
    },
  },
  {
    name: 'ebay_get_promotions',
    description: 'Get promotions for the seller',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter by marketplace ID'),
      limit: z.number().optional().describe('Number of promotions to return'),
    },
  },
  {
    name: 'ebay_find_listing_recommendations',
    description: 'Find listing recommendations for items',
    inputSchema: {
      listingIds: z
        .array(z.string())
        .optional()
        .describe('Array of listing IDs to get recommendations for'),
      filter: z.string().optional().describe('Filter criteria'),
      limit: z.number().optional().describe('Number of recommendations to return'),
      offset: z.number().optional().describe('Number to skip'),
      marketplaceId: z.string().optional().describe('Marketplace ID'),
    },
  },
];

export const analyticsTools: ToolDefinition[] = [
  {
    name: 'ebay_get_traffic_report',
    description: 'Get traffic report for listings',
    inputSchema: {
      dimension: z.string().describe('Dimension for the report (e.g., LISTING, DAY)'),
      filter: z.string().describe('Filter criteria'),
      metric: z.string().describe('Metrics to retrieve (e.g., CLICK_THROUGH_RATE, IMPRESSION)'),
      sort: z.string().optional().describe('Sort order'),
    },
  },
  {
    name: 'ebay_find_seller_standards_profiles',
    description: 'Find all seller standards profiles',
    inputSchema: {},
  },
  {
    name: 'ebay_get_seller_standards_profile',
    description: 'Get a specific seller standards profile',
    inputSchema: {
      program: z.string().describe('The program (e.g., CUSTOMER_SERVICE)'),
      cycle: z.string().describe('The cycle (e.g., CURRENT)'),
    },
  },
  {
    name: 'ebay_get_customer_service_metric',
    description: 'Get customer service metrics',
    inputSchema: {
      customerServiceMetricType: z.string().describe('Type of metric'),
      evaluationType: z.string().describe('Evaluation type'),
      evaluationMarketplaceId: z.string().describe('Marketplace ID for evaluation'),
    },
  },
];

export const metadataTools: ToolDefinition[] = [
  {
    name: 'ebay_get_automotive_parts_compatibility_policies',
    description: 'Get automotive parts compatibility policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_category_policies',
    description: 'Get category policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_extended_producer_responsibility_policies',
    description: 'Get extended producer responsibility policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_hazardous_materials_labels',
    description: 'Get hazardous materials labels for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
    },
  },
  {
    name: 'ebay_get_item_condition_policies',
    description: 'Get item condition policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_listing_structure_policies',
    description: 'Get listing structure policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_negotiated_price_policies',
    description: 'Get negotiated price policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_product_safety_labels',
    description: 'Get product safety labels for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
    },
  },
  {
    name: 'ebay_get_regulatory_policies',
    description: 'Get regulatory policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },

  {
    name: 'ebay_get_shipping_cost_type_policies',
    description: 'Get shipping cost type policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_classified_ad_policies',
    description: 'Get classified ad policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_currencies',
    description: 'Get currencies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
    },
  },
  {
    name: 'ebay_get_listing_type_policies',
    description: 'Get listing type policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_motors_listing_policies',
    description: 'Get motors listing policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_shipping_policies',
    description: 'Get shipping policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_site_visibility_policies',
    description: 'Get site visibility policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
  },
  {
    name: 'ebay_get_compatibilities_by_specification',
    description: 'Get compatibilities by specification',
    inputSchema: {
      specification: compatibilitySpecificationSchema.describe(
        'Compatibility specification object'
      ),
    },
  },
  {
    name: 'ebay_get_compatibility_property_names',
    description: 'Get compatibility property names',
    inputSchema: {
      data: compatibilityDataSchema.describe(
        'Request data for getting compatibility property names'
      ),
    },
  },
  {
    name: 'ebay_get_compatibility_property_values',
    description: 'Get compatibility property values',
    inputSchema: {
      data: compatibilityDataSchema.describe(
        'Request data for getting compatibility property values'
      ),
    },
  },
  {
    name: 'ebay_get_multi_compatibility_property_values',
    description: 'Get multiple compatibility property values',
    inputSchema: {
      data: compatibilityDataSchema.describe(
        'Request data for getting multi compatibility property values'
      ),
    },
  },
  {
    name: 'ebay_get_product_compatibilities',
    description: 'Get product compatibilities',
    inputSchema: {
      data: compatibilityDataSchema.describe('Request data for getting product compatibilities'),
    },
  },
  {
    name: 'ebay_get_sales_tax_jurisdictions',
    description: 'Get sales tax jurisdictions for a country',
    inputSchema: {
      countryCode: z.string().describe('Country code (e.g., US)'),
    },
  },
];

export const taxonomyTools: ToolDefinition[] = [
  {
    name: 'ebay_get_default_category_tree_id',
    description: 'Get the default category tree ID for a marketplace',
    inputSchema: {
      marketplaceId: z.string().describe('Marketplace ID (e.g., EBAY_US)'),
    },
  },
  {
    name: 'ebay_get_category_tree',
    description: 'Get category tree by ID',
    inputSchema: {
      categoryTreeId: z.string().describe('Category tree ID'),
    },
  },
  {
    name: 'ebay_get_category_suggestions',
    description: 'Get category suggestions based on query',
    inputSchema: {
      categoryTreeId: z.string().describe('Category tree ID'),
      query: z.string().describe('Search query for category suggestions'),
    },
  },
  {
    name: 'ebay_get_item_aspects_for_category',
    description: 'Get item aspects for a specific category',
    inputSchema: {
      categoryTreeId: z.string().describe('Category tree ID'),
      categoryId: z.string().describe('Category ID'),
    },
  },
];

export const communicationTools: ToolDefinition[] = [
  // Negotiation API
  {
    name: 'ebay_get_offers_to_buyers',
    description: 'Get offers to buyers (Best Offers) for the seller',
    inputSchema: {
      filter: z.string().optional().describe('Filter criteria for offers'),
      limit: z.number().optional().describe('Number of offers to return'),
      offset: z.number().optional().describe('Number of offers to skip'),
    },
  },
  {
    name: 'ebay_send_offer_to_interested_buyers',
    description: 'Send offer to interested buyers',
    inputSchema: {
      offerId: z.string().describe('The offer ID'),
      offerData: offerToBuyersSchema.describe('Offer details to send to buyers'),
    },
  },
  // Message API
  {
    name: 'ebay_search_messages',
    description: 'Search for buyer-seller messages',
    inputSchema: {
      filter: z.string().optional().describe('Filter criteria for messages'),
      limit: z.number().optional().describe('Number of messages to return'),
      offset: z.number().optional().describe('Number of messages to skip'),
    },
  },
  {
    name: 'ebay_get_message',
    description: 'Get a specific message by ID',
    inputSchema: {
      messageId: z.string().describe('The message ID'),
    },
  },
  {
    name: 'ebay_send_message',
    description:
      'Send a direct message to a buyer regarding a specific transaction or inquiry. Use this to communicate about orders, answer questions, resolve issues, or provide updates.',
    inputSchema: {
      messageData: z
        .object({
          conversationId: z
            .string()
            .optional()
            .describe(
              'Optional conversation ID to reply to an existing thread. Use getConversations to retrieve conversation IDs. Required if replying to existing conversation.'
            ),
          messageText: z
            .string()
            .describe('REQUIRED. The text of the message to send (max 2000 characters).'),
          otherPartyUsername: z
            .string()
            .optional()
            .describe(
              'eBay username of the other party (buyer or seller). Required when starting a new conversation.'
            ),
          emailCopyToSender: z
            .boolean()
            .optional()
            .describe('If true, a copy of the message will be emailed to the sender.'),
          reference: z
            .object({
              referenceId: z
                .string()
                .optional()
                .describe(
                  'The ID of the listing or order to reference (e.g., item ID or order ID)'
                ),
              referenceType: z
                .string()
                .optional()
                .describe(
                  'Type of reference. Valid values: "LISTING" (for item listings) or "ORDER" (for orders)'
                ),
            })
            .optional()
            .describe('Optional reference to associate message with a listing or order.'),
          messageMedia: z
            .array(
              z.object({
                mediaUrl: z.string().optional().describe('URL of the media to attach'),
                mediaType: z
                  .string()
                  .optional()
                  .describe('MIME type of the media (e.g., "image/jpeg")'),
              })
            )
            .optional()
            .describe('Optional array of media attachments (max 5 per message)'),
        })
        .describe(
          'Message details including recipient and content. Must include messageText (required), and either conversationId (for replies) OR otherPartyUsername (for new messages).'
        ),
    },
  },
  {
    name: 'ebay_reply_to_message',
    description: 'Reply to a buyer message in an existing conversation thread',
    inputSchema: {
      messageId: z.string().describe('The conversation/message ID to reply to'),
      messageContent: z.string().describe('The reply message content'),
    },
  },
  // Notification API
  {
    name: 'ebay_get_notification_config',
    description: 'Get notification configuration',
    inputSchema: {},
  },
  {
    name: 'ebay_update_notification_config',
    description: 'Update notification configuration',
    inputSchema: {
      config: notificationConfigSchema.describe('Notification configuration settings'),
    },
  },
  {
    name: 'ebay_create_notification_destination',
    description: 'Create a notification destination',
    inputSchema: {
      destination: notificationDestinationSchema.describe('Destination configuration'),
    },
  },
  // Feedback API
  {
    name: 'ebay_get_feedback',
    description: 'Get feedback for a transaction',
    inputSchema: {
      transactionId: z.string().describe('The transaction ID'),
    },
  },
  {
    name: 'ebay_leave_feedback_for_buyer',
    description: 'Leave feedback for a buyer',
    inputSchema: {
      feedbackData: feedbackDataSchema.describe('Feedback details including rating and comment'),
    },
  },
  {
    name: 'ebay_get_feedback_summary',
    description: 'Get feedback summary for the seller',
    inputSchema: {},
  },
];

export const otherApiTools: ToolDefinition[] = [
  // Identity API
  {
    name: 'ebay_get_user',
    description: 'Get user identity information',
    inputSchema: {},
  },
  // Compliance API
  {
    name: 'ebay_get_listing_violations',
    description: 'Get listing violations for the seller',
    inputSchema: {
      complianceType: z.string().optional().describe('Type of compliance violation'),
      offset: z.number().optional().describe('Number of violations to skip'),
      limit: z.number().optional().describe('Number of violations to return'),
    },
  },
  {
    name: 'ebay_get_listing_violations_summary',
    description: 'Get summary of listing violations',
    inputSchema: {
      complianceType: z.string().optional().describe('Type of compliance violation'),
    },
  },
  {
    name: 'ebay_suppress_violation',
    description: 'Suppress a listing violation',
    inputSchema: {
      listingViolationId: z.string().describe('The violation ID to suppress'),
    },
  },
  // VERO API
  {
    name: 'ebay_report_infringement',
    description: 'Report intellectual property infringement',
    inputSchema: {
      infringementData: infringementDataSchema.describe('Infringement report details'),
    },
  },
  {
    name: 'ebay_get_reported_items',
    description: 'Get reported items',
    inputSchema: {
      filter: z.string().optional().describe('Filter criteria'),
      limit: z.number().optional().describe('Number of items to return'),
      offset: z.number().optional().describe('Number of items to skip'),
    },
  },
  // Translation API
  {
    name: 'ebay_translate',
    description: 'Translate listing text',
    inputSchema: {
      from: z.string().describe('Source language code'),
      to: z.string().describe('Target language code'),
      translationContext: z
        .string()
        .describe('Translation context (e.g., ITEM_TITLE, ITEM_DESCRIPTION)'),
      text: z.array(z.string()).describe('Array of text to translate'),
    },
  },
  // eDelivery API
  {
    name: 'ebay_create_shipping_quote',
    description: 'Create a shipping quote for international shipping',
    inputSchema: {
      shippingQuoteRequest: shippingQuoteRequestSchema.describe('Shipping quote request details'),
    },
  },
  {
    name: 'ebay_get_shipping_quote',
    description: 'Get a shipping quote by ID',
    inputSchema: {
      shippingQuoteId: z.string().describe('The shipping quote ID'),
    },
  },
];

export const claudeTools: ToolDefinition[] = [
  {
    name: 'SearchClaudeCodeDocs',
    description:
      'Search across the Claude Code Docs knowledge base to find relevant information, code examples, API references, and guides. Use this tool when you need to answer questions about Claude Code Docs, find specific documentation, understand how features work, or locate implementation details. The search returns contextual content with titles and direct links to the documentation pages.',
    inputSchema: {
      query: z.string().describe('A query to search the content with.'),
    },
  },
];
