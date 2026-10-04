import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  requestDeleteEffect,
  requestGetEffect,
  requestPostEffect,
  requestPutEffect,
} from '@/api/shared/request.js';
import type {
  bulkCreateOrReplaceSalesTaxInputSchema,
  createCustomPolicyInputSchema,
  createFulfillmentPolicyInputSchema,
  createOrReplaceSalesTaxInputSchema,
  createPaymentPolicyInputSchema,
  createReturnPolicyInputSchema,
  deleteFulfillmentPolicyInputSchema,
  deletePaymentPolicyInputSchema,
  deleteReturnPolicyInputSchema,
  deleteSalesTaxInputSchema,
  getAdvertisingEligibilityInputSchema,
  getCustomPoliciesInputSchema,
  getCustomPolicyInputSchema,
  getFulfillmentPoliciesInputSchema,
  getFulfillmentPolicyByNameInputSchema,
  getFulfillmentPolicyInputSchema,
  getPaymentPoliciesInputSchema,
  getPaymentPolicyByNameInputSchema,
  getPaymentPolicyInputSchema,
  getPaymentsProgramInputSchema,
  getPaymentsProgramOnboardingInputSchema,
  getReturnPoliciesInputSchema,
  getReturnPolicyByNameInputSchema,
  getReturnPolicyInputSchema,
  getSalesTaxesInputSchema,
  getSalesTaxInputSchema,
  getSubscriptionInputSchema,
  optInToProgramInputSchema,
  optOutOfProgramInputSchema,
  updateCustomPolicyInputSchema,
  updateFulfillmentPolicyInputSchema,
  updatePaymentPolicyInputSchema,
  updateReturnPolicyInputSchema,
} from '@/schemas/account-management/account.js';
import type { components } from '@/types/sell-apps/account-management/sellAccountV1Oas3.js';
import type { Effect } from 'effect';
import type { z } from 'zod';

const ACCOUNT_BASE_PATH = '/sell/account/v1';

type EmptyAccountInput = Record<string, never>;
type GetCustomPoliciesInput = z.infer<typeof getCustomPoliciesInputSchema>;
type GetCustomPolicyInput = z.infer<typeof getCustomPolicyInputSchema>;
type CreateCustomPolicyInput = z.infer<typeof createCustomPolicyInputSchema>;
type UpdateCustomPolicyInput = z.infer<typeof updateCustomPolicyInputSchema>;
type GetFulfillmentPoliciesInput = z.infer<typeof getFulfillmentPoliciesInputSchema>;
type GetFulfillmentPolicyInput = z.infer<typeof getFulfillmentPolicyInputSchema>;
type GetFulfillmentPolicyByNameInput = z.infer<typeof getFulfillmentPolicyByNameInputSchema>;
type CreateFulfillmentPolicyInput = z.infer<typeof createFulfillmentPolicyInputSchema>;
type UpdateFulfillmentPolicyInput = z.infer<typeof updateFulfillmentPolicyInputSchema>;
type DeleteFulfillmentPolicyInput = z.infer<typeof deleteFulfillmentPolicyInputSchema>;
type GetPaymentPoliciesInput = z.infer<typeof getPaymentPoliciesInputSchema>;
type GetPaymentPolicyInput = z.infer<typeof getPaymentPolicyInputSchema>;
type GetPaymentPolicyByNameInput = z.infer<typeof getPaymentPolicyByNameInputSchema>;
type CreatePaymentPolicyInput = z.infer<typeof createPaymentPolicyInputSchema>;
type UpdatePaymentPolicyInput = z.infer<typeof updatePaymentPolicyInputSchema>;
type DeletePaymentPolicyInput = z.infer<typeof deletePaymentPolicyInputSchema>;
type GetReturnPoliciesInput = z.infer<typeof getReturnPoliciesInputSchema>;
type GetReturnPolicyInput = z.infer<typeof getReturnPolicyInputSchema>;
type GetReturnPolicyByNameInput = z.infer<typeof getReturnPolicyByNameInputSchema>;
type CreateReturnPolicyInput = z.infer<typeof createReturnPolicyInputSchema>;
type UpdateReturnPolicyInput = z.infer<typeof updateReturnPolicyInputSchema>;
type DeleteReturnPolicyInput = z.infer<typeof deleteReturnPolicyInputSchema>;
type GetPaymentsProgramInput = z.infer<typeof getPaymentsProgramInputSchema>;
type GetPaymentsProgramOnboardingInput = z.infer<typeof getPaymentsProgramOnboardingInputSchema>;
type CreateOrReplaceSalesTaxInput = z.infer<typeof createOrReplaceSalesTaxInputSchema>;
type BulkCreateOrReplaceSalesTaxInput = z.infer<typeof bulkCreateOrReplaceSalesTaxInputSchema>;
type GetSalesTaxInput = z.infer<typeof getSalesTaxInputSchema>;
type DeleteSalesTaxInput = z.infer<typeof deleteSalesTaxInputSchema>;
type GetSalesTaxesInput = z.infer<typeof getSalesTaxesInputSchema>;
type GetSubscriptionInput = z.infer<typeof getSubscriptionInputSchema>;
type OptInToProgramInput = z.infer<typeof optInToProgramInputSchema>;
type OptOutOfProgramInput = z.infer<typeof optOutOfProgramInputSchema>;
type GetAdvertisingEligibilityInput = z.infer<typeof getAdvertisingEligibilityInputSchema>;

type CustomPolicy = components['schemas']['CustomPolicy'];
type SetFulfillmentPolicyResponse = components['schemas']['SetFulfillmentPolicyResponse'];
type FulfillmentPolicyResponse = components['schemas']['FulfillmentPolicyResponse'];
type FulfillmentPolicy = components['schemas']['FulfillmentPolicy'];
type KycResponse = components['schemas']['KycResponse'];
type SetPaymentPolicyResponse = components['schemas']['SetPaymentPolicyResponse'];
type GetPaymentPoliciesResponse = components['schemas']['PaymentPolicyResponse'];
type PaymentPolicy = components['schemas']['PaymentPolicy'];
type PaymentsProgramResponse = components['schemas']['PaymentsProgramResponse'];
type PaymentsProgramOnboardingResponse = components['schemas']['PaymentsProgramOnboardingResponse'];
type SellerEligibilityMultiProgramResponse =
  components['schemas']['SellerEligibilityMultiProgramResponse'];
type SellingPrivileges = components['schemas']['SellingPrivileges'];
type Programs = components['schemas']['Programs'];
type RateTableResponse = components['schemas']['RateTableResponse'];
type SetReturnPolicyResponse = components['schemas']['SetReturnPolicyResponse'];
type ReturnPolicyResponse = components['schemas']['ReturnPolicyResponse'];
type ReturnPolicy = components['schemas']['ReturnPolicy'];
type SalesTax = components['schemas']['SalesTax'];
type SalesTaxes = components['schemas']['SalesTaxes'];
type SubscriptionResponse = components['schemas']['SubscriptionResponse'];

/**
 * Response returned by eBay Account API getCustomPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicies
 */
export type GetCustomPoliciesResponse = components['schemas']['CustomPolicyResponse'];

/** Account API client for seller account policies, programs, tax, and eligibility. */
export class AccountApi {
  private readonly client: EbayApiClient;

  constructor(client: EbayApiClient) {
    this.client = client;
  }

  /**
   * Retrieves custom policies defined for the seller account.
   *
   * @param input - Optional custom policy type filter.
   * @returns An Effect that succeeds with eBay's generated CustomPolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   accountApi.getCustomPolicies({ policyTypes: 'TAKE_BACK' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicies
   */
  getCustomPolicies = (
    input: GetCustomPoliciesInput = {},
  ): Effect.Effect<GetCustomPoliciesResponse, EbayApiError> => {
    const params = buildEndpointParams({
      policyTypes: { wireName: 'policy_types', value: input.policyTypes },
    });

    return requestGetEffect<GetCustomPoliciesResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/custom_policy/`,
      params,
    );
  };

  /**
   * Retrieves one custom policy by ID.
   *
   * @param input - Custom policy identifier.
   * @returns An Effect that succeeds with eBay's generated CustomPolicy.
   *
   * @example
   * ```ts
   * const policy = await Effect.runPromise(
   *   accountApi.getCustomPolicy({ customPolicyId: '1234567890' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicy
   */
  getCustomPolicy = (input: GetCustomPolicyInput): Effect.Effect<CustomPolicy, EbayApiError> =>
    requestGetEffect<CustomPolicy>(
      this.client,
      `${ACCOUNT_BASE_PATH}/custom_policy/${input.customPolicyId}`,
    );

  /**
   * Creates a custom policy.
   *
   * @param input - Custom policy request body.
   * @returns An Effect that succeeds with eBay's generated CustomPolicy.
   *
   * @example
   * ```ts
   * const policy = await Effect.runPromise(
   *   accountApi.createCustomPolicy({ policy: { name: 'Compliance', policyType: 'PRODUCT_COMPLIANCE' } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/custom_policy/methods/createCustomPolicy
   */
  createCustomPolicy = (
    input: CreateCustomPolicyInput,
  ): Effect.Effect<CustomPolicy, EbayApiError> =>
    requestPostEffect<CustomPolicy>(
      this.client,
      `${ACCOUNT_BASE_PATH}/custom_policy/`,
      input.policy,
    );

  /**
   * Updates a custom policy by ID.
   *
   * @param input - Custom policy ID and full replacement policy payload.
   * @returns An Effect that succeeds when eBay accepts the update.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountApi.updateCustomPolicy({ customPolicyId: '1234567890', policy }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/custom_policy/methods/updateCustomPolicy
   */
  updateCustomPolicy = (input: UpdateCustomPolicyInput): Effect.Effect<void, EbayApiError> =>
    requestPutEffect<void>(
      this.client,
      `${ACCOUNT_BASE_PATH}/custom_policy/${input.customPolicyId}`,
      input.policy,
    );

  /**
   * Retrieves fulfillment policies for one marketplace.
   *
   * @param input - Marketplace ID used as the `marketplace_id` query parameter.
   * @returns An Effect that succeeds with eBay's generated FulfillmentPolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   accountApi.getFulfillmentPolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicies
   */
  getFulfillmentPolicies = (
    input: GetFulfillmentPoliciesInput,
  ): Effect.Effect<FulfillmentPolicyResponse, EbayApiError> => {
    const params = buildEndpointParams({
      marketplaceId: { wireName: 'marketplace_id', value: input.marketplaceId },
    });

    return requestGetEffect<FulfillmentPolicyResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/fulfillment_policy`,
      params,
    );
  };

  /**
   * Creates a fulfillment policy.
   *
   * @param input - Fulfillment policy request body.
   * @returns An Effect that succeeds with eBay's generated SetFulfillmentPolicyResponse.
   *
   * @example
   * ```ts
   * const created = await Effect.runPromise(
   *   accountApi.createFulfillmentPolicy({ policy }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/createFulfillmentPolicy
   */
  createFulfillmentPolicy = (
    input: CreateFulfillmentPolicyInput,
  ): Effect.Effect<SetFulfillmentPolicyResponse, EbayApiError> =>
    requestPostEffect<SetFulfillmentPolicyResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/fulfillment_policy/`,
      input.policy,
    );

  /**
   * Retrieves one fulfillment policy by ID.
   *
   * @param input - Fulfillment policy identifier.
   * @returns An Effect that succeeds with eBay's generated FulfillmentPolicy.
   *
   * @example
   * ```ts
   * const policy = await Effect.runPromise(
   *   accountApi.getFulfillmentPolicy({ fulfillmentPolicyId: 'FP123' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicy
   */
  getFulfillmentPolicy = (
    input: GetFulfillmentPolicyInput,
  ): Effect.Effect<FulfillmentPolicy, EbayApiError> =>
    requestGetEffect<FulfillmentPolicy>(
      this.client,
      `${ACCOUNT_BASE_PATH}/fulfillment_policy/${input.fulfillmentPolicyId}`,
    );

  /**
   * Retrieves one fulfillment policy by marketplace and policy name.
   *
   * @param input - Marketplace ID and seller-defined policy name.
   * @returns An Effect that succeeds with eBay's generated FulfillmentPolicy.
   *
   * @example
   * ```ts
   * const policy = await Effect.runPromise(
   *   accountApi.getFulfillmentPolicyByName({ marketplaceId: 'EBAY_US', name: 'Standard Shipping' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicyByName
   */
  getFulfillmentPolicyByName = (
    input: GetFulfillmentPolicyByNameInput,
  ): Effect.Effect<FulfillmentPolicy, EbayApiError> => {
    const params = buildEndpointParams({
      marketplaceId: { wireName: 'marketplace_id', value: input.marketplaceId },
      name: { wireName: 'name', value: input.name },
    });

    return requestGetEffect<FulfillmentPolicy>(
      this.client,
      `${ACCOUNT_BASE_PATH}/fulfillment_policy/get_by_policy_name`,
      params,
    );
  };

  /**
   * Updates a fulfillment policy by ID.
   *
   * @param input - Fulfillment policy ID and full replacement policy payload.
   * @returns An Effect that succeeds with eBay's generated SetFulfillmentPolicyResponse.
   *
   * @example
   * ```ts
   * const updated = await Effect.runPromise(
   *   accountApi.updateFulfillmentPolicy({ fulfillmentPolicyId: 'FP123', policy }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/updateFulfillmentPolicy
   */
  updateFulfillmentPolicy = (
    input: UpdateFulfillmentPolicyInput,
  ): Effect.Effect<SetFulfillmentPolicyResponse, EbayApiError> =>
    requestPutEffect<SetFulfillmentPolicyResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/fulfillment_policy/${input.fulfillmentPolicyId}`,
      input.policy,
    );

  /**
   * Deletes a fulfillment policy by ID.
   *
   * @param input - Fulfillment policy identifier.
   * @returns An Effect that succeeds when eBay deletes the policy.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountApi.deleteFulfillmentPolicy({ fulfillmentPolicyId: 'FP123' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/deleteFulfillmentPolicy
   */
  deleteFulfillmentPolicy = (
    input: DeleteFulfillmentPolicyInput,
  ): Effect.Effect<void, EbayApiError> =>
    requestDeleteEffect<void>(
      this.client,
      `${ACCOUNT_BASE_PATH}/fulfillment_policy/${input.fulfillmentPolicyId}`,
    );

  /**
   * Retrieves payment policies for one marketplace.
   *
   * @param input - Marketplace ID used as the `marketplace_id` query parameter.
   * @returns An Effect that succeeds with eBay's generated PaymentPolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   accountApi.getPaymentPolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicies
   */
  getPaymentPolicies = (
    input: GetPaymentPoliciesInput,
  ): Effect.Effect<GetPaymentPoliciesResponse, EbayApiError> => {
    const params = buildEndpointParams({
      marketplaceId: { wireName: 'marketplace_id', value: input.marketplaceId },
    });

    return requestGetEffect<GetPaymentPoliciesResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/payment_policy`,
      params,
    );
  };

  /**
   * Creates a payment policy.
   *
   * @param input - Payment policy request body.
   * @returns An Effect that succeeds with eBay's generated SetPaymentPolicyResponse.
   *
   * @example
   * ```ts
   * const created = await Effect.runPromise(accountApi.createPaymentPolicy({ policy }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/createPaymentPolicy
   */
  createPaymentPolicy = (
    input: CreatePaymentPolicyInput,
  ): Effect.Effect<SetPaymentPolicyResponse, EbayApiError> =>
    requestPostEffect<SetPaymentPolicyResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/payment_policy`,
      input.policy,
    );

  /**
   * Retrieves one payment policy by ID.
   *
   * @param input - Payment policy identifier.
   * @returns An Effect that succeeds with eBay's generated PaymentPolicy.
   *
   * @example
   * ```ts
   * const policy = await Effect.runPromise(
   *   accountApi.getPaymentPolicy({ paymentPolicyId: 'PP123' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicy
   */
  getPaymentPolicy = (input: GetPaymentPolicyInput): Effect.Effect<PaymentPolicy, EbayApiError> =>
    requestGetEffect<PaymentPolicy>(
      this.client,
      `${ACCOUNT_BASE_PATH}/payment_policy/${input.paymentPolicyId}`,
    );

  /**
   * Retrieves one payment policy by marketplace and policy name.
   *
   * @param input - Marketplace ID and seller-defined policy name.
   * @returns An Effect that succeeds with eBay's generated PaymentPolicy.
   *
   * @example
   * ```ts
   * const policy = await Effect.runPromise(
   *   accountApi.getPaymentPolicyByName({ marketplaceId: 'EBAY_US', name: 'Immediate Payment' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicyByName
   */
  getPaymentPolicyByName = (
    input: GetPaymentPolicyByNameInput,
  ): Effect.Effect<PaymentPolicy, EbayApiError> => {
    const params = buildEndpointParams({
      marketplaceId: { wireName: 'marketplace_id', value: input.marketplaceId },
      name: { wireName: 'name', value: input.name },
    });

    return requestGetEffect<PaymentPolicy>(
      this.client,
      `${ACCOUNT_BASE_PATH}/payment_policy/get_by_policy_name`,
      params,
    );
  };

  /**
   * Updates a payment policy by ID.
   *
   * @param input - Payment policy ID and full replacement policy payload.
   * @returns An Effect that succeeds with eBay's generated SetPaymentPolicyResponse.
   *
   * @example
   * ```ts
   * const updated = await Effect.runPromise(
   *   accountApi.updatePaymentPolicy({ paymentPolicyId: 'PP123', policy }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/updatePaymentPolicy
   */
  updatePaymentPolicy = (
    input: UpdatePaymentPolicyInput,
  ): Effect.Effect<SetPaymentPolicyResponse, EbayApiError> =>
    requestPutEffect<SetPaymentPolicyResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/payment_policy/${input.paymentPolicyId}`,
      input.policy,
    );

  /**
   * Deletes a payment policy by ID.
   *
   * @param input - Payment policy identifier.
   * @returns An Effect that succeeds when eBay deletes the policy.
   *
   * @example
   * ```ts
   * await Effect.runPromise(accountApi.deletePaymentPolicy({ paymentPolicyId: 'PP123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/deletePaymentPolicy
   */
  deletePaymentPolicy = (input: DeletePaymentPolicyInput): Effect.Effect<void, EbayApiError> =>
    requestDeleteEffect<void>(
      this.client,
      `${ACCOUNT_BASE_PATH}/payment_policy/${input.paymentPolicyId}`,
    );

  /**
   * Retrieves return policies for one marketplace.
   *
   * @param input - Marketplace ID used as the `marketplace_id` query parameter.
   * @returns An Effect that succeeds with eBay's generated ReturnPolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   accountApi.getReturnPolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/getReturnPolicies
   */
  getReturnPolicies = (
    input: GetReturnPoliciesInput,
  ): Effect.Effect<ReturnPolicyResponse, EbayApiError> => {
    const params = buildEndpointParams({
      marketplaceId: { wireName: 'marketplace_id', value: input.marketplaceId },
    });

    return requestGetEffect<ReturnPolicyResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/return_policy`,
      params,
    );
  };

  /**
   * Creates a return policy.
   *
   * @param input - Return policy request body.
   * @returns An Effect that succeeds with eBay's generated SetReturnPolicyResponse.
   *
   * @example
   * ```ts
   * const created = await Effect.runPromise(accountApi.createReturnPolicy({ policy }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/createReturnPolicy
   */
  createReturnPolicy = (
    input: CreateReturnPolicyInput,
  ): Effect.Effect<SetReturnPolicyResponse, EbayApiError> =>
    requestPostEffect<SetReturnPolicyResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/return_policy`,
      input.policy,
    );

  /**
   * Retrieves one return policy by ID.
   *
   * @param input - Return policy identifier.
   * @returns An Effect that succeeds with eBay's generated ReturnPolicy.
   *
   * @example
   * ```ts
   * const policy = await Effect.runPromise(accountApi.getReturnPolicy({ returnPolicyId: 'RP123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/getReturnPolicy
   */
  getReturnPolicy = (input: GetReturnPolicyInput): Effect.Effect<ReturnPolicy, EbayApiError> =>
    requestGetEffect<ReturnPolicy>(
      this.client,
      `${ACCOUNT_BASE_PATH}/return_policy/${input.returnPolicyId}`,
    );

  /**
   * Retrieves one return policy by marketplace and policy name.
   *
   * @param input - Marketplace ID and seller-defined policy name.
   * @returns An Effect that succeeds with eBay's generated ReturnPolicy.
   *
   * @example
   * ```ts
   * const policy = await Effect.runPromise(
   *   accountApi.getReturnPolicyByName({ marketplaceId: 'EBAY_US', name: '30 Day Returns' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/getReturnPolicyByName
   */
  getReturnPolicyByName = (
    input: GetReturnPolicyByNameInput,
  ): Effect.Effect<ReturnPolicy, EbayApiError> => {
    const params = buildEndpointParams({
      marketplaceId: { wireName: 'marketplace_id', value: input.marketplaceId },
      name: { wireName: 'name', value: input.name },
    });

    return requestGetEffect<ReturnPolicy>(
      this.client,
      `${ACCOUNT_BASE_PATH}/return_policy/get_by_policy_name`,
      params,
    );
  };

  /**
   * Updates a return policy by ID.
   *
   * @param input - Return policy ID and full replacement policy payload.
   * @returns An Effect that succeeds with eBay's generated SetReturnPolicyResponse.
   *
   * @example
   * ```ts
   * const updated = await Effect.runPromise(
   *   accountApi.updateReturnPolicy({ returnPolicyId: 'RP123', policy }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/updateReturnPolicy
   */
  updateReturnPolicy = (
    input: UpdateReturnPolicyInput,
  ): Effect.Effect<SetReturnPolicyResponse, EbayApiError> =>
    requestPutEffect<SetReturnPolicyResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/return_policy/${input.returnPolicyId}`,
      input.policy,
    );

  /**
   * Deletes a return policy by ID.
   *
   * @param input - Return policy identifier.
   * @returns An Effect that succeeds when eBay deletes the policy.
   *
   * @example
   * ```ts
   * await Effect.runPromise(accountApi.deleteReturnPolicy({ returnPolicyId: 'RP123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/deleteReturnPolicy
   */
  deleteReturnPolicy = (input: DeleteReturnPolicyInput): Effect.Effect<void, EbayApiError> =>
    requestDeleteEffect<void>(
      this.client,
      `${ACCOUNT_BASE_PATH}/return_policy/${input.returnPolicyId}`,
    );

  /**
   * Retrieves seller payments program status.
   *
   * @param input - Marketplace ID and payments program type.
   * @returns An Effect that succeeds with eBay's generated PaymentsProgramResponse.
   *
   * @example
   * ```ts
   * const status = await Effect.runPromise(
   *   accountApi.getPaymentsProgram({ marketplaceId: 'EBAY_US', paymentsProgramType: 'EBAY_PAYMENTS' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/payments_program/methods/getPaymentsProgram
   */
  getPaymentsProgram = (
    input: GetPaymentsProgramInput,
  ): Effect.Effect<PaymentsProgramResponse, EbayApiError> =>
    requestGetEffect<PaymentsProgramResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/payments_program/${input.marketplaceId}/${input.paymentsProgramType}`,
    );

  /**
   * Retrieves seller payments program onboarding status.
   *
   * @param input - Marketplace ID and payments program type.
   * @returns An Effect that succeeds with eBay's generated PaymentsProgramOnboardingResponse.
   *
   * @example
   * ```ts
   * const onboarding = await Effect.runPromise(
   *   accountApi.getPaymentsProgramOnboarding({
   *     marketplaceId: 'EBAY_US',
   *     paymentsProgramType: 'EBAY_PAYMENTS',
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/program/methods/payments_program/onboarding/methods/getPaymentsProgramOnboarding
   */
  getPaymentsProgramOnboarding = (
    input: GetPaymentsProgramOnboardingInput,
  ): Effect.Effect<PaymentsProgramOnboardingResponse, EbayApiError> =>
    requestGetEffect<PaymentsProgramOnboardingResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/payments_program/${input.marketplaceId}/${input.paymentsProgramType}/onboarding`,
    );

  /**
   * Retrieves the seller account privileges.
   *
   * @param _input - Empty object accepted for tool/API shape consistency.
   * @returns An Effect that succeeds with eBay's generated SellingPrivileges.
   *
   * @example
   * ```ts
   * const privileges = await Effect.runPromise(accountApi.getPrivileges({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/privilege/methods/getPrivileges
   */
  getPrivileges = (
    _input: EmptyAccountInput = {},
  ): Effect.Effect<SellingPrivileges, EbayApiError> =>
    requestGetEffect<SellingPrivileges>(this.client, `${ACCOUNT_BASE_PATH}/privilege`);

  /**
   * Retrieves seller programs the account has opted into.
   *
   * @param _input - Empty object accepted for tool/API shape consistency.
   * @returns An Effect that succeeds with eBay's generated Programs response.
   *
   * @example
   * ```ts
   * const programs = await Effect.runPromise(accountApi.getOptedInPrograms({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/program/methods/getOptedInPrograms
   */
  getOptedInPrograms = (_input: EmptyAccountInput = {}): Effect.Effect<Programs, EbayApiError> =>
    requestGetEffect<Programs>(this.client, `${ACCOUNT_BASE_PATH}/program/get_opted_in_programs`);

  /**
   * Opts the seller into an Account API program.
   *
   * @param input - Program opt-in request body.
   * @returns An Effect that succeeds when eBay accepts the opt-in request.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountApi.optInToProgram({ request: { programType: 'OUT_OF_STOCK_CONTROL' } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/program/methods/optInToProgram
   */
  optInToProgram = (input: OptInToProgramInput): Effect.Effect<void, EbayApiError> =>
    requestPostEffect<void>(this.client, `${ACCOUNT_BASE_PATH}/program/opt_in`, input.request);

  /**
   * Opts the seller out of an Account API program.
   *
   * @param input - Program opt-out request body.
   * @returns An Effect that succeeds when eBay accepts the opt-out request.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountApi.optOutOfProgram({ request: { programType: 'OUT_OF_STOCK_CONTROL' } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/program/methods/optOutOfProgram
   */
  optOutOfProgram = (input: OptOutOfProgramInput): Effect.Effect<void, EbayApiError> =>
    requestPostEffect<void>(this.client, `${ACCOUNT_BASE_PATH}/program/opt_out`, input.request);

  /**
   * Retrieves seller rate tables.
   *
   * @param _input - Empty object accepted for tool/API shape consistency.
   * @returns An Effect that succeeds with eBay's generated RateTableResponse.
   *
   * @example
   * ```ts
   * const rateTables = await Effect.runPromise(accountApi.getRateTables({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/rate_table/methods/getRateTables
   */
  getRateTables = (
    _input: EmptyAccountInput = {},
  ): Effect.Effect<RateTableResponse, EbayApiError> =>
    requestGetEffect<RateTableResponse>(this.client, `${ACCOUNT_BASE_PATH}/rate_table`);

  /**
   * Creates or replaces one sales tax table entry.
   *
   * @param input - Country, jurisdiction, and sales tax payload.
   * @returns An Effect that succeeds when eBay accepts the sales tax table entry.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountApi.createOrReplaceSalesTax({ countryCode: 'US', jurisdictionId: 'CA', salesTaxBase }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/sales_tax/methods/createOrReplaceSalesTax
   */
  createOrReplaceSalesTax = (
    input: CreateOrReplaceSalesTaxInput,
  ): Effect.Effect<void, EbayApiError> =>
    requestPutEffect<void>(
      this.client,
      `${ACCOUNT_BASE_PATH}/sales_tax/${input.countryCode}/${input.jurisdictionId}`,
      input.salesTaxBase,
    );

  /**
   * Creates or replaces multiple sales tax table entries.
   *
   * @param input - Bulk sales tax request rows.
   * @returns An Effect that succeeds when eBay accepts the bulk sales tax request.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountApi.bulkCreateOrReplaceSalesTax({ requests }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/sales_tax/methods/bulkCreateOrReplaceSalesTax
   */
  bulkCreateOrReplaceSalesTax = (
    input: BulkCreateOrReplaceSalesTaxInput,
  ): Effect.Effect<void, EbayApiError> =>
    requestPostEffect<void>(this.client, `${ACCOUNT_BASE_PATH}/bulk_create_or_replace_sales_tax`, {
      requests: input.requests,
    });

  /**
   * Deletes one sales tax table entry.
   *
   * @param input - Country and jurisdiction identifiers.
   * @returns An Effect that succeeds when eBay deletes the sales tax table entry.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountApi.deleteSalesTax({ countryCode: 'US', jurisdictionId: 'CA' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/sales_tax/methods/deleteSalesTax
   */
  deleteSalesTax = (input: DeleteSalesTaxInput): Effect.Effect<void, EbayApiError> =>
    requestDeleteEffect<void>(
      this.client,
      `${ACCOUNT_BASE_PATH}/sales_tax/${input.countryCode}/${input.jurisdictionId}`,
    );

  /**
   * Retrieves one sales tax table entry.
   *
   * @param input - Country and jurisdiction identifiers.
   * @returns An Effect that succeeds with eBay's generated SalesTax.
   *
   * @example
   * ```ts
   * const tax = await Effect.runPromise(
   *   accountApi.getSalesTax({ countryCode: 'US', jurisdictionId: 'CA' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/sales_tax/methods/getSalesTax
   */
  getSalesTax = (input: GetSalesTaxInput): Effect.Effect<SalesTax, EbayApiError> =>
    requestGetEffect<SalesTax>(
      this.client,
      `${ACCOUNT_BASE_PATH}/sales_tax/${input.countryCode}/${input.jurisdictionId}`,
    );

  /**
   * Retrieves all sales tax table entries for one country.
   *
   * @param input - Country code used as the `country_code` query parameter.
   * @returns An Effect that succeeds with eBay's generated SalesTaxes response.
   *
   * @example
   * ```ts
   * const taxes = await Effect.runPromise(accountApi.getSalesTaxes({ countryCode: 'US' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/sales_tax/methods/getSalesTaxes
   */
  getSalesTaxes = (input: GetSalesTaxesInput): Effect.Effect<SalesTaxes, EbayApiError> => {
    const params = buildEndpointParams({
      countryCode: { wireName: 'country_code', value: input.countryCode },
    });

    return requestGetEffect<SalesTaxes>(this.client, `${ACCOUNT_BASE_PATH}/sales_tax`, params);
  };

  /**
   * Retrieves seller subscription information.
   *
   * @param input - Optional subscription limit and continuation token.
   * @returns An Effect that succeeds with eBay's generated SubscriptionResponse.
   *
   * @example
   * ```ts
   * const subscription = await Effect.runPromise(accountApi.getSubscription({ limit: '10' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/subscription/methods/getSubscription
   */
  getSubscription = (
    input: GetSubscriptionInput = {},
  ): Effect.Effect<SubscriptionResponse, EbayApiError> => {
    const params = buildEndpointParams({
      limit: { wireName: 'limit', value: input.limit },
      continuationToken: { wireName: 'continuation_token', value: input.continuationToken },
    });

    return requestGetEffect<SubscriptionResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/subscription`,
      params,
    );
  };

  /**
   * Retrieves seller KYC status.
   *
   * @param _input - Empty object accepted for tool/API shape consistency.
   * @returns An Effect that succeeds with eBay's generated KycResponse.
   *
   * @example
   * ```ts
   * const kyc = await Effect.runPromise(accountApi.getKyc({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/kyc/methods/getKYC
   */
  getKyc = (_input: EmptyAccountInput = {}): Effect.Effect<KycResponse, EbayApiError> =>
    requestGetEffect<KycResponse>(this.client, `${ACCOUNT_BASE_PATH}/kyc`);

  /**
   * Retrieves seller advertising-program eligibility for one marketplace.
   *
   * @param input - Marketplace header and optional comma-separated program type filter.
   * @returns An Effect that succeeds with eBay's generated SellerEligibilityMultiProgramResponse.
   *
   * @example
   * ```ts
   * const eligibility = await Effect.runPromise(
   *   accountApi.getAdvertisingEligibility({ marketplaceId: 'EBAY_US', programTypes: 'PLA' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/resources/advertising_eligibility/methods/getAdvertisingEligibility
   */
  getAdvertisingEligibility = (
    input: GetAdvertisingEligibilityInput,
  ): Effect.Effect<SellerEligibilityMultiProgramResponse, EbayApiError> => {
    const params = buildEndpointParams({
      programTypes: { wireName: 'program_types', value: input.programTypes },
    });

    return requestGetEffect<SellerEligibilityMultiProgramResponse>(
      this.client,
      `${ACCOUNT_BASE_PATH}/advertising_eligibility`,
      params,
      {
        headers: {
          'X-EBAY-C-MARKETPLACE-ID': input.marketplaceId,
        },
      },
    );
  };
}
