import { MarketplaceId } from '@/types/ebay-enums.js';
import { z } from 'zod';
import {
  bulkSalesTaxRequestSchema,
  customPolicySchema,
  fulfillmentPolicySchema,
  paymentPolicySchema,
  programRequestSchema,
  returnPolicySchema,
  salesTaxBaseSchema,
} from '../schemas.js';

export interface OutputArgs {
  [x: string]: unknown;
  type: 'object';
  properties?: Record<string, object>;
  required?: string[];
}

export interface ToolAnnotations {
  [x: string]: unknown;
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
  title?: string;
  outputSchema?: OutputArgs;
  annotations?: ToolAnnotations;
  _meta?: Record<string, unknown>;
}
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
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Required: eBay marketplace ID'),
    },
  },
  {
    name: 'ebay_get_payment_policies',
    description: 'Get payment policies for the seller',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Required: eBay marketplace ID'),
    },
  },
  {
    name: 'ebay_get_return_policies',
    description: 'Get return policies for the seller',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Required: eBay marketplace ID'),
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
    description: 'Get all sales tax tables for a country',
    inputSchema: {
      countryCode: z.string().describe('Required: Two-letter ISO 3166-1 country code'),
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
  {
    name: 'ebay_get_privileges',
    description:
      "Get seller's current set of privileges, including whether or not the seller's eBay registration has been completed, as well as the details of their site-wide sellingLimit (the maximum dollar value and quantity of items a seller can sell per day).\n\nRequired OAuth Scope: sell.account.readonly or sell.account",
    inputSchema: {},
  },
  {
    name: 'ebay_get_advertising_eligibility',
    description:
      'Check the seller eligibility status for eBay advertising programs. This allows developers to determine if a seller is eligible for various advertising programs on eBay.\n\nRequired OAuth Scope: sell.account.readonly or sell.account',
    inputSchema: {
      marketplaceId: z
        .nativeEnum(MarketplaceId)
        .describe('eBay marketplace ID to check eligibility for'),
      programTypes: z
        .string()
        .optional()
        .describe('Optional comma-separated list of program types to check eligibility for'),
    },
  },
  {
    name: 'ebay_get_payments_program',
    description:
      'Get payments program status for a marketplace. Note: This method is deprecated as all seller accounts globally have been enabled for the new eBay payment and checkout flow.\n\nRequired OAuth Scope: sell.account.readonly or sell.account',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('The eBay marketplace ID'),
      paymentsProgramType: z
        .string()
        .describe('The type of payments program (e.g., EBAY_PAYMENTS)'),
    },
  },
  {
    name: 'ebay_get_payments_program_onboarding',
    description:
      'Get payments program onboarding information. Note: This method is deprecated as all seller accounts globally have been enabled for the new eBay payment and checkout flow.\n\nRequired OAuth Scope: sell.account.readonly or sell.account',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('The eBay marketplace ID'),
      paymentsProgramType: z
        .string()
        .describe('The type of payments program (e.g., EBAY_PAYMENTS)'),
    },
  },
];
