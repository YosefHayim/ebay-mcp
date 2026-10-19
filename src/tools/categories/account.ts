import { Effect } from 'effect';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  bulkCreateOrReplaceSalesTaxInputSchema,
  createCustomPolicyInputSchema,
  createCustomPolicyOutputSchema,
  createFulfillmentPolicyInputSchema,
  createFulfillmentPolicyOutputSchema,
  createOrReplaceSalesTaxInputSchema,
  createPaymentPolicyInputSchema,
  createPaymentPolicyOutputSchema,
  createReturnPolicyInputSchema,
  createReturnPolicyOutputSchema,
  customPolicyResponseSchema,
  deleteFulfillmentPolicyInputSchema,
  deletePaymentPolicyInputSchema,
  deleteReturnPolicyInputSchema,
  deleteSalesTaxInputSchema,
  fulfillmentPolicyResponseSchema,
  getAdvertisingEligibilityInputSchema,
  getCustomPoliciesInputSchema,
  getCustomPolicyInputSchema,
  getFulfillmentPoliciesInputSchema,
  getFulfillmentPoliciesOutputSchema,
  getFulfillmentPolicyByNameInputSchema,
  getFulfillmentPolicyInputSchema,
  getPaymentPoliciesInputSchema,
  getPaymentPoliciesOutputSchema,
  getPaymentPolicyByNameInputSchema,
  getPaymentPolicyInputSchema,
  getKYCInputSchema,
  getOptedInProgramsInputSchema,
  getPaymentsProgramInputSchema,
  getPaymentsProgramOnboardingInputSchema,
  getPrivilegesInputSchema,
  getRateTablesInputSchema,
  getReturnPoliciesInputSchema,
  getReturnPoliciesOutputSchema,
  getReturnPolicyByNameInputSchema,
  getReturnPolicyInputSchema,
  getSalesTaxesInputSchema,
  getSalesTaxesOutputSchema,
  getSalesTaxInputSchema,
  getSubscriptionInputSchema,
  kycOutputSchema,
  optInToProgramInputSchema,
  optOutOfProgramInputSchema,
  paymentPolicyResponseSchema,
  privilegesOutputSchema,
  programsOutputSchema,
  returnPolicyResponseSchema,
  salesTaxSchema,
  updateCustomPolicyInputSchema,
  updateFulfillmentPolicyInputSchema,
  updatePaymentPolicyInputSchema,
  updateReturnPolicyInputSchema,
} from '@/schemas/account-management/account.js';
import { defineTool } from '@/tools/defineTool.js';
import type { OutputArgs } from '@/tools/types.js';
import type { ToolEntry } from '@/tools/registry.js';

const emptyResponseSchema: OutputArgs = {
  type: 'object',
  properties: {},
  description: 'Empty response on successful operation',
};

/** Account Management API tools for seller policies, tax, KYC, privileges, and programs. */
export const accountEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_custom_policies',
    description: 'Retrieve custom policies defined for the seller account',
    inputSchema: getCustomPoliciesInputSchema.shape,
    outputSchema: zodToJsonSchema(customPolicyResponseSchema, {
      name: 'CustomPoliciesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getCustomPolicies(args)),
  }),
  defineTool({
    name: 'ebay_create_custom_policy',
    description: 'Create a new custom policy',
    inputSchema: createCustomPolicyInputSchema.shape,
    outputSchema: zodToJsonSchema(createCustomPolicyOutputSchema, {
      name: 'CreateCustomPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.account.createCustomPolicy(args)),
  }),
  defineTool({
    name: 'ebay_get_custom_policy',
    description: 'Get a specific custom policy by ID',
    inputSchema: getCustomPolicyInputSchema.shape,
    outputSchema: zodToJsonSchema(createCustomPolicyOutputSchema, {
      name: 'CustomPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getCustomPolicy(args)),
  }),
  defineTool({
    name: 'ebay_update_custom_policy',
    description: 'Update an existing custom policy',
    inputSchema: updateCustomPolicyInputSchema.shape,
    outputSchema: emptyResponseSchema,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.account.updateCustomPolicy(args)),
  }),
  defineTool({
    name: 'ebay_get_fulfillment_policies',
    description:
      'Get fulfillment policies for the seller.\n\nRequired OAuth Scope: sell.account.readonly or sell.account\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.account.readonly',
    inputSchema: getFulfillmentPoliciesInputSchema.shape,
    outputSchema: zodToJsonSchema(getFulfillmentPoliciesOutputSchema, {
      name: 'FulfillmentPoliciesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getFulfillmentPolicies(args)),
  }),
  defineTool({
    name: 'ebay_create_fulfillment_policy',
    description:
      'Create a new fulfillment policy.\n\n' +
      'shippingServiceCode must be a marketplace-valid eBay service enum (not a free-form carrier nickname). ' +
      'Invalid codes return "Please select a valid shipping service". eBay may cite DomesticItemShippingService[0] ' +
      'and [1] for a single bad entry — that is remote validation, not client array duplication. ' +
      'Discover valid codes via Trading GeteBayDetails (ShippingServiceDetails). ' +
      'Known-good EBAY_US FLAT_RATE sketch: policy.name, policy.marketplaceId=EBAY_US, ' +
      'policy.categoryTypes=[{name:ALL_EXCLUDING_MOTORS_VEHICLES}], policy.handlingTime={unit:DAY,value:1}, ' +
      'policy.shippingOptions=[{costType:FLAT_RATE,optionType:DOMESTIC,shippingServices:[{shippingServiceCode:USPSPriority,shippingCost:{currency:USD,value:"5.99"}}]}]. ' +
      'Avoid invented codes like USPSPriorityMail. Sandbox may accept a smaller code set than production.\n\n' +
      'Required OAuth Scope: sell.account\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.account',
    inputSchema: createFulfillmentPolicyInputSchema.shape,
    outputSchema: zodToJsonSchema(createFulfillmentPolicyOutputSchema, {
      name: 'CreateFulfillmentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.account.createFulfillmentPolicy(args)),
  }),
  defineTool({
    name: 'ebay_get_fulfillment_policy',
    description: 'Get a specific fulfillment policy by ID',
    inputSchema: getFulfillmentPolicyInputSchema.shape,
    outputSchema: zodToJsonSchema(fulfillmentPolicyResponseSchema, {
      name: 'FulfillmentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getFulfillmentPolicy(args)),
  }),
  defineTool({
    name: 'ebay_get_fulfillment_policy_by_name',
    description: 'Get a fulfillment policy by name',
    inputSchema: getFulfillmentPolicyByNameInputSchema.shape,
    outputSchema: zodToJsonSchema(fulfillmentPolicyResponseSchema, {
      name: 'FulfillmentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getFulfillmentPolicyByName(args)),
  }),
  defineTool({
    name: 'ebay_update_fulfillment_policy',
    description:
      'Update an existing fulfillment policy.\n\nRequired OAuth Scope: sell.account\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.account',
    inputSchema: updateFulfillmentPolicyInputSchema.shape,
    outputSchema: zodToJsonSchema(createFulfillmentPolicyOutputSchema, {
      name: 'UpdateFulfillmentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.account.updateFulfillmentPolicy(args)),
  }),
  defineTool({
    name: 'ebay_delete_fulfillment_policy',
    description: 'Delete a fulfillment policy',
    inputSchema: deleteFulfillmentPolicyInputSchema.shape,
    outputSchema: emptyResponseSchema,
    annotations: { readOnlyHint: false, destructiveHint: true },
    handler: (api, args) => Effect.runPromise(api.account.deleteFulfillmentPolicy(args)),
  }),
  defineTool({
    name: 'ebay_get_payment_policies',
    description: 'Get payment policies for the seller',
    inputSchema: getPaymentPoliciesInputSchema.shape,
    outputSchema: zodToJsonSchema(getPaymentPoliciesOutputSchema, {
      name: 'PaymentPoliciesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getPaymentPolicies(args)),
  }),
  defineTool({
    name: 'ebay_create_payment_policy',
    description: 'Create a new payment policy',
    inputSchema: createPaymentPolicyInputSchema.shape,
    outputSchema: zodToJsonSchema(createPaymentPolicyOutputSchema, {
      name: 'CreatePaymentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.account.createPaymentPolicy(args)),
  }),
  defineTool({
    name: 'ebay_get_payment_policy',
    description: 'Get a specific payment policy by ID',
    inputSchema: getPaymentPolicyInputSchema.shape,
    outputSchema: zodToJsonSchema(paymentPolicyResponseSchema, {
      name: 'PaymentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getPaymentPolicy(args)),
  }),
  defineTool({
    name: 'ebay_get_payment_policy_by_name',
    description: 'Get a payment policy by name',
    inputSchema: getPaymentPolicyByNameInputSchema.shape,
    outputSchema: zodToJsonSchema(paymentPolicyResponseSchema, {
      name: 'PaymentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getPaymentPolicyByName(args)),
  }),
  defineTool({
    name: 'ebay_update_payment_policy',
    description: 'Update an existing payment policy',
    inputSchema: updatePaymentPolicyInputSchema.shape,
    outputSchema: zodToJsonSchema(createPaymentPolicyOutputSchema, {
      name: 'UpdatePaymentPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.account.updatePaymentPolicy(args)),
  }),
  defineTool({
    name: 'ebay_delete_payment_policy',
    description: 'Delete a payment policy',
    inputSchema: deletePaymentPolicyInputSchema.shape,
    outputSchema: emptyResponseSchema,
    annotations: { readOnlyHint: false, destructiveHint: true },
    handler: (api, args) => Effect.runPromise(api.account.deletePaymentPolicy(args)),
  }),
  defineTool({
    name: 'ebay_get_return_policies',
    description: 'Get return policies for the seller',
    inputSchema: getReturnPoliciesInputSchema.shape,
    outputSchema: zodToJsonSchema(getReturnPoliciesOutputSchema, {
      name: 'ReturnPoliciesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getReturnPolicies(args)),
  }),
  defineTool({
    name: 'ebay_create_return_policy',
    description: 'Create a new return policy',
    inputSchema: createReturnPolicyInputSchema.shape,
    outputSchema: zodToJsonSchema(createReturnPolicyOutputSchema, {
      name: 'CreateReturnPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.account.createReturnPolicy(args)),
  }),
  defineTool({
    name: 'ebay_get_return_policy',
    description: 'Get a specific return policy by ID',
    inputSchema: getReturnPolicyInputSchema.shape,
    outputSchema: zodToJsonSchema(returnPolicyResponseSchema, {
      name: 'ReturnPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getReturnPolicy(args)),
  }),
  defineTool({
    name: 'ebay_get_return_policy_by_name',
    description: 'Get a return policy by name',
    inputSchema: getReturnPolicyByNameInputSchema.shape,
    outputSchema: zodToJsonSchema(returnPolicyResponseSchema, {
      name: 'ReturnPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getReturnPolicyByName(args)),
  }),
  defineTool({
    name: 'ebay_update_return_policy',
    description: 'Update an existing return policy',
    inputSchema: updateReturnPolicyInputSchema.shape,
    outputSchema: zodToJsonSchema(createReturnPolicyOutputSchema, {
      name: 'UpdateReturnPolicyResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.account.updateReturnPolicy(args)),
  }),
  defineTool({
    name: 'ebay_delete_return_policy',
    description: 'Delete a return policy',
    inputSchema: deleteReturnPolicyInputSchema.shape,
    outputSchema: emptyResponseSchema,
    annotations: { readOnlyHint: false, destructiveHint: true },
    handler: (api, args) => Effect.runPromise(api.account.deleteReturnPolicy(args)),
  }),
  defineTool({
    name: 'ebay_get_kyc',
    description: 'Get seller KYC (Know Your Customer) status',
    inputSchema: getKYCInputSchema.shape,
    outputSchema: zodToJsonSchema(kycOutputSchema, {
      name: 'KYCResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getKYC(args)),
  }),
  defineTool({
    name: 'ebay_get_payments_program',
    description:
      'Get payments program status for a marketplace. Note: This method is deprecated as all seller accounts globally have been enabled for the new eBay payment and checkout flow.\n\nRequired OAuth Scope: sell.account.readonly or sell.account',
    inputSchema: getPaymentsProgramInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getPaymentsProgram(args)),
  }),
  defineTool({
    name: 'ebay_get_payments_program_onboarding',
    description:
      'Get payments program onboarding information. Note: This method is deprecated as all seller accounts globally have been enabled for the new eBay payment and checkout flow.\n\nRequired OAuth Scope: sell.account.readonly or sell.account',
    inputSchema: getPaymentsProgramOnboardingInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getPaymentsProgramOnboarding(args)),
  }),
  defineTool({
    name: 'ebay_get_rate_tables',
    description: 'Get seller rate tables',
    inputSchema: getRateTablesInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getRateTables(args)),
  }),
  defineTool({
    name: 'ebay_create_or_replace_sales_tax',
    description: 'Create or replace sales tax table for a jurisdiction',
    inputSchema: createOrReplaceSalesTaxInputSchema.shape,
    outputSchema: emptyResponseSchema,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.account.createOrReplaceSalesTax(args)),
  }),
  defineTool({
    name: 'ebay_bulk_create_or_replace_sales_tax',
    description: 'Bulk create or replace sales tax tables',
    inputSchema: bulkCreateOrReplaceSalesTaxInputSchema.shape,
    outputSchema: emptyResponseSchema,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.account.bulkCreateOrReplaceSalesTax(args)),
  }),
  defineTool({
    name: 'ebay_delete_sales_tax',
    description: 'Delete sales tax table for a jurisdiction',
    inputSchema: deleteSalesTaxInputSchema.shape,
    outputSchema: emptyResponseSchema,
    annotations: { readOnlyHint: false, destructiveHint: true },
    handler: (api, args) => Effect.runPromise(api.account.deleteSalesTax(args)),
  }),
  defineTool({
    name: 'ebay_get_sales_tax',
    description: 'Get sales tax table for a jurisdiction',
    inputSchema: getSalesTaxInputSchema.shape,
    outputSchema: zodToJsonSchema(salesTaxSchema, {
      name: 'SalesTaxResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getSalesTax(args)),
  }),
  defineTool({
    name: 'ebay_get_sales_taxes',
    description: 'Get all sales tax tables for a country',
    inputSchema: getSalesTaxesInputSchema.shape,
    outputSchema: zodToJsonSchema(getSalesTaxesOutputSchema, {
      name: 'GetSalesTaxesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getSalesTaxes(args)),
  }),
  defineTool({
    name: 'ebay_get_subscription',
    description: 'Get seller subscription information',
    inputSchema: getSubscriptionInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getSubscription(args)),
  }),
  defineTool({
    name: 'ebay_opt_in_to_program',
    description: 'Opt-in to a seller program',
    inputSchema: optInToProgramInputSchema.shape,
    outputSchema: emptyResponseSchema,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.account.optInToProgram(args)),
  }),
  defineTool({
    name: 'ebay_opt_out_of_program',
    description: 'Opt-out of a seller program',
    inputSchema: optOutOfProgramInputSchema.shape,
    outputSchema: emptyResponseSchema,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.account.optOutOfProgram(args)),
  }),
  defineTool({
    name: 'ebay_get_opted_in_programs',
    description: 'Get seller programs the account is opted into',
    inputSchema: getOptedInProgramsInputSchema.shape,
    outputSchema: zodToJsonSchema(programsOutputSchema, {
      name: 'ProgramsResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getOptedInPrograms(args)),
  }),
  defineTool({
    name: 'ebay_get_privileges',
    description:
      "Get seller's current set of privileges, including whether or not the seller's eBay registration has been completed, as well as the details of their site-wide sellingLimit (the maximum dollar value and quantity of items a seller can sell per day).\n\nRequired OAuth Scope: sell.account.readonly or sell.account",
    inputSchema: getPrivilegesInputSchema.shape,
    outputSchema: zodToJsonSchema(privilegesOutputSchema, {
      name: 'PrivilegesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getPrivileges(args)),
  }),
  defineTool({
    name: 'ebay_get_advertising_eligibility',
    description:
      'Check the seller eligibility status for eBay advertising programs. This allows developers to determine if a seller is eligible for various advertising programs on eBay.\n\nRequired OAuth Scope: sell.account.readonly or sell.account',
    inputSchema: getAdvertisingEligibilityInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.account.getAdvertisingEligibility(args)),
  }),
];
