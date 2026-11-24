import type { z } from "zod";
import type {
	cloneCampaignInputSchema,
	createCampaignInputSchema,
	deleteCampaignInputSchema,
	endCampaignInputSchema,
	findCampaignByAdReferenceInputSchema,
	getCampaignByNameInputSchema,
	getCampaignInputSchema,
	getCampaignsInputSchema,
	pauseCampaignInputSchema,
	resumeCampaignInputSchema,
	suggestBudgetInputSchema,
	suggestItemsInputSchema,
	suggestMaxCpcInputSchema,
	updateAdRateStrategyInputSchema,
	updateBiddingStrategyInputSchema,
	updateCampaignBudgetInputSchema,
	updateCampaignIdentificationInputSchema,
} from "@/ebay-apis/marketing/marketingSchemas.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	marketplaceHeader,
	requestDeleteEffect,
	requestGetEffect,
	requestPostEffect,
} from "@/ebay-client/request.js";
import {
	MARKETING_BASE_PATH,
	type MarketingOperationResponse,
} from "./marketingSharedApi.js";

type CloneCampaignInput = z.infer<typeof cloneCampaignInputSchema>;
type GetCampaignsInput = z.infer<typeof getCampaignsInputSchema>;
type CreateCampaignInput = z.infer<typeof createCampaignInputSchema>;
type GetCampaignInput = z.infer<typeof getCampaignInputSchema>;
type DeleteCampaignInput = z.infer<typeof deleteCampaignInputSchema>;
type EndCampaignInput = z.infer<typeof endCampaignInputSchema>;
type FindCampaignByAdReferenceInput = z.infer<
	typeof findCampaignByAdReferenceInputSchema
>;
type GetCampaignByNameInput = z.infer<typeof getCampaignByNameInputSchema>;
type PauseCampaignInput = z.infer<typeof pauseCampaignInputSchema>;
type ResumeCampaignInput = z.infer<typeof resumeCampaignInputSchema>;
type SuggestBudgetInput = z.infer<typeof suggestBudgetInputSchema>;
type SuggestItemsInput = z.infer<typeof suggestItemsInputSchema>;
type SuggestMaxCpcInput = z.infer<typeof suggestMaxCpcInputSchema>;
type UpdateAdRateStrategyInput = z.infer<
	typeof updateAdRateStrategyInputSchema
>;
type UpdateBiddingStrategyInput = z.infer<
	typeof updateBiddingStrategyInputSchema
>;
type UpdateCampaignBudgetInput = z.infer<
	typeof updateCampaignBudgetInputSchema
>;
type UpdateCampaignIdentificationInput = z.infer<
	typeof updateCampaignIdentificationInputSchema
>;

export type CloneCampaignResponse = MarketingOperationResponse<"cloneCampaign">;

export type GetCampaignsResponse = MarketingOperationResponse<"getCampaigns">;

export type CreateCampaignResponse =
	MarketingOperationResponse<"createCampaign">;

export type GetCampaignResponse = MarketingOperationResponse<"getCampaign">;

export type DeleteCampaignResponse =
	MarketingOperationResponse<"deleteCampaign">;

export type EndCampaignResponse = MarketingOperationResponse<"endCampaign">;

export type FindCampaignByAdReferenceResponse =
	MarketingOperationResponse<"findCampaignByAdReference">;

export type GetCampaignByNameResponse =
	MarketingOperationResponse<"getCampaignByName">;

export type PauseCampaignResponse = MarketingOperationResponse<"pauseCampaign">;

export type ResumeCampaignResponse =
	MarketingOperationResponse<"resumeCampaign">;

export type SuggestBudgetResponse = MarketingOperationResponse<"suggestBudget">;

export type SuggestItemsResponse = MarketingOperationResponse<"suggestItems">;

export type SuggestMaxCpcResponse = MarketingOperationResponse<"suggestMaxCpc">;

export type UpdateAdRateStrategyResponse =
	MarketingOperationResponse<"updateAdRateStrategy">;

export type UpdateBiddingStrategyResponse =
	MarketingOperationResponse<"updateBiddingStrategy">;

export type UpdateCampaignBudgetResponse =
	MarketingOperationResponse<"updateCampaignBudget">;

export type UpdateCampaignIdentificationResponse =
	MarketingOperationResponse<"updateCampaignIdentification">;

export function createMarketingCampaignsMethods(client: EbayApiClient) {
	return {
		cloneCampaign: (
			input: CloneCampaignInput,
		): Promise<CloneCampaignResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/clone`;
			return requestPostEffect<CloneCampaignResponse>(
				client,
				path,
				input.request,
			);
		},

		getCampaigns: (
			input: GetCampaignsInput = {},
		): Promise<GetCampaignsResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign`;
			const params = buildEndpointParams({
				campaignName: { wireName: "campaign_name", value: input.campaignName },
				campaignStatus: {
					wireName: "campaign_status",
					value: input.campaignStatus,
				},
				campaignTargetingTypes: {
					wireName: "campaign_targeting_types",
					value: input.campaignTargetingTypes,
				},
				channels: { wireName: "channels", value: input.channels },
				endDateRange: { wireName: "end_date_range", value: input.endDateRange },
				fundingStrategy: {
					wireName: "funding_strategy",
					value: input.fundingStrategy,
				},
				limit: { wireName: "limit", value: input.limit },
				offset: { wireName: "offset", value: input.offset },
				startDateRange: {
					wireName: "start_date_range",
					value: input.startDateRange,
				},
			});
			return requestGetEffect<GetCampaignsResponse>(client, path, params);
		},

		createCampaign: (
			input: CreateCampaignInput,
		): Promise<CreateCampaignResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign`;
			return requestPostEffect<CreateCampaignResponse>(
				client,
				path,
				input.request,
			);
		},

		getCampaign: (input: GetCampaignInput): Promise<GetCampaignResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}`;
			return requestGetEffect<GetCampaignResponse>(client, path);
		},

		deleteCampaign: (
			input: DeleteCampaignInput,
		): Promise<DeleteCampaignResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}`;
			return requestDeleteEffect<DeleteCampaignResponse>(client, path);
		},

		endCampaign: (input: EndCampaignInput): Promise<EndCampaignResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/end`;
			return requestPostEffect<EndCampaignResponse>(client, path);
		},

		findCampaignByAdReference: (
			input: FindCampaignByAdReferenceInput = {},
		): Promise<FindCampaignByAdReferenceResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/find_campaign_by_ad_reference`;
			const params = buildEndpointParams({
				inventoryReferenceId: {
					wireName: "inventory_reference_id",
					value: input.inventoryReferenceId,
				},
				inventoryReferenceType: {
					wireName: "inventory_reference_type",
					value: input.inventoryReferenceType,
				},
				listingId: { wireName: "listing_id", value: input.listingId },
			});
			return requestGetEffect<FindCampaignByAdReferenceResponse>(
				client,
				path,
				params,
			);
		},

		getCampaignByName: (
			input: GetCampaignByNameInput,
		): Promise<GetCampaignByNameResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/get_campaign_by_name`;
			const params = buildEndpointParams({
				campaignName: { wireName: "campaign_name", value: input.campaignName },
			});
			return requestGetEffect<GetCampaignByNameResponse>(client, path, params);
		},

		pauseCampaign: (
			input: PauseCampaignInput,
		): Promise<PauseCampaignResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/pause`;
			return requestPostEffect<PauseCampaignResponse>(client, path);
		},

		resumeCampaign: (
			input: ResumeCampaignInput,
		): Promise<ResumeCampaignResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/resume`;
			return requestPostEffect<ResumeCampaignResponse>(client, path);
		},

		suggestBudget: (
			input: SuggestBudgetInput,
		): Promise<SuggestBudgetResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/suggest_budget`;
			const config = marketplaceHeader(input.marketplaceId);
			return requestGetEffect<SuggestBudgetResponse>(
				client,
				path,
				undefined,
				config,
			);
		},

		suggestItems: (input: SuggestItemsInput): Promise<SuggestItemsResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/suggest_items`;
			const params = buildEndpointParams({
				categoryIds: { wireName: "category_ids", value: input.categoryIds },
				limit: { wireName: "limit", value: input.limit },
				offset: { wireName: "offset", value: input.offset },
			});
			return requestGetEffect<SuggestItemsResponse>(client, path, params);
		},

		suggestMaxCpc: (
			input: SuggestMaxCpcInput,
		): Promise<SuggestMaxCpcResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/suggest_max_cpc`;
			return requestPostEffect<SuggestMaxCpcResponse>(
				client,
				path,
				input.request,
			);
		},

		updateAdRateStrategy: (
			input: UpdateAdRateStrategyInput,
		): Promise<UpdateAdRateStrategyResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/update_ad_rate_strategy`;
			return requestPostEffect<UpdateAdRateStrategyResponse>(
				client,
				path,
				input.request,
			);
		},

		updateBiddingStrategy: (
			input: UpdateBiddingStrategyInput,
		): Promise<UpdateBiddingStrategyResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/update_bidding_strategy`;
			return requestPostEffect<UpdateBiddingStrategyResponse>(
				client,
				path,
				input.request,
			);
		},

		updateCampaignBudget: (
			input: UpdateCampaignBudgetInput,
		): Promise<UpdateCampaignBudgetResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/update_campaign_budget`;
			return requestPostEffect<UpdateCampaignBudgetResponse>(
				client,
				path,
				input.request,
			);
		},

		updateCampaignIdentification: (
			input: UpdateCampaignIdentificationInput,
		): Promise<UpdateCampaignIdentificationResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/update_campaign_identification`;
			return requestPostEffect<UpdateCampaignIdentificationResponse>(
				client,
				path,
				input.request,
			);
		},
	};
}
