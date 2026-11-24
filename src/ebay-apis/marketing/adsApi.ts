import type { z } from "zod";
import type {
	bulkCreateAdsByInventoryReferenceInputSchema,
	bulkCreateAdsByListingIdInputSchema,
	bulkCreateKeywordInputSchema,
	bulkCreateNegativeKeywordInputSchema,
	bulkDeleteAdsByInventoryReferenceInputSchema,
	bulkDeleteAdsByListingIdInputSchema,
	bulkUpdateAdsBidByInventoryReferenceInputSchema,
	bulkUpdateAdsBidByListingIdInputSchema,
	bulkUpdateAdsStatusByListingIdInputSchema,
	bulkUpdateAdsStatusInputSchema,
	bulkUpdateKeywordInputSchema,
	bulkUpdateNegativeKeywordInputSchema,
	createAdByListingIdInputSchema,
	createAdGroupInputSchema,
	createAdsByInventoryReferenceInputSchema,
	createKeywordInputSchema,
	createNegativeKeywordInputSchema,
	deleteAdInputSchema,
	deleteAdsByInventoryReferenceInputSchema,
	getAdGroupInputSchema,
	getAdGroupsInputSchema,
	getAdInputSchema,
	getAdsByInventoryReferenceInputSchema,
	getAdsInputSchema,
	getKeywordInputSchema,
	getKeywordsInputSchema,
	getNegativeKeywordInputSchema,
	getNegativeKeywordsInputSchema,
	suggestBidsInputSchema,
	suggestKeywordsInputSchema,
	updateAdGroupInputSchema,
	updateBidInputSchema,
	updateKeywordInputSchema,
	updateNegativeKeywordInputSchema,
} from "@/ebay-apis/marketing/marketingSchemas.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	requestDeleteEffect,
	requestGetEffect,
	requestPostEffect,
	requestPutEffect,
} from "@/ebay-client/request.js";
import {
	MARKETING_BASE_PATH,
	type MarketingOperationResponse,
} from "./marketingSharedApi.js";

type BulkCreateAdsByInventoryReferenceInput = z.infer<
	typeof bulkCreateAdsByInventoryReferenceInputSchema
>;
type BulkCreateAdsByListingIdInput = z.infer<
	typeof bulkCreateAdsByListingIdInputSchema
>;
type BulkDeleteAdsByInventoryReferenceInput = z.infer<
	typeof bulkDeleteAdsByInventoryReferenceInputSchema
>;
type BulkDeleteAdsByListingIdInput = z.infer<
	typeof bulkDeleteAdsByListingIdInputSchema
>;
type BulkUpdateAdsBidByInventoryReferenceInput = z.infer<
	typeof bulkUpdateAdsBidByInventoryReferenceInputSchema
>;
type BulkUpdateAdsBidByListingIdInput = z.infer<
	typeof bulkUpdateAdsBidByListingIdInputSchema
>;
type BulkUpdateAdsStatusInput = z.infer<typeof bulkUpdateAdsStatusInputSchema>;
type BulkUpdateAdsStatusByListingIdInput = z.infer<
	typeof bulkUpdateAdsStatusByListingIdInputSchema
>;
type GetAdsInput = z.infer<typeof getAdsInputSchema>;
type CreateAdByListingIdInput = z.infer<typeof createAdByListingIdInputSchema>;
type CreateAdsByInventoryReferenceInput = z.infer<
	typeof createAdsByInventoryReferenceInputSchema
>;
type GetAdInput = z.infer<typeof getAdInputSchema>;
type DeleteAdInput = z.infer<typeof deleteAdInputSchema>;
type DeleteAdsByInventoryReferenceInput = z.infer<
	typeof deleteAdsByInventoryReferenceInputSchema
>;
type GetAdsByInventoryReferenceInput = z.infer<
	typeof getAdsByInventoryReferenceInputSchema
>;
type UpdateBidInput = z.infer<typeof updateBidInputSchema>;
type GetAdGroupsInput = z.infer<typeof getAdGroupsInputSchema>;
type CreateAdGroupInput = z.infer<typeof createAdGroupInputSchema>;
type GetAdGroupInput = z.infer<typeof getAdGroupInputSchema>;
type UpdateAdGroupInput = z.infer<typeof updateAdGroupInputSchema>;
type SuggestBidsInput = z.infer<typeof suggestBidsInputSchema>;
type SuggestKeywordsInput = z.infer<typeof suggestKeywordsInputSchema>;
type BulkCreateKeywordInput = z.infer<typeof bulkCreateKeywordInputSchema>;
type BulkUpdateKeywordInput = z.infer<typeof bulkUpdateKeywordInputSchema>;
type GetKeywordsInput = z.infer<typeof getKeywordsInputSchema>;
type CreateKeywordInput = z.infer<typeof createKeywordInputSchema>;
type GetKeywordInput = z.infer<typeof getKeywordInputSchema>;
type UpdateKeywordInput = z.infer<typeof updateKeywordInputSchema>;
type BulkCreateNegativeKeywordInput = z.infer<
	typeof bulkCreateNegativeKeywordInputSchema
>;
type BulkUpdateNegativeKeywordInput = z.infer<
	typeof bulkUpdateNegativeKeywordInputSchema
>;
type GetNegativeKeywordsInput = z.infer<typeof getNegativeKeywordsInputSchema>;
type CreateNegativeKeywordInput = z.infer<
	typeof createNegativeKeywordInputSchema
>;
type GetNegativeKeywordInput = z.infer<typeof getNegativeKeywordInputSchema>;
type UpdateNegativeKeywordInput = z.infer<
	typeof updateNegativeKeywordInputSchema
>;

export type BulkCreateAdsByInventoryReferenceResponse =
	MarketingOperationResponse<"bulkCreateAdsByInventoryReference">;

export type BulkCreateAdsByListingIdResponse =
	MarketingOperationResponse<"bulkCreateAdsByListingId">;

export type BulkDeleteAdsByInventoryReferenceResponse =
	MarketingOperationResponse<"bulkDeleteAdsByInventoryReference">;

export type BulkDeleteAdsByListingIdResponse =
	MarketingOperationResponse<"bulkDeleteAdsByListingId">;

export type BulkUpdateAdsBidByInventoryReferenceResponse =
	MarketingOperationResponse<"bulkUpdateAdsBidByInventoryReference">;

export type BulkUpdateAdsBidByListingIdResponse =
	MarketingOperationResponse<"bulkUpdateAdsBidByListingId">;

export type BulkUpdateAdsStatusResponse =
	MarketingOperationResponse<"bulkUpdateAdsStatus">;

export type BulkUpdateAdsStatusByListingIdResponse =
	MarketingOperationResponse<"bulkUpdateAdsStatusByListingId">;

export type GetAdsResponse = MarketingOperationResponse<"getAds">;

export type CreateAdByListingIdResponse =
	MarketingOperationResponse<"createAdByListingId">;

export type CreateAdsByInventoryReferenceResponse =
	MarketingOperationResponse<"createAdsByInventoryReference">;

export type GetAdResponse = MarketingOperationResponse<"getAd">;

export type DeleteAdResponse = MarketingOperationResponse<"deleteAd">;

export type DeleteAdsByInventoryReferenceResponse =
	MarketingOperationResponse<"deleteAdsByInventoryReference">;

export type GetAdsByInventoryReferenceResponse =
	MarketingOperationResponse<"getAdsByInventoryReference">;

export type UpdateBidResponse = MarketingOperationResponse<"updateBid">;

export type GetAdGroupsResponse = MarketingOperationResponse<"getAdGroups">;

export type CreateAdGroupResponse = MarketingOperationResponse<"createAdGroup">;

export type GetAdGroupResponse = MarketingOperationResponse<"getAdGroup">;

export type UpdateAdGroupResponse = MarketingOperationResponse<"updateAdGroup">;

export type SuggestBidsResponse = MarketingOperationResponse<"suggestBids">;

export type SuggestKeywordsResponse =
	MarketingOperationResponse<"suggestKeywords">;

export type BulkCreateKeywordResponse =
	MarketingOperationResponse<"bulkCreateKeyword">;

export type BulkUpdateKeywordResponse =
	MarketingOperationResponse<"bulkUpdateKeyword">;

export type GetKeywordsResponse = MarketingOperationResponse<"getKeywords">;

export type CreateKeywordResponse = MarketingOperationResponse<"createKeyword">;

export type GetKeywordResponse = MarketingOperationResponse<"getKeyword">;

export type UpdateKeywordResponse = MarketingOperationResponse<"updateKeyword">;

export type BulkCreateNegativeKeywordResponse =
	MarketingOperationResponse<"bulkCreateNegativeKeyword">;

export type BulkUpdateNegativeKeywordResponse =
	MarketingOperationResponse<"bulkUpdateNegativeKeyword">;

export type GetNegativeKeywordsResponse =
	MarketingOperationResponse<"getNegativeKeywords">;

export type CreateNegativeKeywordResponse =
	MarketingOperationResponse<"createNegativeKeyword">;

export type GetNegativeKeywordResponse =
	MarketingOperationResponse<"getNegativeKeyword">;

export type UpdateNegativeKeywordResponse =
	MarketingOperationResponse<"updateNegativeKeyword">;

export function createMarketingAdsMethods(client: EbayApiClient) {
	return {
		bulkCreateAdsByInventoryReference: (
			input: BulkCreateAdsByInventoryReferenceInput,
		): Promise<BulkCreateAdsByInventoryReferenceResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_create_ads_by_inventory_reference`;
			return requestPostEffect<BulkCreateAdsByInventoryReferenceResponse>(
				client,
				path,
				input.request,
			);
		},

		bulkCreateAdsByListingId: (
			input: BulkCreateAdsByListingIdInput,
		): Promise<BulkCreateAdsByListingIdResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_create_ads_by_listing_id`;
			return requestPostEffect<BulkCreateAdsByListingIdResponse>(
				client,
				path,
				input.request,
			);
		},

		bulkDeleteAdsByInventoryReference: (
			input: BulkDeleteAdsByInventoryReferenceInput,
		): Promise<BulkDeleteAdsByInventoryReferenceResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_delete_ads_by_inventory_reference`;
			return requestPostEffect<BulkDeleteAdsByInventoryReferenceResponse>(
				client,
				path,
				input.request,
			);
		},

		bulkDeleteAdsByListingId: (
			input: BulkDeleteAdsByListingIdInput,
		): Promise<BulkDeleteAdsByListingIdResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_delete_ads_by_listing_id`;
			return requestPostEffect<BulkDeleteAdsByListingIdResponse>(
				client,
				path,
				input.request,
			);
		},

		bulkUpdateAdsBidByInventoryReference: (
			input: BulkUpdateAdsBidByInventoryReferenceInput,
		): Promise<BulkUpdateAdsBidByInventoryReferenceResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_update_ads_bid_by_inventory_reference`;
			return requestPostEffect<BulkUpdateAdsBidByInventoryReferenceResponse>(
				client,
				path,
				input.request,
			);
		},

		bulkUpdateAdsBidByListingId: (
			input: BulkUpdateAdsBidByListingIdInput,
		): Promise<BulkUpdateAdsBidByListingIdResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_update_ads_bid_by_listing_id`;
			return requestPostEffect<BulkUpdateAdsBidByListingIdResponse>(
				client,
				path,
				input.request,
			);
		},

		bulkUpdateAdsStatus: (
			input: BulkUpdateAdsStatusInput,
		): Promise<BulkUpdateAdsStatusResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_update_ads_status`;
			return requestPostEffect<BulkUpdateAdsStatusResponse>(
				client,
				path,
				input.request,
			);
		},

		bulkUpdateAdsStatusByListingId: (
			input: BulkUpdateAdsStatusByListingIdInput,
		): Promise<BulkUpdateAdsStatusByListingIdResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_update_ads_status_by_listing_id`;
			return requestPostEffect<BulkUpdateAdsStatusByListingIdResponse>(
				client,
				path,
				input.request,
			);
		},

		getAds: (input: GetAdsInput): Promise<GetAdsResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad`;
			const params = buildEndpointParams({
				adGroupIds: { wireName: "ad_group_ids", value: input.adGroupIds },
				adStatus: { wireName: "ad_status", value: input.adStatus },
				limit: { wireName: "limit", value: input.limit },
				listingIds: { wireName: "listing_ids", value: input.listingIds },
				offset: { wireName: "offset", value: input.offset },
			});
			return requestGetEffect<GetAdsResponse>(client, path, params);
		},

		createAdByListingId: (
			input: CreateAdByListingIdInput,
		): Promise<CreateAdByListingIdResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad`;
			return requestPostEffect<CreateAdByListingIdResponse>(
				client,
				path,
				input.request,
			);
		},

		createAdsByInventoryReference: (
			input: CreateAdsByInventoryReferenceInput,
		): Promise<CreateAdsByInventoryReferenceResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/create_ads_by_inventory_reference`;
			return requestPostEffect<CreateAdsByInventoryReferenceResponse>(
				client,
				path,
				input.request,
			);
		},

		getAd: (input: GetAdInput): Promise<GetAdResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad/${input.adId}`;
			return requestGetEffect<GetAdResponse>(client, path);
		},

		deleteAd: (input: DeleteAdInput): Promise<DeleteAdResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad/${input.adId}`;
			return requestDeleteEffect<DeleteAdResponse>(client, path);
		},

		deleteAdsByInventoryReference: (
			input: DeleteAdsByInventoryReferenceInput,
		): Promise<DeleteAdsByInventoryReferenceResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/delete_ads_by_inventory_reference`;
			return requestPostEffect<DeleteAdsByInventoryReferenceResponse>(
				client,
				path,
				input.request,
			);
		},

		getAdsByInventoryReference: (
			input: GetAdsByInventoryReferenceInput,
		): Promise<GetAdsByInventoryReferenceResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/get_ads_by_inventory_reference`;
			const params = buildEndpointParams({
				inventoryReferenceId: {
					wireName: "inventory_reference_id",
					value: input.inventoryReferenceId,
				},
				inventoryReferenceType: {
					wireName: "inventory_reference_type",
					value: input.inventoryReferenceType,
				},
			});
			return requestGetEffect<GetAdsByInventoryReferenceResponse>(
				client,
				path,
				params,
			);
		},

		updateBid: (input: UpdateBidInput): Promise<UpdateBidResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad/${input.adId}/update_bid`;
			return requestPostEffect<UpdateBidResponse>(client, path, input.request);
		},

		getAdGroups: (input: GetAdGroupsInput): Promise<GetAdGroupsResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group`;
			const params = buildEndpointParams({
				adGroupStatus: {
					wireName: "ad_group_status",
					value: input.adGroupStatus,
				},
				limit: { wireName: "limit", value: input.limit },
				offset: { wireName: "offset", value: input.offset },
			});
			return requestGetEffect<GetAdGroupsResponse>(client, path, params);
		},

		createAdGroup: (
			input: CreateAdGroupInput,
		): Promise<CreateAdGroupResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group`;
			return requestPostEffect<CreateAdGroupResponse>(
				client,
				path,
				input.request,
			);
		},

		getAdGroup: (input: GetAdGroupInput): Promise<GetAdGroupResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group/${input.adGroupId}`;
			return requestGetEffect<GetAdGroupResponse>(client, path);
		},

		updateAdGroup: (
			input: UpdateAdGroupInput,
		): Promise<UpdateAdGroupResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group/${input.adGroupId}`;
			return requestPutEffect<UpdateAdGroupResponse>(
				client,
				path,
				input.request,
			);
		},

		suggestBids: (input: SuggestBidsInput): Promise<SuggestBidsResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group/${input.adGroupId}/suggest_bids`;
			return requestPostEffect<SuggestBidsResponse>(
				client,
				path,
				input.request,
			);
		},

		suggestKeywords: (
			input: SuggestKeywordsInput,
		): Promise<SuggestKeywordsResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group/${input.adGroupId}/suggest_keywords`;
			return requestPostEffect<SuggestKeywordsResponse>(
				client,
				path,
				input.request,
			);
		},

		bulkCreateKeyword: (
			input: BulkCreateKeywordInput,
		): Promise<BulkCreateKeywordResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_create_keyword`;
			return requestPostEffect<BulkCreateKeywordResponse>(
				client,
				path,
				input.request,
			);
		},

		bulkUpdateKeyword: (
			input: BulkUpdateKeywordInput,
		): Promise<BulkUpdateKeywordResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_update_keyword`;
			return requestPostEffect<BulkUpdateKeywordResponse>(
				client,
				path,
				input.request,
			);
		},

		getKeywords: (input: GetKeywordsInput): Promise<GetKeywordsResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/keyword`;
			const params = buildEndpointParams({
				adGroupIds: { wireName: "ad_group_ids", value: input.adGroupIds },
				keywordStatus: {
					wireName: "keyword_status",
					value: input.keywordStatus,
				},
				limit: { wireName: "limit", value: input.limit },
				offset: { wireName: "offset", value: input.offset },
			});
			return requestGetEffect<GetKeywordsResponse>(client, path, params);
		},

		createKeyword: (
			input: CreateKeywordInput,
		): Promise<CreateKeywordResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/keyword`;
			return requestPostEffect<CreateKeywordResponse>(
				client,
				path,
				input.request,
			);
		},

		getKeyword: (input: GetKeywordInput): Promise<GetKeywordResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/keyword/${input.keywordId}`;
			return requestGetEffect<GetKeywordResponse>(client, path);
		},

		updateKeyword: (
			input: UpdateKeywordInput,
		): Promise<UpdateKeywordResponse> => {
			const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/keyword/${input.keywordId}`;
			return requestPutEffect<UpdateKeywordResponse>(
				client,
				path,
				input.request,
			);
		},

		bulkCreateNegativeKeyword: (
			input: BulkCreateNegativeKeywordInput,
		): Promise<BulkCreateNegativeKeywordResponse> => {
			const path = `${MARKETING_BASE_PATH}/bulk_create_negative_keyword`;
			return requestPostEffect<BulkCreateNegativeKeywordResponse>(
				client,
				path,
				input.request,
			);
		},

		bulkUpdateNegativeKeyword: (
			input: BulkUpdateNegativeKeywordInput,
		): Promise<BulkUpdateNegativeKeywordResponse> => {
			const path = `${MARKETING_BASE_PATH}/bulk_update_negative_keyword`;
			return requestPostEffect<BulkUpdateNegativeKeywordResponse>(
				client,
				path,
				input.request,
			);
		},

		getNegativeKeywords: (
			input: GetNegativeKeywordsInput = {},
		): Promise<GetNegativeKeywordsResponse> => {
			const path = `${MARKETING_BASE_PATH}/negative_keyword`;
			const params = buildEndpointParams({
				adGroupIds: { wireName: "ad_group_ids", value: input.adGroupIds },
				campaignIds: { wireName: "campaign_ids", value: input.campaignIds },
				limit: { wireName: "limit", value: input.limit },
				negativeKeywordStatus: {
					wireName: "negative_keyword_status",
					value: input.negativeKeywordStatus,
				},
				offset: { wireName: "offset", value: input.offset },
			});
			return requestGetEffect<GetNegativeKeywordsResponse>(
				client,
				path,
				params,
			);
		},

		createNegativeKeyword: (
			input: CreateNegativeKeywordInput,
		): Promise<CreateNegativeKeywordResponse> => {
			const path = `${MARKETING_BASE_PATH}/negative_keyword`;
			return requestPostEffect<CreateNegativeKeywordResponse>(
				client,
				path,
				input.request,
			);
		},

		getNegativeKeyword: (
			input: GetNegativeKeywordInput,
		): Promise<GetNegativeKeywordResponse> => {
			const path = `${MARKETING_BASE_PATH}/negative_keyword/${input.negativeKeywordId}`;
			return requestGetEffect<GetNegativeKeywordResponse>(client, path);
		},

		updateNegativeKeyword: (
			input: UpdateNegativeKeywordInput,
		): Promise<UpdateNegativeKeywordResponse> => {
			const path = `${MARKETING_BASE_PATH}/negative_keyword/${input.negativeKeywordId}`;
			return requestPutEffect<UpdateNegativeKeywordResponse>(
				client,
				path,
				input.request,
			);
		},
	};
}
