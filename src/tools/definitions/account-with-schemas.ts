/**
 * Example: Account Management Tools with Full Schema Integration
 *
 * This file demonstrates how to integrate the new Zod schemas
 * for both input and output validation with MCP tools.
 */

import { MarketplaceId } from '@/types/ebay-enums.js';
import { z } from 'zod';
import type { ToolDefinition } from './account.js';

// Import schemas from the new schemas folder
import {
  getCustomPoliciesInputSchema,
  customPolicyResponseSchema,
  getFulfillmentPoliciesInputSchema,
  getFulfillmentPoliciesOutputSchema,
  createFulfillmentPolicyInputSchema,
  createFulfillmentPolicyOutputSchema,
  fulfillmentPolicyResponseSchema,
  getPaymentPoliciesInputSchema,
  getPaymentPoliciesOutputSchema,
  createPaymentPolicyInputSchema,
  createPaymentPolicyOutputSchema,
  getReturnPoliciesInputSchema,
  getReturnPoliciesOutputSchema,
  createReturnPolicyInputSchema,
  createReturnPolicyOutputSchema,
  getSalesTaxesOutputSchema,
  salesTaxSchema,
  kycOutputSchema,
  privilegesOutputSchema,
  programsOutputSchema,
} from '@/schemas/account-management/account.js';

/**
 * Account Management Tools with Output Schema Validation
 *
 * These tool definitions include both inputSchema and outputSchema
 * for complete request/response validation.
 */
export const accountToolsWithSchemas: ToolDefinition[] = [
  // ============================================================================
  // Custom Policies
  // ============================================================================
  {
    name: 'ebay_get_custom_policies',
    description: 'Retrieve custom policies defined for the seller account',
    inputSchema: {
      policyTypes: getCustomPoliciesInputSchema.shape.policyTypes,
    },
  },

  // ============================================================================
  // Fulfillment Policies
  // ============================================================================
  {
    name: 'ebay_get_fulfillment_policies',
    description:
      'Get fulfillment policies for the seller.\n\nRequired OAuth Scope: sell.account.readonly or sell.account\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.account.readonly',
    inputSchema: {
      marketplaceId: getFulfillmentPoliciesInputSchema.shape.marketplaceId,
    },
  },
  {
    name: 'ebay_create_fulfillment_policy',
    description:
      'Create a new fulfillment policy.\n\nRequired OAuth Scope: sell.account\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.account',
    inputSchema: {
      policy: createFulfillmentPolicyInputSchema.shape.policy,
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
      policy: createFulfillmentPolicyInputSchema.shape.policy,
    },
  },
  {
    name: 'ebay_delete_fulfillment_policy',
    description: 'Delete a fulfillment policy',
    inputSchema: {
      fulfillmentPolicyId: z.string().describe('The fulfillment policy ID'),
    },
  },

  // ============================================================================
  // Payment Policies
  // ============================================================================
  {
    name: 'ebay_get_payment_policies',
    description: 'Get payment policies for the seller',
    inputSchema: {
      marketplaceId: getPaymentPoliciesInputSchema.shape.marketplaceId,
    },
  },
  {
    name: 'ebay_create_payment_policy',
    description: 'Create a new payment policy',
    inputSchema: {
      policy: createPaymentPolicyInputSchema.shape.policy,
    },
  },

  // ============================================================================
  // Return Policies
  // ============================================================================
  {
    name: 'ebay_get_return_policies',
    description: 'Get return policies for the seller',
    inputSchema: {
      marketplaceId: getReturnPoliciesInputSchema.shape.marketplaceId,
    },
  },
  {
    name: 'ebay_create_return_policy',
    description: 'Create a new return policy',
    inputSchema: {
      policy: createReturnPolicyInputSchema.shape.policy,
    },
  },

  // ============================================================================
  // Sales Tax
  // ============================================================================
  {
    name: 'ebay_get_sales_taxes',
    description: 'Get all sales tax tables for a country',
    inputSchema: {
      countryCode: z.string().describe('Required: Two-letter ISO 3166-1 country code'),
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

  // ============================================================================
  // KYC & Programs
  // ============================================================================
  {
    name: 'ebay_get_kyc',
    description: 'Get seller KYC (Know Your Customer) status',
    inputSchema: {},
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
];

/**
 * Example: Using the schemas for runtime validation
 *
 * ```typescript
 * import { accountToolsWithSchemas } from '@/tools/definitions/account-with-schemas';
 * import { EbaySellerApi } from '@/api';
 *
 * async function validateToolExecution() {
 *   const api = new EbaySellerApi();
 *   const tool = accountToolsWithSchemas.find(t => t.name === 'ebay_get_fulfillment_policies');
 *
 *   // Validate input
 *   const input = { marketplaceId: 'EBAY_US' };
 *   const validatedInput = tool.inputSchema.parse(input); // Throws if invalid
 *
 *   // Execute API call
 *   const response = await api.account.getFulfillmentPolicies(validatedInput.marketplaceId);
 *
 *   // Validate output
 *   const validatedOutput = tool.outputSchema?.parse(response); // Throws if invalid
 *
 *   return validatedOutput;
 * }
 * ```
 */
