import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { MarketplaceId } from '@/types/ebay-enums.js';
import { defineTool } from '@/tools/define-tool.js';
import type { OutputArgs } from '@/tools/definitions/types.js';
import type { ToolEntry } from '@/tools/registry.js';
import {
  bulkSalesTaxRequestSchema,
  customPolicySchema,
  fulfillmentPolicySchema,
  paymentPolicySchema,
  programRequestSchema,
  returnPolicySchema,
  salesTaxBaseSchema,
} from '@/tools/schemas.js';
import {
  customPolicyResponseSchema,
  getFulfillmentPoliciesOutputSchema,
  createFulfillmentPolicyOutputSchema,
  fulfillmentPolicyResponseSchema,
  getPaymentPoliciesOutputSchema,
  createPaymentPolicyOutputSchema,
  paymentPolicyResponseSchema,
  getReturnPoliciesOutputSchema,
  createReturnPolicyOutputSchema,
  returnPolicyResponseSchema,
  createCustomPolicyOutputSchema,
  getSalesTaxesOutputSchema,
  salesTaxSchema,
  kycOutputSchema,
  privilegesOutputSchema,
  programsOutputSchema,
} from '@/schemas/account-management/account.js';

/** Account Management API tools for seller policies, tax, KYC, privileges, and programs. */
export const accountEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_custom_policies',
    description: 'Retrieve custom policies defined for the seller account',
    inputSchema: {
      policyTypes: z
        .string()
        .optional()
        .describe('Comma-delimited list of policy types to retrieve'),
    },
    outputSchema: zodToJsonSchema(customPolicyResponseSchema, {
      name: 'CustomPoliciesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getCustomPolicies(args.policyTypes),
  }),
  defineTool({
    name: 'ebay_get_fulfillment_policies',
    description:
      'Get fulfillment policies for the seller.\n\nRequired OAuth Scope: sell.account.readonly or sell.account\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.account.readonly',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Required: eBay marketplace ID'),
    },
    outputSchema: zodToJsonSchema(getFulfillmentPoliciesOutputSchema, {
      name: 'FulfillmentPoliciesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getFulfillmentPolicies(args.marketplaceId),
  }),
  defineTool({
    name: 'ebay_get_payment_policies',
    description: 'Get payment policies for the seller',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Required: eBay marketplace ID'),
    },
    outputSchema: zodToJsonSchema(getPaymentPoliciesOutputSchema, {
      name: 'PaymentPoliciesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getPaymentPolicies(args.marketplaceId),
  }),
  defineTool({
    name: 'ebay_get_return_policies',
    description: 'Get return policies for the seller',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Required: eBay marketplace ID'),
    },
    outputSchema: zodToJsonSchema(getReturnPoliciesOutputSchema, {
      name: 'ReturnPoliciesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getReturnPolicies(args.marketplaceId),
  }),
  // Fulfillment Policy CRUD
  defineTool({
    name: 'ebay_create_fulfillment_policy',
    description:
      'Create a new fulfillment policy.\n\nRequired OAuth Scope: sell.account\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.account',
    inputSchema: {
      policy: fulfillmentPolicySchema.describe('Fulfillment policy details'),
    },
    outputSchema: zodToJsonSchema(createFulfillmentPolicyOutputSchema, {
      name: 'CreateFulfillmentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.createFulfillmentPolicy(args.policy),
  }),
  defineTool({
    name: 'ebay_get_fulfillment_policy',
    description: 'Get a specific fulfillment policy by ID',
    inputSchema: {
      fulfillmentPolicyId: z.string().describe('The fulfillment policy ID'),
    },
    outputSchema: zodToJsonSchema(fulfillmentPolicyResponseSchema, {
      name: 'FulfillmentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getFulfillmentPolicy(args.fulfillmentPolicyId),
  }),
  defineTool({
    name: 'ebay_get_fulfillment_policy_by_name',
    description: 'Get a fulfillment policy by name',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
      name: z.string().describe('Policy name'),
    },
    outputSchema: zodToJsonSchema(fulfillmentPolicyResponseSchema, {
      name: 'FulfillmentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getFulfillmentPolicyByName(args.marketplaceId, args.name),
  }),
  defineTool({
    name: 'ebay_update_fulfillment_policy',
    description: 'Update an existing fulfillment policy',
    inputSchema: {
      fulfillmentPolicyId: z.string().describe('The fulfillment policy ID'),
      policy: fulfillmentPolicySchema.describe('Updated fulfillment policy details'),
    },
    outputSchema: zodToJsonSchema(createFulfillmentPolicyOutputSchema, {
      name: 'UpdateFulfillmentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) =>
      api.account.updateFulfillmentPolicy(args.fulfillmentPolicyId, args.policy),
  }),
  defineTool({
    name: 'ebay_delete_fulfillment_policy',
    description: 'Delete a fulfillment policy',
    inputSchema: {
      fulfillmentPolicyId: z.string().describe('The fulfillment policy ID'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful deletion (HTTP 204)',
    },
    handler: (api, args) => api.account.deleteFulfillmentPolicy(args.fulfillmentPolicyId),
  }),
  // Payment Policy CRUD
  defineTool({
    name: 'ebay_create_payment_policy',
    description: 'Create a new payment policy',
    inputSchema: {
      policy: paymentPolicySchema.describe('Payment policy details'),
    },
    outputSchema: zodToJsonSchema(createPaymentPolicyOutputSchema, {
      name: 'CreatePaymentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.createPaymentPolicy(args.policy),
  }),
  defineTool({
    name: 'ebay_get_payment_policy',
    description: 'Get a specific payment policy by ID',
    inputSchema: {
      paymentPolicyId: z.string().describe('The payment policy ID'),
    },
    outputSchema: zodToJsonSchema(paymentPolicyResponseSchema, {
      name: 'PaymentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getPaymentPolicy(args.paymentPolicyId),
  }),
  defineTool({
    name: 'ebay_get_payment_policy_by_name',
    description: 'Get a payment policy by name',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
      name: z.string().describe('Policy name'),
    },
    outputSchema: zodToJsonSchema(paymentPolicyResponseSchema, {
      name: 'PaymentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getPaymentPolicyByName(args.marketplaceId, args.name),
  }),
  defineTool({
    name: 'ebay_update_payment_policy',
    description: 'Update an existing payment policy',
    inputSchema: {
      paymentPolicyId: z.string().describe('The payment policy ID'),
      policy: paymentPolicySchema.describe('Updated payment policy details'),
    },
    outputSchema: zodToJsonSchema(createPaymentPolicyOutputSchema, {
      name: 'UpdatePaymentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.updatePaymentPolicy(args.paymentPolicyId, args.policy),
  }),
  defineTool({
    name: 'ebay_delete_payment_policy',
    description: 'Delete a payment policy',
    inputSchema: {
      paymentPolicyId: z.string().describe('The payment policy ID'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful deletion (HTTP 204)',
    },
    handler: (api, args) => api.account.deletePaymentPolicy(args.paymentPolicyId),
  }),
  // Return Policy CRUD
  defineTool({
    name: 'ebay_create_return_policy',
    description: 'Create a new return policy',
    inputSchema: {
      policy: returnPolicySchema.describe('Return policy details'),
    },
    outputSchema: zodToJsonSchema(createReturnPolicyOutputSchema, {
      name: 'CreateReturnPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.createReturnPolicy(args.policy),
  }),
  defineTool({
    name: 'ebay_get_return_policy',
    description: 'Get a specific return policy by ID',
    inputSchema: {
      returnPolicyId: z.string().describe('The return policy ID'),
    },
    outputSchema: zodToJsonSchema(returnPolicyResponseSchema, {
      name: 'ReturnPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getReturnPolicy(args.returnPolicyId),
  }),
  defineTool({
    name: 'ebay_get_return_policy_by_name',
    description: 'Get a return policy by name',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
      name: z.string().describe('Policy name'),
    },
    outputSchema: zodToJsonSchema(returnPolicyResponseSchema, {
      name: 'ReturnPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getReturnPolicyByName(args.marketplaceId, args.name),
  }),
  defineTool({
    name: 'ebay_update_return_policy',
    description: 'Update an existing return policy',
    inputSchema: {
      returnPolicyId: z.string().describe('The return policy ID'),
      policy: returnPolicySchema.describe('Updated return policy details'),
    },
    outputSchema: zodToJsonSchema(createReturnPolicyOutputSchema, {
      name: 'UpdateReturnPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.updateReturnPolicy(args.returnPolicyId, args.policy),
  }),
  defineTool({
    name: 'ebay_delete_return_policy',
    description: 'Delete a return policy',
    inputSchema: {
      returnPolicyId: z.string().describe('The return policy ID'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful deletion (HTTP 204)',
    },
    handler: (api, args) => api.account.deleteReturnPolicy(args.returnPolicyId),
  }),
  // Custom Policy CRUD
  defineTool({
    name: 'ebay_create_custom_policy',
    description: 'Create a new custom policy',
    inputSchema: {
      policy: customPolicySchema.describe('Custom policy details'),
    },
    outputSchema: zodToJsonSchema(createCustomPolicyOutputSchema, {
      name: 'CreateCustomPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.createCustomPolicy(args.policy),
  }),
  defineTool({
    name: 'ebay_get_custom_policy',
    description: 'Get a specific custom policy by ID',
    inputSchema: {
      customPolicyId: z.string().describe('The custom policy ID'),
    },
    outputSchema: zodToJsonSchema(createCustomPolicyOutputSchema, {
      name: 'CustomPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getCustomPolicy(args.customPolicyId),
  }),
  defineTool({
    name: 'ebay_update_custom_policy',
    description: 'Update an existing custom policy',
    inputSchema: {
      customPolicyId: z.string().describe('The custom policy ID'),
      policy: customPolicySchema.describe('Updated custom policy details'),
    },
    outputSchema: zodToJsonSchema(createCustomPolicyOutputSchema, {
      name: 'UpdateCustomPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.updateCustomPolicy(args.customPolicyId, args.policy),
  }),
  defineTool({
    name: 'ebay_delete_custom_policy',
    description: 'Delete a custom policy',
    inputSchema: {
      customPolicyId: z.string().describe('The custom policy ID'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful deletion (HTTP 204)',
    },
    handler: (api, args) => api.account.deleteCustomPolicy(args.customPolicyId),
  }),
  // KYC, Payments, Programs, Sales Tax, Subscription
  defineTool({
    name: 'ebay_get_kyc',
    description: 'Get seller KYC (Know Your Customer) status',
    inputSchema: {},
    outputSchema: zodToJsonSchema(kycOutputSchema, {
      name: 'KYCResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api) => api.account.getKyc(),
  }),
  defineTool({
    name: 'ebay_opt_in_to_payments_program',
    description: 'Opt-in to a payments program',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
      paymentsProgramType: z.string().describe('Payments program type'),
    },
    handler: (api, args) =>
      api.account.optInToPaymentsProgram(args.marketplaceId, args.paymentsProgramType),
  }),
  defineTool({
    name: 'ebay_get_payments_program_status',
    description: 'Get payments program status',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
      paymentsProgramType: z.string().describe('Payments program type'),
    },
    handler: (api, args) =>
      api.account.getPaymentsProgramStatus(args.marketplaceId, args.paymentsProgramType),
  }),
  defineTool({
    name: 'ebay_get_rate_tables',
    description: 'Get seller rate tables',
    inputSchema: {},
    handler: (api) => api.account.getRateTables(),
  }),
  defineTool({
    name: 'ebay_create_or_replace_sales_tax',
    description: 'Create or replace sales tax table for a jurisdiction',
    inputSchema: {
      countryCode: z.string().describe('Two-letter ISO 3166 country code'),
      jurisdictionId: z.string().describe('Tax jurisdiction ID'),
      salesTaxBase: salesTaxBaseSchema.describe('Sales tax details'),
    },
    handler: (api, args) =>
      api.account.createOrReplaceSalesTax(args.countryCode, args.jurisdictionId, args.salesTaxBase),
  }),
  defineTool({
    name: 'ebay_bulk_create_or_replace_sales_tax',
    description: 'Bulk create or replace sales tax tables',
    inputSchema: {
      requests: bulkSalesTaxRequestSchema.shape.requests.describe('Array of sales tax requests'),
    },
    handler: (api, args) => api.account.bulkCreateOrReplaceSalesTax(args.requests),
  }),
  defineTool({
    name: 'ebay_delete_sales_tax',
    description: 'Delete sales tax table for a jurisdiction',
    inputSchema: {
      countryCode: z.string().describe('Two-letter ISO 3166 country code'),
      jurisdictionId: z.string().describe('Tax jurisdiction ID'),
    },
    handler: (api, args) => api.account.deleteSalesTax(args.countryCode, args.jurisdictionId),
  }),
  defineTool({
    name: 'ebay_get_sales_tax',
    description: 'Get sales tax table for a jurisdiction',
    inputSchema: {
      countryCode: z.string().describe('Two-letter ISO 3166 country code'),
      jurisdictionId: z.string().describe('Tax jurisdiction ID'),
    },
    outputSchema: zodToJsonSchema(salesTaxSchema, {
      name: 'SalesTaxResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getSalesTax(args.countryCode, args.jurisdictionId),
  }),
  defineTool({
    name: 'ebay_get_sales_taxes',
    description: 'Get all sales tax tables for a country',
    inputSchema: {
      countryCode: z.string().describe('Required: Two-letter ISO 3166-1 country code'),
    },
    outputSchema: zodToJsonSchema(getSalesTaxesOutputSchema, {
      name: 'GetSalesTaxesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => api.account.getSalesTaxes(args.countryCode),
  }),
  defineTool({
    name: 'ebay_get_subscription',
    description: 'Get seller subscription information',
    inputSchema: {
      limitType: z.string().optional().describe('Optional limit type filter'),
    },
    handler: (api, args) => api.account.getSubscription(args.limitType),
  }),
  defineTool({
    name: 'ebay_opt_in_to_program',
    description: 'Opt-in to a seller program',
    inputSchema: {
      request: programRequestSchema.describe('Program opt-in request'),
    },
    handler: (api, args) => api.account.optInToProgram(args.request),
  }),
  defineTool({
    name: 'ebay_opt_out_of_program',
    description: 'Opt-out of a seller program',
    inputSchema: {
      request: programRequestSchema.describe('Program opt-out request'),
    },
    handler: (api, args) => api.account.optOutOfProgram(args.request),
  }),
  defineTool({
    name: 'ebay_get_opted_in_programs',
    description: 'Get seller programs the account is opted into',
    inputSchema: {},
    outputSchema: zodToJsonSchema(programsOutputSchema, {
      name: 'ProgramsResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api) => api.account.getOptedInPrograms(),
  }),
  defineTool({
    name: 'ebay_get_privileges',
    description:
      "Get seller's current set of privileges, including whether or not the seller's eBay registration has been completed, as well as the details of their site-wide sellingLimit (the maximum dollar value and quantity of items a seller can sell per day).\n\nRequired OAuth Scope: sell.account.readonly or sell.account",
    inputSchema: {},
    outputSchema: zodToJsonSchema(privilegesOutputSchema, {
      name: 'PrivilegesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api) => api.account.getPrivileges(),
  }),
  defineTool({
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
    handler: (api, args) =>
      api.account.getAdvertisingEligibility(args.marketplaceId, args.programTypes),
  }),
  defineTool({
    name: 'ebay_get_payments_program',
    description:
      'Get payments program status for a marketplace. Note: This method is deprecated as all seller accounts globally have been enabled for the new eBay payment and checkout flow.\n\nRequired OAuth Scope: sell.account.readonly or sell.account',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('The eBay marketplace ID'),
      paymentsProgramType: z
        .string()
        .describe('The type of payments program (e.g., EBAY_PAYMENTS)'),
    },
    handler: (api, args) =>
      api.account.getPaymentsProgram(args.marketplaceId, args.paymentsProgramType),
  }),
  defineTool({
    name: 'ebay_get_payments_program_onboarding',
    description:
      'Get payments program onboarding information. Note: This method is deprecated as all seller accounts globally have been enabled for the new eBay payment and checkout flow.\n\nRequired OAuth Scope: sell.account.readonly or sell.account',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('The eBay marketplace ID'),
      paymentsProgramType: z
        .string()
        .describe('The type of payments program (e.g., EBAY_PAYMENTS)'),
    },
    handler: (api, args) =>
      api.account.getPaymentsProgramOnboarding(args.marketplaceId, args.paymentsProgramType),
  }),
];
