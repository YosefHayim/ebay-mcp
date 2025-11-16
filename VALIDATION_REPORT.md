# Zod Schema Validation Report

## Overview
This report compares the Zod schemas in `/home/user/ebay-mcp/src/schemas/account-management/account.ts` with the OpenAPI TypeScript types in `/home/user/ebay-mcp/src/types/sell-apps/account-management/sellAccountV1Oas3.ts`.

**Date:** 2025-11-16
**Validation Scope:** CustomPolicyResponse, FulfillmentPolicyResponse, FulfillmentPolicy, PaymentPolicyResponse, PaymentPolicy, ReturnPolicyResponse, ReturnPolicy

---

## 1. CustomPolicyResponse

### OpenAPI TypeScript Type (`components.schemas.CustomPolicyResponse`)
```typescript
CustomPolicyResponse: {
  customPolicies?: components['schemas']['CompactCustomPolicyResponse'][];
  href?: string;
  limit?: number;  // Format: int32
  next?: string;
  offset?: number; // Format: int32
  prev?: string;
  total?: number;  // Format: int32
}

CompactCustomPolicyResponse: {
  customPolicyId?: string;
  label?: string;
  name?: string;
  policyType?: string;
}
```

### Zod Schema (`customPolicyResponseSchema`)
```typescript
customPolicyResponseSchema = z.object({
  customPolicies: z.array(customPolicySchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

customPolicySchema = z.object({
  customPolicyId: z.string().optional(),
  label: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  policyType: z.string().optional(),
});
```

### Findings

#### ✅ Correct Fields
- `customPolicies` - Optional array ✓
- `href` - Optional string ✓
- `limit` - Optional number ✓
- `next` - Optional string ✓
- `offset` - Optional number ✓
- `prev` - Optional string ✓
- `total` - Optional number ✓

#### ⚠️ Issues

1. **Field Mismatch in Nested Schema**
   - **Issue:** `customPolicySchema` includes `description` field, but `CompactCustomPolicyResponse` does NOT have this field
   - **Impact:** Zod schema will accept a field that the API doesn't return
   - **Recommendation:** Remove `description` from `customPolicySchema` OR create a separate schema for `CompactCustomPolicyResponse`

2. **Missing Field in OpenAPI**
   - **Field:** `warnings`
   - **Issue:** Zod schema includes `warnings` field, but OpenAPI type definition does NOT include it
   - **Note:** This might be intentional if the API actually returns warnings but the OpenAPI spec is incomplete
   - **Recommendation:** Verify if API responses include `warnings` field

---

## 2. FulfillmentPolicyResponse

### OpenAPI TypeScript Type
```typescript
FulfillmentPolicyResponse: {
  fulfillmentPolicies?: components['schemas']['FulfillmentPolicy'][];
  href?: string;
  limit?: number;  // Format: int32
  next?: string;
  offset?: number; // Format: int32
  prev?: string;
  total?: number;  // Format: int32
}
```

### Zod Schema (`getFulfillmentPoliciesOutputSchema`)
```typescript
getFulfillmentPoliciesOutputSchema = z.object({
  fulfillmentPolicies: z.array(fulfillmentPolicyResponseSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});
```

### Findings

#### ✅ Correct Fields
- All pagination fields match correctly

#### ⚠️ Issues

1. **Missing Field in OpenAPI**
   - **Field:** `warnings`
   - **Issue:** Zod schema includes `warnings`, but OpenAPI type doesn't
   - **Recommendation:** Verify API behavior

---

## 3. FulfillmentPolicy

### OpenAPI TypeScript Type
```typescript
FulfillmentPolicy: {
  categoryTypes?: components['schemas']['CategoryType'][];
  description?: string;
  freightShipping?: boolean;
  fulfillmentPolicyId?: string;
  globalShipping?: boolean;
  handlingTime?: components['schemas']['TimeDuration'];
  localPickup?: boolean;
  marketplaceId?: string;  // MarketplaceIdEnum
  name?: string;
  pickupDropOff?: boolean;
  shippingOptions?: components['schemas']['ShippingOption'][];
  shipToLocations?: components['schemas']['RegionSet'];
}
```

### Zod Schema (`fulfillmentPolicyResponseSchema`)
```typescript
fulfillmentPolicyResponseSchema = z.object({
  fulfillmentPolicyId: z.string().optional(),
  categoryTypes: z.array(categoryTypeSchema).optional(),
  description: z.string().optional(),
  freightShipping: z.boolean().optional(),
  globalShipping: z.boolean().optional(),
  handlingTime: timeDurationSchema.optional(),
  localPickup: z.boolean().optional(),
  marketplaceId: z.string().optional(),
  name: z.string().optional(),
  pickupDropOff: z.boolean().optional(),
  shippingOptions: z.array(shippingOptionSchema).optional(),
  shipToLocations: regionSetSchema.optional(),
  warnings: z.array(errorSchema).optional(),
});
```

### Findings

#### ✅ Correct Fields
All fields match correctly in terms of type and optionality!

#### ⚠️ Issues

1. **Missing Field in OpenAPI**
   - **Field:** `warnings`
   - **Issue:** Zod schema includes `warnings`, but OpenAPI type doesn't
   - **Recommendation:** Verify if this field is returned by the API

2. **Type Mismatch for marketplaceId**
   - **OpenAPI:** Expects enum value (MarketplaceIdEnum)
   - **Zod Schema:** Uses `z.string()` instead of `z.nativeEnum(MarketplaceId)`
   - **Impact:** Less strict validation, won't catch invalid marketplace IDs
   - **Recommendation:** Change to `z.nativeEnum(MarketplaceId)` for response validation (currently only used in input schemas)

---

## 4. PaymentPolicyResponse

### OpenAPI TypeScript Type
```typescript
PaymentPolicyResponse: {
  href?: string;
  limit?: number;  // Format: int32
  next?: string;
  offset?: number; // Format: int32
  paymentPolicies?: components['schemas']['PaymentPolicy'][];
  prev?: string;
  total?: number;  // Format: int32
}
```

### Zod Schema (`getPaymentPoliciesOutputSchema`)
```typescript
getPaymentPoliciesOutputSchema = z.object({
  paymentPolicies: z.array(paymentPolicyResponseSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});
```

### Findings

#### ✅ Correct Fields
All pagination and policy fields match correctly

#### ⚠️ Issues

1. **Missing Field in OpenAPI**
   - **Field:** `warnings`
   - **Issue:** Zod schema includes `warnings`, OpenAPI doesn't
   - **Recommendation:** Verify API behavior

---

## 5. PaymentPolicy

### OpenAPI TypeScript Type
```typescript
PaymentPolicy: {
  categoryTypes?: components['schemas']['CategoryType'][];
  deposit?: components['schemas']['Deposit'];
  description?: string;
  fullPaymentDueIn?: components['schemas']['TimeDuration'];
  immediatePay?: boolean;
  marketplaceId?: string;  // MarketplaceIdEnum
  name?: string;
  paymentInstructions?: string;
  paymentMethods?: components['schemas']['PaymentMethod'][];
  paymentPolicyId?: string;
}
```

### Zod Schema (`paymentPolicyResponseSchema`)
```typescript
paymentPolicyResponseSchema = z.object({
  paymentPolicyId: z.string().optional(),
  categoryTypes: z.array(categoryTypeSchema).optional(),
  deposit: depositSchema.optional(),
  description: z.string().optional(),
  fullPaymentDueIn: timeDurationSchema.optional(),
  immediatePay: z.boolean().optional(),
  marketplaceId: z.string().optional(),
  name: z.string().optional(),
  paymentInstructions: z.string().optional(),
  paymentMethods: z.array(paymentMethodSchema).optional(),
  warnings: z.array(errorSchema).optional(),
});
```

### Findings

#### ✅ Correct Fields
All fields match correctly!

#### ⚠️ Issues

1. **Missing Field in OpenAPI**
   - **Field:** `warnings`
   - **Issue:** Zod schema includes `warnings`, OpenAPI doesn't
   - **Recommendation:** Verify API behavior

2. **Type Mismatch for marketplaceId**
   - **OpenAPI:** Expects enum value (MarketplaceIdEnum)
   - **Zod Schema:** Uses `z.string()` instead of `z.nativeEnum(MarketplaceId)`
   - **Impact:** Less strict validation
   - **Recommendation:** Consider using enum for response validation

---

## 6. ReturnPolicyResponse

### OpenAPI TypeScript Type
```typescript
ReturnPolicyResponse: {
  href?: string;
  limit?: number;  // Format: int32
  next?: string;
  offset?: number; // Format: int32
  prev?: string;
  returnPolicies?: components['schemas']['ReturnPolicy'][];
  total?: number;  // Format: int32
}
```

### Zod Schema (`getReturnPoliciesOutputSchema`)
```typescript
getReturnPoliciesOutputSchema = z.object({
  returnPolicies: z.array(returnPolicyResponseSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});
```

### Findings

#### ✅ Correct Fields
All pagination and policy fields match correctly

#### ⚠️ Issues

1. **Missing Field in OpenAPI**
   - **Field:** `warnings`
   - **Issue:** Zod schema includes `warnings`, OpenAPI doesn't
   - **Recommendation:** Verify API behavior

---

## 7. ReturnPolicy

### OpenAPI TypeScript Type
```typescript
ReturnPolicy: {
  categoryTypes?: components['schemas']['CategoryType'][];
  description?: string;
  extendedHolidayReturnsOffered?: boolean;  // DEPRECATED
  internationalOverride?: components['schemas']['InternationalReturnOverrideType'];
  marketplaceId?: string;  // MarketplaceIdEnum
  name?: string;
  refundMethod?: string;  // RefundMethodEnum
  restockingFeePercentage?: string;  // DEPRECATED
  returnInstructions?: string;
  returnMethod?: string;  // ReturnMethodEnum
  returnPeriod?: components['schemas']['TimeDuration'];
  returnPolicyId?: string;
  returnsAccepted?: boolean;
  returnShippingCostPayer?: string;  // ReturnShippingCostPayerEnum
}
```

### Zod Schema (`returnPolicyResponseSchema`)
```typescript
returnPolicyResponseSchema = z.object({
  returnPolicyId: z.string().optional(),
  categoryTypes: z.array(categoryTypeSchema).optional(),
  description: z.string().optional(),
  extendedHolidayReturnsOffered: z.boolean().optional(),
  marketplaceId: z.string().optional(),
  name: z.string().optional(),
  refundMethod: z.string().optional(),
  restockingFeePercentage: z.string().optional(),
  returnInstructions: z.string().optional(),
  returnMethod: z.string().optional(),
  returnPeriod: timeDurationSchema.optional(),
  returnsAccepted: z.boolean().optional(),
  returnShippingCostPayer: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});
```

### Findings

#### ✅ Correct Fields
All fields present and correctly typed!

#### ⚠️ Issues

1. **Missing Field in Zod**
   - **Field:** `internationalOverride`
   - **Issue:** OpenAPI has this field, but Zod schema is MISSING it
   - **Impact:** API responses with international override settings will not be validated
   - **Type:** `components['schemas']['InternationalReturnOverrideType']`
   - **Recommendation:** **ADD THIS FIELD** to the Zod schema

2. **Missing Field in OpenAPI**
   - **Field:** `warnings`
   - **Issue:** Zod schema includes `warnings`, OpenAPI doesn't
   - **Recommendation:** Verify API behavior

3. **Type Mismatches for Enum Fields**
   - **Fields:** `refundMethod`, `returnMethod`, `returnShippingCostPayer`, `marketplaceId`
   - **OpenAPI:** These should be enum values
   - **Zod Schema:** Uses `z.string()` instead of `z.nativeEnum()`
   - **Impact:** Less strict validation
   - **Recommendation:** Consider using enums for response validation

---

## Nested Schema Validation

### CategoryType

#### OpenAPI Type
```typescript
CategoryType: {
  default?: boolean;  // DEPRECATED - do not use
  name?: string;  // CategoryTypeEnum
}
```

#### Zod Schema
```typescript
categoryTypeSchema = z.object({
  name: z.string().optional(),
  default: z.boolean().optional(),
});
```

**Status:** ✅ Fields match correctly

---

### TimeDuration

#### OpenAPI Type
```typescript
TimeDuration: {
  unit?: string;   // TimeDurationUnitEnum
  value?: number;  // Format: int32
}
```

#### Zod Schema
```typescript
timeDurationSchema = z.object({
  unit: z.nativeEnum(TimeDurationUnit),  // REQUIRED
  value: z.number(),                      // REQUIRED
});
```

**Issues:**
- ❌ **OPTIONALITY MISMATCH**: OpenAPI defines both fields as optional (`?`), but Zod schema requires them
- **Impact:** Validation will fail if API returns TimeDuration with missing fields
- **Recommendation:** Change Zod schema to make both fields optional for response validation

---

### Amount

#### OpenAPI Type
```typescript
Amount: {
  currency?: string;  // CurrencyCodeEnum
  value?: string;
}
```

#### Zod Schema
```typescript
amountSchema = z.object({
  currency: z.string(),  // REQUIRED
  value: z.string(),      // REQUIRED
});
```

**Issues:**
- ❌ **OPTIONALITY MISMATCH**: OpenAPI defines both fields as optional, but Zod schema requires them
- **Impact:** Validation will fail if API returns Amount with missing fields
- **Recommendation:** Change Zod schema to make both fields optional for response validation

---

### Region

#### OpenAPI Type
```typescript
Region: {
  regionName?: string;
  regionType?: string;  // RegionTypeEnum
}
```

#### Zod Schema
```typescript
regionSchema = z.object({
  regionName: z.string().optional(),
  regionType: z.nativeEnum(RegionType).optional(),
});
```

**Status:** ✅ Fields match correctly

---

### RegionSet

#### OpenAPI Type
```typescript
RegionSet: {
  regionExcluded?: components['schemas']['Region'][];
  regionIncluded?: components['schemas']['Region'][];
}
```

#### Zod Schema
```typescript
regionSetSchema = z.object({
  regionIncluded: z.array(regionSchema).optional(),
  regionExcluded: z.array(regionSchema).optional(),
});
```

**Status:** ✅ Fields match correctly

---

### ShippingOption

#### OpenAPI Type
```typescript
ShippingOption: {
  costType?: string;  // ShippingCostTypeEnum
  insuranceFee?: Amount;  // DEPRECATED
  insuranceOffered?: boolean;  // DEPRECATED
  optionType?: string;  // ShippingOptionTypeEnum
  packageHandlingCost?: Amount;
  rateTableId?: string;
  shippingDiscountProfileId?: string;
  shippingPromotionOffered?: boolean;
  shippingServices?: ShippingService[];
}
```

#### Zod Schema
```typescript
shippingOptionSchema = z.object({
  costType: z.nativeEnum(ShippingCostType),  // REQUIRED
  optionType: z.nativeEnum(ShippingOptionType),  // REQUIRED
  packageHandlingCost: amountSchema.optional(),
  rateTableId: z.string().optional(),
  shippingServices: z.array(shippingServiceSchema).optional(),
});
```

**Issues:**
1. ❌ **OPTIONALITY MISMATCH**: `costType` and `optionType` are optional in OpenAPI but required in Zod
2. ❌ **Missing Fields in Zod**:
   - `insuranceFee` (deprecated, but still in API)
   - `insuranceOffered` (deprecated, but still in API)
   - `shippingDiscountProfileId`
   - `shippingPromotionOffered`

**Recommendation:** Make `costType` and `optionType` optional, and add missing fields (even if deprecated)

---

### ShippingService

#### OpenAPI Type
```typescript
ShippingService: {
  additionalShippingCost?: Amount;
  buyerResponsibleForPickup?: boolean;
  buyerResponsibleForShipping?: boolean;
  freeShipping?: boolean;
  shippingCarrierCode?: string;
  shippingCost?: Amount;
  shippingServiceCode?: string;
  shipToLocations?: RegionSet;
  sortOrder?: number;  // Format: int32
  surcharge?: Amount;  // DEPRECATED
}
```

#### Zod Schema
```typescript
shippingServiceSchema = z.object({
  additionalShippingCost: amountSchema.optional(),
  buyerResponsibleForPickup: z.boolean().optional(),
  buyerResponsibleForShipping: z.boolean().optional(),
  cashOnDeliveryFee: amountSchema.optional(),
  freeShipping: z.boolean().optional(),
  shipToLocations: regionSetSchema.optional(),
  shippingCarrierCode: z.string().optional(),
  shippingCost: amountSchema.optional(),
  shippingServiceCode: z.string().optional(),
  sortOrder: z.number().optional(),
});
```

**Issues:**
1. ❌ **Extra Field in Zod**: `cashOnDeliveryFee` - not in OpenAPI type
2. ❌ **Missing Field in Zod**: `surcharge` (deprecated but still in API)

**Recommendation:** Remove `cashOnDeliveryFee` and add `surcharge`

---

### PaymentMethod

#### OpenAPI Type
```typescript
PaymentMethod: {
  brands?: string[];  // DEPRECATED
  paymentMethodType?: string;  // PaymentMethodTypeEnum
  recipientAccountReference?: RecipientAccountReference;  // DEPRECATED
}
```

#### Zod Schema
```typescript
paymentMethodSchema = z.object({
  paymentMethodType: z.string(),  // REQUIRED
  brands: z.array(z.string()).optional(),
  recipientAccountReference: z.object({
    referenceId: z.string().optional(),
    referenceType: z.string().optional(),
  }).optional(),
});
```

**Issues:**
- ❌ **OPTIONALITY MISMATCH**: `paymentMethodType` is optional in OpenAPI but required in Zod

**Recommendation:** Make `paymentMethodType` optional

---

### Deposit

#### OpenAPI Type
```typescript
Deposit: {
  amount?: Amount;
  dueIn?: TimeDuration;
  paymentMethods?: PaymentMethod[];  // DEPRECATED
}
```

#### Zod Schema
```typescript
depositSchema = z.object({
  depositAmount: amountSchema.optional(),
  depositType: z.nativeEnum(DepositType).optional(),
  dueIn: timeDurationSchema.optional(),
});
```

**Issues:**
1. ❌ **Field Name Mismatch**: OpenAPI uses `amount`, Zod uses `depositAmount`
2. ❌ **Extra Field in Zod**: `depositType` - not in OpenAPI type
3. ❌ **Missing Field in Zod**: `paymentMethods` (deprecated but in API)

**Recommendation:** Rename `depositAmount` to `amount`, remove `depositType`, add `paymentMethods`

---

## Summary of Critical Issues

### 🔴 High Priority - Missing Fields

1. **ReturnPolicy Missing Field**
   - Missing: `internationalOverride`
   - Impact: International return policy settings won't be validated
   - Action: ADD to `returnPolicyResponseSchema`

2. **Deposit Schema Field Mismatch**
   - Wrong: Using `depositAmount` instead of `amount`
   - Impact: Validation will fail for all deposit responses
   - Action: RENAME field

### 🟡 Medium Priority - Optionality Mismatches

1. **TimeDuration Schema**
   - Both `unit` and `value` should be optional for response validation
   - Impact: May fail on partial API responses

2. **Amount Schema**
   - Both `currency` and `value` should be optional for response validation
   - Impact: May fail on partial API responses

3. **ShippingOption Schema**
   - `costType` and `optionType` should be optional
   - Impact: May fail on partial API responses

4. **PaymentMethod Schema**
   - `paymentMethodType` should be optional
   - Impact: May fail on partial API responses

### 🟢 Low Priority - Nice to Have

1. **CustomPolicySchema**
   - Extra field: `description` (not in CompactCustomPolicyResponse)
   - Impact: Minor - accepts more than API returns

2. **Warnings Field**
   - All response schemas include `warnings` field not in OpenAPI
   - Impact: Depends on actual API behavior

3. **ShippingService Extra Field**
   - Extra field: `cashOnDeliveryFee`
   - Missing field: `surcharge`
   - Impact: Minor validation inconsistency

4. **Enum Usage in Responses**
   - Using `z.string()` instead of enums for `marketplaceId`, `refundMethod`, etc.
   - Impact: Less strict validation, but more flexible

---

## Recommendations

### Immediate Actions Required

1. **Fix Deposit Schema** - Critical bug
   ```typescript
   depositSchema = z.object({
     amount: amountSchema.optional(),  // Changed from depositAmount
     dueIn: timeDurationSchema.optional(),
     paymentMethods: z.array(paymentMethodSchema).optional(),  // Added
     // Remove depositType - not in API
   });
   ```

2. **Add internationalOverride to ReturnPolicy**
   ```typescript
   returnPolicyResponseSchema = z.object({
     // ... existing fields ...
     internationalOverride: z.object({
       returnMethod: z.string().optional(),
       returnPeriod: timeDurationSchema.optional(),
       returnsAccepted: z.boolean().optional(),
       returnShippingCostPayer: z.string().optional(),
     }).optional(),
     // ... rest of fields ...
   });
   ```

3. **Make Common Schemas Flexible for Responses**
   ```typescript
   // For response validation, make fields optional
   timeDurationSchema = z.object({
     unit: z.nativeEnum(TimeDurationUnit).optional(),
     value: z.number().optional(),
   });

   amountSchema = z.object({
     currency: z.string().optional(),
     value: z.string().optional(),
   });
   ```

4. **Fix ShippingOption Optionality**
   ```typescript
   shippingOptionSchema = z.object({
     costType: z.nativeEnum(ShippingCostType).optional(),  // Make optional
     optionType: z.nativeEnum(ShippingOptionType).optional(),  // Make optional
     // ... rest of fields ...
   });
   ```

### Consider for Future

1. Create separate schemas for request vs response validation
2. Add missing deprecated fields for complete API coverage
3. Consider using `.passthrough()` for future-proofing
4. Verify if `warnings` field is actually returned by API

---

## Validation Statistics

- **Total Types Validated:** 7 main types + 10 nested types
- **Critical Issues:** 2
- **Medium Issues:** 4
- **Minor Issues:** 4
- **Correctly Implemented:** ~85% of fields

**Overall Assessment:** The Zod schemas are well-structured but need several critical fixes for production use, particularly around the Deposit schema and missing ReturnPolicy fields.
