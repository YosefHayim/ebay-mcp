import { z } from "zod";
import { selectionRuleSchema } from "./campaignsSchemas.js";
import {
	amountSchema,
	errorSchema,
	marketingInventoryItemSchema,
} from "./marketingCommonSchemas.js";

// ============================================================================
// Item Promotion (Discounts) Schemas
// ============================================================================

export const discountBenefitSchema = z.object({
	amountOffItem: amountSchema.optional(),
	amountOffOrder: amountSchema.optional(),
	percentageOffItem: z.string().optional(),
	percentageOffOrder: z.string().optional(),
});

export const priceRangeSchema = z.object({
	maxPrice: amountSchema.optional(),
	minPrice: amountSchema.optional(),
});

export const discountSpecificationSchema = z.object({
	forEachAmount: amountSchema.optional(),
	forEachQuantity: z.number().optional(),
	minAmount: amountSchema.optional(),
	minQuantity: z.number().optional(),
	numberOfDiscountedItems: z.number().optional(),
});

export const discountRuleSchema = z.object({
	discountBenefit: discountBenefitSchema.optional(),
	discountSpecification: discountSpecificationSchema.optional(),
	ruleOrder: z.number().optional(),
});

export const inventoryCriterionSchema = z.object({
	inventoryCriterionType: z.string().optional(),
	inventoryItems: z.array(marketingInventoryItemSchema).optional(),
	listingIds: z.array(z.string()).optional(),
	ruleCriteria: z
		.object({
			excludeInventoryItems: z.array(marketingInventoryItemSchema).optional(),
			excludeListingIds: z.array(z.string()).optional(),
			markupInventoryItems: z.array(marketingInventoryItemSchema).optional(),
			markupListingIds: z.array(z.string()).optional(),
			selectionRules: z.array(selectionRuleSchema).optional(),
		})
		.optional(),
});

export const couponConfigurationSchema = z.object({
	couponCode: z.string().optional(),
	couponType: z.string().optional(),
	maxCouponRedemptionPerUser: z.number().optional(),
});

export const itemPromotionSchema = z.object({
	applyDiscountToSingleItemOnly: z.boolean().optional(),
	budget: amountSchema.optional(),
	couponConfiguration: couponConfigurationSchema.optional(),
	description: z.string().optional(),
	discountRules: z.array(discountRuleSchema).optional(),
	endDate: z.string().optional(),
	inventoryCriterion: inventoryCriterionSchema.optional(),
	marketplaceId: z.string().optional(),
	name: z.string().optional(),
	priority: z.string().optional(),
	promotionImageUrl: z.string().optional(),
	promotionStatus: z.string().optional(),
	promotionType: z.string().optional(),
	startDate: z.string().optional(),
});

export const itemPromotionResponseSchema = z.object({
	applyDiscountToSingleItemOnly: z.boolean().optional(),
	budget: amountSchema.optional(),
	couponConfiguration: couponConfigurationSchema.optional(),
	description: z.string().optional(),
	discountRules: z.array(discountRuleSchema).optional(),
	endDate: z.string().optional(),
	inventoryCriterion: inventoryCriterionSchema.optional(),
	marketplaceId: z.string().optional(),
	name: z.string().optional(),
	priority: z.string().optional(),
	promotionId: z.string().optional(),
	promotionImageUrl: z.string().optional(),
	promotionStatus: z.string().optional(),
	promotionType: z.string().optional(),
	startDate: z.string().optional(),
});

export const selectedInventoryDiscountSchema = z.object({
	discountBenefit: discountBenefitSchema.optional(),
	discountId: z.string().optional(),
	inventoryCriterion: inventoryCriterionSchema.optional(),
	ruleOrder: z.number().optional(),
});

export const itemMarkdownStatusSchema = z.object({
	listingPromotionStatus: z.string().optional(),
	timestamp: z.string().optional(),
});

export const listingDetailSchema = z.object({
	currentPrice: amountSchema.optional(),
	freeShipping: z.boolean().optional(),
	inventoryReferenceId: z.string().optional(),
	inventoryReferenceType: z.string().optional(),
	listingCategoryId: z.string().optional(),
	listingCondition: z.string().optional(),
	listingConditionId: z.string().optional(),
	listingId: z.string().optional(),
	listingPromotionStatuses: z.array(itemMarkdownStatusSchema).optional(),
	quantity: z.number().optional(),
	storeCategoryId: z.string().optional(),
	title: z.string().optional(),
});

export const itemsPagedCollectionSchema = z.object({
	href: z.string().optional(),
	limit: z.number().optional(),
	listings: z.array(listingDetailSchema).optional(),
	next: z.string().optional(),
	offset: z.number().optional(),
	prev: z.string().optional(),
	total: z.number().optional(),
	warnings: z.array(errorSchema).optional(),
});

export const promotionsPagedCollectionSchema = z.object({
	href: z.string().optional(),
	limit: z.number().optional(),
	next: z.string().optional(),
	offset: z.number().optional(),
	prev: z.string().optional(),
	promotions: z.array(itemPromotionResponseSchema).optional(),
	total: z.number().optional(),
});

export const promotionDetailSchema = z.object({
	description: z.string().optional(),
	endDate: z.string().optional(),
	marketplaceId: z.string().optional(),
	name: z.string().optional(),
	priority: z.string().optional(),
	promotionId: z.string().optional(),
	promotionImageUrl: z.string().optional(),
	promotionStatus: z.string().optional(),
	promotionType: z.string().optional(),
	startDate: z.string().optional(),
});

export const promotionReportDetailSchema = z.object({
	averageItemDiscount: amountSchema.optional(),
	averageItemRevenue: amountSchema.optional(),
	averageOrderDiscount: amountSchema.optional(),
	averageOrderRevenue: amountSchema.optional(),
	averageOrderSize: z.string().optional(),
	baseSale: amountSchema.optional(),
	clicksToPromotion: z.number().optional(),
	impressionsToPromotion: z.number().optional(),
	numberOfItemsSoldInPromotion: z.number().optional(),
	numberOfOrdersWithPromotion: z.number().optional(),
	percentageSalesLift: z.string().optional(),
	promotionHref: z.string().optional(),
	promotionId: z.string().optional(),
	promotionReportId: z.string().optional(),
	promotionSale: amountSchema.optional(),
	totalDiscount: amountSchema.optional(),
	totalSale: amountSchema.optional(),
});

export const promotionsReportPagedCollectionSchema = z.object({
	href: z.string().optional(),
	limit: z.number().optional(),
	next: z.string().optional(),
	offset: z.number().optional(),
	prev: z.string().optional(),
	promotionReports: z.array(promotionReportDetailSchema).optional(),
	total: z.number().optional(),
});

// Item Price Markdown Schemas
export const itemBasisSchema = z.object({
	itemIds: z.array(z.string()).optional(),
	priceRange: priceRangeSchema.optional(),
});

export const itemPriceMarkdownSchema = z.object({
	applyFreeShipping: z.boolean().optional(),
	autoSelectFutureInventory: z.boolean().optional(),
	blockPriceIncreaseInItemRevision: z.boolean().optional(),
	description: z.string().optional(),
	endDate: z.string().optional(),
	marketplaceId: z.string().optional(),
	name: z.string().optional(),
	priority: z.string().optional(),
	promotionImageUrl: z.string().optional(),
	promotionStatus: z.string().optional(),
	selectedInventoryDiscounts: z
		.array(selectedInventoryDiscountSchema)
		.optional(),
	startDate: z.string().optional(),
});

// ============================================================================
// Email Campaign Schemas
// ============================================================================

export const campaignAudienceSchema = z.object({
	audienceType: z.string().optional(),
	code: z.string().optional(),
	name: z.string().optional(),
});

export const campaignDTOSchema = z.object({
	audiences: z.array(campaignAudienceSchema).optional(),
	creationDate: z.string().optional(),
	emailCampaignId: z.string().optional(),
	emailCampaignStatus: z.string().optional(),
	emailCampaignType: z.string().optional(),
	marketplaceId: z.string().optional(),
	modificationDate: z.string().optional(),
	scheduleDate: z.string().optional(),
	scheduleDateType: z.string().optional(),
	sentDate: z.string().optional(),
	subject: z.string().optional(),
});

export const createEmailCampaignRequestSchema = z.object({
	audiences: z.array(campaignAudienceSchema).optional(),
	emailCampaignType: z.string(),
	itemIds: z.array(z.string()).optional(),
	marketplaceId: z.string(),
	scheduleDate: z.string().optional(),
	scheduleDateType: z.string().optional(),
	subject: z.string().optional(),
});

export const createEmailCampaignResponseSchema = z.object({
	emailCampaignId: z.string().optional(),
	href: z.string().optional(),
});

export const updateEmailCampaignResponseSchema = z.object({
	emailCampaignId: z.string().optional(),
	href: z.string().optional(),
});

export const deleteEmailCampaignResponseSchema = z.object({
	emailCampaignId: z.string().optional(),
});

export const getEmailCampaignResponseSchema = z.object({
	emailCampaign: campaignDTOSchema.optional(),
});

export const getEmailCampaignsResponseSchema = z.object({
	emailCampaigns: z.array(campaignDTOSchema).optional(),
	href: z.string().optional(),
	limit: z.number().optional(),
	next: z.string().optional(),
	offset: z.number().optional(),
	prev: z.string().optional(),
	total: z.number().optional(),
});

export const getEmailCampaignAudiencesResponseSchema = z.object({
	audiences: z.array(campaignAudienceSchema).optional(),
	href: z.string().optional(),
	limit: z.number().optional(),
	next: z.string().optional(),
	offset: z.number().optional(),
	prev: z.string().optional(),
	total: z.number().optional(),
});

export const getEmailPreviewResponseSchema = z.object({
	emailPreviewHtml: z.string().optional(),
});

export const getEmailReportResponseSchema = z.object({
	clickRate: z.string().optional(),
	numberOfClicks: z.number().optional(),
	numberOfOpens: z.number().optional(),
	numberOfRecipients: z.number().optional(),
	numberOfUnsubscribes: z.number().optional(),
	openRate: z.string().optional(),
	unsubscribeRate: z.string().optional(),
});

// ============================================================================
// Email Campaign Request Schemas
// ============================================================================

export const updateEmailCampaignRequestSchema = z.object({
	audienceCodes: z.array(z.string()).optional(),
	categoryId: z.string().optional(),
	categoryType: z.string().optional(),
	itemIds: z.array(z.string()).optional(),
	itemSelectMode: z.string().optional(),
	personalizedMessage: z.string().optional(),
	priceRange: priceRangeSchema.optional(),
	promotionId: z.string().optional(),
	promotionSelectModeEnum: z.string().optional(),
	scheduleDate: z.string().optional(),
	sort: z.string().optional(),
	subject: z.string().optional(),
});

export const createItemPriceMarkdownPromotionInputSchema = z.object({
	request: itemPriceMarkdownSchema.describe(
		"Create item price markdown promotion request body",
	),
});

export const getItemPriceMarkdownPromotionInputSchema = z.object({
	promotionId: z.string().describe("promotionId required endpoint parameter"),
});

export const updateItemPriceMarkdownPromotionInputSchema = z.object({
	promotionId: z.string().describe("promotionId required endpoint parameter"),
	request: itemPriceMarkdownSchema.describe(
		"Update item price markdown promotion request body",
	),
});

export const deleteItemPriceMarkdownPromotionInputSchema = z.object({
	promotionId: z.string().describe("promotionId required endpoint parameter"),
});

export const createItemPromotionInputSchema = z.object({
	request: itemPromotionSchema.describe("Create item promotion request body"),
});

export const getItemPromotionInputSchema = z.object({
	promotionId: z.string().describe("promotionId required endpoint parameter"),
});

export const updateItemPromotionInputSchema = z.object({
	promotionId: z.string().describe("promotionId required endpoint parameter"),
	request: itemPromotionSchema.describe("Update item promotion request body"),
});

export const deleteItemPromotionInputSchema = z.object({
	promotionId: z.string().describe("promotionId required endpoint parameter"),
});

export const getListingSetInputSchema = z.object({
	promotionId: z.string().describe("promotionId required endpoint parameter"),
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
	q: z.string().describe("q optional endpoint parameter").optional(),
	sort: z.string().describe("sort optional endpoint parameter").optional(),
	status: z.string().describe("status optional endpoint parameter").optional(),
});

export const getPromotionsInputSchema = z.object({
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	marketplaceId: z
		.string()
		.describe("marketplaceId required endpoint parameter"),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
	promotionStatus: z
		.string()
		.describe("promotionStatus optional endpoint parameter")
		.optional(),
	promotionType: z
		.string()
		.describe("promotionType optional endpoint parameter")
		.optional(),
	q: z.string().describe("q optional endpoint parameter").optional(),
	sort: z.string().describe("sort optional endpoint parameter").optional(),
});

export const pausePromotionInputSchema = z.object({
	promotionId: z.string().describe("promotionId required endpoint parameter"),
});

export const resumePromotionInputSchema = z.object({
	promotionId: z.string().describe("promotionId required endpoint parameter"),
});

export const getPromotionReportsInputSchema = z.object({
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	marketplaceId: z
		.string()
		.describe("marketplaceId required endpoint parameter"),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
	promotionStatus: z
		.string()
		.describe("promotionStatus optional endpoint parameter")
		.optional(),
	promotionType: z
		.string()
		.describe("promotionType optional endpoint parameter")
		.optional(),
	q: z.string().describe("q optional endpoint parameter").optional(),
});

export const getPromotionSummaryReportInputSchema = z.object({
	marketplaceId: z
		.string()
		.describe("marketplaceId required endpoint parameter"),
});

export const getEmailCampaignsInputSchema = z.object({
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
	q: z.string().describe("q optional endpoint parameter").optional(),
	sort: z.string().describe("sort optional endpoint parameter").optional(),
});

export const createEmailCampaignInputSchema = z.object({
	marketplaceId: z
		.string()
		.describe("Marketplace ID sent as X-EBAY-C-MARKETPLACE-ID"),
	request: createEmailCampaignRequestSchema.describe(
		"Create email campaign request body",
	),
});

export const getEmailCampaignInputSchema = z.object({
	emailCampaignId: z
		.string()
		.describe("emailCampaignId required endpoint parameter"),
});

export const updateEmailCampaignInputSchema = z.object({
	emailCampaignId: z
		.string()
		.describe("emailCampaignId required endpoint parameter"),
	request: updateEmailCampaignRequestSchema.describe(
		"Update email campaign request body",
	),
});

export const deleteEmailCampaignInputSchema = z.object({
	emailCampaignId: z
		.string()
		.describe("emailCampaignId required endpoint parameter"),
});

export const getAudiencesInputSchema = z.object({
	emailCampaignType: z
		.string()
		.describe("emailCampaignType required endpoint parameter"),
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
});

export const getEmailPreviewInputSchema = z.object({
	emailCampaignId: z
		.string()
		.describe("emailCampaignId required endpoint parameter"),
});

export const getEmailReportInputSchema = z.object({
	endDate: z.string().describe("endDate required endpoint parameter"),
	startDate: z.string().describe("startDate required endpoint parameter"),
});
