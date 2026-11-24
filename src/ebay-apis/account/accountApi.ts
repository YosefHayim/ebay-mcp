import type { z } from "zod";
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
} from "@/ebay-apis/account/accountSchemas.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	requestDeleteEffect,
	requestGetEffect,
	requestPostEffect,
	requestPutEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellAccountV1Oas3.js";

const ACCOUNT_BASE_PATH = "/sell/account/v1";

type EmptyAccountInput = Record<string, never>;
type GetCustomPoliciesInput = z.infer<typeof getCustomPoliciesInputSchema>;
type GetCustomPolicyInput = z.infer<typeof getCustomPolicyInputSchema>;
type CreateCustomPolicyInput = z.infer<typeof createCustomPolicyInputSchema>;
type UpdateCustomPolicyInput = z.infer<typeof updateCustomPolicyInputSchema>;
type GetFulfillmentPoliciesInput = z.infer<
	typeof getFulfillmentPoliciesInputSchema
>;
type GetFulfillmentPolicyInput = z.infer<
	typeof getFulfillmentPolicyInputSchema
>;
type GetFulfillmentPolicyByNameInput = z.infer<
	typeof getFulfillmentPolicyByNameInputSchema
>;
type CreateFulfillmentPolicyInput = z.infer<
	typeof createFulfillmentPolicyInputSchema
>;
type UpdateFulfillmentPolicyInput = z.infer<
	typeof updateFulfillmentPolicyInputSchema
>;
type DeleteFulfillmentPolicyInput = z.infer<
	typeof deleteFulfillmentPolicyInputSchema
>;
type GetPaymentPoliciesInput = z.infer<typeof getPaymentPoliciesInputSchema>;
type GetPaymentPolicyInput = z.infer<typeof getPaymentPolicyInputSchema>;
type GetPaymentPolicyByNameInput = z.infer<
	typeof getPaymentPolicyByNameInputSchema
>;
type CreatePaymentPolicyInput = z.infer<typeof createPaymentPolicyInputSchema>;
type UpdatePaymentPolicyInput = z.infer<typeof updatePaymentPolicyInputSchema>;
type DeletePaymentPolicyInput = z.infer<typeof deletePaymentPolicyInputSchema>;
type GetReturnPoliciesInput = z.infer<typeof getReturnPoliciesInputSchema>;
type GetReturnPolicyInput = z.infer<typeof getReturnPolicyInputSchema>;
type GetReturnPolicyByNameInput = z.infer<
	typeof getReturnPolicyByNameInputSchema
>;
type CreateReturnPolicyInput = z.infer<typeof createReturnPolicyInputSchema>;
type UpdateReturnPolicyInput = z.infer<typeof updateReturnPolicyInputSchema>;
type DeleteReturnPolicyInput = z.infer<typeof deleteReturnPolicyInputSchema>;
type GetPaymentsProgramInput = z.infer<typeof getPaymentsProgramInputSchema>;
type GetPaymentsProgramOnboardingInput = z.infer<
	typeof getPaymentsProgramOnboardingInputSchema
>;
type CreateOrReplaceSalesTaxInput = z.infer<
	typeof createOrReplaceSalesTaxInputSchema
>;
type BulkCreateOrReplaceSalesTaxInput = z.infer<
	typeof bulkCreateOrReplaceSalesTaxInputSchema
>;
type GetSalesTaxInput = z.infer<typeof getSalesTaxInputSchema>;
type DeleteSalesTaxInput = z.infer<typeof deleteSalesTaxInputSchema>;
type GetSalesTaxesInput = z.infer<typeof getSalesTaxesInputSchema>;
type GetSubscriptionInput = z.infer<typeof getSubscriptionInputSchema>;
type OptInToProgramInput = z.infer<typeof optInToProgramInputSchema>;
type OptOutOfProgramInput = z.infer<typeof optOutOfProgramInputSchema>;
type GetAdvertisingEligibilityInput = z.infer<
	typeof getAdvertisingEligibilityInputSchema
>;

type CustomPolicy = components["schemas"]["CustomPolicy"];
type SetFulfillmentPolicyResponse =
	components["schemas"]["SetFulfillmentPolicyResponse"];
type FulfillmentPolicyResponse =
	components["schemas"]["FulfillmentPolicyResponse"];
type FulfillmentPolicy = components["schemas"]["FulfillmentPolicy"];
type KycResponse = components["schemas"]["KycResponse"];
type SetPaymentPolicyResponse =
	components["schemas"]["SetPaymentPolicyResponse"];
type GetPaymentPoliciesResponse =
	components["schemas"]["PaymentPolicyResponse"];
type PaymentPolicy = components["schemas"]["PaymentPolicy"];
type PaymentsProgramResponse = components["schemas"]["PaymentsProgramResponse"];
type PaymentsProgramOnboardingResponse =
	components["schemas"]["PaymentsProgramOnboardingResponse"];
type SellerEligibilityMultiProgramResponse =
	components["schemas"]["SellerEligibilityMultiProgramResponse"];
type SellingPrivileges = components["schemas"]["SellingPrivileges"];
type Programs = components["schemas"]["Programs"];
type RateTableResponse = components["schemas"]["RateTableResponse"];
type SetReturnPolicyResponse = components["schemas"]["SetReturnPolicyResponse"];
type ReturnPolicyResponse = components["schemas"]["ReturnPolicyResponse"];
type ReturnPolicy = components["schemas"]["ReturnPolicy"];
type SalesTax = components["schemas"]["SalesTax"];
type SalesTaxes = components["schemas"]["SalesTaxes"];
type SubscriptionResponse = components["schemas"]["SubscriptionResponse"];

/**
 * Response returned by eBay Account API getCustomPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicies
 */
export type GetCustomPoliciesResponse =
	components["schemas"]["CustomPolicyResponse"];

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
	 * @returns A promise that resolves with eBay's generated CustomPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await accountApi.getCustomPolicies({ policyTypes: 'TAKE_BACK' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicies
	 */
	getCustomPolicies = (
		input: GetCustomPoliciesInput = {},
	): Promise<GetCustomPoliciesResponse> => {
		const params = buildEndpointParams({
			policyTypes: { wireName: "policy_types", value: input.policyTypes },
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
	 * @returns A promise that resolves with eBay's generated CustomPolicy.
	 *
	 * @example
	 * ```ts
	 * const policy = await accountApi.getCustomPolicy({ customPolicyId: '1234567890' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/custom_policy/methods/getCustomPolicy
	 */
	getCustomPolicy = (input: GetCustomPolicyInput): Promise<CustomPolicy> =>
		requestGetEffect<CustomPolicy>(
			this.client,
			`${ACCOUNT_BASE_PATH}/custom_policy/${input.customPolicyId}`,
		);

	/**
	 * Creates a custom policy.
	 *
	 * @param input - Custom policy request body.
	 * @returns A promise that resolves with eBay's generated CustomPolicy.
	 *
	 * @example
	 * ```ts
	 * const policy = await accountApi.createCustomPolicy({ policy: { name: 'Compliance', policyType: 'PRODUCT_COMPLIANCE' } });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/custom_policy/methods/createCustomPolicy
	 */
	createCustomPolicy = (
		input: CreateCustomPolicyInput,
	): Promise<CustomPolicy> =>
		requestPostEffect<CustomPolicy>(
			this.client,
			`${ACCOUNT_BASE_PATH}/custom_policy/`,
			input.policy,
		);

	/**
	 * Updates a custom policy by ID.
	 *
	 * @param input - Custom policy ID and full replacement policy payload.
	 * @returns A promise that resolves when eBay accepts the update.
	 *
	 * @example
	 * ```ts
	 * await accountApi.updateCustomPolicy({ customPolicyId: '1234567890', policy });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/custom_policy/methods/updateCustomPolicy
	 */
	updateCustomPolicy = (input: UpdateCustomPolicyInput): Promise<void> =>
		requestPutEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/custom_policy/${input.customPolicyId}`,
			input.policy,
		);

	/**
	 * Retrieves fulfillment policies for one marketplace.
	 *
	 * @param input - Marketplace ID used as the `marketplace_id` query parameter.
	 * @returns A promise that resolves with eBay's generated FulfillmentPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await accountApi.getFulfillmentPolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicies
	 */
	getFulfillmentPolicies = (
		input: GetFulfillmentPoliciesInput,
	): Promise<FulfillmentPolicyResponse> => {
		const params = buildEndpointParams({
			marketplaceId: { wireName: "marketplace_id", value: input.marketplaceId },
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
	 * @returns A promise that resolves with eBay's generated SetFulfillmentPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const created = await accountApi.createFulfillmentPolicy({ policy });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/createFulfillmentPolicy
	 */
	createFulfillmentPolicy = (
		input: CreateFulfillmentPolicyInput,
	): Promise<SetFulfillmentPolicyResponse> =>
		requestPostEffect<SetFulfillmentPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/fulfillment_policy/`,
			input.policy,
		);

	/**
	 * Retrieves one fulfillment policy by ID.
	 *
	 * @param input - Fulfillment policy identifier.
	 * @returns A promise that resolves with eBay's generated FulfillmentPolicy.
	 *
	 * @example
	 * ```ts
	 * const policy = await accountApi.getFulfillmentPolicy({ fulfillmentPolicyId: 'FP123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicy
	 */
	getFulfillmentPolicy = (
		input: GetFulfillmentPolicyInput,
	): Promise<FulfillmentPolicy> =>
		requestGetEffect<FulfillmentPolicy>(
			this.client,
			`${ACCOUNT_BASE_PATH}/fulfillment_policy/${input.fulfillmentPolicyId}`,
		);

	/**
	 * Retrieves one fulfillment policy by marketplace and policy name.
	 *
	 * @param input - Marketplace ID and seller-defined policy name.
	 * @returns A promise that resolves with eBay's generated FulfillmentPolicy.
	 *
	 * @example
	 * ```ts
	 * const policy = await accountApi.getFulfillmentPolicyByName({ marketplaceId: 'EBAY_US', name: 'Standard Shipping' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/getFulfillmentPolicyByName
	 */
	getFulfillmentPolicyByName = (
		input: GetFulfillmentPolicyByNameInput,
	): Promise<FulfillmentPolicy> => {
		const params = buildEndpointParams({
			marketplaceId: { wireName: "marketplace_id", value: input.marketplaceId },
			name: { wireName: "name", value: input.name },
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
	 * @returns A promise that resolves with eBay's generated SetFulfillmentPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const updated = await accountApi.updateFulfillmentPolicy({ fulfillmentPolicyId: 'FP123', policy });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/updateFulfillmentPolicy
	 */
	updateFulfillmentPolicy = (
		input: UpdateFulfillmentPolicyInput,
	): Promise<SetFulfillmentPolicyResponse> =>
		requestPutEffect<SetFulfillmentPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/fulfillment_policy/${input.fulfillmentPolicyId}`,
			input.policy,
		);

	/**
	 * Deletes a fulfillment policy by ID.
	 *
	 * @param input - Fulfillment policy identifier.
	 * @returns A promise that resolves when eBay deletes the policy.
	 *
	 * @example
	 * ```ts
	 * await accountApi.deleteFulfillmentPolicy({ fulfillmentPolicyId: 'FP123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/fulfillment_policy/methods/deleteFulfillmentPolicy
	 */
	deleteFulfillmentPolicy = (
		input: DeleteFulfillmentPolicyInput,
	): Promise<void> =>
		requestDeleteEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/fulfillment_policy/${input.fulfillmentPolicyId}`,
		);

	/**
	 * Retrieves payment policies for one marketplace.
	 *
	 * @param input - Marketplace ID used as the `marketplace_id` query parameter.
	 * @returns A promise that resolves with eBay's generated PaymentPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await accountApi.getPaymentPolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicies
	 */
	getPaymentPolicies = (
		input: GetPaymentPoliciesInput,
	): Promise<GetPaymentPoliciesResponse> => {
		const params = buildEndpointParams({
			marketplaceId: { wireName: "marketplace_id", value: input.marketplaceId },
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
	 * @returns A promise that resolves with eBay's generated SetPaymentPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const created = await accountApi.createPaymentPolicy({ policy });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/createPaymentPolicy
	 */
	createPaymentPolicy = (
		input: CreatePaymentPolicyInput,
	): Promise<SetPaymentPolicyResponse> =>
		requestPostEffect<SetPaymentPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payment_policy`,
			input.policy,
		);

	/**
	 * Retrieves one payment policy by ID.
	 *
	 * @param input - Payment policy identifier.
	 * @returns A promise that resolves with eBay's generated PaymentPolicy.
	 *
	 * @example
	 * ```ts
	 * const policy = await accountApi.getPaymentPolicy({ paymentPolicyId: 'PP123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicy
	 */
	getPaymentPolicy = (input: GetPaymentPolicyInput): Promise<PaymentPolicy> =>
		requestGetEffect<PaymentPolicy>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payment_policy/${input.paymentPolicyId}`,
		);

	/**
	 * Retrieves one payment policy by marketplace and policy name.
	 *
	 * @param input - Marketplace ID and seller-defined policy name.
	 * @returns A promise that resolves with eBay's generated PaymentPolicy.
	 *
	 * @example
	 * ```ts
	 * const policy = await accountApi.getPaymentPolicyByName({ marketplaceId: 'EBAY_US', name: 'Immediate Payment' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/getPaymentPolicyByName
	 */
	getPaymentPolicyByName = (
		input: GetPaymentPolicyByNameInput,
	): Promise<PaymentPolicy> => {
		const params = buildEndpointParams({
			marketplaceId: { wireName: "marketplace_id", value: input.marketplaceId },
			name: { wireName: "name", value: input.name },
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
	 * @returns A promise that resolves with eBay's generated SetPaymentPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const updated = await accountApi.updatePaymentPolicy({ paymentPolicyId: 'PP123', policy });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/updatePaymentPolicy
	 */
	updatePaymentPolicy = (
		input: UpdatePaymentPolicyInput,
	): Promise<SetPaymentPolicyResponse> =>
		requestPutEffect<SetPaymentPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payment_policy/${input.paymentPolicyId}`,
			input.policy,
		);

	/**
	 * Deletes a payment policy by ID.
	 *
	 * @param input - Payment policy identifier.
	 * @returns A promise that resolves when eBay deletes the policy.
	 *
	 * @example
	 * ```ts
	 * await accountApi.deletePaymentPolicy({ paymentPolicyId: 'PP123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/payment_policy/methods/deletePaymentPolicy
	 */
	deletePaymentPolicy = (input: DeletePaymentPolicyInput): Promise<void> =>
		requestDeleteEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payment_policy/${input.paymentPolicyId}`,
		);

	/**
	 * Retrieves return policies for one marketplace.
	 *
	 * @param input - Marketplace ID used as the `marketplace_id` query parameter.
	 * @returns A promise that resolves with eBay's generated ReturnPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await accountApi.getReturnPolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/getReturnPolicies
	 */
	getReturnPolicies = (
		input: GetReturnPoliciesInput,
	): Promise<ReturnPolicyResponse> => {
		const params = buildEndpointParams({
			marketplaceId: { wireName: "marketplace_id", value: input.marketplaceId },
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
	 * @returns A promise that resolves with eBay's generated SetReturnPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const created = await accountApi.createReturnPolicy({ policy });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/createReturnPolicy
	 */
	createReturnPolicy = (
		input: CreateReturnPolicyInput,
	): Promise<SetReturnPolicyResponse> =>
		requestPostEffect<SetReturnPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/return_policy`,
			input.policy,
		);

	/**
	 * Retrieves one return policy by ID.
	 *
	 * @param input - Return policy identifier.
	 * @returns A promise that resolves with eBay's generated ReturnPolicy.
	 *
	 * @example
	 * ```ts
	 * const policy = await accountApi.getReturnPolicy({ returnPolicyId: 'RP123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/getReturnPolicy
	 */
	getReturnPolicy = (input: GetReturnPolicyInput): Promise<ReturnPolicy> =>
		requestGetEffect<ReturnPolicy>(
			this.client,
			`${ACCOUNT_BASE_PATH}/return_policy/${input.returnPolicyId}`,
		);

	/**
	 * Retrieves one return policy by marketplace and policy name.
	 *
	 * @param input - Marketplace ID and seller-defined policy name.
	 * @returns A promise that resolves with eBay's generated ReturnPolicy.
	 *
	 * @example
	 * ```ts
	 * const policy = await accountApi.getReturnPolicyByName({ marketplaceId: 'EBAY_US', name: '30 Day Returns' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/getReturnPolicyByName
	 */
	getReturnPolicyByName = (
		input: GetReturnPolicyByNameInput,
	): Promise<ReturnPolicy> => {
		const params = buildEndpointParams({
			marketplaceId: { wireName: "marketplace_id", value: input.marketplaceId },
			name: { wireName: "name", value: input.name },
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
	 * @returns A promise that resolves with eBay's generated SetReturnPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const updated = await accountApi.updateReturnPolicy({ returnPolicyId: 'RP123', policy });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/updateReturnPolicy
	 */
	updateReturnPolicy = (
		input: UpdateReturnPolicyInput,
	): Promise<SetReturnPolicyResponse> =>
		requestPutEffect<SetReturnPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/return_policy/${input.returnPolicyId}`,
			input.policy,
		);

	/**
	 * Deletes a return policy by ID.
	 *
	 * @param input - Return policy identifier.
	 * @returns A promise that resolves when eBay deletes the policy.
	 *
	 * @example
	 * ```ts
	 * await accountApi.deleteReturnPolicy({ returnPolicyId: 'RP123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/return_policy/methods/deleteReturnPolicy
	 */
	deleteReturnPolicy = (input: DeleteReturnPolicyInput): Promise<void> =>
		requestDeleteEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/return_policy/${input.returnPolicyId}`,
		);

	/**
	 * Retrieves seller payments program status.
	 *
	 * @param input - Marketplace ID and payments program type.
	 * @returns A promise that resolves with eBay's generated PaymentsProgramResponse.
	 *
	 * @example
	 * ```ts
	 * const status = await accountApi.getPaymentsProgram({ marketplaceId: 'EBAY_US', paymentsProgramType: 'EBAY_PAYMENTS' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/payments_program/methods/getPaymentsProgram
	 */
	getPaymentsProgram = (
		input: GetPaymentsProgramInput,
	): Promise<PaymentsProgramResponse> =>
		requestGetEffect<PaymentsProgramResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payments_program/${input.marketplaceId}/${input.paymentsProgramType}`,
		);

	/**
	 * Retrieves seller payments program onboarding status.
	 *
	 * @param input - Marketplace ID and payments program type.
	 * @returns A promise that resolves with eBay's generated PaymentsProgramOnboardingResponse.
	 *
	 * @example
	 * ```ts
	 * const onboarding = await accountApi.getPaymentsProgramOnboarding({
	 *     marketplaceId: 'EBAY_US',
	 *     paymentsProgramType: 'EBAY_PAYMENTS',
	 *   });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/program/methods/payments_program/onboarding/methods/getPaymentsProgramOnboarding
	 */
	getPaymentsProgramOnboarding = (
		input: GetPaymentsProgramOnboardingInput,
	): Promise<PaymentsProgramOnboardingResponse> =>
		requestGetEffect<PaymentsProgramOnboardingResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payments_program/${input.marketplaceId}/${input.paymentsProgramType}/onboarding`,
		);

	/**
	 * Retrieves the seller account privileges.
	 *
	 * @param _input - Empty object accepted for tool/API shape consistency.
	 * @returns A promise that resolves with eBay's generated SellingPrivileges.
	 *
	 * @example
	 * ```ts
	 * const privileges = await accountApi.getPrivileges({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/privilege/methods/getPrivileges
	 */
	getPrivileges = (
		_input: EmptyAccountInput = {},
	): Promise<SellingPrivileges> =>
		requestGetEffect<SellingPrivileges>(
			this.client,
			`${ACCOUNT_BASE_PATH}/privilege`,
		);

	/**
	 * Retrieves seller programs the account has opted into.
	 *
	 * @param _input - Empty object accepted for tool/API shape consistency.
	 * @returns A promise that resolves with eBay's generated Programs response.
	 *
	 * @example
	 * ```ts
	 * const programs = await accountApi.getOptedInPrograms({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/program/methods/getOptedInPrograms
	 */
	getOptedInPrograms = (_input: EmptyAccountInput = {}): Promise<Programs> =>
		requestGetEffect<Programs>(
			this.client,
			`${ACCOUNT_BASE_PATH}/program/get_opted_in_programs`,
		);

	/**
	 * Opts the seller into an Account API program.
	 *
	 * @param input - Program opt-in request body.
	 * @returns A promise that resolves when eBay accepts the opt-in request.
	 *
	 * @example
	 * ```ts
	 * await accountApi.optInToProgram({ request: { programType: 'OUT_OF_STOCK_CONTROL' } });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/program/methods/optInToProgram
	 */
	optInToProgram = (input: OptInToProgramInput): Promise<void> =>
		requestPostEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/program/opt_in`,
			input.request,
		);

	/**
	 * Opts the seller out of an Account API program.
	 *
	 * @param input - Program opt-out request body.
	 * @returns A promise that resolves when eBay accepts the opt-out request.
	 *
	 * @example
	 * ```ts
	 * await accountApi.optOutOfProgram({ request: { programType: 'OUT_OF_STOCK_CONTROL' } });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/program/methods/optOutOfProgram
	 */
	optOutOfProgram = (input: OptOutOfProgramInput): Promise<void> =>
		requestPostEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/program/opt_out`,
			input.request,
		);

	/**
	 * Retrieves seller rate tables.
	 *
	 * @param _input - Empty object accepted for tool/API shape consistency.
	 * @returns A promise that resolves with eBay's generated RateTableResponse.
	 *
	 * @example
	 * ```ts
	 * const rateTables = await accountApi.getRateTables({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/rate_table/methods/getRateTables
	 */
	getRateTables = (
		_input: EmptyAccountInput = {},
	): Promise<RateTableResponse> =>
		requestGetEffect<RateTableResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/rate_table`,
		);

	/**
	 * Creates or replaces one sales tax table entry.
	 *
	 * @param input - Country, jurisdiction, and sales tax payload.
	 * @returns A promise that resolves when eBay accepts the sales tax table entry.
	 *
	 * @example
	 * ```ts
	 * await accountApi.createOrReplaceSalesTax({ countryCode: 'US', jurisdictionId: 'CA', salesTaxBase });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/sales_tax/methods/createOrReplaceSalesTax
	 */
	createOrReplaceSalesTax = (
		input: CreateOrReplaceSalesTaxInput,
	): Promise<void> =>
		requestPutEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/sales_tax/${input.countryCode}/${input.jurisdictionId}`,
			input.salesTaxBase,
		);

	/**
	 * Creates or replaces multiple sales tax table entries.
	 *
	 * @param input - Bulk sales tax request rows.
	 * @returns A promise that resolves when eBay accepts the bulk sales tax request.
	 *
	 * @example
	 * ```ts
	 * await accountApi.bulkCreateOrReplaceSalesTax({ requests });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/sales_tax/methods/bulkCreateOrReplaceSalesTax
	 */
	bulkCreateOrReplaceSalesTax = (
		input: BulkCreateOrReplaceSalesTaxInput,
	): Promise<void> =>
		requestPostEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/bulk_create_or_replace_sales_tax`,
			{
				requests: input.requests,
			},
		);

	/**
	 * Deletes one sales tax table entry.
	 *
	 * @param input - Country and jurisdiction identifiers.
	 * @returns A promise that resolves when eBay deletes the sales tax table entry.
	 *
	 * @example
	 * ```ts
	 * await accountApi.deleteSalesTax({ countryCode: 'US', jurisdictionId: 'CA' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/sales_tax/methods/deleteSalesTax
	 */
	deleteSalesTax = (input: DeleteSalesTaxInput): Promise<void> =>
		requestDeleteEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/sales_tax/${input.countryCode}/${input.jurisdictionId}`,
		);

	/**
	 * Retrieves one sales tax table entry.
	 *
	 * @param input - Country and jurisdiction identifiers.
	 * @returns A promise that resolves with eBay's generated SalesTax.
	 *
	 * @example
	 * ```ts
	 * const tax = await accountApi.getSalesTax({ countryCode: 'US', jurisdictionId: 'CA' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/sales_tax/methods/getSalesTax
	 */
	getSalesTax = (input: GetSalesTaxInput): Promise<SalesTax> =>
		requestGetEffect<SalesTax>(
			this.client,
			`${ACCOUNT_BASE_PATH}/sales_tax/${input.countryCode}/${input.jurisdictionId}`,
		);

	/**
	 * Retrieves all sales tax table entries for one country.
	 *
	 * @param input - Country code used as the `country_code` query parameter.
	 * @returns A promise that resolves with eBay's generated SalesTaxes response.
	 *
	 * @example
	 * ```ts
	 * const taxes = await accountApi.getSalesTaxes({ countryCode: 'US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/sales_tax/methods/getSalesTaxes
	 */
	getSalesTaxes = (input: GetSalesTaxesInput): Promise<SalesTaxes> => {
		const params = buildEndpointParams({
			countryCode: { wireName: "country_code", value: input.countryCode },
		});

		return requestGetEffect<SalesTaxes>(
			this.client,
			`${ACCOUNT_BASE_PATH}/sales_tax`,
			params,
		);
	};

	/**
	 * Retrieves seller subscription information.
	 *
	 * @param input - Optional subscription limit and continuation token.
	 * @returns A promise that resolves with eBay's generated SubscriptionResponse.
	 *
	 * @example
	 * ```ts
	 * const subscription = await accountApi.getSubscription({ limit: '10' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/subscription/methods/getSubscription
	 */
	getSubscription = (
		input: GetSubscriptionInput = {},
	): Promise<SubscriptionResponse> => {
		const params = buildEndpointParams({
			limit: { wireName: "limit", value: input.limit },
			continuationToken: {
				wireName: "continuation_token",
				value: input.continuationToken,
			},
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
	 * @returns A promise that resolves with eBay's generated KycResponse.
	 *
	 * @example
	 * ```ts
	 * const kyc = await accountApi.getKYC({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/kyc/methods/getKYC
	 */
	getKYC = (_input: EmptyAccountInput = {}): Promise<KycResponse> =>
		requestGetEffect<KycResponse>(this.client, `${ACCOUNT_BASE_PATH}/kyc`);

	/**
	 * Retrieves seller advertising-program eligibility for one marketplace.
	 *
	 * @param input - Marketplace header and optional comma-separated program type filter.
	 * @returns A promise that resolves with eBay's generated SellerEligibilityMultiProgramResponse.
	 *
	 * @example
	 * ```ts
	 * const eligibility = await accountApi.getAdvertisingEligibility({ marketplaceId: 'EBAY_US', programTypes: 'PLA' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/account/resources/advertising_eligibility/methods/getAdvertisingEligibility
	 */
	getAdvertisingEligibility = (
		input: GetAdvertisingEligibilityInput,
	): Promise<SellerEligibilityMultiProgramResponse> => {
		const params = buildEndpointParams({
			programTypes: { wireName: "program_types", value: input.programTypes },
		});

		return requestGetEffect<SellerEligibilityMultiProgramResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/advertising_eligibility`,
			params,
			{
				headers: {
					"X-EBAY-C-MARKETPLACE-ID": input.marketplaceId,
				},
			},
		);
	};
}
