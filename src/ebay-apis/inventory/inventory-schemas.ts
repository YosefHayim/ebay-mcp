import { z } from 'zod';
import {
  Condition,
  LengthUnit,
  WeightUnit,
  PricingVisibility,
  FormatType,
  ListingDuration,
  MarketplaceId,
} from '@/shared/ebay-enums.js';

const amountSchema = z.object({
  currency: z.string(),
  value: z.string(),
});

// ============================================================================
// Inventory Item Schemas
// ============================================================================

const availabilitySchema = z.object({
  shipToLocationAvailability: z
    .object({
      quantity: z.number().optional(),
      availabilityDistributions: z
        .array(
          z.object({
            fulfillmentTime: z
              .object({
                unit: z.string().optional(),
                value: z.number().optional(),
              })
              .optional(),
            merchantLocationKey: z.string().optional(),
            quantity: z.number().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

const productSchema = z.object({
  title: z.string().max(80).optional(),
  aspects: z.record(z.array(z.string())).optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  mpn: z.string().optional(),
  ean: z.array(z.string()).optional(),
  isbn: z.array(z.string()).optional(),
  upc: z.array(z.string()).optional(),
  epid: z.string().optional(),
  subtitle: z.string().optional(),
  videoIds: z.array(z.string()).optional(),
});

const dimensionsSchema = z.object({
  height: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  unit: z.nativeEnum(LengthUnit).optional(),
});

const weightSchema = z.object({
  value: z.number().optional(),
  unit: z.nativeEnum(WeightUnit).optional(),
});

const packageWeightAndSizeSchema = z.object({
  dimensions: dimensionsSchema.optional(),
  packageType: z.string().optional(),
  weight: weightSchema.optional(),
});

/**
 * Validates the Inventory Management API inventory item model.
 */
export const inventoryItemSchema = z.object({
  availability: availabilitySchema.optional(),
  condition: z.nativeEnum(Condition).optional(),
  conditionDescription: z.string().optional(),
  conditionDescriptors: z
    .array(
      z.object({
        name: z.string().optional(),
        values: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  packageWeightAndSize: packageWeightAndSizeSchema.optional(),
  product: productSchema.optional(),
  locale: z.string().optional(),
});

// ============================================================================
// Offer Schemas
// ============================================================================

const listingPoliciesSchema = z
  .object({
    fulfillmentPolicyId: z.string().optional(),
    paymentPolicyId: z.string().optional(),
    returnPolicyId: z.string().optional(),
    productCompliancePolicyIds: z.array(z.string()).optional(),
    takeBackPolicyIds: z.array(z.string()).optional(),
    eBayPlusIfEligible: z
      .boolean()
      .optional()
      .describe('FIXED_PRICE offers only; not applicable to auctions'),
    bestOfferTerms: z
      .object({
        autoAcceptPrice: amountSchema.optional(),
        autoDeclinePrice: amountSchema.optional(),
        bestOfferEnabled: z
          .boolean()
          .optional()
          .describe(
            'Enable Best Offer where the category allows it. On AUCTION offers it cannot be combined with a Buy It Now price (pricingSummary.price)',
          ),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

/**
 * Validates the Inventory Management API offer pricing container for both listing formats.
 */
const pricingSchema = z
  .object({
    price: amountSchema
      .optional()
      .describe(
        'Listing price for FIXED_PRICE offers (required before publish). For AUCTION offers this is the optional Buy It Now price, at least 30% above auctionStartPrice and not combinable with Best Offer',
      ),
    auctionStartPrice: amountSchema
      .optional()
      .describe(
        'Opening bid for AUCTION offers (required before publish); not allowed on FIXED_PRICE offers',
      ),
    auctionReservePrice: amountSchema
      .optional()
      .describe(
        'Optional AUCTION reserve; must be higher than auctionStartPrice and eBay charges a reserve fee whether or not the item sells',
      ),
    pricingVisibility: z.nativeEnum(PricingVisibility).optional(),
    minimumAdvertisedPrice: amountSchema.optional(),
    originalRetailPrice: amountSchema.optional(),
  })
  .passthrough();

const taxSchema = z
  .object({
    applyTax: z.boolean().optional(),
    thirdPartyTaxCategory: z.string().optional(),
    vatPercentage: z.number().optional(),
  })
  .passthrough();

/** Offer fields shared by create, update, and response payloads (everything except the keys). */
const offerDetailsFields = {
  availableQuantity: z
    .number()
    .optional()
    .describe(
      'Purchasable quantity. FIXED_PRICE offers take any quantity; AUCTION offers list a single unit, so omit it or set it to 1',
    ),
  categoryId: z.string().optional(),
  charity: z
    .object({
      charityId: z.string().optional(),
      donationPercentage: z.string().optional(),
    })
    .optional(),
  extendedProducerResponsibility: z
    .object({
      producerProductId: z.string().optional(),
      productPackageId: z.string().optional(),
      shipmentPackageId: z.string().optional(),
      productDocumentationId: z.string().optional(),
    })
    .optional(),
  hideBuyerDetails: z.boolean().optional(),
  includeCatalogProductDetails: z.boolean().optional(),
  listingDescription: z.string().optional(),
  listingDuration: z
    .nativeEnum(ListingDuration)
    .optional()
    .describe(
      'FIXED_PRICE offers use GTC. AUCTION offers need a day count (DAYS_1, DAYS_3, DAYS_5, DAYS_7, or DAYS_10 everywhere; DAYS_14, DAYS_21, and DAYS_30 only where ebay_get_listing_type_policies lists them for the category) and never GTC',
    ),
  listingPolicies: listingPoliciesSchema.optional(),
  listingStartDate: z
    .string()
    .optional()
    .describe(
      'Schedules the listing to go live later (ISO 8601 UTC). Only set it when the user explicitly asked for a scheduled start — eBay may charge a scheduling fee; never add it on your own',
    ),
  lotSize: z.number().optional(),
  merchantLocationKey: z.string().optional(),
  pricingSummary: pricingSchema.optional(),
  quantityLimitPerBuyer: z
    .number()
    .optional()
    .describe('Per-buyer purchase cap for FIXED_PRICE offers; not applicable to auctions'),
  secondaryCategoryId: z.string().optional(),
  storeCategoryNames: z.array(z.string()).optional(),
  tax: taxSchema.optional(),
};

/** Keys that identify an offer on create and cannot change on update. */
const offerKeyFields = {
  sku: z.string(),
  marketplaceId: z.nativeEnum(MarketplaceId),
  format: z
    .nativeEnum(FormatType)
    .describe(
      'FIXED_PRICE (price + GTC) or AUCTION (auctionStartPrice + day-count listingDuration; availableQuantity omitted or 1)',
    ),
};

/**
 * Validates the Inventory Management API offer model (createOffer / bulkCreateOffer body).
 * Unknown keys pass through so generated fields this schema does not model still reach eBay.
 */
export const offerSchema = z.object({ ...offerKeyFields, ...offerDetailsFields }).passthrough();

/**
 * Validates the Inventory Management API updateOffer body (offer details without the keys).
 */
export const updateOfferBodySchema = z.object(offerDetailsFields).passthrough();

/**
 * Validates the Inventory Management API get offers request payload.
 */
export const getOffersInputSchema = z.object({
  format: z.string().optional().describe('Filter offers by listing format'),
  sku: z.string().min(1).describe('Seller-defined SKU whose offers to return'),
  marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter offers by marketplace'),
  limit: z.number().optional().describe('Number of offers to return'),
  offset: z.number().optional().describe('Number of offers to skip'),
});

/**
 * Validates the Inventory Management API bulk offer request model.
 */
export const bulkOfferRequestSchema = z.object({
  requests: z.array(offerSchema),
});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================
