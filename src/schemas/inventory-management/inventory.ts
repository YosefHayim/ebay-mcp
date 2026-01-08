import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  Condition,
  LengthUnit,
  WeightUnit,
  PricingVisibility,
  FormatType,
  LocationType,
  MerchantLocationStatus,
  DayOfWeek,
  MarketplaceId,
} from '@/types/ebay-enums.js';

/**
 * Inventory Management API Schemas
 *
 * This file contains Zod schemas for all Inventory Management endpoints.
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
      })
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
          })
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
  title: z.string().optional(),
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

export const inventoryItemSchema = z.object({
  availability: availabilitySchema.optional(),
  condition: z.nativeEnum(Condition).optional(),
  conditionDescription: z.string().optional(),
  conditionDescriptors: z
    .array(
      z.object({
        name: z.string().optional(),
        values: z.array(z.string()).optional(),
      })
    )
    .optional(),
  packageWeightAndSize: packageWeightAndSizeSchema.optional(),
  product: productSchema.optional(),
  locale: z.string().optional(),
});

export const getInventoryItemsInputSchema = z.object({
  limit: z.number().optional().describe('Number of items to return per page'),
  offset: z.number().optional().describe('Number of items to skip for pagination'),
});

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
      })
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

export const getInventoryItemInputSchema = z.object({
  sku: z.string().describe('The seller-defined SKU value for the inventory item'),
});

export const getInventoryItemOutputSchema = inventoryItemSchema.extend({
  sku: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const createInventoryItemInputSchema = z.object({
  sku: z.string().describe('The seller-defined SKU value for the inventory item'),
  inventoryItem: inventoryItemSchema,
});

export const createInventoryItemOutputSchema = z.object({
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Offer Schemas
// ============================================================================

const listingPoliciesSchema = z.object({
  fulfillmentPolicyId: z.string().optional(),
  paymentPolicyId: z.string().optional(),
  returnPolicyId: z.string().optional(),
  productCompliancePolicyIds: z.array(z.string()).optional(),
  takeBackPolicyIds: z.array(z.string()).optional(),
  eBayPlusIfEligible: z.boolean().optional(),
  bestOfferTerms: z
    .object({
      autoAcceptPrice: amountSchema.optional(),
      autoDeclinePrice: amountSchema.optional(),
      bestOfferEnabled: z.boolean().optional(),
    })
    .optional(),
});

const pricingSchema = z.object({
  price: amountSchema,
  pricingVisibility: z.nativeEnum(PricingVisibility).optional(),
  minimumAdvertisedPrice: amountSchema.optional(),
  originalRetailPrice: amountSchema.optional(),
});

const taxSchema = z.object({
  applyTax: z.boolean().optional(),
  thirdPartyTaxCategory: z.string().optional(),
  vatPercentage: z.number().optional(),
});

export const offerSchema = z.object({
  sku: z.string(),
  marketplaceId: z.nativeEnum(MarketplaceId),
  format: z.nativeEnum(FormatType),
  availableQuantity: z.number().optional(),
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
  listingDuration: z.string().optional(),
  listingPolicies: listingPoliciesSchema.optional(),
  listingStartDate: z.string().optional(),
  lotSize: z.number().optional(),
  merchantLocationKey: z.string().optional(),
  pricingSummary: pricingSchema.optional(),
  quantityLimitPerBuyer: z.number().optional(),
  secondaryCategoryId: z.string().optional(),
  storeCategoryNames: z.array(z.string()).optional(),
  tax: taxSchema.optional(),
});

export const offerResponseSchema = offerSchema.extend({
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

export const getOffersInputSchema = z.object({
  sku: z.string().optional().describe('Filter offers by SKU'),
  marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter offers by marketplace'),
  limit: z.number().optional().describe('Number of offers to return'),
});

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

export const createOfferInputSchema = z.object({
  offer: offerSchema,
});

export const createOfferOutputSchema = z.object({
  offerId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const publishOfferInputSchema = z.object({
  offerId: z.string().describe('The unique identifier of the offer to publish'),
});

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
      })
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
      })
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

export const getInventoryLocationsInputSchema = z.object({
  limit: z.number().optional().describe('Number of locations to return'),
  offset: z.number().optional().describe('Number of locations to skip'),
});

export const getInventoryLocationsOutputSchema = z.object({
  locations: z
    .array(
      locationSchema.extend({
        merchantLocationKey: z.string().optional(),
      })
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

export const createInventoryLocationInputSchema = z.object({
  merchantLocationKey: z.string().describe('Unique merchant-defined key for the location'),
  location: locationSchema,
});

export const createInventoryLocationOutputSchema = z.object({
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Product Compatibility Schemas
// ============================================================================

const compatibilityPropertySchema = z.object({
  name: z.string(),
  value: z.string(),
});

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

export const productCompatibilitySchema = z.object({
  compatibleProducts: z.array(compatibleProductSchema).optional(),
});

export const getProductCompatibilityInputSchema = z.object({
  sku: z.string().describe('The SKU of the inventory item'),
});

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

export const getInventoryItemGroupInputSchema = z.object({
  inventoryItemGroupKey: z.string().describe('The unique identifier for the inventory item group'),
});

export const getInventoryItemGroupOutputSchema = inventoryItemGroupSchema.extend({
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Bulk Operation Schemas
// ============================================================================

export const bulkInventoryItemRequestSchema = z.object({
  requests: z.array(
    z.object({
      sku: z.string(),
      product: productSchema.optional(),
      availability: availabilitySchema.optional(),
      condition: z.nativeEnum(Condition).optional(),
      conditionDescription: z.string().optional(),
    })
  ),
});

export const bulkInventoryItemResponseSchema = z.object({
  responses: z
    .array(
      z.object({
        sku: z.string().optional(),
        statusCode: z.number().optional(),
        errors: z.array(errorSchema).optional(),
        warnings: z.array(errorSchema).optional(),
      })
    )
    .optional(),
});

export const bulkOfferRequestSchema = z.object({
  requests: z.array(offerSchema),
});

export const bulkOfferResponseSchema = z.object({
  responses: z
    .array(
      z.object({
        offerId: z.string().optional(),
        statusCode: z.number().optional(),
        errors: z.array(errorSchema).optional(),
        warnings: z.array(errorSchema).optional(),
      })
    )
    .optional(),
});

export const bulkPublishRequestSchema = z.object({
  requests: z.array(
    z.object({
      offerId: z.string(),
    })
  ),
});

export const bulkPublishResponseSchema = z.object({
  responses: z
    .array(
      z.object({
        offerId: z.string().optional(),
        listingId: z.string().optional(),
        statusCode: z.number().optional(),
        errors: z.array(errorSchema).optional(),
        warnings: z.array(errorSchema).optional(),
      })
    )
    .optional(),
});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================

/**
 * Convert Zod schemas to JSON Schema format for MCP tools
 */
export function getInventoryManagementJsonSchemas() {
  return {
    // Inventory Items
    getInventoryItemsInput: zodToJsonSchema(getInventoryItemsInputSchema, 'getInventoryItemsInput'),
    getInventoryItemsOutput: zodToJsonSchema(
      getInventoryItemsOutputSchema,
      'getInventoryItemsOutput'
    ),
    getInventoryItemInput: zodToJsonSchema(getInventoryItemInputSchema, 'getInventoryItemInput'),
    getInventoryItemOutput: zodToJsonSchema(getInventoryItemOutputSchema, 'getInventoryItemOutput'),
    createInventoryItemInput: zodToJsonSchema(
      createInventoryItemInputSchema,
      'createInventoryItemInput'
    ),
    createInventoryItemOutput: zodToJsonSchema(
      createInventoryItemOutputSchema,
      'createInventoryItemOutput'
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
      'getInventoryLocationsInput'
    ),
    getInventoryLocationsOutput: zodToJsonSchema(
      getInventoryLocationsOutputSchema,
      'getInventoryLocationsOutput'
    ),
    createInventoryLocationInput: zodToJsonSchema(
      createInventoryLocationInputSchema,
      'createInventoryLocationInput'
    ),
    createInventoryLocationOutput: zodToJsonSchema(
      createInventoryLocationOutputSchema,
      'createInventoryLocationOutput'
    ),

    // Product Compatibility
    getProductCompatibilityInput: zodToJsonSchema(
      getProductCompatibilityInputSchema,
      'getProductCompatibilityInput'
    ),
    getProductCompatibilityOutput: zodToJsonSchema(
      getProductCompatibilityOutputSchema,
      'getProductCompatibilityOutput'
    ),

    // Inventory Item Groups
    getInventoryItemGroupInput: zodToJsonSchema(
      getInventoryItemGroupInputSchema,
      'getInventoryItemGroupInput'
    ),
    getInventoryItemGroupOutput: zodToJsonSchema(
      getInventoryItemGroupOutputSchema,
      'getInventoryItemGroupOutput'
    ),
    inventoryItemGroup: zodToJsonSchema(inventoryItemGroupSchema, 'inventoryItemGroup'),

    // Bulk Operations
    bulkInventoryItemRequest: zodToJsonSchema(
      bulkInventoryItemRequestSchema,
      'bulkInventoryItemRequest'
    ),
    bulkInventoryItemResponse: zodToJsonSchema(
      bulkInventoryItemResponseSchema,
      'bulkInventoryItemResponse'
    ),
    bulkOfferRequest: zodToJsonSchema(bulkOfferRequestSchema, 'bulkOfferRequest'),
    bulkOfferResponse: zodToJsonSchema(bulkOfferResponseSchema, 'bulkOfferResponse'),
    bulkPublishRequest: zodToJsonSchema(bulkPublishRequestSchema, 'bulkPublishRequest'),
    bulkPublishResponse: zodToJsonSchema(bulkPublishResponseSchema, 'bulkPublishResponse'),
  };
}
