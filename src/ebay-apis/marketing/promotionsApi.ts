import type { z } from "zod";
import type {
	createEmailCampaignInputSchema,
	createItemPriceMarkdownPromotionInputSchema,
	createItemPromotionInputSchema,
	deleteEmailCampaignInputSchema,
	deleteItemPriceMarkdownPromotionInputSchema,
	deleteItemPromotionInputSchema,
	getAudiencesInputSchema,
	getEmailCampaignInputSchema,
	getEmailCampaignsInputSchema,
	getEmailPreviewInputSchema,
	getEmailReportInputSchema,
	getItemPriceMarkdownPromotionInputSchema,
	getItemPromotionInputSchema,
	getListingSetInputSchema,
	getPromotionReportsInputSchema,
	getPromotionSummaryReportInputSchema,
	getPromotionsInputSchema,
	pausePromotionInputSchema,
	resumePromotionInputSchema,
	updateEmailCampaignInputSchema,
	updateItemPriceMarkdownPromotionInputSchema,
	updateItemPromotionInputSchema,
} from "@/ebay-apis/marketing/marketingSchemas.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	marketplaceHeader,
	requestDeleteEffect,
	requestGetEffect,
	requestPostEffect,
	requestPutEffect,
} from "@/ebay-client/request.js";
import {
	MARKETING_BASE_PATH,
	type MarketingOperationResponse,
} from "./marketingSharedApi.js";

type CreateItemPriceMarkdownPromotionInput = z.infer<
	typeof createItemPriceMarkdownPromotionInputSchema
>;
type GetItemPriceMarkdownPromotionInput = z.infer<
	typeof getItemPriceMarkdownPromotionInputSchema
>;
type UpdateItemPriceMarkdownPromotionInput = z.infer<
	typeof updateItemPriceMarkdownPromotionInputSchema
>;
type DeleteItemPriceMarkdownPromotionInput = z.infer<
	typeof deleteItemPriceMarkdownPromotionInputSchema
>;
type CreateItemPromotionInput = z.infer<typeof createItemPromotionInputSchema>;
type GetItemPromotionInput = z.infer<typeof getItemPromotionInputSchema>;
type UpdateItemPromotionInput = z.infer<typeof updateItemPromotionInputSchema>;
type DeleteItemPromotionInput = z.infer<typeof deleteItemPromotionInputSchema>;
type GetListingSetInput = z.infer<typeof getListingSetInputSchema>;
type GetPromotionsInput = z.infer<typeof getPromotionsInputSchema>;
type PausePromotionInput = z.infer<typeof pausePromotionInputSchema>;
type ResumePromotionInput = z.infer<typeof resumePromotionInputSchema>;
type GetPromotionReportsInput = z.infer<typeof getPromotionReportsInputSchema>;
type GetPromotionSummaryReportInput = z.infer<
	typeof getPromotionSummaryReportInputSchema
>;
type GetEmailCampaignsInput = z.infer<typeof getEmailCampaignsInputSchema>;
type CreateEmailCampaignInput = z.infer<typeof createEmailCampaignInputSchema>;
type GetEmailCampaignInput = z.infer<typeof getEmailCampaignInputSchema>;
type UpdateEmailCampaignInput = z.infer<typeof updateEmailCampaignInputSchema>;
type DeleteEmailCampaignInput = z.infer<typeof deleteEmailCampaignInputSchema>;
type GetAudiencesInput = z.infer<typeof getAudiencesInputSchema>;
type GetEmailPreviewInput = z.infer<typeof getEmailPreviewInputSchema>;
type GetEmailReportInput = z.infer<typeof getEmailReportInputSchema>;

export type CreateItemPriceMarkdownPromotionResponse =
	MarketingOperationResponse<"createItemPriceMarkdownPromotion">;

export type GetItemPriceMarkdownPromotionResponse =
	MarketingOperationResponse<"getItemPriceMarkdownPromotion">;

export type UpdateItemPriceMarkdownPromotionResponse =
	MarketingOperationResponse<"updateItemPriceMarkdownPromotion">;

export type DeleteItemPriceMarkdownPromotionResponse =
	MarketingOperationResponse<"deleteItemPriceMarkdownPromotion">;

export type CreateItemPromotionResponse =
	MarketingOperationResponse<"createItemPromotion">;

export type GetItemPromotionResponse =
	MarketingOperationResponse<"getItemPromotion">;

export type UpdateItemPromotionResponse =
	MarketingOperationResponse<"updateItemPromotion">;

export type DeleteItemPromotionResponse =
	MarketingOperationResponse<"deleteItemPromotion">;

export type GetListingSetResponse = MarketingOperationResponse<"getListingSet">;

export type GetPromotionsResponse = MarketingOperationResponse<"getPromotions">;

export type PausePromotionResponse =
	MarketingOperationResponse<"pausePromotion">;

export type ResumePromotionResponse =
	MarketingOperationResponse<"resumePromotion">;

export type GetPromotionReportsResponse =
	MarketingOperationResponse<"getPromotionReports">;

export type GetPromotionSummaryReportResponse =
	MarketingOperationResponse<"getPromotionSummaryReport">;

export type GetEmailCampaignsResponse =
	MarketingOperationResponse<"getEmailCampaigns">;

export type CreateEmailCampaignResponse =
	MarketingOperationResponse<"createEmailCampaign">;

export type GetEmailCampaignResponse =
	MarketingOperationResponse<"getEmailCampaign">;

export type UpdateEmailCampaignResponse =
	MarketingOperationResponse<"updateEmailCampaign">;

export type DeleteEmailCampaignResponse =
	MarketingOperationResponse<"deleteEmailCampaign">;

export type GetAudiencesResponse = MarketingOperationResponse<"getAudiences">;

export type GetEmailPreviewResponse =
	MarketingOperationResponse<"getEmailPreview">;

export type GetEmailReportResponse =
	MarketingOperationResponse<"getEmailReport">;

export function createMarketingPromotionsMethods(client: EbayApiClient) {
	return {
		createItemPriceMarkdownPromotion: (
			input: CreateItemPriceMarkdownPromotionInput,
		): Promise<CreateItemPriceMarkdownPromotionResponse> => {
			const path = `${MARKETING_BASE_PATH}/item_price_markdown`;
			return requestPostEffect<CreateItemPriceMarkdownPromotionResponse>(
				client,
				path,
				input.request,
			);
		},

		getItemPriceMarkdownPromotion: (
			input: GetItemPriceMarkdownPromotionInput,
		): Promise<GetItemPriceMarkdownPromotionResponse> => {
			const path = `${MARKETING_BASE_PATH}/item_price_markdown/${input.promotionId}`;
			return requestGetEffect<GetItemPriceMarkdownPromotionResponse>(
				client,
				path,
			);
		},

		updateItemPriceMarkdownPromotion: (
			input: UpdateItemPriceMarkdownPromotionInput,
		): Promise<UpdateItemPriceMarkdownPromotionResponse> => {
			const path = `${MARKETING_BASE_PATH}/item_price_markdown/${input.promotionId}`;
			return requestPutEffect<UpdateItemPriceMarkdownPromotionResponse>(
				client,
				path,
				input.request,
			);
		},

		deleteItemPriceMarkdownPromotion: (
			input: DeleteItemPriceMarkdownPromotionInput,
		): Promise<DeleteItemPriceMarkdownPromotionResponse> => {
			const path = `${MARKETING_BASE_PATH}/item_price_markdown/${input.promotionId}`;
			return requestDeleteEffect<DeleteItemPriceMarkdownPromotionResponse>(
				client,
				path,
			);
		},

		createItemPromotion: (
			input: CreateItemPromotionInput,
		): Promise<CreateItemPromotionResponse> => {
			const path = `${MARKETING_BASE_PATH}/item_promotion`;
			return requestPostEffect<CreateItemPromotionResponse>(
				client,
				path,
				input.request,
			);
		},

		getItemPromotion: (
			input: GetItemPromotionInput,
		): Promise<GetItemPromotionResponse> => {
			const path = `${MARKETING_BASE_PATH}/item_promotion/${input.promotionId}`;
			return requestGetEffect<GetItemPromotionResponse>(client, path);
		},

		updateItemPromotion: (
			input: UpdateItemPromotionInput,
		): Promise<UpdateItemPromotionResponse> => {
			const path = `${MARKETING_BASE_PATH}/item_promotion/${input.promotionId}`;
			return requestPutEffect<UpdateItemPromotionResponse>(
				client,
				path,
				input.request,
			);
		},

		deleteItemPromotion: (
			input: DeleteItemPromotionInput,
		): Promise<DeleteItemPromotionResponse> => {
			const path = `${MARKETING_BASE_PATH}/item_promotion/${input.promotionId}`;
			return requestDeleteEffect<DeleteItemPromotionResponse>(client, path);
		},

		getListingSet: (
			input: GetListingSetInput,
		): Promise<GetListingSetResponse> => {
			const path = `${MARKETING_BASE_PATH}/promotion/${input.promotionId}/get_listing_set`;
			const params = buildEndpointParams({
				limit: { wireName: "limit", value: input.limit },
				offset: { wireName: "offset", value: input.offset },
				q: { wireName: "q", value: input.q },
				sort: { wireName: "sort", value: input.sort },
				status: { wireName: "status", value: input.status },
			});
			return requestGetEffect<GetListingSetResponse>(client, path, params);
		},

		getPromotions: (
			input: GetPromotionsInput,
		): Promise<GetPromotionsResponse> => {
			const path = `${MARKETING_BASE_PATH}/promotion`;
			const params = buildEndpointParams({
				limit: { wireName: "limit", value: input.limit },
				marketplaceId: {
					wireName: "marketplace_id",
					value: input.marketplaceId,
				},
				offset: { wireName: "offset", value: input.offset },
				promotionStatus: {
					wireName: "promotion_status",
					value: input.promotionStatus,
				},
				promotionType: {
					wireName: "promotion_type",
					value: input.promotionType,
				},
				q: { wireName: "q", value: input.q },
				sort: { wireName: "sort", value: input.sort },
			});
			return requestGetEffect<GetPromotionsResponse>(client, path, params);
		},

		pausePromotion: (
			input: PausePromotionInput,
		): Promise<PausePromotionResponse> => {
			const path = `${MARKETING_BASE_PATH}/promotion/${input.promotionId}/pause`;
			return requestPostEffect<PausePromotionResponse>(client, path);
		},

		resumePromotion: (
			input: ResumePromotionInput,
		): Promise<ResumePromotionResponse> => {
			const path = `${MARKETING_BASE_PATH}/promotion/${input.promotionId}/resume`;
			return requestPostEffect<ResumePromotionResponse>(client, path);
		},

		getPromotionReports: (
			input: GetPromotionReportsInput,
		): Promise<GetPromotionReportsResponse> => {
			const path = `${MARKETING_BASE_PATH}/promotion_report`;
			const params = buildEndpointParams({
				limit: { wireName: "limit", value: input.limit },
				marketplaceId: {
					wireName: "marketplace_id",
					value: input.marketplaceId,
				},
				offset: { wireName: "offset", value: input.offset },
				promotionStatus: {
					wireName: "promotion_status",
					value: input.promotionStatus,
				},
				promotionType: {
					wireName: "promotion_type",
					value: input.promotionType,
				},
				q: { wireName: "q", value: input.q },
			});
			return requestGetEffect<GetPromotionReportsResponse>(
				client,
				path,
				params,
			);
		},

		getPromotionSummaryReport: (
			input: GetPromotionSummaryReportInput,
		): Promise<GetPromotionSummaryReportResponse> => {
			const path = `${MARKETING_BASE_PATH}/promotion_summary_report`;
			const params = buildEndpointParams({
				marketplaceId: {
					wireName: "marketplace_id",
					value: input.marketplaceId,
				},
			});
			return requestGetEffect<GetPromotionSummaryReportResponse>(
				client,
				path,
				params,
			);
		},

		getEmailCampaigns: (
			input: GetEmailCampaignsInput = {},
		): Promise<GetEmailCampaignsResponse> => {
			const path = `${MARKETING_BASE_PATH}/email_campaign`;
			const params = buildEndpointParams({
				limit: { wireName: "limit", value: input.limit },
				offset: { wireName: "offset", value: input.offset },
				q: { wireName: "q", value: input.q },
				sort: { wireName: "sort", value: input.sort },
			});
			return requestGetEffect<GetEmailCampaignsResponse>(client, path, params);
		},

		createEmailCampaign: (
			input: CreateEmailCampaignInput,
		): Promise<CreateEmailCampaignResponse> => {
			const path = `${MARKETING_BASE_PATH}/email_campaign`;
			const config = marketplaceHeader(input.marketplaceId);
			return requestPostEffect<CreateEmailCampaignResponse>(
				client,
				path,
				input.request,
				config,
			);
		},

		getEmailCampaign: (
			input: GetEmailCampaignInput,
		): Promise<GetEmailCampaignResponse> => {
			const path = `${MARKETING_BASE_PATH}/email_campaign/${input.emailCampaignId}`;
			return requestGetEffect<GetEmailCampaignResponse>(client, path);
		},

		updateEmailCampaign: (
			input: UpdateEmailCampaignInput,
		): Promise<UpdateEmailCampaignResponse> => {
			const path = `${MARKETING_BASE_PATH}/email_campaign/${input.emailCampaignId}`;
			return requestPutEffect<UpdateEmailCampaignResponse>(
				client,
				path,
				input.request,
			);
		},

		deleteEmailCampaign: (
			input: DeleteEmailCampaignInput,
		): Promise<DeleteEmailCampaignResponse> => {
			const path = `${MARKETING_BASE_PATH}/email_campaign/${input.emailCampaignId}`;
			return requestDeleteEffect<DeleteEmailCampaignResponse>(client, path);
		},

		getAudiences: (input: GetAudiencesInput): Promise<GetAudiencesResponse> => {
			const path = `${MARKETING_BASE_PATH}/email_campaign/audience`;
			const params = buildEndpointParams({
				emailCampaignType: {
					wireName: "emailCampaignType",
					value: input.emailCampaignType,
				},
				limit: { wireName: "limit", value: input.limit },
				offset: { wireName: "offset", value: input.offset },
			});
			return requestGetEffect<GetAudiencesResponse>(client, path, params);
		},

		getEmailPreview: (
			input: GetEmailPreviewInput,
		): Promise<GetEmailPreviewResponse> => {
			const path = `${MARKETING_BASE_PATH}/email_campaign/${input.emailCampaignId}/email_preview`;
			return requestGetEffect<GetEmailPreviewResponse>(client, path);
		},

		getEmailReport: (
			input: GetEmailReportInput,
		): Promise<GetEmailReportResponse> => {
			const path = `${MARKETING_BASE_PATH}/email_campaign/report`;
			const params = buildEndpointParams({
				endDate: { wireName: "endDate", value: input.endDate },
				startDate: { wireName: "startDate", value: input.startDate },
			});
			return requestGetEffect<GetEmailReportResponse>(client, path, params);
		},
	};
}
