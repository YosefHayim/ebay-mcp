# Account Management API

This directory contains the implementation of eBay's Sell Account API v1, which manages seller account configuration including fulfillment policies, payment policies, return policies, sales tax, subscriptions, and KYC verification.

## Implementation Status

✅ **COMPLETE** - All 25 OpenAPI endpoints implemented with 40 methods

## Files

- **`account.ts`** - Main AccountApi class with all account management methods

## API Coverage

### Business Policies (Fulfillment, Payment, Return, Custom)

#### Fulfillment Policies
- ✅ `createFulfillmentPolicy()` - Create a new fulfillment policy
- ✅ `getFulfillmentPolicies()` - Get all fulfillment policies
- ✅ `getFulfillmentPolicy(policyId)` - Get specific fulfillment policy
- ✅ `getFulfillmentPolicyByName(name)` - Get fulfillment policy by name
- ✅ `updateFulfillmentPolicy(policyId, policy)` - Update fulfillment policy
- ✅ `deleteFulfillmentPolicy(policyId)` - Delete fulfillment policy

#### Payment Policies
- ✅ `createPaymentPolicy()` - Create a new payment policy
- ✅ `getPaymentPolicies()` - Get all payment policies
- ✅ `getPaymentPolicy(policyId)` - Get specific payment policy
- ✅ `getPaymentPolicyByName(name)` - Get payment policy by name
- ✅ `updatePaymentPolicy(policyId, policy)` - Update payment policy
- ✅ `deletePaymentPolicy(policyId)` - Delete payment policy

#### Return Policies
- ✅ `createReturnPolicy()` - Create a new return policy
- ✅ `getReturnPolicies()` - Get all return policies
- ✅ `getReturnPolicy(policyId)` - Get specific return policy
- ✅ `getReturnPolicyByName(name)` - Get return policy by name
- ✅ `updateReturnPolicy(policyId, policy)` - Update return policy
- ✅ `deleteReturnPolicy(policyId)` - Delete return policy

#### Custom Policies (International)
- ✅ `createCustomPolicy()` - Create custom policy for international shipping
- ✅ `getCustomPolicies()` - Get all custom policies
- ✅ `getCustomPolicy(policyId)` - Get specific custom policy
- ✅ `updateCustomPolicy(policyId, policy)` - Update custom policy
- ✅ `deleteCustomPolicy(policyId)` - Delete custom policy

### Sales Tax Management
- ✅ `bulkCreateOrReplaceSalesTax()` - Bulk create/update sales tax for multiple jurisdictions
- ✅ `createOrReplaceSalesTax()` - Create or replace sales tax for jurisdiction
- ✅ `getSalesTaxes()` - Get all sales tax configurations
- ✅ `getSalesTax(countryCode, jurisdictionId)` - Get specific sales tax
- ✅ `deleteSalesTax(countryCode, jurisdictionId)` - Delete sales tax configuration

### Payments Program Management
- ✅ `getPaymentsProgramOnboarding()` - Get onboarding status for payments program
- ✅ `getPaymentsProgram()` - Get payments program details
- ✅ `getPaymentsProgramStatus()` - Get current status of payments program
- ✅ `optInToPaymentsProgram()` - Opt in to payments program

### Program Management (eBay Programs)
- ✅ `getOptedInPrograms()` - Get all programs seller is opted into
- ✅ `optInToProgram()` - Opt in to eBay program
- ✅ `optOutOfProgram()` - Opt out of eBay program

### Rate Tables
- ✅ `getRateTables()` - Get shipping rate tables

### Subscription Management
- ✅ `getSubscription()` - Get seller subscription information

### Account Verification
- ✅ `getKyc()` - Get Know Your Customer (KYC) verification status
- ✅ `getAdvertisingEligibility()` - Get advertising eligibility status

### Privileges
- ✅ `getPrivileges()` - Get selling privileges for the account

## OpenAPI Specification

Source: `docs/sell-apps/account-management/sell_account_v1_oas3.json`

## OAuth Scopes Required

- `https://api.ebay.com/oauth/api_scope/sell.account` - Read/write access to account settings
- `https://api.ebay.com/oauth/api_scope/sell.account.readonly` - Read-only access to account settings

## Usage Example

```typescript
import { EbaySellerApi } from '@/api/index.js';

const api = new EbaySellerApi(config);
await api.initialize();

// Create a fulfillment policy
const policy = await api.account.createFulfillmentPolicy({
  name: 'Standard Shipping',
  marketplaceId: 'EBAY_US',
  // ... policy details
});

// Get all return policies
const returnPolicies = await api.account.getReturnPolicies({
  marketplaceId: 'EBAY_US'
});

// Configure sales tax
await api.account.createOrReplaceSalesTax('US', 'CA', {
  salesTaxPercentage: 7.25
});
```

## Related Tools

All methods are exposed as MCP tools with the prefix `ebay_`:
- `ebay_create_fulfillment_policy`
- `ebay_get_fulfillment_policies`
- `ebay_create_payment_policy`
- `ebay_get_return_policies`
- `ebay_create_or_replace_sales_tax`
- And 35+ more account management tools...

See `src/tools/definitions/account.ts` for complete tool definitions.
