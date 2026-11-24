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

export type GetCustomPoliciesResponse =
	components["schemas"]["CustomPolicyResponse"];

export class AccountApi {
	private readonly client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.client = client;
	}

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

	getCustomPolicy = (input: GetCustomPolicyInput): Promise<CustomPolicy> =>
		requestGetEffect<CustomPolicy>(
			this.client,
			`${ACCOUNT_BASE_PATH}/custom_policy/${input.customPolicyId}`,
		);

	createCustomPolicy = (
		input: CreateCustomPolicyInput,
	): Promise<CustomPolicy> =>
		requestPostEffect<CustomPolicy>(
			this.client,
			`${ACCOUNT_BASE_PATH}/custom_policy/`,
			input.policy,
		);

	updateCustomPolicy = (input: UpdateCustomPolicyInput): Promise<void> =>
		requestPutEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/custom_policy/${input.customPolicyId}`,
			input.policy,
		);

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

	createFulfillmentPolicy = (
		input: CreateFulfillmentPolicyInput,
	): Promise<SetFulfillmentPolicyResponse> =>
		requestPostEffect<SetFulfillmentPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/fulfillment_policy/`,
			input.policy,
		);

	getFulfillmentPolicy = (
		input: GetFulfillmentPolicyInput,
	): Promise<FulfillmentPolicy> =>
		requestGetEffect<FulfillmentPolicy>(
			this.client,
			`${ACCOUNT_BASE_PATH}/fulfillment_policy/${input.fulfillmentPolicyId}`,
		);

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

	updateFulfillmentPolicy = (
		input: UpdateFulfillmentPolicyInput,
	): Promise<SetFulfillmentPolicyResponse> =>
		requestPutEffect<SetFulfillmentPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/fulfillment_policy/${input.fulfillmentPolicyId}`,
			input.policy,
		);

	deleteFulfillmentPolicy = (
		input: DeleteFulfillmentPolicyInput,
	): Promise<void> =>
		requestDeleteEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/fulfillment_policy/${input.fulfillmentPolicyId}`,
		);

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

	createPaymentPolicy = (
		input: CreatePaymentPolicyInput,
	): Promise<SetPaymentPolicyResponse> =>
		requestPostEffect<SetPaymentPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payment_policy`,
			input.policy,
		);

	getPaymentPolicy = (input: GetPaymentPolicyInput): Promise<PaymentPolicy> =>
		requestGetEffect<PaymentPolicy>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payment_policy/${input.paymentPolicyId}`,
		);

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

	updatePaymentPolicy = (
		input: UpdatePaymentPolicyInput,
	): Promise<SetPaymentPolicyResponse> =>
		requestPutEffect<SetPaymentPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payment_policy/${input.paymentPolicyId}`,
			input.policy,
		);

	deletePaymentPolicy = (input: DeletePaymentPolicyInput): Promise<void> =>
		requestDeleteEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payment_policy/${input.paymentPolicyId}`,
		);

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

	createReturnPolicy = (
		input: CreateReturnPolicyInput,
	): Promise<SetReturnPolicyResponse> =>
		requestPostEffect<SetReturnPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/return_policy`,
			input.policy,
		);

	getReturnPolicy = (input: GetReturnPolicyInput): Promise<ReturnPolicy> =>
		requestGetEffect<ReturnPolicy>(
			this.client,
			`${ACCOUNT_BASE_PATH}/return_policy/${input.returnPolicyId}`,
		);

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

	updateReturnPolicy = (
		input: UpdateReturnPolicyInput,
	): Promise<SetReturnPolicyResponse> =>
		requestPutEffect<SetReturnPolicyResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/return_policy/${input.returnPolicyId}`,
			input.policy,
		);

	deleteReturnPolicy = (input: DeleteReturnPolicyInput): Promise<void> =>
		requestDeleteEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/return_policy/${input.returnPolicyId}`,
		);

	getPaymentsProgram = (
		input: GetPaymentsProgramInput,
	): Promise<PaymentsProgramResponse> =>
		requestGetEffect<PaymentsProgramResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payments_program/${input.marketplaceId}/${input.paymentsProgramType}`,
		);

	getPaymentsProgramOnboarding = (
		input: GetPaymentsProgramOnboardingInput,
	): Promise<PaymentsProgramOnboardingResponse> =>
		requestGetEffect<PaymentsProgramOnboardingResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/payments_program/${input.marketplaceId}/${input.paymentsProgramType}/onboarding`,
		);

	getPrivileges = (
		_input: EmptyAccountInput = {},
	): Promise<SellingPrivileges> =>
		requestGetEffect<SellingPrivileges>(
			this.client,
			`${ACCOUNT_BASE_PATH}/privilege`,
		);

	getOptedInPrograms = (_input: EmptyAccountInput = {}): Promise<Programs> =>
		requestGetEffect<Programs>(
			this.client,
			`${ACCOUNT_BASE_PATH}/program/get_opted_in_programs`,
		);

	optInToProgram = (input: OptInToProgramInput): Promise<void> =>
		requestPostEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/program/opt_in`,
			input.request,
		);

	optOutOfProgram = (input: OptOutOfProgramInput): Promise<void> =>
		requestPostEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/program/opt_out`,
			input.request,
		);

	getRateTables = (
		_input: EmptyAccountInput = {},
	): Promise<RateTableResponse> =>
		requestGetEffect<RateTableResponse>(
			this.client,
			`${ACCOUNT_BASE_PATH}/rate_table`,
		);

	createOrReplaceSalesTax = (
		input: CreateOrReplaceSalesTaxInput,
	): Promise<void> =>
		requestPutEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/sales_tax/${input.countryCode}/${input.jurisdictionId}`,
			input.salesTaxBase,
		);

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

	deleteSalesTax = (input: DeleteSalesTaxInput): Promise<void> =>
		requestDeleteEffect<void>(
			this.client,
			`${ACCOUNT_BASE_PATH}/sales_tax/${input.countryCode}/${input.jurisdictionId}`,
		);

	getSalesTax = (input: GetSalesTaxInput): Promise<SalesTax> =>
		requestGetEffect<SalesTax>(
			this.client,
			`${ACCOUNT_BASE_PATH}/sales_tax/${input.countryCode}/${input.jurisdictionId}`,
		);

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

	getKYC = (_input: EmptyAccountInput = {}): Promise<KycResponse> =>
		requestGetEffect<KycResponse>(this.client, `${ACCOUNT_BASE_PATH}/kyc`);

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
