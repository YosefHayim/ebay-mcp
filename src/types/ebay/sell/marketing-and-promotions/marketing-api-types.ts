/**
 * eBay Marketing API Type Definitions
 * Based on: docs/sell-apps/marketing-and-promotions/sell_marketing_v1_oas3.json
 */

/**
 * Monetary amount type
 */
export interface Amount {
  /**
   * A three-letter ISO 4217 code that indicates the currency of the amount
   */
  currency?: string;
  /**
   * The monetary amount
   */
  value?: string;
}

/**
 * The allocated daily budget for the Cost Per Click (CPC) Promoted Listings campaign.
 */
export interface CampaignBudgetRequest {
  /**
   * The budget amount for the campaign
   */
  amount?: Amount;
  /**
   * The type of budget (e.g., DAILY)
   */
  budgetType?: string;
}

/**
 * Campaign criterion for rules-based campaign
 */
export interface CampaignCriterion {
  /**
   * An array of listing criteria
   */
  selectionRules?: unknown[];
}

/**
 * Funding strategy for the campaign
 */
export interface FundingStrategy {
  /**
   * The funding model for the campaign (e.g., COST_PER_SALE, COST_PER_CLICK)
   */
  fundingModel?: string;
  /**
   * The bid percentage for CPS campaigns
   */
  bidPercentage?: string;
}

/**
 * This type defines the fields needed to create a campaign.
 */
export interface CreateCampaignRequest {
  /**
   * The allocated daily budget for the Cost Per Click (CPC) Promoted Listings campaign.
   * Required if the campaign funding model is CPC.
   */
  budget?: CampaignBudgetRequest;
  /**
   * This container is used if the seller wishes to create one or more rules for a rules-based campaign.
   */
  campaignCriterion?: CampaignCriterion;
  /**
   * A seller-defined name for the campaign. This value must be unique for the seller.
   * Max length: 80 characters
   */
  campaignName?: string;
  /**
   * The targeting type of the campaign (MANUAL or SMART).
   * Default: MANUAL
   */
  campaignTargetingType?: string;
  /**
   * The channel for the campaign (ON_SITE or OFF_SITE).
   * Default: ON_SITE
   */
  channels?: string[];
  /**
   * The date and time the campaign ends, in UTC format (yyyy-MM-ddThh:mm:ssZ).
   */
  endDate?: string;
  /**
   * This container includes parameters that define an ad campaign funding strategy.
   */
  fundingStrategy?: FundingStrategy;
  /**
   * The ID of the eBay marketplace where the campaign is hosted.
   */
  marketplaceId?: string;
  /**
   * The date and time the campaign starts, in UTC format (yyyy-MM-ddThh:mm:ssZ).
   */
  startDate?: string;
}

/**
 * Coupon configuration for coded coupon promotions
 */
export interface CouponConfiguration {
  /**
   * The coupon code
   */
  couponCode?: string;
  /**
   * The type of coupon (PUBLIC or PRIVATE)
   */
  couponType?: string;
  /**
   * Maximum number of uses per buyer
   */
  maxCouponRedemptionPerUser?: number;
}

/**
 * Inventory criterion for selecting items
 */
export interface InventoryCriterion {
  /**
   * An array of inventory items
   */
  inventoryItems?: unknown[];
  /**
   * Selection rules for inventory
   */
  selectionRules?: unknown[];
}

/**
 * Discount rule defining the discount benefit and specification
 */
export interface DiscountRule {
  /**
   * Defines the discount amount or percentage
   */
  discountBenefit?: unknown;
  /**
   * Defines the rules for when the discount applies
   */
  discountSpecification?: unknown;
  /**
   * The order in which the rule is applied (relevant for volume pricing)
   */
  ruleOrder?: number;
}

/**
 * This type defines the fields that describe a threshold discount (item promotion).
 */
export interface ItemPromotion {
  /**
   * For VOLUME_DISCOUNT: if true, discount applies only when buying multiple quantities of a single item.
   */
  applyDiscountToSingleItemOnly?: boolean;
  /**
   * Budget for CODED_COUPON discount type (range: 100-1000000).
   */
  budget?: Amount;
  /**
   * The configuration of a coded coupon discount.
   */
  couponConfiguration?: CouponConfiguration;
  /**
   * Seller-defined tag line for the offer (max 50 characters).
   * Required for CODED_COUPON, ORDER_DISCOUNT, or MARKDOWN_SALE.
   */
  description?: string;
  /**
   * Defines the discount rules (minimum 2, maximum 4 for volume pricing).
   */
  discountRules?: DiscountRule[];
  /**
   * The date and time the discount ends in UTC format (yyyy-MM-ddThh:mm:ssZ).
   */
  endDate?: string;
  /**
   * Defines the items to be discounted using listing IDs or selection rules.
   */
  inventoryCriterion?: InventoryCriterion;
  /**
   * The eBay marketplace ID where the discount is hosted.
   */
  marketplaceId?: string;
  /**
   * Seller-defined name/title of the discount (max 90 characters).
   */
  name?: string;
  /**
   * Priority for ORDER_DISCOUNT promotions.
   */
  priority?: string;
  /**
   * URL pointing to promotion image (JPEG or PNG, minimum 500x500px, max 12MB).
   * Required for CODED_COUPON, MARKDOWN_SALE, and ORDER_DISCOUNT.
   */
  promotionImageUrl?: string;
  /**
   * Current status of the discount (DRAFT, SCHEDULED, RUNNING, PAUSED, ENDED).
   */
  promotionStatus?: string;
  /**
   * Type of discount: CODED_COUPON, MARKDOWN_SALE, ORDER_DISCOUNT, or VOLUME_DISCOUNT.
   */
  promotionType?: string;
  /**
   * The date and time the discount starts in UTC format (yyyy-MM-ddThh:mm:ssZ).
   */
  startDate?: string;
}

/**
 * This type defines the fields for the create ad request.
 */
export interface CreateAdRequest {
  /**
   * A unique eBay-assigned identifier for an ad group in a campaign that uses the Cost Per Click (CPC) funding model.
   */
  adGroupId?: string;
  /**
   * The user-defined bid percentage (also known as the ad rate) sets the level that eBay increases the visibility in search results for the associated listing.
   */
  bidPercentage?: string;
  /**
   * A unique identifier of an eBay listing.
   */
  listingId?: string;
}

/**
 * This type defines the fields needed to create ads by inventory reference ID request.
 */
export interface CreateAdsByInventoryReferenceRequest {
  /**
   * A unique eBay-assigned identifier for an ad group in a campaign that uses the Cost Per Click (CPC) funding model.
   */
  adGroupId?: string;
  /**
   * The user-defined bid percentage (also known as the ad rate) sets the level that eBay increases the visibility in search results for the associated listing.
   */
  bidPercentage?: string;
  /**
   * The unique identifier of a single-item listing or a multi-variation listing.
   */
  inventoryReferenceId?: string;
  /**
   * This enumerated value indicates the type of item the inventoryReferenceId references.
   */
  inventoryReferenceType?: string;
}

/**
 * This type defines the fields for the clone ad request.
 */
export interface CloneAdRequest {
  /**
   * The user-defined bid percentage (also known as the ad rate) sets the level that eBay increases the visibility in search results for the associated listing.
   */
  bidPercentage?: string;
}

/**
 * This type specifies the bid percentage for an ad campaign.
 */
export interface UpdateBidPercentageRequest {
  /**
   * The updated bid percentage value for the specified ad in the specified campaign.
   */
  bidPercentage?: string;
}

/**
 * This type defines the fields needed for a clone-campaign request.
 */
export interface CloneCampaignRequest {
  /**
   * A seller-defined name for the newly-cloned campaign.
   */
  campaignName?: string;
  /**
   * The date and time the campaign ends, in UTC format (yyyy-MM-ddThh:mm:ssZ).
   */
  endDate?: string;
  /**
   * This container includes parameters that define an ad campaign funding strategy.
   */
  fundingStrategy?: FundingStrategy;
  /**
   * The date and time the cloned campaign starts, in UTC format (yyyy-MM-ddThh:mm:ssZ).
   */
  startDate?: string;
}

/**
 * This type specifies the bid percentage for an ad campaign.
 */
export interface UpdateBidPercentageRequest {
  /**
   * The updated bid percentage value for the specified ad in the specified campaign.
   */
  bidPercentage?: string;
}
