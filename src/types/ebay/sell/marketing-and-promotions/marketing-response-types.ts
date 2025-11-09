import type {
  CampaignBudgetRequest,
  FundingStrategy,
  ItemPromotion,
} from './marketing-api-types.js';
import type { Alert } from '../../global/global-ebay-types.js';

/**
 * Error container
 */
export interface Error {
  /**
   * The category of the error
   */
  category?: string;
  /**
   * The domain of the error
   */
  domain?: string;
  /**
   * The error ID
   */
  errorId?: number;
  /**
   * Input parameters related to the error
   */
  inputRefIds?: string[];
  /**
   * The long message describing the error
   */
  longMessage?: string;
  /**
   * The short message describing the error
   */
  message?: string;
  /**
   * Output reference IDs
   */
  outputRefIds?: string[];
  /**
   * Parameters associated with the error
   */
  parameters?: ErrorParameter[];
  /**
   * The subdomain of the error
   */
  subdomain?: string;
}

/**
 * Error parameter
 */
export interface ErrorParameter {
  /**
   * The name of the parameter
   */
  name?: string;
  /**
   * The value of the parameter
   */
  value?: string;
}

/**
 * Base response with warnings
 */
export interface BaseResponse {
  /**
   * Warning error messages (non-fatal)
   */
  warnings?: Error[];
}

/**
 * Campaign alert
 */
export interface Alert {
  /**
   * Alert message
   */
  alertMessage?: string;
  /**
   * Alert severity (INFO, WARNING, ERROR)
   */
  alertSeverity?: string;
}

/**
 * Campaign entity
 */
export interface Campaign {
  /**
   * Alerts associated with the campaign
   */
  alerts?: Alert[];
  /**
   * Budget allocated for the campaign
   */
  budget?: CampaignBudgetRequest;
  /**
   * Campaign selection criterion
   */
  campaignCriterion?: CampaignCriterion;
  /**
   * Unique identifier of the campaign
   */
  campaignId?: string;
  /**
   * Seller-defined name of the campaign
   */
  campaignName?: string;
  /**
   * Campaign status (RUNNING, PAUSED, ENDED, etc.)
   */
  campaignStatus?: string;
  /**
   * Targeting type (MANUAL or SMART)
   */
  campaignTargetingType?: string;
  /**
   * Channels where the campaign runs (ON_SITE, OFF_SITE)
   */
  channels?: string[];
  /**
   * Campaign end date (ISO 8601 format)
   */
  endDate?: string;
  /**
   * Funding strategy for the campaign
   */
  fundingStrategy?: FundingStrategy;
  /**
   * Marketplace ID where the campaign is hosted
   */
  marketplaceId?: string;
  /**
   * Campaign start date (ISO 8601 format)
   */
  startDate?: string;
}

/**
 * Paged collection of campaigns
 */
export interface CampaignPagedCollectionResponse {
  /**
   * Array of campaigns
   */
  campaigns?: Campaign[];
  /**
   * URI of the current page
   */
  href?: string;
  /**
   * Maximum number of campaigns per page
   */
  limit?: number;
  /**
   * URI to the next page
   */
  next?: string;
  /**
   * Number of results skipped
   */
  offset?: number;
  /**
   * URI to the previous page
   */
  prev?: string;
  /**
   * Total number of campaigns
   */
  total?: number;
}

/**
 * Item promotion response (extends ItemPromotion)
 */
export interface ItemPromotionResponse extends ItemPromotion {
  /**
   * Unique identifier of the promotion
   */
  promotionId?: string;
  /**
   * Promotion href
   */
  promotionHref?: string;
}

/**
 * Paged collection of item promotions
 */
export interface ItemPromotionsPagedCollection {
  /**
   * Array of item promotions
   */
  itemPromotions?: ItemPromotionResponse[];
  /**
   * URI of the current page
   */
  href?: string;
  /**
   * Maximum number of promotions per page
   */
  limit?: number;
  /**
   * URI to the next page
   */
  next?: string;
  /**
   * Number of results skipped
   */
  offset?: number;
  /**
   * URI to the previous page
   */
  prev?: string;
  /**
   * Total number of promotions
   */
  total?: number;
}

/**
 * Ad entity
 */
export interface Ad {
  /**
   * A unique eBay-assigned ID for an ad group in a campaign that uses the Cost Per Click (CPC) funding model.
   */
  adGroupId?: string;
  /**
   * A unique eBay-assigned ID that is generated when the ad is created.
   */
  adId?: string;
  /**
   * The current status of the CPC ad.
   */
  adStatus?: string;
  /**
   * An array containing alert messages for the ad.
   */
  alerts?: Alert[];
  /**
   * The user-defined bid percentage (also known as the ad rate) sets the level that eBay increases the visibility in search results for the associated listing.
   */
  bidPercentage?: string;
  /**
   * An ID that identifies a single-item listing or multiple-variation listing that is managed with the Inventory API.
   */
  inventoryReferenceId?: string;
  /**
   * The enumeration value returned here indicates the type of listing the inventoryReferenceId references.
   */
  inventoryReferenceType?: string;
  /**
   * A unique eBay-assigned ID that is generated when a listing is created.
   */
  listingId?: string;
}

/**
 * Paged collection of ads
 */
export interface AdPagedCollectionResponse {
  /**
   * The list of ads that matched the request criteria.
   */
  ads?: Ad[];
  /**
   * The URI of the current page of results from the result set.
   */
  href?: string;
  /**
   * The number of items returned on a single page from the result set.
   */
  limit?: number;
  /**
   * The call URI that can be used to retrieve the next page in the result set.
   */
  next?: string;
  /**
   * The number of results skipped in the result set before listing the first result on the current page.
   */
  offset?: number;
  /**
   * The call URI that can be used to retrieve the previous page in the result set.
   */
  prev?: string;
  /**
   * The total number of items retrieved in the result set.
   */
  total?: number;
}

/**
 * This type defines the fields for an ad ID and its associated URL.
 */
export interface AdReference {
  /**
   * A unique eBay-assigned ID for an ad. This ID is generated when an ad is created.
   */
  adId?: string;
  /**
   * The getAd URI of an ad. You can use this URI to retrieve the ad.
   */
  href?: string;
}

/**
 * This type is a container for a list of ad IDs and their associated URIs.
 */
export interface AdReferences {
  /**
   * A list of ad IDs. An ad ID is generated for each successfully created ad. Only one ad can be created per operation.
   */
  ads?: AdReference[];
}

/**
 * This type defines the container for an array of ads.
 */
export interface Ads {
  /**
   * A list of ad IDs. An ad ID is generated for each successfully created ad.
   */
  ads?: Ad[];
}
