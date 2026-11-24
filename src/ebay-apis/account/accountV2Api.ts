import type { z } from "zod";
import type {
	calculatedShippingRulesInputSchema,
	flatShippingRulesInputSchema,
	getCombinedShippingRulesInputSchema,
	getPayoutSettingsInputSchema,
	getRateTableInputSchema,
	getUserPreferencesInputSchema,
	promotionalShippingRuleInputSchema,
	setUserPreferencesInputSchema,
	updateCombinedPaymentsInputSchema,
	updatePayoutPercentageInputSchema,
	updateShippingCostInputSchema,
} from "@/ebay-apis/account/accountV2Schemas.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	marketplaceHeader,
	optionalStringEffect,
	requestGetEffect,
	requestPatchEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellAccountV2Oas3.js";

type GetRateTableInput = z.infer<typeof getRateTableInputSchema>;
type UpdateShippingCostInput = z.infer<typeof updateShippingCostInputSchema>;
type GetPayoutSettingsInput = z.infer<typeof getPayoutSettingsInputSchema>;
type UpdatePayoutPercentageInput = z.infer<
	typeof updatePayoutPercentageInputSchema
>;
type GetCombinedShippingRulesInput = z.infer<
	typeof getCombinedShippingRulesInputSchema
>;
type CalculatedShippingRulesInput = z.infer<
	typeof calculatedShippingRulesInputSchema
>;
type FlatShippingRulesInput = z.infer<typeof flatShippingRulesInputSchema>;
type PromotionalShippingRuleInput = z.infer<
	typeof promotionalShippingRuleInputSchema
>;
type UpdateCombinedPaymentsInput = z.infer<
	typeof updateCombinedPaymentsInputSchema
>;
type GetUserPreferencesInput = z.infer<typeof getUserPreferencesInputSchema>;
type SetUserPreferencesInput = z.infer<typeof setUserPreferencesInputSchema>;

type Schemas = components["schemas"];
type RateTableUpdate = Schemas["RateTableUpdate"];
type UpdatePayoutPercentageRequest = Schemas["UpdatePayoutPercentageRequest"];
type SetUserPreferencesRequest = Schemas["SetUserPreferencesRequest"];

type CombinedShippingRulesOperation =
	| "create_calculated_shipping_rules"
	| "create_flat_shipping_rules"
	| "create_promotional_shipping_rule"
	| "update_calculated_shipping_rules"
	| "update_combined_payments"
	| "update_flat_shipping_rules"
	| "update_promotional_shipping_rule";

export type RateTableDetailsResponse = Schemas["RateTableDetails"];

export type PayoutSettingsResponse = Schemas["PayoutSettingsResponse"];

export type CombinedShippingRulesResponse =
	Schemas["GetCombinedShippingRulesPublicApiResponse"];

export type UserPreferencesResponse = Schemas["GetUserPreferencesResponse"];

export class AccountV2Api {
	private readonly basePath = "/sell/account/v2";
	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	public getRateTable = async (
		input: GetRateTableInput,
	): Promise<RateTableDetailsResponse> => {
		const { client, basePath } = this;
		const validInput = requireObjectEffect<GetRateTableInput>(input, "input");
		const rateTableId = requireStringEffect(
			validInput.rateTableId,
			"rateTableId",
		);

		return requestGetEffect<RateTableDetailsResponse>(
			client,
			`${basePath}/rate_table/${encodeURIComponent(rateTableId)}`,
		);
	};

	public updateShippingCost = async (
		input: UpdateShippingCostInput,
	): Promise<void> => {
		const { client, basePath } = this;
		const validInput = requireObjectEffect<UpdateShippingCostInput>(
			input,
			"input",
		);
		const rateTableId = requireStringEffect(
			validInput.rateTableId,
			"rateTableId",
		);
		const rateTableUpdate = requireObjectEffect<RateTableUpdate>(
			validInput.rateTableUpdate,
			"rateTableUpdate",
		);
		const path = `${basePath}/rate_table/${encodeURIComponent(rateTableId)}/update_shipping_cost`;

		return requestPostEffect<void>(client, path, rateTableUpdate);
	};

	public getPayoutSettings = (
		_input: GetPayoutSettingsInput = {},
	): Promise<PayoutSettingsResponse> =>
		requestGetEffect<PayoutSettingsResponse>(
			this.client,
			`${this.basePath}/payout_settings`,
		);

	public updatePayoutPercentage = async (
		input: UpdatePayoutPercentageInput,
	): Promise<void> => {
		const { client } = this;
		const path = `${this.basePath}/payout_settings/update_percentage`;
		const validInput = requireObjectEffect<UpdatePayoutPercentageInput>(
			input,
			"input",
		);
		const payoutSplit = requireObjectEffect<UpdatePayoutPercentageRequest>(
			validInput.payoutSplit,
			"payoutSplit",
		);

		return requestPostEffect<void>(client, path, payoutSplit);
	};

	public createCalculatedShippingRules = (
		input: CalculatedShippingRulesInput,
	): Promise<void> =>
		this.postCombinedShippingRules<
			Schemas["CreateCalculatedShippingRulesRequest"]
		>("create_calculated_shipping_rules", input, "shippingRules");

	public createFlatShippingRules = (
		input: FlatShippingRulesInput,
	): Promise<void> =>
		this.postCombinedShippingRules<Schemas["CreateFlatShippingRulesRequest"]>(
			"create_flat_shipping_rules",
			input,
			"shippingRules",
		);

	public createPromotionalShippingRule = (
		input: PromotionalShippingRuleInput,
	): Promise<void> =>
		this.postCombinedShippingRules<
			Schemas["CreatePromotionalShippingRuleRequest"]
		>("create_promotional_shipping_rule", input, "shippingRules");

	public getCombinedShippingRules = async (
		input: GetCombinedShippingRulesInput,
	): Promise<CombinedShippingRulesResponse> => {
		const { client } = this;
		const path = `${this.basePath}/combined_shipping_rules`;
		const validInput = requireObjectEffect<GetCombinedShippingRulesInput>(
			input,
			"input",
		);
		const marketplaceId = requireStringEffect(
			validInput.marketplaceId,
			"marketplaceId",
		);

		return requestGetEffect<CombinedShippingRulesResponse>(
			client,
			path,
			undefined,
			marketplaceHeader(marketplaceId),
		);
	};

	public updateCalculatedShippingRules = (
		input: CalculatedShippingRulesInput,
	): Promise<void> =>
		this.postCombinedShippingRules<
			Schemas["UpdateCalculatedShippingRulesRequest"]
		>("update_calculated_shipping_rules", input, "shippingRules");

	public updateCombinedPayments = (
		input: UpdateCombinedPaymentsInput,
	): Promise<void> =>
		this.postCombinedShippingRules<Schemas["UpdateCombinedPaymentsRequest"]>(
			"update_combined_payments",
			input,
			"combinedPayments",
		);

	public updateFlatShippingRules = (
		input: FlatShippingRulesInput,
	): Promise<void> =>
		this.postCombinedShippingRules<Schemas["UpdateFlatShippingRulesRequest"]>(
			"update_flat_shipping_rules",
			input,
			"shippingRules",
		);

	public updatePromotionalShippingRule = (
		input: PromotionalShippingRuleInput,
	): Promise<void> =>
		this.postCombinedShippingRules<
			Schemas["UpdatePromotionalShippingRuleRequest"]
		>("update_promotional_shipping_rule", input, "shippingRules");

	public getUserPreferences = async (
		input: GetUserPreferencesInput,
	): Promise<UserPreferencesResponse> => {
		const { client } = this;
		const path = `${this.basePath}/user_preferences`;
		const validInput = requireObjectEffect<GetUserPreferencesInput>(
			input,
			"input",
		);
		const marketplaceId = requireStringEffect(
			validInput.marketplaceId,
			"marketplaceId",
		);
		const fieldgroups = optionalStringEffect(
			validInput.fieldgroups,
			"fieldgroups",
		);
		const params = buildEndpointParams({
			fieldgroups: { wireName: "fieldgroups", value: fieldgroups },
		});

		return requestGetEffect<UserPreferencesResponse>(
			client,
			path,
			params,
			marketplaceHeader(marketplaceId),
		);
	};

	public setUserPreferences = async (
		input: SetUserPreferencesInput,
	): Promise<void> => {
		const { client } = this;
		const path = `${this.basePath}/user_preferences`;
		const validInput = requireObjectEffect<SetUserPreferencesInput>(
			input,
			"input",
		);
		const marketplaceId = requireStringEffect(
			validInput.marketplaceId,
			"marketplaceId",
		);
		const preferences = requireObjectEffect<SetUserPreferencesRequest>(
			validInput.preferences,
			"preferences",
		);

		return requestPatchEffect<void>(
			client,
			path,
			preferences,
			marketplaceHeader(marketplaceId),
		);
	};

	private readonly postCombinedShippingRules = async <Body extends object>(
		operation: CombinedShippingRulesOperation,
		input: unknown,
		bodyField: "shippingRules" | "combinedPayments",
	): Promise<void> => {
		const { client } = this;
		const path = `${this.basePath}/combined_shipping_rules/${operation}`;
		const validInput = requireObjectEffect<Record<string, unknown>>(
			input,
			"input",
		);
		const marketplaceId = requireStringEffect(
			validInput["marketplaceId"],
			"marketplaceId",
		);
		const rules = requireObjectEffect<Body>(validInput[bodyField], bodyField);

		return requestPostEffect<void>(
			client,
			path,
			rules,
			marketplaceHeader(marketplaceId),
		);
	};
}
