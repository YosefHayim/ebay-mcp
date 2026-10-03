import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  type EbayApiError,
  buildEndpointParams,
  marketplaceHeader,
  requestDeleteEffect,
  requestGetEffect,
  requestPostEffect,
} from '@/api/shared/request.js';
import type {
  cloneCampaignInputSchema,
  getCampaignsInputSchema,
  createCampaignInputSchema,
  getCampaignInputSchema,
  deleteCampaignInputSchema,
  endCampaignInputSchema,
  findCampaignByAdReferenceInputSchema,
  getCampaignByNameInputSchema,
  launchCampaignInputSchema,
  pauseCampaignInputSchema,
  resumeCampaignInputSchema,
  setupQuickCampaignInputSchema,
  suggestBudgetInputSchema,
  suggestItemsInputSchema,
  suggestMaxCpcInputSchema,
  updateAdRateStrategyInputSchema,
  updateBiddingStrategyInputSchema,
  updateCampaignBudgetInputSchema,
  updateCampaignIdentificationInputSchema,
} from '@/schemas/marketing/marketing.js';
import type { Effect } from 'effect';
import type { z } from 'zod';
import { MARKETING_BASE_PATH, type MarketingOperationResponse } from './shared.js';

type CloneCampaignInput = z.infer<typeof cloneCampaignInputSchema>;
type GetCampaignsInput = z.infer<typeof getCampaignsInputSchema>;
type CreateCampaignInput = z.infer<typeof createCampaignInputSchema>;
type GetCampaignInput = z.infer<typeof getCampaignInputSchema>;
type DeleteCampaignInput = z.infer<typeof deleteCampaignInputSchema>;
type EndCampaignInput = z.infer<typeof endCampaignInputSchema>;
type FindCampaignByAdReferenceInput = z.infer<typeof findCampaignByAdReferenceInputSchema>;
type GetCampaignByNameInput = z.infer<typeof getCampaignByNameInputSchema>;
type LaunchCampaignInput = z.infer<typeof launchCampaignInputSchema>;
type PauseCampaignInput = z.infer<typeof pauseCampaignInputSchema>;
type ResumeCampaignInput = z.infer<typeof resumeCampaignInputSchema>;
type SetupQuickCampaignInput = z.infer<typeof setupQuickCampaignInputSchema>;
type SuggestBudgetInput = z.infer<typeof suggestBudgetInputSchema>;
type SuggestItemsInput = z.infer<typeof suggestItemsInputSchema>;
type SuggestMaxCpcInput = z.infer<typeof suggestMaxCpcInputSchema>;
type UpdateAdRateStrategyInput = z.infer<typeof updateAdRateStrategyInputSchema>;
type UpdateBiddingStrategyInput = z.infer<typeof updateBiddingStrategyInputSchema>;
type UpdateCampaignBudgetInput = z.infer<typeof updateCampaignBudgetInputSchema>;
type UpdateCampaignIdentificationInput = z.infer<typeof updateCampaignIdentificationInputSchema>;

/**
 * Response returned by eBay Marketing API cloneCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/cloneCampaign
 */
export type CloneCampaignResponse = MarketingOperationResponse<'cloneCampaign'>;

/**
 * Response returned by eBay Marketing API getCampaigns.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/getCampaigns
 */
export type GetCampaignsResponse = MarketingOperationResponse<'getCampaigns'>;

/**
 * Response returned by eBay Marketing API createCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/createCampaign
 */
export type CreateCampaignResponse = MarketingOperationResponse<'createCampaign'>;

/**
 * Response returned by eBay Marketing API getCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/getCampaign
 */
export type GetCampaignResponse = MarketingOperationResponse<'getCampaign'>;

/**
 * Response returned by eBay Marketing API deleteCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/deleteCampaign
 */
export type DeleteCampaignResponse = MarketingOperationResponse<'deleteCampaign'>;

/**
 * Response returned by eBay Marketing API endCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/endCampaign
 */
export type EndCampaignResponse = MarketingOperationResponse<'endCampaign'>;

/**
 * Response returned by eBay Marketing API findCampaignByAdReference.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/findCampaignByAdReference
 */
export type FindCampaignByAdReferenceResponse =
  MarketingOperationResponse<'findCampaignByAdReference'>;

/**
 * Response returned by eBay Marketing API getCampaignByName.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/getCampaignByName
 */
export type GetCampaignByNameResponse = MarketingOperationResponse<'getCampaignByName'>;

/**
 * Response returned by eBay Marketing API launchCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/launchCampaign
 */
export type LaunchCampaignResponse = MarketingOperationResponse<'launchCampaign'>;

/**
 * Response returned by eBay Marketing API pauseCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/pauseCampaign
 */
export type PauseCampaignResponse = MarketingOperationResponse<'pauseCampaign'>;

/**
 * Response returned by eBay Marketing API resumeCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/resumeCampaign
 */
export type ResumeCampaignResponse = MarketingOperationResponse<'resumeCampaign'>;

/**
 * Response returned by eBay Marketing API setupQuickCampaign.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/setupQuickCampaign
 */
export type SetupQuickCampaignResponse = MarketingOperationResponse<'setupQuickCampaign'>;

/**
 * Response returned by eBay Marketing API suggestBudget.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/suggestBudget
 */
export type SuggestBudgetResponse = MarketingOperationResponse<'suggestBudget'>;

/**
 * Response returned by eBay Marketing API suggestItems.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/suggestItems
 */
export type SuggestItemsResponse = MarketingOperationResponse<'suggestItems'>;

/**
 * Response returned by eBay Marketing API suggestMaxCpc.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/suggestMaxCpc
 */
export type SuggestMaxCpcResponse = MarketingOperationResponse<'suggestMaxCpc'>;

/**
 * Response returned by eBay Marketing API updateAdRateStrategy.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/updateAdRateStrategy
 */
export type UpdateAdRateStrategyResponse = MarketingOperationResponse<'updateAdRateStrategy'>;

/**
 * Response returned by eBay Marketing API updateBiddingStrategy.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/updateBiddingStrategy
 */
export type UpdateBiddingStrategyResponse = MarketingOperationResponse<'updateBiddingStrategy'>;

/**
 * Response returned by eBay Marketing API updateCampaignBudget.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/updateCampaignBudget
 */
export type UpdateCampaignBudgetResponse = MarketingOperationResponse<'updateCampaignBudget'>;

/**
 * Response returned by eBay Marketing API updateCampaignIdentification.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/updateCampaignIdentification
 */
export type UpdateCampaignIdentificationResponse =
  MarketingOperationResponse<'updateCampaignIdentification'>;

/** Marketing API — campaigns methods closed over a shared client. */
export const createMarketingCampaignsMethods = (client: EbayApiClient) => ({
  /**
   * Clone campaign through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for cloneCampaign.
   * @returns An Effect that succeeds with eBay's generated cloneCampaign response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.cloneCampaign({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/cloneCampaign
   */
  cloneCampaign: (
    input: CloneCampaignInput,
  ): Effect.Effect<CloneCampaignResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/clone`;
    return requestPostEffect<CloneCampaignResponse>(client, path, input.request);
  },

  /**
   * Get campaigns through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getCampaigns.
   * @returns An Effect that succeeds with eBay's generated getCampaigns response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getCampaigns());
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/getCampaigns
   */
  getCampaigns: (
    input: GetCampaignsInput = {},
  ): Effect.Effect<GetCampaignsResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign`;
    const params = buildEndpointParams({
      campaignName: { wireName: 'campaign_name', value: input.campaignName },
      campaignStatus: { wireName: 'campaign_status', value: input.campaignStatus },
      campaignTargetingTypes: {
        wireName: 'campaign_targeting_types',
        value: input.campaignTargetingTypes,
      },
      channels: { wireName: 'channels', value: input.channels },
      endDateRange: { wireName: 'end_date_range', value: input.endDateRange },
      fundingStrategy: { wireName: 'funding_strategy', value: input.fundingStrategy },
      limit: { wireName: 'limit', value: input.limit },
      offset: { wireName: 'offset', value: input.offset },
      startDateRange: { wireName: 'start_date_range', value: input.startDateRange },
    });
    return requestGetEffect<GetCampaignsResponse>(client, path, params);
  },

  /**
   * Create campaign through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for createCampaign.
   * @returns An Effect that succeeds with eBay's generated createCampaign response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.createCampaign({ request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/createCampaign
   */
  createCampaign: (
    input: CreateCampaignInput,
  ): Effect.Effect<CreateCampaignResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign`;
    return requestPostEffect<CreateCampaignResponse>(client, path, input.request);
  },

  /**
   * Get campaign through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getCampaign.
   * @returns An Effect that succeeds with eBay's generated getCampaign response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getCampaign({ campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/getCampaign
   */
  getCampaign: (input: GetCampaignInput): Effect.Effect<GetCampaignResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}`;
    return requestGetEffect<GetCampaignResponse>(client, path);
  },

  /**
   * Delete campaign through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for deleteCampaign.
   * @returns An Effect that succeeds with eBay's generated deleteCampaign response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.deleteCampaign({ campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/deleteCampaign
   */
  deleteCampaign: (
    input: DeleteCampaignInput,
  ): Effect.Effect<DeleteCampaignResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}`;
    return requestDeleteEffect<DeleteCampaignResponse>(client, path);
  },

  /**
   * End campaign through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for endCampaign.
   * @returns An Effect that succeeds with eBay's generated endCampaign response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.endCampaign({ campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/endCampaign
   */
  endCampaign: (input: EndCampaignInput): Effect.Effect<EndCampaignResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/end`;
    return requestPostEffect<EndCampaignResponse>(client, path);
  },

  /**
   * Find campaign by ad reference through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for findCampaignByAdReference.
   * @returns An Effect that succeeds with eBay's generated findCampaignByAdReference response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.findCampaignByAdReference());
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/findCampaignByAdReference
   */
  findCampaignByAdReference: (
    input: FindCampaignByAdReferenceInput = {},
  ): Effect.Effect<FindCampaignByAdReferenceResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/find_campaign_by_ad_reference`;
    const params = buildEndpointParams({
      inventoryReferenceId: {
        wireName: 'inventory_reference_id',
        value: input.inventoryReferenceId,
      },
      inventoryReferenceType: {
        wireName: 'inventory_reference_type',
        value: input.inventoryReferenceType,
      },
      listingId: { wireName: 'listing_id', value: input.listingId },
    });
    return requestGetEffect<FindCampaignByAdReferenceResponse>(client, path, params);
  },

  /**
   * Get campaign by name through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getCampaignByName.
   * @returns An Effect that succeeds with eBay's generated getCampaignByName response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getCampaignByName({ campaignName: 'campaignName-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/getCampaignByName
   */
  getCampaignByName: (
    input: GetCampaignByNameInput,
  ): Effect.Effect<GetCampaignByNameResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/get_campaign_by_name`;
    const params = buildEndpointParams({
      campaignName: { wireName: 'campaign_name', value: input.campaignName },
    });
    return requestGetEffect<GetCampaignByNameResponse>(client, path, params);
  },

  /**
   * Launch campaign through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for launchCampaign.
   * @returns An Effect that succeeds with eBay's generated launchCampaign response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.launchCampaign({ campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/launchCampaign
   */
  launchCampaign: (
    input: LaunchCampaignInput,
  ): Effect.Effect<LaunchCampaignResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/launch`;
    return requestPostEffect<LaunchCampaignResponse>(client, path);
  },

  /**
   * Pause campaign through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for pauseCampaign.
   * @returns An Effect that succeeds with eBay's generated pauseCampaign response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.pauseCampaign({ campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/pauseCampaign
   */
  pauseCampaign: (
    input: PauseCampaignInput,
  ): Effect.Effect<PauseCampaignResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/pause`;
    return requestPostEffect<PauseCampaignResponse>(client, path);
  },

  /**
   * Resume campaign through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for resumeCampaign.
   * @returns An Effect that succeeds with eBay's generated resumeCampaign response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.resumeCampaign({ campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/resumeCampaign
   */
  resumeCampaign: (
    input: ResumeCampaignInput,
  ): Effect.Effect<ResumeCampaignResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/resume`;
    return requestPostEffect<ResumeCampaignResponse>(client, path);
  },

  /**
   * Setup quick campaign through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for setupQuickCampaign.
   * @returns An Effect that succeeds with eBay's generated setupQuickCampaign response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.setupQuickCampaign({ request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/setupQuickCampaign
   */
  setupQuickCampaign: (
    input: SetupQuickCampaignInput,
  ): Effect.Effect<SetupQuickCampaignResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/setup_quick_campaign`;
    return requestPostEffect<SetupQuickCampaignResponse>(client, path, input.request);
  },

  /**
   * Suggest budget through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for suggestBudget.
   * @returns An Effect that succeeds with eBay's generated suggestBudget response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.suggestBudget({ marketplaceId: 'EBAY_US' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/suggestBudget
   */
  suggestBudget: (
    input: SuggestBudgetInput,
  ): Effect.Effect<SuggestBudgetResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/suggest_budget`;
    const config = marketplaceHeader(input.marketplaceId);
    return requestGetEffect<SuggestBudgetResponse>(client, path, undefined, config);
  },

  /**
   * Suggest items through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for suggestItems.
   * @returns An Effect that succeeds with eBay's generated suggestItems response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.suggestItems({ campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/suggestItems
   */
  suggestItems: (input: SuggestItemsInput): Effect.Effect<SuggestItemsResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/suggest_items`;
    const params = buildEndpointParams({
      categoryIds: { wireName: 'category_ids', value: input.categoryIds },
      limit: { wireName: 'limit', value: input.limit },
      offset: { wireName: 'offset', value: input.offset },
    });
    return requestGetEffect<SuggestItemsResponse>(client, path, params);
  },

  /**
   * Suggest max cpc through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for suggestMaxCpc.
   * @returns An Effect that succeeds with eBay's generated suggestMaxCpc response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.suggestMaxCpc({ request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/suggestMaxCpc
   */
  suggestMaxCpc: (
    input: SuggestMaxCpcInput,
  ): Effect.Effect<SuggestMaxCpcResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/suggest_max_cpc`;
    return requestPostEffect<SuggestMaxCpcResponse>(client, path, input.request);
  },

  /**
   * Update ad rate strategy through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for updateAdRateStrategy.
   * @returns An Effect that succeeds with eBay's generated updateAdRateStrategy response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.updateAdRateStrategy({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/updateAdRateStrategy
   */
  updateAdRateStrategy: (
    input: UpdateAdRateStrategyInput,
  ): Effect.Effect<UpdateAdRateStrategyResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/update_ad_rate_strategy`;
    return requestPostEffect<UpdateAdRateStrategyResponse>(client, path, input.request);
  },

  /**
   * Update bidding strategy through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for updateBiddingStrategy.
   * @returns An Effect that succeeds with eBay's generated updateBiddingStrategy response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.updateBiddingStrategy({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/updateBiddingStrategy
   */
  updateBiddingStrategy: (
    input: UpdateBiddingStrategyInput,
  ): Effect.Effect<UpdateBiddingStrategyResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/update_bidding_strategy`;
    return requestPostEffect<UpdateBiddingStrategyResponse>(client, path, input.request);
  },

  /**
   * Update campaign budget through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for updateCampaignBudget.
   * @returns An Effect that succeeds with eBay's generated updateCampaignBudget response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.updateCampaignBudget({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/updateCampaignBudget
   */
  updateCampaignBudget: (
    input: UpdateCampaignBudgetInput,
  ): Effect.Effect<UpdateCampaignBudgetResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/update_campaign_budget`;
    return requestPostEffect<UpdateCampaignBudgetResponse>(client, path, input.request);
  },

  /**
   * Update campaign identification through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for updateCampaignIdentification.
   * @returns An Effect that succeeds with eBay's generated updateCampaignIdentification response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.updateCampaignIdentification({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/campaign/methods/updateCampaignIdentification
   */
  updateCampaignIdentification: (
    input: UpdateCampaignIdentificationInput,
  ): Effect.Effect<UpdateCampaignIdentificationResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/update_campaign_identification`;
    return requestPostEffect<UpdateCampaignIdentificationResponse>(client, path, input.request);
  },
});
