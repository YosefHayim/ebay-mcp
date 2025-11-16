import { z } from 'zod';

/**
 * Zod schemas for Account API input validation
 * Based on: src/api/account-management/account.ts
 * OpenAPI spec: docs/sell-apps/account-management/sell_account_v1_oas3.json
 * Types from: src/types/sell_account_v1_oas3.ts
 */

// Reusable schema for ID parameters
const idSchema = (name: string, description: string) =>
  z.string({
    message: `${name} is required`,
    required_error: `${name.toLowerCase().replace(/\s+/g, '_')} is required`,
    invalid_type_error: `${name.toLowerCase().replace(/\s+/g, '_')} must be a string`,
    description,
  });

// Reusable schema for optional marketplace_id parameter
const marketplaceIdSchema = z
  .string({
    invalid_type_error: 'marketplace_id must be a string',
    description: 'The eBay marketplace ID',
  })
  .optional();

// Reusable schema for optional name parameter
const nameSchema = z
  .string({
    invalid_type_error: 'name must be a string',
    description: 'The policy name',
  })
  .optional();

// ============================================================
// Custom Policy Schemas
// ============================================================

/**
 * Schema for getCustomPolicies method
 * Endpoint: GET /custom_policy/
 * Query: GetCustomPoliciesParams - policy_types (optional)
 */
export const getCustomPoliciesSchema = z.object({
  policy_types: z
    .string({
      invalid_type_error: 'policy_types must be a string',
      description: 'Comma-delimited list of custom policy types (PRODUCT_COMPLIANCE, TAKE_BACK)',
    })
    .optional(),
});

/**
 * Schema for getCustomPolicy method
 * Endpoint: GET /custom_policy/{custom_policy_id}
 * Path: GetCustomPolicyParams - custom_policy_id (required)
 */
export const getCustomPolicySchema = z.object({
  custom_policy_id: idSchema('Custom policy ID', 'The unique identifier of the custom policy'),
});

/**
 * Schema for createCustomPolicy method
 * Endpoint: POST /custom_policy/
 * Body: CreateCustomPolicyRequest - name, label, description, policyType
 */
export const createCustomPolicySchema = z.object({
  name: z
    .string({
      invalid_type_error: 'name must be a string',
      description: 'Seller-defined name for the custom policy (max 64 characters)',
    })
    .max(64, 'name must be 64 characters or less')
    .optional(),
  label: z
    .string({
      invalid_type_error: 'label must be a string',
      description: 'Seller-defined label for the custom policy (max 250 characters)',
    })
    .max(250, 'label must be 250 characters or less')
    .optional(),
  description: z
    .string({
      invalid_type_error: 'description must be a string',
      description: 'Seller-defined description of the custom policy (max 5000 characters)',
    })
    .max(5000, 'description must be 5000 characters or less')
    .optional(),
  policy_type: z
    .string({
      invalid_type_error: 'policy_type must be a string',
      description: 'Type of custom policy: PRODUCT_COMPLIANCE or TAKE_BACK',
    })
    .optional(),
});

/**
 * Schema for updateCustomPolicy method
 * Endpoint: PUT /custom_policy/{custom_policy_id}
 * Path: custom_policy_id (required)
 * Body: UpdateCustomPolicyRequest - name, label, description
 */
export const updateCustomPolicySchema = z.object({
  custom_policy_id: idSchema(
    'Custom policy ID',
    'The unique identifier of the custom policy to update'
  ),
  name: z
    .string({
      invalid_type_error: 'name must be a string',
      description: 'Updated name for the custom policy (max 64 characters)',
    })
    .max(64, 'name must be 64 characters or less')
    .optional(),
  label: z
    .string({
      invalid_type_error: 'label must be a string',
      description: 'Updated label for the custom policy (max 250 characters)',
    })
    .max(250, 'label must be 250 characters or less')
    .optional(),
  description: z
    .string({
      invalid_type_error: 'description must be a string',
      description: 'Updated description of the custom policy (max 5000 characters)',
    })
    .max(5000, 'description must be 5000 characters or less')
    .optional(),
});

/**
 * Schema for deleteCustomPolicy method
 * Endpoint: DELETE /custom_policy/{custom_policy_id}
 * Path: custom_policy_id (required)
 */
export const deleteCustomPolicySchema = z.object({
  custom_policy_id: idSchema(
    'Custom policy ID',
    'The unique identifier of the custom policy to delete'
  ),
});

// ============================================================
// Fulfillment Policy Schemas
// ============================================================

/**
 * Schema for getFulfillmentPolicies method
 * Endpoint: GET /fulfillment_policy
 * Query: GetFulfillmentPoliciesParams - marketplace_id (required)
 */
export const getFulfillmentPoliciesSchema = z.object({
  marketplace_id: z.string({
    message: 'Marketplace ID is required',
    required_error: 'marketplace_id is required',
    invalid_type_error: 'marketplace_id must be a string',
    description: 'The eBay marketplace ID',
  }),
});

/**
 * Schema for getFulfillmentPolicy method
 * Endpoint: GET /fulfillment_policy/{fulfillmentPolicyId}
 * Path: GetFulfillmentPolicyParams - fulfillmentPolicyId (required)
 */
export const getFulfillmentPolicySchema = z.object({
  fulfillment_policy_id: idSchema(
    'Fulfillment policy ID',
    'The unique identifier of the fulfillment policy'
  ),
});

/**
 * Schema for getFulfillmentPolicyByName method
 * Endpoint: GET /fulfillment_policy/get_by_policy_name
 * Query: GetFulfillmentPolicyByNameParams - marketplace_id (required), name (required)
 */
export const getFulfillmentPolicyByNameSchema = z.object({
  marketplace_id: z.string({
    message: 'Marketplace ID is required',
    required_error: 'marketplace_id is required',
    invalid_type_error: 'marketplace_id must be a string',
    description: 'The eBay marketplace ID',
  }),
  name: z.string({
    message: 'Policy name is required',
    required_error: 'name is required',
    invalid_type_error: 'name must be a string',
    description: 'The fulfillment policy name',
  }),
});

/**
 * Schema for createFulfillmentPolicy method
 * Endpoint: POST /fulfillment_policy/
 * Body: FulfillmentPolicyRequest - complex object with many optional fields
 */
export const createFulfillmentPolicySchema = z.object({
  category_types: z
    .array(
      z.object({
        name: z
          .string({
            invalid_type_error: 'category type name must be a string',
            description: 'Category type: ALL_EXCLUDING_MOTORS_VEHICLES or MOTORS_VEHICLES',
          })
          .optional(),
      })
    )
    .optional(),
  description: z
    .string({
      invalid_type_error: 'description must be a string',
      description: 'Seller-defined description of the fulfillment policy (max 250 characters)',
    })
    .max(250, 'description must be 250 characters or less')
    .optional(),
  freight_shipping: z
    .boolean({
      invalid_type_error: 'freight_shipping must be a boolean',
      description: 'Whether freight shipping is available for large items over 150 lbs',
    })
    .optional(),
  global_shipping: z
    .boolean({
      invalid_type_error: 'global_shipping must be a boolean',
      description: 'Whether to use Global Shipping Program (UK marketplace only)',
    })
    .optional(),
  handling_time: z
    .object({
      unit: z
        .string({
          invalid_type_error: 'unit must be a string',
          description: 'Time unit (typically DAY)',
        })
        .optional(),
      value: z
        .number({
          invalid_type_error: 'value must be a number',
          description: 'Number of handling time units (0-20 days)',
        })
        .int()
        .optional(),
    })
    .optional(),
  local_pickup: z
    .boolean({
      invalid_type_error: 'local_pickup must be a boolean',
      description: 'Whether local pickup is available',
    })
    .optional(),
  marketplace_id: marketplaceIdSchema,
  name: z
    .string({
      invalid_type_error: 'name must be a string',
      description: 'Seller-defined name for the fulfillment policy (max 64 characters)',
    })
    .max(64, 'name must be 64 characters or less')
    .optional(),
  pickup_drop_off: z
    .boolean({
      invalid_type_error: 'pickup_drop_off must be a boolean',
      description: 'Whether Click and Collect is available',
    })
    .optional(),
  shipping_options: z.array(z.record(z.unknown())).optional(),
  ship_to_locations: z
    .object({
      region_included: z.array(z.record(z.unknown())).optional(),
      region_excluded: z.array(z.record(z.unknown())).optional(),
    })
    .optional(),
});

/**
 * Schema for updateFulfillmentPolicy method
 * Endpoint: PUT /fulfillment_policy/{fulfillmentPolicyId}
 * Path: fulfillmentPolicyId (required)
 * Body: FulfillmentPolicyRequest
 */
export const updateFulfillmentPolicySchema = z.object({
  fulfillment_policy_id: idSchema(
    'Fulfillment policy ID',
    'The unique identifier of the fulfillment policy to update'
  ),
  category_types: z
    .array(
      z.object({
        name: z.string().optional(),
      })
    )
    .optional(),
  description: z.string().max(250).optional(),
  freight_shipping: z.boolean().optional(),
  global_shipping: z.boolean().optional(),
  handling_time: z
    .object({
      unit: z.string().optional(),
      value: z.number().int().optional(),
    })
    .optional(),
  local_pickup: z.boolean().optional(),
  marketplace_id: marketplaceIdSchema,
  name: z.string().max(64).optional(),
  pickup_drop_off: z.boolean().optional(),
  shipping_options: z.array(z.record(z.unknown())).optional(),
  ship_to_locations: z
    .object({
      region_included: z.array(z.record(z.unknown())).optional(),
      region_excluded: z.array(z.record(z.unknown())).optional(),
    })
    .optional(),
});

/**
 * Schema for deleteFulfillmentPolicy method
 * Endpoint: DELETE /fulfillment_policy/{fulfillmentPolicyId}
 * Path: fulfillmentPolicyId (required)
 */
export const deleteFulfillmentPolicySchema = z.object({
  fulfillment_policy_id: idSchema(
    'Fulfillment policy ID',
    'The unique identifier of the fulfillment policy to delete'
  ),
});

// ============================================================
// Payment Policy Schemas
// ============================================================

/**
 * Schema for getPaymentPolicies method
 * Endpoint: GET /payment_policy
 * Query: GetPaymentPoliciesParams - marketplace_id (required)
 */
export const getPaymentPoliciesSchema = z.object({
  marketplace_id: z.string({
    message: 'Marketplace ID is required',
    required_error: 'marketplace_id is required',
    invalid_type_error: 'marketplace_id must be a string',
    description: 'The eBay marketplace ID',
  }),
});

/**
 * Schema for getPaymentPolicy method
 * Endpoint: GET /payment_policy/{paymentPolicyId}
 * Path: GetPaymentPolicyParams - paymentPolicyId (required)
 */
export const getPaymentPolicySchema = z.object({
  payment_policy_id: idSchema('Payment policy ID', 'The unique identifier of the payment policy'),
});

/**
 * Schema for getPaymentPolicyByName method
 * Endpoint: GET /payment_policy/get_by_policy_name
 * Query: GetPaymentPolicyByNameParams - marketplace_id (required), name (required)
 */
export const getPaymentPolicyByNameSchema = z.object({
  marketplace_id: z.string({
    message: 'Marketplace ID is required',
    required_error: 'marketplace_id is required',
    invalid_type_error: 'marketplace_id must be a string',
    description: 'The eBay marketplace ID',
  }),
  name: z.string({
    message: 'Policy name is required',
    required_error: 'name is required',
    invalid_type_error: 'name must be a string',
    description: 'The payment policy name',
  }),
});

/**
 * Schema for createPaymentPolicy method
 * Endpoint: POST /payment_policy/
 * Body: PaymentPolicyRequest - complex object with many optional fields
 */
export const createPaymentPolicySchema = z.object({
  category_types: z
    .array(
      z.object({
        name: z.string().optional(),
      })
    )
    .optional(),
  description: z
    .string({
      invalid_type_error: 'description must be a string',
      description: 'Seller-defined description of the payment policy (max 250 characters)',
    })
    .max(250, 'description must be 250 characters or less')
    .optional(),
  deposit: z
    .object({
      amount: z
        .object({
          currency: z.string().optional(),
          value: z.string().optional(),
        })
        .optional(),
      due_in: z
        .object({
          unit: z.string().optional(),
          value: z.number().int().optional(),
        })
        .optional(),
      payment_methods: z.array(z.record(z.unknown())).optional(),
    })
    .optional(),
  full_payment_due_in: z
    .object({
      unit: z.string().optional(),
      value: z.number().int().optional(),
    })
    .optional(),
  immediate_pay: z
    .boolean({
      invalid_type_error: 'immediate_pay must be a boolean',
      description: 'Whether immediate payment is required',
    })
    .optional(),
  marketplace_id: marketplaceIdSchema,
  name: z
    .string({
      invalid_type_error: 'name must be a string',
      description: 'Seller-defined name for the payment policy (max 64 characters)',
    })
    .max(64, 'name must be 64 characters or less')
    .optional(),
  payment_methods: z.array(z.record(z.unknown())).optional(),
});

/**
 * Schema for updatePaymentPolicy method
 * Endpoint: PUT /payment_policy/{paymentPolicyId}
 * Path: paymentPolicyId (required)
 * Body: PaymentPolicyRequest
 */
export const updatePaymentPolicySchema = z.object({
  payment_policy_id: idSchema(
    'Payment policy ID',
    'The unique identifier of the payment policy to update'
  ),
  category_types: z
    .array(
      z.object({
        name: z.string().optional(),
      })
    )
    .optional(),
  description: z.string().max(250).optional(),
  deposit: z
    .object({
      amount: z
        .object({
          currency: z.string().optional(),
          value: z.string().optional(),
        })
        .optional(),
      due_in: z
        .object({
          unit: z.string().optional(),
          value: z.number().int().optional(),
        })
        .optional(),
      payment_methods: z.array(z.record(z.unknown())).optional(),
    })
    .optional(),
  full_payment_due_in: z
    .object({
      unit: z.string().optional(),
      value: z.number().int().optional(),
    })
    .optional(),
  immediate_pay: z.boolean().optional(),
  marketplace_id: marketplaceIdSchema,
  name: z.string().max(64).optional(),
  payment_methods: z.array(z.record(z.unknown())).optional(),
});

/**
 * Schema for deletePaymentPolicy method
 * Endpoint: DELETE /payment_policy/{paymentPolicyId}
 * Path: paymentPolicyId (required)
 */
export const deletePaymentPolicySchema = z.object({
  payment_policy_id: idSchema(
    'Payment policy ID',
    'The unique identifier of the payment policy to delete'
  ),
});

// ============================================================
// Return Policy Schemas
// ============================================================

/**
 * Schema for getReturnPolicies method
 * Endpoint: GET /return_policy
 * Query: GetReturnPoliciesParams - marketplace_id (required)
 */
export const getReturnPoliciesSchema = z.object({
  marketplace_id: z.string({
    message: 'Marketplace ID is required',
    required_error: 'marketplace_id is required',
    invalid_type_error: 'marketplace_id must be a string',
    description: 'The eBay marketplace ID',
  }),
});

/**
 * Schema for getReturnPolicy method
 * Endpoint: GET /return_policy/{returnPolicyId}
 * Path: GetReturnPolicyParams - returnPolicyId (required)
 */
export const getReturnPolicySchema = z.object({
  return_policy_id: idSchema('Return policy ID', 'The unique identifier of the return policy'),
});

/**
 * Schema for getReturnPolicyByName method
 * Endpoint: GET /return_policy/get_by_policy_name
 * Query: GetReturnPolicyByNameParams - marketplace_id (required), name (required)
 */
export const getReturnPolicyByNameSchema = z.object({
  marketplace_id: z.string({
    message: 'Marketplace ID is required',
    required_error: 'marketplace_id is required',
    invalid_type_error: 'marketplace_id must be a string',
    description: 'The eBay marketplace ID',
  }),
  name: z.string({
    message: 'Policy name is required',
    required_error: 'name is required',
    invalid_type_error: 'name must be a string',
    description: 'The return policy name',
  }),
});

/**
 * Schema for createReturnPolicy method
 * Endpoint: POST /return_policy/
 * Body: ReturnPolicyRequest - complex object with many optional fields
 */
export const createReturnPolicySchema = z.object({
  category_types: z
    .array(
      z.object({
        name: z.string().optional(),
      })
    )
    .optional(),
  description: z
    .string({
      invalid_type_error: 'description must be a string',
      description: 'Seller-defined description of the return policy (max 250 characters)',
    })
    .max(250, 'description must be 250 characters or less')
    .optional(),
  extended_holiday_returns_offered: z
    .boolean({
      invalid_type_error: 'extended_holiday_returns_offered must be a boolean',
      description: 'Whether extended holiday returns are offered',
    })
    .optional(),
  international_override: z
    .object({
      return_method: z.string().optional(),
      return_period: z
        .object({
          unit: z.string().optional(),
          value: z.number().int().optional(),
        })
        .optional(),
      returns_accepted: z.boolean().optional(),
      return_shipping_cost_payer: z.string().optional(),
    })
    .optional(),
  marketplace_id: marketplaceIdSchema,
  name: z
    .string({
      invalid_type_error: 'name must be a string',
      description: 'Seller-defined name for the return policy (max 64 characters)',
    })
    .max(64, 'name must be 64 characters or less')
    .optional(),
  refund_method: z
    .string({
      invalid_type_error: 'refund_method must be a string',
      description: 'Refund method: MONEY_BACK or MERCHANDISE_CREDIT',
    })
    .optional(),
  restocking_fee_percentage: z
    .string({
      invalid_type_error: 'restocking_fee_percentage must be a string',
      description: 'Restocking fee percentage (10, 15, 20, or custom)',
    })
    .optional(),
  return_instructions: z
    .string({
      invalid_type_error: 'return_instructions must be a string',
      description: 'Return instructions for the buyer (max 5000 characters)',
    })
    .max(5000, 'return_instructions must be 5000 characters or less')
    .optional(),
  return_method: z
    .string({
      invalid_type_error: 'return_method must be a string',
      description: 'Return method: REPLACEMENT or EXCHANGE',
    })
    .optional(),
  return_period: z
    .object({
      unit: z.string().optional(),
      value: z.number().int().optional(),
    })
    .optional(),
  returns_accepted: z
    .boolean({
      invalid_type_error: 'returns_accepted must be a boolean',
      description: 'Whether returns are accepted',
    })
    .optional(),
  return_shipping_cost_payer: z
    .string({
      invalid_type_error: 'return_shipping_cost_payer must be a string',
      description: 'Who pays return shipping: BUYER or SELLER',
    })
    .optional(),
});

/**
 * Schema for updateReturnPolicy method
 * Endpoint: PUT /return_policy/{returnPolicyId}
 * Path: returnPolicyId (required)
 * Body: ReturnPolicyRequest
 */
export const updateReturnPolicySchema = z.object({
  return_policy_id: idSchema(
    'Return policy ID',
    'The unique identifier of the return policy to update'
  ),
  category_types: z
    .array(
      z.object({
        name: z.string().optional(),
      })
    )
    .optional(),
  description: z.string().max(250).optional(),
  extended_holiday_returns_offered: z.boolean().optional(),
  international_override: z
    .object({
      return_method: z.string().optional(),
      return_period: z
        .object({
          unit: z.string().optional(),
          value: z.number().int().optional(),
        })
        .optional(),
      returns_accepted: z.boolean().optional(),
      return_shipping_cost_payer: z.string().optional(),
    })
    .optional(),
  marketplace_id: marketplaceIdSchema,
  name: z.string().max(64).optional(),
  refund_method: z.string().optional(),
  restocking_fee_percentage: z.string().optional(),
  return_instructions: z.string().max(5000).optional(),
  return_method: z.string().optional(),
  return_period: z
    .object({
      unit: z.string().optional(),
      value: z.number().int().optional(),
    })
    .optional(),
  returns_accepted: z.boolean().optional(),
  return_shipping_cost_payer: z.string().optional(),
});

/**
 * Schema for deleteReturnPolicy method
 * Endpoint: DELETE /return_policy/{returnPolicyId}
 * Path: returnPolicyId (required)
 */
export const deleteReturnPolicySchema = z.object({
  return_policy_id: idSchema(
    'Return policy ID',
    'The unique identifier of the return policy to delete'
  ),
});

// ============================================================
// Privileges, KYC, and Other Account Schemas
// ============================================================

/**
 * Schema for getPrivileges method
 * Endpoint: GET /privilege
 * No parameters required
 */
export const getPrivilegesSchema = z.object({});

/**
 * Schema for getKyc method
 * Endpoint: GET /kyc
 * No parameters required
 */
export const getKycSchema = z.object({});

/**
 * Schema for optInToPaymentsProgram method
 * Endpoint: POST /payments_program/{marketplace_id}/{payments_program_type}
 * Path: marketplace_id (required), payments_program_type (required)
 */
export const optInToPaymentsProgramSchema = z.object({
  marketplace_id: z.string({
    message: 'Marketplace ID is required',
    required_error: 'marketplace_id is required',
    invalid_type_error: 'marketplace_id must be a string',
    description: 'The eBay marketplace ID',
  }),
  payments_program_type: z.string({
    message: 'Payments program type is required',
    required_error: 'payments_program_type is required',
    invalid_type_error: 'payments_program_type must be a string',
    description: 'The payments program type (e.g., EBAY_PAYMENTS)',
  }),
});

/**
 * Schema for getPaymentsProgramStatus method
 * Endpoint: GET /payments_program/{marketplace_id}/{payments_program_type}
 * Path: marketplace_id (required), payments_program_type (required)
 */
export const getPaymentsProgramStatusSchema = z.object({
  marketplace_id: z.string({
    message: 'Marketplace ID is required',
    required_error: 'marketplace_id is required',
    invalid_type_error: 'marketplace_id must be a string',
    description: 'The eBay marketplace ID',
  }),
  payments_program_type: z.string({
    message: 'Payments program type is required',
    required_error: 'payments_program_type is required',
    invalid_type_error: 'payments_program_type must be a string',
    description: 'The payments program type',
  }),
});

/**
 * Schema for getRateTables method
 * Endpoint: GET /rate_table
 * No parameters required
 */
export const getRateTablesSchema = z.object({});

/**
 * Schema for createOrReplaceSalesTax method
 * Endpoint: PUT /sales_tax/{country_code}/{jurisdiction_id}
 * Path: country_code (required), jurisdiction_id (required)
 * Body: SalesTaxBase - sales_tax_percentage, shipping_and_handling_taxed
 */
export const createOrReplaceSalesTaxSchema = z.object({
  country_code: z.string({
    message: 'Country code is required',
    required_error: 'country_code is required',
    invalid_type_error: 'country_code must be a string',
    description: 'Two-letter ISO 3166-1 country code',
  }),
  jurisdiction_id: z.string({
    message: 'Jurisdiction ID is required',
    required_error: 'jurisdiction_id is required',
    invalid_type_error: 'jurisdiction_id must be a string',
    description: 'State or province ID (e.g., US state abbreviation)',
  }),
  sales_tax_percentage: z
    .string({
      invalid_type_error: 'sales_tax_percentage must be a string',
      description: 'Sales tax percentage (0-100)',
    })
    .optional(),
  shipping_and_handling_taxed: z
    .boolean({
      invalid_type_error: 'shipping_and_handling_taxed must be a boolean',
      description: 'Whether shipping and handling are taxed',
    })
    .optional(),
});

/**
 * Schema for bulkCreateOrReplaceSalesTax method
 * Endpoint: POST /sales_tax/bulk_create_or_replace
 * Body: Array of sales tax requests
 */
export const bulkCreateOrReplaceSalesTaxSchema = z.object({
  requests: z
    .array(
      z.object({
        country_code: z.string().optional(),
        jurisdiction_id: z.string().optional(),
        sales_tax_base: z
          .object({
            sales_tax_percentage: z.string().optional(),
            shipping_and_handling_taxed: z.boolean().optional(),
          })
          .optional(),
      }),
      {
        invalid_type_error: 'requests must be an array',
        description: 'Array of sales tax requests',
      }
    )
    .optional(),
});

/**
 * Schema for getSalesTax method
 * Endpoint: GET /sales_tax/{country_code}/{jurisdiction_id}
 * Path: country_code (required), jurisdiction_id (required)
 */
export const getSalesTaxSchema = z.object({
  country_code: z.string({
    message: 'Country code is required',
    required_error: 'country_code is required',
    invalid_type_error: 'country_code must be a string',
    description: 'Two-letter ISO 3166-1 country code',
  }),
  jurisdiction_id: z.string({
    message: 'Jurisdiction ID is required',
    required_error: 'jurisdiction_id is required',
    invalid_type_error: 'jurisdiction_id must be a string',
    description: 'State or province ID',
  }),
});

/**
 * Schema for deleteSalesTax method
 * Endpoint: DELETE /sales_tax/{country_code}/{jurisdiction_id}
 * Path: country_code (required), jurisdiction_id (required)
 */
export const deleteSalesTaxSchema = z.object({
  country_code: z.string({
    message: 'Country code is required',
    required_error: 'country_code is required',
    invalid_type_error: 'country_code must be a string',
    description: 'Two-letter ISO 3166-1 country code',
  }),
  jurisdiction_id: z.string({
    message: 'Jurisdiction ID is required',
    required_error: 'jurisdiction_id is required',
    invalid_type_error: 'jurisdiction_id must be a string',
    description: 'State or province ID',
  }),
});

/**
 * Schema for getSalesTaxes method
 * Endpoint: GET /sales_tax
 * Query: GetSalesTaxesParams - country_code (required)
 */
export const getSalesTaxesSchema = z.object({
  country_code: z.string({
    message: 'Country code is required',
    required_error: 'country_code is required',
    invalid_type_error: 'country_code must be a string',
    description: 'Two-letter ISO 3166-1 country code',
  }),
});

/**
 * Schema for getSubscription method
 * Endpoint: GET /subscription
 * Query: GetSubscriptionParams - limit (optional)
 */
export const getSubscriptionSchema = z.object({
  limit_type: z
    .string({
      invalid_type_error: 'limit_type must be a string',
      description: 'Type of subscription limit to retrieve',
    })
    .optional(),
});

/**
 * Schema for optInToProgram method
 * Endpoint: POST /program/opt_in
 * Body: OptInToProgramRequest - program_type
 */
export const optInToProgramSchema = z.object({
  program_type: z
    .string({
      invalid_type_error: 'program_type must be a string',
      description: 'The program type to opt into (e.g., OUT_OF_STOCK_CONTROL)',
    })
    .optional(),
});

/**
 * Schema for optOutOfProgram method
 * Endpoint: POST /program/opt_out
 * Body: OptInToProgramRequest - program_type
 */
export const optOutOfProgramSchema = z.object({
  program_type: z
    .string({
      invalid_type_error: 'program_type must be a string',
      description: 'The program type to opt out of',
    })
    .optional(),
});

/**
 * Schema for getOptedInPrograms method
 * Endpoint: GET /program
 * No parameters required
 */
export const getOptedInProgramsSchema = z.object({});
