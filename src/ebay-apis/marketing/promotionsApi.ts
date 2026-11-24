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

/**
 * Response returned by eBay Marketing API createItemPriceMarkdownPromotion.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_price_markdown/methods/createItemPriceMarkdownPromotion
 */
export type CreateItemPriceMarkdownPromotionResponse =
	MarketingOperationResponse<"createItemPriceMarkdownPromotion">;

/**
 * Response returned by eBay Marketing API getItemPriceMarkdownPromotion.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_price_markdown/methods/getItemPriceMarkdownPromotion
 */
export type GetItemPriceMarkdownPromotionResponse =
	MarketingOperationResponse<"getItemPriceMarkdownPromotion">;

/**
 * Response returned by eBay Marketing API updateItemPriceMarkdownPromotion.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_price_markdown/methods/updateItemPriceMarkdownPromotion
 */
export type UpdateItemPriceMarkdownPromotionResponse =
	MarketingOperationResponse<"updateItemPriceMarkdownPromotion">;

/**
 * Response returned by eBay Marketing API deleteItemPriceMarkdownPromotion.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_price_markdown/methods/deleteItemPriceMarkdownPromotion
 */
export type DeleteItemPriceMarkdownPromotionResponse =
	MarketingOperationResponse<"deleteItemPriceMarkdownPromotion">;

/**
 * Response returned by eBay Marketing API createItemPromotion.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_promotion/methods/createItemPromotion
 */
export type CreateItemPromotionResponse =
	MarketingOperationResponse<"createItemPromotion">;

/**
 * Response returned by eBay Marketing API getItemPromotion.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_promotion/methods/getItemPromotion
 */
export type GetItemPromotionResponse =
	MarketingOperationResponse<"getItemPromotion">;

/**
 * Response returned by eBay Marketing API updateItemPromotion.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_promotion/methods/updateItemPromotion
 */
export type UpdateItemPromotionResponse =
	MarketingOperationResponse<"updateItemPromotion">;

/**
 * Response returned by eBay Marketing API deleteItemPromotion.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_promotion/methods/deleteItemPromotion
 */
export type DeleteItemPromotionResponse =
	MarketingOperationResponse<"deleteItemPromotion">;

/**
 * Response returned by eBay Marketing API getListingSet.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion/methods/getListingSet
 */
export type GetListingSetResponse = MarketingOperationResponse<"getListingSet">;

/**
 * Response returned by eBay Marketing API getPromotions.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion/methods/getPromotions
 */
export type GetPromotionsResponse = MarketingOperationResponse<"getPromotions">;

/**
 * Response returned by eBay Marketing API pausePromotion.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion/methods/pausePromotion
 */
export type PausePromotionResponse =
	MarketingOperationResponse<"pausePromotion">;

/**
 * Response returned by eBay Marketing API resumePromotion.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion/methods/resumePromotion
 */
export type ResumePromotionResponse =
	MarketingOperationResponse<"resumePromotion">;

/**
 * Response returned by eBay Marketing API getPromotionReports.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion_report/methods/getPromotionReports
 */
export type GetPromotionReportsResponse =
	MarketingOperationResponse<"getPromotionReports">;

/**
 * Response returned by eBay Marketing API getPromotionSummaryReport.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion_summary_report/methods/getPromotionSummaryReport
 */
export type GetPromotionSummaryReportResponse =
	MarketingOperationResponse<"getPromotionSummaryReport">;

/**
 * Response returned by eBay Marketing API getEmailCampaigns.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/getEmailCampaigns
 */
export type GetEmailCampaignsResponse =
	MarketingOperationResponse<"getEmailCampaigns">;

/**
 * Response returned by eBay Marketing API createEmailCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/createEmailCampaign
 */
export type CreateEmailCampaignResponse =
	MarketingOperationResponse<"createEmailCampaign">;

/**
 * Response returned by eBay Marketing API getEmailCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/getEmailCampaign
 */
export type GetEmailCampaignResponse =
	MarketingOperationResponse<"getEmailCampaign">;

/**
 * Response returned by eBay Marketing API updateEmailCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/updateEmailCampaign
 */
export type UpdateEmailCampaignResponse =
	MarketingOperationResponse<"updateEmailCampaign">;

/**
 * Response returned by eBay Marketing API deleteEmailCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/deleteEmailCampaign
 */
export type DeleteEmailCampaignResponse =
	MarketingOperationResponse<"deleteEmailCampaign">;

/**
 * Response returned by eBay Marketing API getAudiences.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/getAudiences
 */
export type GetAudiencesResponse = MarketingOperationResponse<"getAudiences">;

/**
 * Response returned by eBay Marketing API getEmailPreview.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/getEmailPreview
 */
export type GetEmailPreviewResponse =
	MarketingOperationResponse<"getEmailPreview">;

/**
 * Response returned by eBay Marketing API getEmailReport.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/getEmailReport
 */
export type GetEmailReportResponse =
	MarketingOperationResponse<"getEmailReport">;

/** Marketing API — promotions methods closed over a shared client. */
export const createMarketingPromotionsMethods = (client: EbayApiClient) => ({
	/**
	 * Create item price markdown promotion through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for createItemPriceMarkdownPromotion.
	 * @returns An Effect that succeeds with eBay's generated createItemPriceMarkdownPromotion response DTO.
	 *
	 * @example
	 * ```ts
	 * const createdItemPriceMarkdownPromotion = await Effect.runPromise(marketingApi.createItemPriceMarkdownPromotion({ request: { ... } }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_price_markdown/methods/createItemPriceMarkdownPromotion
	 */
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

	/**
	 * Get item price markdown promotion through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for getItemPriceMarkdownPromotion.
	 * @returns An Effect that succeeds with eBay's generated getItemPriceMarkdownPromotion response DTO.
	 *
	 * @example
	 * ```ts
	 * const itemPriceMarkdownPromotion = await Effect.runPromise(marketingApi.getItemPriceMarkdownPromotion({ promotionId: 'promotion-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_price_markdown/methods/getItemPriceMarkdownPromotion
	 */
	getItemPriceMarkdownPromotion: (
		input: GetItemPriceMarkdownPromotionInput,
	): Promise<GetItemPriceMarkdownPromotionResponse> => {
		const path = `${MARKETING_BASE_PATH}/item_price_markdown/${input.promotionId}`;
		return requestGetEffect<GetItemPriceMarkdownPromotionResponse>(
			client,
			path,
		);
	},

	/**
	 * Update item price markdown promotion through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for updateItemPriceMarkdownPromotion.
	 * @returns An Effect that succeeds with eBay's generated updateItemPriceMarkdownPromotion response DTO.
	 *
	 * @example
	 * ```ts
	 * const updatedItemPriceMarkdownPromotion = await Effect.runPromise(marketingApi.updateItemPriceMarkdownPromotion({ promotionId: 'promotion-1', request: { ... } }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_price_markdown/methods/updateItemPriceMarkdownPromotion
	 */
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

	/**
	 * Delete item price markdown promotion through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for deleteItemPriceMarkdownPromotion.
	 * @returns An Effect that succeeds with eBay's generated deleteItemPriceMarkdownPromotion response DTO.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(marketingApi.deleteItemPriceMarkdownPromotion({ promotionId: 'promotion-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_price_markdown/methods/deleteItemPriceMarkdownPromotion
	 */
	deleteItemPriceMarkdownPromotion: (
		input: DeleteItemPriceMarkdownPromotionInput,
	): Promise<DeleteItemPriceMarkdownPromotionResponse> => {
		const path = `${MARKETING_BASE_PATH}/item_price_markdown/${input.promotionId}`;
		return requestDeleteEffect<DeleteItemPriceMarkdownPromotionResponse>(
			client,
			path,
		);
	},

	/**
	 * Create item promotion through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for createItemPromotion.
	 * @returns An Effect that succeeds with eBay's generated createItemPromotion response DTO.
	 *
	 * @example
	 * ```ts
	 * const createdItemPromotion = await Effect.runPromise(marketingApi.createItemPromotion({ request: { ... } }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_promotion/methods/createItemPromotion
	 */
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

	/**
	 * Get item promotion through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for getItemPromotion.
	 * @returns An Effect that succeeds with eBay's generated getItemPromotion response DTO.
	 *
	 * @example
	 * ```ts
	 * const itemPromotion = await Effect.runPromise(marketingApi.getItemPromotion({ promotionId: 'promotion-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_promotion/methods/getItemPromotion
	 */
	getItemPromotion: (
		input: GetItemPromotionInput,
	): Promise<GetItemPromotionResponse> => {
		const path = `${MARKETING_BASE_PATH}/item_promotion/${input.promotionId}`;
		return requestGetEffect<GetItemPromotionResponse>(client, path);
	},

	/**
	 * Update item promotion through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for updateItemPromotion.
	 * @returns An Effect that succeeds with eBay's generated updateItemPromotion response DTO.
	 *
	 * @example
	 * ```ts
	 * const updatedItemPromotion = await Effect.runPromise(marketingApi.updateItemPromotion({ promotionId: 'promotion-1', request: { ... } }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_promotion/methods/updateItemPromotion
	 */
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

	/**
	 * Delete item promotion through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for deleteItemPromotion.
	 * @returns An Effect that succeeds with eBay's generated deleteItemPromotion response DTO.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(marketingApi.deleteItemPromotion({ promotionId: 'promotion-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/item_promotion/methods/deleteItemPromotion
	 */
	deleteItemPromotion: (
		input: DeleteItemPromotionInput,
	): Promise<DeleteItemPromotionResponse> => {
		const path = `${MARKETING_BASE_PATH}/item_promotion/${input.promotionId}`;
		return requestDeleteEffect<DeleteItemPromotionResponse>(client, path);
	},

	/**
	 * Get listing set through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for getListingSet.
	 * @returns An Effect that succeeds with eBay's generated getListingSet response DTO.
	 *
	 * @example
	 * ```ts
	 * const listingSet = await Effect.runPromise(marketingApi.getListingSet({ promotionId: 'promotion-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion/methods/getListingSet
	 */
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

	/**
	 * Get promotions through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for getPromotions.
	 * @returns An Effect that succeeds with eBay's generated getPromotions response DTO.
	 *
	 * @example
	 * ```ts
	 * const promotions = await Effect.runPromise(marketingApi.getPromotions({ marketplaceId: 'marketplace-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion/methods/getPromotions
	 */
	getPromotions: (
		input: GetPromotionsInput,
	): Promise<GetPromotionsResponse> => {
		const path = `${MARKETING_BASE_PATH}/promotion`;
		const params = buildEndpointParams({
			limit: { wireName: "limit", value: input.limit },
			marketplaceId: { wireName: "marketplace_id", value: input.marketplaceId },
			offset: { wireName: "offset", value: input.offset },
			promotionStatus: {
				wireName: "promotion_status",
				value: input.promotionStatus,
			},
			promotionType: { wireName: "promotion_type", value: input.promotionType },
			q: { wireName: "q", value: input.q },
			sort: { wireName: "sort", value: input.sort },
		});
		return requestGetEffect<GetPromotionsResponse>(client, path, params);
	},

	/**
	 * Pause promotion through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for pausePromotion.
	 * @returns An Effect that succeeds with eBay's generated pausePromotion response DTO.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(marketingApi.pausePromotion({ promotionId: 'promotion-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion/methods/pausePromotion
	 */
	pausePromotion: (
		input: PausePromotionInput,
	): Promise<PausePromotionResponse> => {
		const path = `${MARKETING_BASE_PATH}/promotion/${input.promotionId}/pause`;
		return requestPostEffect<PausePromotionResponse>(client, path);
	},

	/**
	 * Resume promotion through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for resumePromotion.
	 * @returns An Effect that succeeds with eBay's generated resumePromotion response DTO.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(marketingApi.resumePromotion({ promotionId: 'promotion-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion/methods/resumePromotion
	 */
	resumePromotion: (
		input: ResumePromotionInput,
	): Promise<ResumePromotionResponse> => {
		const path = `${MARKETING_BASE_PATH}/promotion/${input.promotionId}/resume`;
		return requestPostEffect<ResumePromotionResponse>(client, path);
	},

	/**
	 * Get promotion reports through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for getPromotionReports.
	 * @returns An Effect that succeeds with eBay's generated getPromotionReports response DTO.
	 *
	 * @example
	 * ```ts
	 * const promotionReports = await Effect.runPromise(marketingApi.getPromotionReports({ marketplaceId: 'marketplace-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion_report/methods/getPromotionReports
	 */
	getPromotionReports: (
		input: GetPromotionReportsInput,
	): Promise<GetPromotionReportsResponse> => {
		const path = `${MARKETING_BASE_PATH}/promotion_report`;
		const params = buildEndpointParams({
			limit: { wireName: "limit", value: input.limit },
			marketplaceId: { wireName: "marketplace_id", value: input.marketplaceId },
			offset: { wireName: "offset", value: input.offset },
			promotionStatus: {
				wireName: "promotion_status",
				value: input.promotionStatus,
			},
			promotionType: { wireName: "promotion_type", value: input.promotionType },
			q: { wireName: "q", value: input.q },
		});
		return requestGetEffect<GetPromotionReportsResponse>(client, path, params);
	},

	/**
	 * Get promotion summary report through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for getPromotionSummaryReport.
	 * @returns An Effect that succeeds with eBay's generated getPromotionSummaryReport response DTO.
	 *
	 * @example
	 * ```ts
	 * const promotionSummaryReport = await Effect.runPromise(marketingApi.getPromotionSummaryReport({ marketplaceId: 'marketplace-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/promotion_summary_report/methods/getPromotionSummaryReport
	 */
	getPromotionSummaryReport: (
		input: GetPromotionSummaryReportInput,
	): Promise<GetPromotionSummaryReportResponse> => {
		const path = `${MARKETING_BASE_PATH}/promotion_summary_report`;
		const params = buildEndpointParams({
			marketplaceId: { wireName: "marketplace_id", value: input.marketplaceId },
		});
		return requestGetEffect<GetPromotionSummaryReportResponse>(
			client,
			path,
			params,
		);
	},

	/**
	 * Get email campaigns through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for getEmailCampaigns.
	 * @returns An Effect that succeeds with eBay's generated getEmailCampaigns response DTO.
	 *
	 * @example
	 * ```ts
	 * const emailCampaigns = await Effect.runPromise(marketingApi.getEmailCampaigns());
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/getEmailCampaigns
	 */
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

	/**
	 * Create email campaign through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for createEmailCampaign.
	 * @returns An Effect that succeeds with eBay's generated createEmailCampaign response DTO.
	 *
	 * @example
	 * ```ts
	 * const createdEmailCampaign = await Effect.runPromise(marketingApi.createEmailCampaign({ marketplaceId: 'EBAY_US', request: { ... } }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/createEmailCampaign
	 */
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

	/**
	 * Get email campaign through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for getEmailCampaign.
	 * @returns An Effect that succeeds with eBay's generated getEmailCampaign response DTO.
	 *
	 * @example
	 * ```ts
	 * const emailCampaign = await Effect.runPromise(marketingApi.getEmailCampaign({ emailCampaignId: 'emailCampaign-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/getEmailCampaign
	 */
	getEmailCampaign: (
		input: GetEmailCampaignInput,
	): Promise<GetEmailCampaignResponse> => {
		const path = `${MARKETING_BASE_PATH}/email_campaign/${input.emailCampaignId}`;
		return requestGetEffect<GetEmailCampaignResponse>(client, path);
	},

	/**
	 * Update email campaign through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for updateEmailCampaign.
	 * @returns An Effect that succeeds with eBay's generated updateEmailCampaign response DTO.
	 *
	 * @example
	 * ```ts
	 * const updatedEmailCampaign = await Effect.runPromise(marketingApi.updateEmailCampaign({ emailCampaignId: 'emailCampaign-1', request: { ... } }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/updateEmailCampaign
	 */
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

	/**
	 * Delete email campaign through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for deleteEmailCampaign.
	 * @returns An Effect that succeeds with eBay's generated deleteEmailCampaign response DTO.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(marketingApi.deleteEmailCampaign({ emailCampaignId: 'emailCampaign-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/deleteEmailCampaign
	 */
	deleteEmailCampaign: (
		input: DeleteEmailCampaignInput,
	): Promise<DeleteEmailCampaignResponse> => {
		const path = `${MARKETING_BASE_PATH}/email_campaign/${input.emailCampaignId}`;
		return requestDeleteEffect<DeleteEmailCampaignResponse>(client, path);
	},

	/**
	 * Get audiences through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for getAudiences.
	 * @returns An Effect that succeeds with eBay's generated getAudiences response DTO.
	 *
	 * @example
	 * ```ts
	 * const audiences = await Effect.runPromise(marketingApi.getAudiences({ emailCampaignType: 'emailCampaignType-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/getAudiences
	 */
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

	/**
	 * Get email preview through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for getEmailPreview.
	 * @returns An Effect that succeeds with eBay's generated getEmailPreview response DTO.
	 *
	 * @example
	 * ```ts
	 * const emailPreview = await Effect.runPromise(marketingApi.getEmailPreview({ emailCampaignId: 'emailCampaign-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/getEmailPreview
	 */
	getEmailPreview: (
		input: GetEmailPreviewInput,
	): Promise<GetEmailPreviewResponse> => {
		const path = `${MARKETING_BASE_PATH}/email_campaign/${input.emailCampaignId}/email_preview`;
		return requestGetEffect<GetEmailPreviewResponse>(client, path);
	},

	/**
	 * Get email report through the eBay Marketing API.
	 *
	 * @param input - Path, query, header, and request body values for getEmailReport.
	 * @returns An Effect that succeeds with eBay's generated getEmailReport response DTO.
	 *
	 * @example
	 * ```ts
	 * const emailReport = await Effect.runPromise(marketingApi.getEmailReport({ endDate: 'endDate-1', startDate: 'startDate-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/email_campaign/methods/getEmailReport
	 */
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
});
