import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  type EbayApiError,
  buildEndpointParams,
  requestDeleteEffect,
  requestGetEffect,
  requestPostEffect,
  requestPutEffect,
} from '@/api/shared/request.js';
import type {
  bulkCreateAdsByInventoryReferenceInputSchema,
  bulkCreateAdsByListingIdInputSchema,
  bulkDeleteAdsByInventoryReferenceInputSchema,
  bulkDeleteAdsByListingIdInputSchema,
  bulkUpdateAdsBidByInventoryReferenceInputSchema,
  bulkUpdateAdsBidByListingIdInputSchema,
  bulkUpdateAdsStatusInputSchema,
  bulkUpdateAdsStatusByListingIdInputSchema,
  getAdsInputSchema,
  createAdByListingIdInputSchema,
  createAdsByInventoryReferenceInputSchema,
  getAdInputSchema,
  deleteAdInputSchema,
  deleteAdsByInventoryReferenceInputSchema,
  getAdsByInventoryReferenceInputSchema,
  updateBidInputSchema,
  getAdGroupsInputSchema,
  createAdGroupInputSchema,
  getAdGroupInputSchema,
  updateAdGroupInputSchema,
  suggestBidsInputSchema,
  suggestKeywordsInputSchema,
  bulkCreateKeywordInputSchema,
  bulkUpdateKeywordInputSchema,
  getKeywordsInputSchema,
  createKeywordInputSchema,
  getKeywordInputSchema,
  updateKeywordInputSchema,
  bulkCreateNegativeKeywordInputSchema,
  bulkUpdateNegativeKeywordInputSchema,
  getNegativeKeywordsInputSchema,
  createNegativeKeywordInputSchema,
  getNegativeKeywordInputSchema,
  updateNegativeKeywordInputSchema,
} from '@/schemas/marketing/marketing.js';
import type { Effect } from 'effect';
import type { InferEffectSchema } from '@/utils/effectSchemaTypes.js';
import { MARKETING_BASE_PATH, type MarketingOperationResponse } from './shared.js';

type BulkCreateAdsByInventoryReferenceInput = InferEffectSchema<
  typeof bulkCreateAdsByInventoryReferenceInputSchema
>;
type BulkCreateAdsByListingIdInput = InferEffectSchema<typeof bulkCreateAdsByListingIdInputSchema>;
type BulkDeleteAdsByInventoryReferenceInput = InferEffectSchema<
  typeof bulkDeleteAdsByInventoryReferenceInputSchema
>;
type BulkDeleteAdsByListingIdInput = InferEffectSchema<typeof bulkDeleteAdsByListingIdInputSchema>;
type BulkUpdateAdsBidByInventoryReferenceInput = InferEffectSchema<
  typeof bulkUpdateAdsBidByInventoryReferenceInputSchema
>;
type BulkUpdateAdsBidByListingIdInput = InferEffectSchema<
  typeof bulkUpdateAdsBidByListingIdInputSchema
>;
type BulkUpdateAdsStatusInput = InferEffectSchema<typeof bulkUpdateAdsStatusInputSchema>;
type BulkUpdateAdsStatusByListingIdInput = InferEffectSchema<
  typeof bulkUpdateAdsStatusByListingIdInputSchema
>;
type GetAdsInput = InferEffectSchema<typeof getAdsInputSchema>;
type CreateAdByListingIdInput = InferEffectSchema<typeof createAdByListingIdInputSchema>;
type CreateAdsByInventoryReferenceInput = InferEffectSchema<
  typeof createAdsByInventoryReferenceInputSchema
>;
type GetAdInput = InferEffectSchema<typeof getAdInputSchema>;
type DeleteAdInput = InferEffectSchema<typeof deleteAdInputSchema>;
type DeleteAdsByInventoryReferenceInput = InferEffectSchema<
  typeof deleteAdsByInventoryReferenceInputSchema
>;
type GetAdsByInventoryReferenceInput = InferEffectSchema<
  typeof getAdsByInventoryReferenceInputSchema
>;
type UpdateBidInput = InferEffectSchema<typeof updateBidInputSchema>;
type GetAdGroupsInput = InferEffectSchema<typeof getAdGroupsInputSchema>;
type CreateAdGroupInput = InferEffectSchema<typeof createAdGroupInputSchema>;
type GetAdGroupInput = InferEffectSchema<typeof getAdGroupInputSchema>;
type UpdateAdGroupInput = InferEffectSchema<typeof updateAdGroupInputSchema>;
type SuggestBidsInput = InferEffectSchema<typeof suggestBidsInputSchema>;
type SuggestKeywordsInput = InferEffectSchema<typeof suggestKeywordsInputSchema>;
type BulkCreateKeywordInput = InferEffectSchema<typeof bulkCreateKeywordInputSchema>;
type BulkUpdateKeywordInput = InferEffectSchema<typeof bulkUpdateKeywordInputSchema>;
type GetKeywordsInput = InferEffectSchema<typeof getKeywordsInputSchema>;
type CreateKeywordInput = InferEffectSchema<typeof createKeywordInputSchema>;
type GetKeywordInput = InferEffectSchema<typeof getKeywordInputSchema>;
type UpdateKeywordInput = InferEffectSchema<typeof updateKeywordInputSchema>;
type BulkCreateNegativeKeywordInput = InferEffectSchema<
  typeof bulkCreateNegativeKeywordInputSchema
>;
type BulkUpdateNegativeKeywordInput = InferEffectSchema<
  typeof bulkUpdateNegativeKeywordInputSchema
>;
type GetNegativeKeywordsInput = InferEffectSchema<typeof getNegativeKeywordsInputSchema>;
type CreateNegativeKeywordInput = InferEffectSchema<typeof createNegativeKeywordInputSchema>;
type GetNegativeKeywordInput = InferEffectSchema<typeof getNegativeKeywordInputSchema>;
type UpdateNegativeKeywordInput = InferEffectSchema<typeof updateNegativeKeywordInputSchema>;

/**
 * Response returned by eBay Marketing API bulkCreateAdsByInventoryReference.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkCreateAdsByInventoryReference
 */
export type BulkCreateAdsByInventoryReferenceResponse =
  MarketingOperationResponse<'bulkCreateAdsByInventoryReference'>;

/**
 * Response returned by eBay Marketing API bulkCreateAdsByListingId.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkCreateAdsByListingId
 */
export type BulkCreateAdsByListingIdResponse =
  MarketingOperationResponse<'bulkCreateAdsByListingId'>;

/**
 * Response returned by eBay Marketing API bulkDeleteAdsByInventoryReference.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkDeleteAdsByInventoryReference
 */
export type BulkDeleteAdsByInventoryReferenceResponse =
  MarketingOperationResponse<'bulkDeleteAdsByInventoryReference'>;

/**
 * Response returned by eBay Marketing API bulkDeleteAdsByListingId.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkDeleteAdsByListingId
 */
export type BulkDeleteAdsByListingIdResponse =
  MarketingOperationResponse<'bulkDeleteAdsByListingId'>;

/**
 * Response returned by eBay Marketing API bulkUpdateAdsBidByInventoryReference.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkUpdateAdsBidByInventoryReference
 */
export type BulkUpdateAdsBidByInventoryReferenceResponse =
  MarketingOperationResponse<'bulkUpdateAdsBidByInventoryReference'>;

/**
 * Response returned by eBay Marketing API bulkUpdateAdsBidByListingId.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkUpdateAdsBidByListingId
 */
export type BulkUpdateAdsBidByListingIdResponse =
  MarketingOperationResponse<'bulkUpdateAdsBidByListingId'>;

/**
 * Response returned by eBay Marketing API bulkUpdateAdsStatus.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkUpdateAdsStatus
 */
export type BulkUpdateAdsStatusResponse = MarketingOperationResponse<'bulkUpdateAdsStatus'>;

/**
 * Response returned by eBay Marketing API bulkUpdateAdsStatusByListingId.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkUpdateAdsStatusByListingId
 */
export type BulkUpdateAdsStatusByListingIdResponse =
  MarketingOperationResponse<'bulkUpdateAdsStatusByListingId'>;

/**
 * Response returned by eBay Marketing API getAds.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/getAds
 */
export type GetAdsResponse = MarketingOperationResponse<'getAds'>;

/**
 * Response returned by eBay Marketing API createAdByListingId.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/createAdByListingId
 */
export type CreateAdByListingIdResponse = MarketingOperationResponse<'createAdByListingId'>;

/**
 * Response returned by eBay Marketing API createAdsByInventoryReference.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/createAdsByInventoryReference
 */
export type CreateAdsByInventoryReferenceResponse =
  MarketingOperationResponse<'createAdsByInventoryReference'>;

/**
 * Response returned by eBay Marketing API getAd.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/getAd
 */
export type GetAdResponse = MarketingOperationResponse<'getAd'>;

/**
 * Response returned by eBay Marketing API deleteAd.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/deleteAd
 */
export type DeleteAdResponse = MarketingOperationResponse<'deleteAd'>;

/**
 * Response returned by eBay Marketing API deleteAdsByInventoryReference.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/deleteAdsByInventoryReference
 */
export type DeleteAdsByInventoryReferenceResponse =
  MarketingOperationResponse<'deleteAdsByInventoryReference'>;

/**
 * Response returned by eBay Marketing API getAdsByInventoryReference.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/getAdsByInventoryReference
 */
export type GetAdsByInventoryReferenceResponse =
  MarketingOperationResponse<'getAdsByInventoryReference'>;

/**
 * Response returned by eBay Marketing API updateBid.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/updateBid
 */
export type UpdateBidResponse = MarketingOperationResponse<'updateBid'>;

/**
 * Response returned by eBay Marketing API getAdGroups.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/getAdGroups
 */
export type GetAdGroupsResponse = MarketingOperationResponse<'getAdGroups'>;

/**
 * Response returned by eBay Marketing API createAdGroup.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/createAdGroup
 */
export type CreateAdGroupResponse = MarketingOperationResponse<'createAdGroup'>;

/**
 * Response returned by eBay Marketing API getAdGroup.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/getAdGroup
 */
export type GetAdGroupResponse = MarketingOperationResponse<'getAdGroup'>;

/**
 * Response returned by eBay Marketing API updateAdGroup.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/updateAdGroup
 */
export type UpdateAdGroupResponse = MarketingOperationResponse<'updateAdGroup'>;

/**
 * Response returned by eBay Marketing API suggestBids.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/suggestBids
 */
export type SuggestBidsResponse = MarketingOperationResponse<'suggestBids'>;

/**
 * Response returned by eBay Marketing API suggestKeywords.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/suggestKeywords
 */
export type SuggestKeywordsResponse = MarketingOperationResponse<'suggestKeywords'>;

/**
 * Response returned by eBay Marketing API bulkCreateKeyword.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/bulkCreateKeyword
 */
export type BulkCreateKeywordResponse = MarketingOperationResponse<'bulkCreateKeyword'>;

/**
 * Response returned by eBay Marketing API bulkUpdateKeyword.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/bulkUpdateKeyword
 */
export type BulkUpdateKeywordResponse = MarketingOperationResponse<'bulkUpdateKeyword'>;

/**
 * Response returned by eBay Marketing API getKeywords.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/getKeywords
 */
export type GetKeywordsResponse = MarketingOperationResponse<'getKeywords'>;

/**
 * Response returned by eBay Marketing API createKeyword.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/createKeyword
 */
export type CreateKeywordResponse = MarketingOperationResponse<'createKeyword'>;

/**
 * Response returned by eBay Marketing API getKeyword.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/getKeyword
 */
export type GetKeywordResponse = MarketingOperationResponse<'getKeyword'>;

/**
 * Response returned by eBay Marketing API updateKeyword.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/updateKeyword
 */
export type UpdateKeywordResponse = MarketingOperationResponse<'updateKeyword'>;

/**
 * Response returned by eBay Marketing API bulkCreateNegativeKeyword.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/bulkCreateNegativeKeyword
 */
export type BulkCreateNegativeKeywordResponse =
  MarketingOperationResponse<'bulkCreateNegativeKeyword'>;

/**
 * Response returned by eBay Marketing API bulkUpdateNegativeKeyword.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/bulkUpdateNegativeKeyword
 */
export type BulkUpdateNegativeKeywordResponse =
  MarketingOperationResponse<'bulkUpdateNegativeKeyword'>;

/**
 * Response returned by eBay Marketing API getNegativeKeywords.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/getNegativeKeywords
 */
export type GetNegativeKeywordsResponse = MarketingOperationResponse<'getNegativeKeywords'>;

/**
 * Response returned by eBay Marketing API createNegativeKeyword.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/createNegativeKeyword
 */
export type CreateNegativeKeywordResponse = MarketingOperationResponse<'createNegativeKeyword'>;

/**
 * Response returned by eBay Marketing API getNegativeKeyword.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/getNegativeKeyword
 */
export type GetNegativeKeywordResponse = MarketingOperationResponse<'getNegativeKeyword'>;

/**
 * Response returned by eBay Marketing API updateNegativeKeyword.
 *
 * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/updateNegativeKeyword
 */
export type UpdateNegativeKeywordResponse = MarketingOperationResponse<'updateNegativeKeyword'>;

/** Marketing API — ads methods closed over a shared client. */
export const createMarketingAdsMethods = (client: EbayApiClient) => ({
  /**
   * Bulk create ads by inventory reference through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkCreateAdsByInventoryReference.
   * @returns An Effect that succeeds with eBay's generated bulkCreateAdsByInventoryReference response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkCreateAdsByInventoryReference({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkCreateAdsByInventoryReference
   */
  bulkCreateAdsByInventoryReference: (
    input: BulkCreateAdsByInventoryReferenceInput,
  ): Effect.Effect<BulkCreateAdsByInventoryReferenceResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_create_ads_by_inventory_reference`;
    return requestPostEffect<BulkCreateAdsByInventoryReferenceResponse>(
      client,
      path,
      input.request,
    );
  },

  /**
   * Bulk create ads by listing id through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkCreateAdsByListingId.
   * @returns An Effect that succeeds with eBay's generated bulkCreateAdsByListingId response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkCreateAdsByListingId({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkCreateAdsByListingId
   */
  bulkCreateAdsByListingId: (
    input: BulkCreateAdsByListingIdInput,
  ): Effect.Effect<BulkCreateAdsByListingIdResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_create_ads_by_listing_id`;
    return requestPostEffect<BulkCreateAdsByListingIdResponse>(client, path, input.request);
  },

  /**
   * Bulk delete ads by inventory reference through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkDeleteAdsByInventoryReference.
   * @returns An Effect that succeeds with eBay's generated bulkDeleteAdsByInventoryReference response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkDeleteAdsByInventoryReference({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkDeleteAdsByInventoryReference
   */
  bulkDeleteAdsByInventoryReference: (
    input: BulkDeleteAdsByInventoryReferenceInput,
  ): Effect.Effect<BulkDeleteAdsByInventoryReferenceResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_delete_ads_by_inventory_reference`;
    return requestPostEffect<BulkDeleteAdsByInventoryReferenceResponse>(
      client,
      path,
      input.request,
    );
  },

  /**
   * Bulk delete ads by listing id through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkDeleteAdsByListingId.
   * @returns An Effect that succeeds with eBay's generated bulkDeleteAdsByListingId response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkDeleteAdsByListingId({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkDeleteAdsByListingId
   */
  bulkDeleteAdsByListingId: (
    input: BulkDeleteAdsByListingIdInput,
  ): Effect.Effect<BulkDeleteAdsByListingIdResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_delete_ads_by_listing_id`;
    return requestPostEffect<BulkDeleteAdsByListingIdResponse>(client, path, input.request);
  },

  /**
   * Bulk update ads bid by inventory reference through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkUpdateAdsBidByInventoryReference.
   * @returns An Effect that succeeds with eBay's generated bulkUpdateAdsBidByInventoryReference response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkUpdateAdsBidByInventoryReference({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkUpdateAdsBidByInventoryReference
   */
  bulkUpdateAdsBidByInventoryReference: (
    input: BulkUpdateAdsBidByInventoryReferenceInput,
  ): Effect.Effect<BulkUpdateAdsBidByInventoryReferenceResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_update_ads_bid_by_inventory_reference`;
    return requestPostEffect<BulkUpdateAdsBidByInventoryReferenceResponse>(
      client,
      path,
      input.request,
    );
  },

  /**
   * Bulk update ads bid by listing id through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkUpdateAdsBidByListingId.
   * @returns An Effect that succeeds with eBay's generated bulkUpdateAdsBidByListingId response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkUpdateAdsBidByListingId({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkUpdateAdsBidByListingId
   */
  bulkUpdateAdsBidByListingId: (
    input: BulkUpdateAdsBidByListingIdInput,
  ): Effect.Effect<BulkUpdateAdsBidByListingIdResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_update_ads_bid_by_listing_id`;
    return requestPostEffect<BulkUpdateAdsBidByListingIdResponse>(client, path, input.request);
  },

  /**
   * Bulk update ads status through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkUpdateAdsStatus.
   * @returns An Effect that succeeds with eBay's generated bulkUpdateAdsStatus response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkUpdateAdsStatus({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkUpdateAdsStatus
   */
  bulkUpdateAdsStatus: (
    input: BulkUpdateAdsStatusInput,
  ): Effect.Effect<BulkUpdateAdsStatusResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_update_ads_status`;
    return requestPostEffect<BulkUpdateAdsStatusResponse>(client, path, input.request);
  },

  /**
   * Bulk update ads status by listing id through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkUpdateAdsStatusByListingId.
   * @returns An Effect that succeeds with eBay's generated bulkUpdateAdsStatusByListingId response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkUpdateAdsStatusByListingId({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/bulkUpdateAdsStatusByListingId
   */
  bulkUpdateAdsStatusByListingId: (
    input: BulkUpdateAdsStatusByListingIdInput,
  ): Effect.Effect<BulkUpdateAdsStatusByListingIdResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_update_ads_status_by_listing_id`;
    return requestPostEffect<BulkUpdateAdsStatusByListingIdResponse>(client, path, input.request);
  },

  /**
   * Get ads through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getAds.
   * @returns An Effect that succeeds with eBay's generated getAds response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getAds({ campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/getAds
   */
  getAds: (input: GetAdsInput): Effect.Effect<GetAdsResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad`;
    const params = buildEndpointParams({
      adGroupIds: { wireName: 'ad_group_ids', value: input.adGroupIds },
      adStatus: { wireName: 'ad_status', value: input.adStatus },
      limit: { wireName: 'limit', value: input.limit },
      listingIds: { wireName: 'listing_ids', value: input.listingIds },
      offset: { wireName: 'offset', value: input.offset },
    });
    return requestGetEffect<GetAdsResponse>(client, path, params);
  },

  /**
   * Create ad by listing id through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for createAdByListingId.
   * @returns An Effect that succeeds with eBay's generated createAdByListingId response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.createAdByListingId({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/createAdByListingId
   */
  createAdByListingId: (
    input: CreateAdByListingIdInput,
  ): Effect.Effect<CreateAdByListingIdResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad`;
    return requestPostEffect<CreateAdByListingIdResponse>(client, path, input.request);
  },

  /**
   * Create ads by inventory reference through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for createAdsByInventoryReference.
   * @returns An Effect that succeeds with eBay's generated createAdsByInventoryReference response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.createAdsByInventoryReference({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/createAdsByInventoryReference
   */
  createAdsByInventoryReference: (
    input: CreateAdsByInventoryReferenceInput,
  ): Effect.Effect<CreateAdsByInventoryReferenceResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/create_ads_by_inventory_reference`;
    return requestPostEffect<CreateAdsByInventoryReferenceResponse>(client, path, input.request);
  },

  /**
   * Get ad through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getAd.
   * @returns An Effect that succeeds with eBay's generated getAd response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getAd({ adId: 'ad-1', campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/getAd
   */
  getAd: (input: GetAdInput): Effect.Effect<GetAdResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad/${input.adId}`;
    return requestGetEffect<GetAdResponse>(client, path);
  },

  /**
   * Delete ad through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for deleteAd.
   * @returns An Effect that succeeds with eBay's generated deleteAd response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.deleteAd({ adId: 'ad-1', campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/deleteAd
   */
  deleteAd: (input: DeleteAdInput): Effect.Effect<DeleteAdResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad/${input.adId}`;
    return requestDeleteEffect<DeleteAdResponse>(client, path);
  },

  /**
   * Delete ads by inventory reference through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for deleteAdsByInventoryReference.
   * @returns An Effect that succeeds with eBay's generated deleteAdsByInventoryReference response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.deleteAdsByInventoryReference({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/deleteAdsByInventoryReference
   */
  deleteAdsByInventoryReference: (
    input: DeleteAdsByInventoryReferenceInput,
  ): Effect.Effect<DeleteAdsByInventoryReferenceResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/delete_ads_by_inventory_reference`;
    return requestPostEffect<DeleteAdsByInventoryReferenceResponse>(client, path, input.request);
  },

  /**
   * Get ads by inventory reference through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getAdsByInventoryReference.
   * @returns An Effect that succeeds with eBay's generated getAdsByInventoryReference response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getAdsByInventoryReference({ campaignId: 'campaign-1', inventoryReferenceId: 'inventoryReference-1', inventoryReferenceType: 'inventoryReferenceType-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/getAdsByInventoryReference
   */
  getAdsByInventoryReference: (
    input: GetAdsByInventoryReferenceInput,
  ): Effect.Effect<GetAdsByInventoryReferenceResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/get_ads_by_inventory_reference`;
    const params = buildEndpointParams({
      inventoryReferenceId: {
        wireName: 'inventory_reference_id',
        value: input.inventoryReferenceId,
      },
      inventoryReferenceType: {
        wireName: 'inventory_reference_type',
        value: input.inventoryReferenceType,
      },
    });
    return requestGetEffect<GetAdsByInventoryReferenceResponse>(client, path, params);
  },

  /**
   * Update bid through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for updateBid.
   * @returns An Effect that succeeds with eBay's generated updateBid response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.updateBid({ adId: 'ad-1', campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad/methods/updateBid
   */
  updateBid: (input: UpdateBidInput): Effect.Effect<UpdateBidResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad/${input.adId}/update_bid`;
    return requestPostEffect<UpdateBidResponse>(client, path, input.request);
  },

  /**
   * Get ad groups through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getAdGroups.
   * @returns An Effect that succeeds with eBay's generated getAdGroups response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getAdGroups({ campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/getAdGroups
   */
  getAdGroups: (input: GetAdGroupsInput): Effect.Effect<GetAdGroupsResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group`;
    const params = buildEndpointParams({
      adGroupStatus: { wireName: 'ad_group_status', value: input.adGroupStatus },
      limit: { wireName: 'limit', value: input.limit },
      offset: { wireName: 'offset', value: input.offset },
    });
    return requestGetEffect<GetAdGroupsResponse>(client, path, params);
  },

  /**
   * Create ad group through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for createAdGroup.
   * @returns An Effect that succeeds with eBay's generated createAdGroup response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.createAdGroup({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/createAdGroup
   */
  createAdGroup: (
    input: CreateAdGroupInput,
  ): Effect.Effect<CreateAdGroupResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group`;
    return requestPostEffect<CreateAdGroupResponse>(client, path, input.request);
  },

  /**
   * Get ad group through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getAdGroup.
   * @returns An Effect that succeeds with eBay's generated getAdGroup response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getAdGroup({ adGroupId: 'adGroup-1', campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/getAdGroup
   */
  getAdGroup: (input: GetAdGroupInput): Effect.Effect<GetAdGroupResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group/${input.adGroupId}`;
    return requestGetEffect<GetAdGroupResponse>(client, path);
  },

  /**
   * Update ad group through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for updateAdGroup.
   * @returns An Effect that succeeds with eBay's generated updateAdGroup response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.updateAdGroup({ adGroupId: 'adGroup-1', campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/updateAdGroup
   */
  updateAdGroup: (
    input: UpdateAdGroupInput,
  ): Effect.Effect<UpdateAdGroupResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group/${input.adGroupId}`;
    return requestPutEffect<UpdateAdGroupResponse>(client, path, input.request);
  },

  /**
   * Suggest bids through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for suggestBids.
   * @returns An Effect that succeeds with eBay's generated suggestBids response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.suggestBids({ adGroupId: 'adGroup-1', campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/suggestBids
   */
  suggestBids: (input: SuggestBidsInput): Effect.Effect<SuggestBidsResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group/${input.adGroupId}/suggest_bids`;
    return requestPostEffect<SuggestBidsResponse>(client, path, input.request);
  },

  /**
   * Suggest keywords through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for suggestKeywords.
   * @returns An Effect that succeeds with eBay's generated suggestKeywords response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.suggestKeywords({ adGroupId: 'adGroup-1', campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/ad_group/methods/suggestKeywords
   */
  suggestKeywords: (
    input: SuggestKeywordsInput,
  ): Effect.Effect<SuggestKeywordsResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/ad_group/${input.adGroupId}/suggest_keywords`;
    return requestPostEffect<SuggestKeywordsResponse>(client, path, input.request);
  },

  /**
   * Bulk create keyword through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkCreateKeyword.
   * @returns An Effect that succeeds with eBay's generated bulkCreateKeyword response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkCreateKeyword({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/bulkCreateKeyword
   */
  bulkCreateKeyword: (
    input: BulkCreateKeywordInput,
  ): Effect.Effect<BulkCreateKeywordResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_create_keyword`;
    return requestPostEffect<BulkCreateKeywordResponse>(client, path, input.request);
  },

  /**
   * Bulk update keyword through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkUpdateKeyword.
   * @returns An Effect that succeeds with eBay's generated bulkUpdateKeyword response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkUpdateKeyword({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/bulkUpdateKeyword
   */
  bulkUpdateKeyword: (
    input: BulkUpdateKeywordInput,
  ): Effect.Effect<BulkUpdateKeywordResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/bulk_update_keyword`;
    return requestPostEffect<BulkUpdateKeywordResponse>(client, path, input.request);
  },

  /**
   * Get keywords through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getKeywords.
   * @returns An Effect that succeeds with eBay's generated getKeywords response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getKeywords({ campaignId: 'campaign-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/getKeywords
   */
  getKeywords: (input: GetKeywordsInput): Effect.Effect<GetKeywordsResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/keyword`;
    const params = buildEndpointParams({
      adGroupIds: { wireName: 'ad_group_ids', value: input.adGroupIds },
      keywordStatus: { wireName: 'keyword_status', value: input.keywordStatus },
      limit: { wireName: 'limit', value: input.limit },
      offset: { wireName: 'offset', value: input.offset },
    });
    return requestGetEffect<GetKeywordsResponse>(client, path, params);
  },

  /**
   * Create keyword through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for createKeyword.
   * @returns An Effect that succeeds with eBay's generated createKeyword response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.createKeyword({ campaignId: 'campaign-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/createKeyword
   */
  createKeyword: (
    input: CreateKeywordInput,
  ): Effect.Effect<CreateKeywordResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/keyword`;
    return requestPostEffect<CreateKeywordResponse>(client, path, input.request);
  },

  /**
   * Get keyword through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getKeyword.
   * @returns An Effect that succeeds with eBay's generated getKeyword response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getKeyword({ campaignId: 'campaign-1', keywordId: 'keyword-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/getKeyword
   */
  getKeyword: (input: GetKeywordInput): Effect.Effect<GetKeywordResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/keyword/${input.keywordId}`;
    return requestGetEffect<GetKeywordResponse>(client, path);
  },

  /**
   * Update keyword through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for updateKeyword.
   * @returns An Effect that succeeds with eBay's generated updateKeyword response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.updateKeyword({ campaignId: 'campaign-1', keywordId: 'keyword-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/keyword/methods/updateKeyword
   */
  updateKeyword: (
    input: UpdateKeywordInput,
  ): Effect.Effect<UpdateKeywordResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/ad_campaign/${input.campaignId}/keyword/${input.keywordId}`;
    return requestPutEffect<UpdateKeywordResponse>(client, path, input.request);
  },

  /**
   * Bulk create negative keyword through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkCreateNegativeKeyword.
   * @returns An Effect that succeeds with eBay's generated bulkCreateNegativeKeyword response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkCreateNegativeKeyword({ request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/bulkCreateNegativeKeyword
   */
  bulkCreateNegativeKeyword: (
    input: BulkCreateNegativeKeywordInput,
  ): Effect.Effect<BulkCreateNegativeKeywordResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/bulk_create_negative_keyword`;
    return requestPostEffect<BulkCreateNegativeKeywordResponse>(client, path, input.request);
  },

  /**
   * Bulk update negative keyword through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for bulkUpdateNegativeKeyword.
   * @returns An Effect that succeeds with eBay's generated bulkUpdateNegativeKeyword response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.bulkUpdateNegativeKeyword({ request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/bulkUpdateNegativeKeyword
   */
  bulkUpdateNegativeKeyword: (
    input: BulkUpdateNegativeKeywordInput,
  ): Effect.Effect<BulkUpdateNegativeKeywordResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/bulk_update_negative_keyword`;
    return requestPostEffect<BulkUpdateNegativeKeywordResponse>(client, path, input.request);
  },

  /**
   * Get negative keywords through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getNegativeKeywords.
   * @returns An Effect that succeeds with eBay's generated getNegativeKeywords response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getNegativeKeywords());
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/getNegativeKeywords
   */
  getNegativeKeywords: (
    input: GetNegativeKeywordsInput = {},
  ): Effect.Effect<GetNegativeKeywordsResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/negative_keyword`;
    const params = buildEndpointParams({
      adGroupIds: { wireName: 'ad_group_ids', value: input.adGroupIds },
      campaignIds: { wireName: 'campaign_ids', value: input.campaignIds },
      limit: { wireName: 'limit', value: input.limit },
      negativeKeywordStatus: {
        wireName: 'negative_keyword_status',
        value: input.negativeKeywordStatus,
      },
      offset: { wireName: 'offset', value: input.offset },
    });
    return requestGetEffect<GetNegativeKeywordsResponse>(client, path, params);
  },

  /**
   * Create negative keyword through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for createNegativeKeyword.
   * @returns An Effect that succeeds with eBay's generated createNegativeKeyword response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.createNegativeKeyword({ request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/createNegativeKeyword
   */
  createNegativeKeyword: (
    input: CreateNegativeKeywordInput,
  ): Effect.Effect<CreateNegativeKeywordResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/negative_keyword`;
    return requestPostEffect<CreateNegativeKeywordResponse>(client, path, input.request);
  },

  /**
   * Get negative keyword through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for getNegativeKeyword.
   * @returns An Effect that succeeds with eBay's generated getNegativeKeyword response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.getNegativeKeyword({ negativeKeywordId: 'negativeKeyword-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/getNegativeKeyword
   */
  getNegativeKeyword: (
    input: GetNegativeKeywordInput,
  ): Effect.Effect<GetNegativeKeywordResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/negative_keyword/${input.negativeKeywordId}`;
    return requestGetEffect<GetNegativeKeywordResponse>(client, path);
  },

  /**
   * Update negative keyword through the eBay Marketing API.
   *
   * @param input - Path, query, header, and request body values for updateNegativeKeyword.
   * @returns An Effect that succeeds with eBay's generated updateNegativeKeyword response DTO.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(marketingApi.updateNegativeKeyword({ negativeKeywordId: 'negativeKeyword-1', request: { ... } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/marketing/resources/negative_keyword/methods/updateNegativeKeyword
   */
  updateNegativeKeyword: (
    input: UpdateNegativeKeywordInput,
  ): Effect.Effect<UpdateNegativeKeywordResponse, EbayApiError> => {
    const path = `${MARKETING_BASE_PATH}/negative_keyword/${input.negativeKeywordId}`;
    return requestPutEffect<UpdateNegativeKeywordResponse>(client, path, input.request);
  },
});
