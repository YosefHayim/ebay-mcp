import { z } from '@/utils/effectSchema.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  Condition,
  LengthUnit,
  WeightUnit,
  PricingVisibility,
  FormatType,
  ListingDuration,
  LocationType,
  MerchantLocationStatus,
  DayOfWeek,
  MarketplaceId,
} from '@/types/ebayEnums.js';

/**
 * Inventory Management API Schemas
 *
 * This file contains Effect-backed schemas for all Inventory Management endpoints.
 * Schemas are organized by endpoint and include both input and output validation.
 */

// ============================================================================
// Common Schemas
// ============================================================================

const errorSchema = z.object({
  errorId: z.number().optional(),
  domain: z.string().optional(),
  category: z.string().optional(),
  message: z.string().optional(),
  longMessage: z.string().optional(),
  parameters: z
    .array(
      z.object({
        name: z.string().optional(),
        value: z.string().optional(),
      }),
    )
    .optional(),
});

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

const productIdentifierSchema = z.object({
  epid: z.string().optional(),
  gtin: z.string().optional(),
  ktype: z.string().optional(),
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

/**
 * Validates the Inventory Management API get inventory items request payload.
 */
export const getInventoryItemsInputSchema = z.object({
  limit: z.number().optional().describe('Number of items to return per page'),
  offset: z.number().optional().describe('Number of items to skip for pagination'),
});

/**
 * Validates the Inventory Management API get inventory items response payload.
 */
export const getInventoryItemsOutputSchema = z.object({
  inventoryItems: z
    .array(
      z.object({
        sku: z.string().optional(),
        locale: z.string().optional(),
        availability: availabilitySchema.optional(),
        condition: z.string().optional(),
        conditionDescription: z.string().optional(),
        packageWeightAndSize: packageWeightAndSizeSchema.optional(),
        product: productSchema.optional(),
      }),
    )
    .optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  size: z.number().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Inventory Management API get inventory item request payload.
 */
export const getInventoryItemInputSchema = z.object({
  sku: z.string().describe('The seller-defined SKU value for the inventory item'),
});

/**
 * Validates the Inventory Management API get inventory item response payload.
 */
export const getInventoryItemOutputSchema = inventoryItemSchema.extend({
  sku: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Inventory Management API create inventory item request payload.
 */
export const createInventoryItemInputSchema = z.object({
  sku: z.string().describe('The seller-defined SKU value for the inventory item'),
  body: inventoryItemSchema,
});

/**
 * Validates the Inventory Management API create inventory item response payload.
 */
export const createInventoryItemOutputSchema = z.object({
  warnings: z.array(errorSchema).optional(),
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
          .describe('Best Offer applies to fixed-price offers only; never enable it on an auction'),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

/**
 * Validates the Inventory Management API offer pricing container for both listing formats.
 */
export const pricingSchema = z
  .object({
    price: amountSchema
      .optional()
      .describe(
        'Listing price for FIXED_PRICE offers (required before publish). For AUCTION offers this is the optional Buy It Now price',
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
      'Purchasable quantity for FIXED_PRICE offers. Omit it for AUCTION offers — eBay rejects it there (error 25762) and lists one unit from the inventory item',
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
      'FIXED_PRICE offers use GTC. AUCTION offers need a day count (commonly DAYS_1, DAYS_3, DAYS_5, DAYS_7, or DAYS_10; check ebay_get_listing_type_policies for the category) and never GTC',
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
      'FIXED_PRICE (price + GTC) or AUCTION (auctionStartPrice + day-count listingDuration; no availableQuantity)',
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
 * Validates the Inventory Management API offer response payload.
 */
export const offerResponseSchema = z.object({
  ...offerKeyFields,
  ...offerDetailsFields,
  offerId: z.string().optional(),
  listing: z
    .object({
      listingId: z.string().optional(),
      listingStatus: z.string().optional(),
      soldQuantity: z.number().optional(),
    })
    .optional(),
  status: z.string().optional(),
  statusDuration: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

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
 * Validates the Inventory Management API get offers response payload.
 */
export const getOffersOutputSchema = z.object({
  offers: z.array(offerResponseSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  size: z.number().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/** Validates the aggregate response from the bounded multi-SKU offer lookup. */
export const getOffersBySkusOutputSchema = z.object({
  requestedSkuCount: z.number(),
  uniqueSkuCount: z.number(),
  successCount: z.number(),
  failureCount: z.number(),
  results: z.array(
    z.union([
      z.object({
        sku: z.string(),
        status: z.enum(['success']),
        response: getOffersOutputSchema,
      }),
      z.object({
        sku: z.string(),
        status: z.enum(['failure']),
        error: z.object({ type: z.string(), message: z.string() }),
      }),
    ]),
  ),
});

/**
 * Validates the Inventory Management API create offer request payload.
 */
export const createOfferInputSchema = z.object({
  body: offerSchema,
});

/**
 * Validates the Inventory Management API create offer response payload.
 */
export const createOfferOutputSchema = z.object({
  offerId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Inventory Management API publish offer request payload.
 */
export const publishOfferInputSchema = z.object({
  offerId: z.string().describe('The unique identifier of the offer to publish'),
});

/**
 * Validates the Inventory Management API publish offer response payload.
 */
export const publishOfferOutputSchema = z.object({
  listingId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Inventory Location Schemas
// ============================================================================

const operatingHoursSchema = z.object({
  dayOfWeekEnum: z.nativeEnum(DayOfWeek).optional(),
  intervals: z
    .array(
      z.object({
        open: z.string().optional(),
        close: z.string().optional(),
      }),
    )
    .optional(),
});

const specialHoursSchema = z.object({
  date: z.string().optional(),
  intervals: z
    .array(
      z.object({
        open: z.string().optional(),
        close: z.string().optional(),
      }),
    )
    .optional(),
});

const geoCoordinatesSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const addressSchema = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  stateOrProvince: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

/**
 * Validates the Inventory Management API location model.
 */
export const locationSchema = z.object({
  location: z
    .object({
      address: addressSchema.optional(),
      geoCoordinates: geoCoordinatesSchema.optional(),
    })
    .optional(),
  locationAdditionalInformation: z.string().optional(),
  locationInstructions: z.string().optional(),
  locationTypes: z.array(z.nativeEnum(LocationType)).optional(),
  locationWebUrl: z.string().optional(),
  merchantLocationStatus: z.nativeEnum(MerchantLocationStatus).optional(),
  name: z.string().optional(),
  operatingHours: z.array(operatingHoursSchema).optional(),
  phone: z.string().optional(),
  specialHours: z.array(specialHoursSchema).optional(),
});

/**
 * Validates the Inventory Management API get inventory locations request payload.
 */
export const getInventoryLocationsInputSchema = z.object({
  limit: z.number().optional().describe('Number of locations to return'),
  offset: z.number().optional().describe('Number of locations to skip'),
});

/**
 * Validates the Inventory Management API get inventory locations response payload.
 */
export const getInventoryLocationsOutputSchema = z.object({
  locations: z
    .array(
      locationSchema.extend({
        merchantLocationKey: z.string().optional(),
      }),
    )
    .optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  size: z.number().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Inventory Management API create inventory location request payload.
 */
export const createInventoryLocationInputSchema = z.object({
  merchantLocationKey: z.string().describe('Unique merchant-defined key for the location'),
  body: locationSchema,
});

/**
 * Validates the Inventory Management API create inventory location response payload.
 */
export const createInventoryLocationOutputSchema = z.object({
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Product Compatibility Schemas
// ============================================================================

const productFamilyPropertiesSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  trim: z.string().optional(),
  engine: z.string().optional(),
});

const compatibleProductSchema = z.object({
  productIdentifier: productIdentifierSchema.optional(),
  productFamilyProperties: productFamilyPropertiesSchema.optional(),
  notes: z.string().optional(),
});

/**
 * Validates the Inventory Management API product compatibility model.
 */
export const productCompatibilitySchema = z.object({
  compatibleProducts: z.array(compatibleProductSchema).optional(),
});

/**
 * Validates the Inventory Management API get product compatibility request payload.
 */
export const getProductCompatibilityInputSchema = z.object({
  sku: z.string().describe('The SKU of the inventory item'),
});

/**
 * Validates the Inventory Management API get product compatibility response payload.
 */
export const getProductCompatibilityOutputSchema = productCompatibilitySchema.extend({
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Inventory Item Group Schemas
// ============================================================================

const specificationSchema = z.object({
  name: z.string(),
  values: z.array(z.string()),
});

const variesBySchema = z.object({
  specifications: z.array(specificationSchema).optional(),
  aspectsImageVariesBy: z.array(z.string()).optional(),
});

/**
 * Validates the Inventory Management API inventory item group model.
 */
export const inventoryItemGroupSchema = z.object({
  aspects: z.record(z.array(z.string())),
  description: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  inventoryItemGroupKey: z.string(),
  subtitle: z.string().optional(),
  title: z.string(),
  variantSKUs: z.array(z.string()).optional(),
  variesBy: variesBySchema.optional(),
  videoIds: z.array(z.string()).optional(),
});

/**
 * Validates the Inventory Management API get inventory item group request payload.
 */
export const getInventoryItemGroupInputSchema = z.object({
  inventoryItemGroupKey: z.string().describe('The unique identifier for the inventory item group'),
});

/**
 * Validates the Inventory Management API get inventory item group response payload.
 */
export const getInventoryItemGroupOutputSchema = inventoryItemGroupSchema.extend({
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Bulk Operation Schemas
// ============================================================================

/**
 * Validates the Inventory Management API bulk inventory item request model.
 */
export const bulkInventoryItemRequestSchema = z.object({
  requests: z.array(
    z.object({
      sku: z.string(),
      product: productSchema.optional(),
      availability: availabilitySchema.optional(),
      condition: z.nativeEnum(Condition).optional(),
      conditionDescription: z.string().optional(),
    }),
  ),
});

/**
 * Validates the Inventory Management API bulk inventory item response payload.
 */
export const bulkInventoryItemResponseSchema = z.object({
  responses: z
    .array(
      z.object({
        sku: z.string().optional(),
        statusCode: z.number().optional(),
        errors: z.array(errorSchema).optional(),
        warnings: z.array(errorSchema).optional(),
      }),
    )
    .optional(),
});

/**
 * Validates the Inventory Management API bulk offer request model.
 */
export const bulkOfferRequestSchema = z.object({
  requests: z.array(offerSchema),
});

/**
 * Validates the Inventory Management API bulk offer response payload.
 */
export const bulkOfferResponseSchema = z.object({
  responses: z
    .array(
      z.object({
        offerId: z.string().optional(),
        statusCode: z.number().optional(),
        errors: z.array(errorSchema).optional(),
        warnings: z.array(errorSchema).optional(),
      }),
    )
    .optional(),
});

/**
 * Validates the Inventory Management API bulk publish request model.
 */
export const bulkPublishRequestSchema = z.object({
  requests: z.array(
    z.object({
      offerId: z.string(),
    }),
  ),
});

/**
 * Validates the Inventory Management API bulk publish response payload.
 */
export const bulkPublishResponseSchema = z.object({
  responses: z
    .array(
      z.object({
        offerId: z.string().optional(),
        listingId: z.string().optional(),
        statusCode: z.number().optional(),
        errors: z.array(errorSchema).optional(),
        warnings: z.array(errorSchema).optional(),
      }),
    )
    .optional(),
});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================

/**
 * Converts Inventory Management API Effect-backed schemas to JSON Schema format for MCP tools.
 *
 * @returns Inventory Management API JSON schemas keyed by endpoint or shared model name.
 * @example
 * ```ts
 * const schemas = getInventoryManagementJsonSchemas();
 * ```
 */
export const getInventoryManagementJsonSchemas = () => {
  return {
    // Inventory Items
    getInventoryItemsInput: zodToJsonSchema(getInventoryItemsInputSchema, 'getInventoryItemsInput'),
    getInventoryItemsOutput: zodToJsonSchema(
      getInventoryItemsOutputSchema,
      'getInventoryItemsOutput',
    ),
    getInventoryItemInput: zodToJsonSchema(getInventoryItemInputSchema, 'getInventoryItemInput'),
    getInventoryItemOutput: zodToJsonSchema(getInventoryItemOutputSchema, 'getInventoryItemOutput'),
    createInventoryItemInput: zodToJsonSchema(
      createInventoryItemInputSchema,
      'createInventoryItemInput',
    ),
    createInventoryItemOutput: zodToJsonSchema(
      createInventoryItemOutputSchema,
      'createInventoryItemOutput',
    ),

    // Offers
    getOffersInput: zodToJsonSchema(getOffersInputSchema, 'getOffersInput'),
    getOffersOutput: zodToJsonSchema(getOffersOutputSchema, 'getOffersOutput'),
    createOfferInput: zodToJsonSchema(createOfferInputSchema, 'createOfferInput'),
    createOfferOutput: zodToJsonSchema(createOfferOutputSchema, 'createOfferOutput'),
    publishOfferInput: zodToJsonSchema(publishOfferInputSchema, 'publishOfferInput'),
    publishOfferOutput: zodToJsonSchema(publishOfferOutputSchema, 'publishOfferOutput'),
    offerDetails: zodToJsonSchema(offerResponseSchema, 'offerDetails'),

    // Inventory Locations
    getInventoryLocationsInput: zodToJsonSchema(
      getInventoryLocationsInputSchema,
      'getInventoryLocationsInput',
    ),
    getInventoryLocationsOutput: zodToJsonSchema(
      getInventoryLocationsOutputSchema,
      'getInventoryLocationsOutput',
    ),
    createInventoryLocationInput: zodToJsonSchema(
      createInventoryLocationInputSchema,
      'createInventoryLocationInput',
    ),
    createInventoryLocationOutput: zodToJsonSchema(
      createInventoryLocationOutputSchema,
      'createInventoryLocationOutput',
    ),

    // Product Compatibility
    getProductCompatibilityInput: zodToJsonSchema(
      getProductCompatibilityInputSchema,
      'getProductCompatibilityInput',
    ),
    getProductCompatibilityOutput: zodToJsonSchema(
      getProductCompatibilityOutputSchema,
      'getProductCompatibilityOutput',
    ),

    // Inventory Item Groups
    getInventoryItemGroupInput: zodToJsonSchema(
      getInventoryItemGroupInputSchema,
      'getInventoryItemGroupInput',
    ),
    getInventoryItemGroupOutput: zodToJsonSchema(
      getInventoryItemGroupOutputSchema,
      'getInventoryItemGroupOutput',
    ),
    inventoryItemGroup: zodToJsonSchema(inventoryItemGroupSchema, 'inventoryItemGroup'),

    // Bulk Operations
    bulkInventoryItemRequest: zodToJsonSchema(
      bulkInventoryItemRequestSchema,
      'bulkInventoryItemRequest',
    ),
    bulkInventoryItemResponse: zodToJsonSchema(
      bulkInventoryItemResponseSchema,
      'bulkInventoryItemResponse',
    ),
    bulkOfferRequest: zodToJsonSchema(bulkOfferRequestSchema, 'bulkOfferRequest'),
    bulkOfferResponse: zodToJsonSchema(bulkOfferResponseSchema, 'bulkOfferResponse'),
    bulkPublishRequest: zodToJsonSchema(bulkPublishRequestSchema, 'bulkPublishRequest'),
    bulkPublishResponse: zodToJsonSchema(bulkPublishResponseSchema, 'bulkPublishResponse'),
  };
};
