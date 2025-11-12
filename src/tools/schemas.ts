import { z } from 'zod';
import {
  TimeDurationUnit,
  RegionType,
  ShippingCostType,
  ShippingOptionType,
  DepositType,
  RefundMethod,
  ReturnMethod,
  ReturnShippingCostPayer,
  Condition,
  LengthUnit,
  WeightUnit,
  PricingVisibility,
  FormatType,
  LocationType,
  MerchantLocationStatus,
  DayOfWeek,
  ReasonForRefund,
  FundingModel,
  MessageReferenceType,
  FeedbackRating,
  ReportedItemType,
} from '@/types/ebay-enums.js';

/**
 * Reusable Zod schemas for eBay API tool input validation
 *
 * These schemas provide type-safe validation while remaining flexible
 * enough to accept the full complexity of eBay API request objects.
 */

// ============================================================================
// Common/Shared Schemas
// ============================================================================

export const timeDurationSchema = z
  .object({
    unit: z.nativeEnum(TimeDurationUnit),
    value: z.number(),
  })
  .passthrough();

export const amountSchema = z
  .object({
    currency: z.string(),
    value: z.string(),
  })
  .passthrough();

export const regionSchema = z
  .object({
    regionName: z.string().optional(),
    regionType: z.nativeEnum(RegionType).optional(),
  })
  .passthrough();

export const regionSetSchema = z
  .object({
    regionIncluded: z.array(regionSchema).optional(),
    regionExcluded: z.array(regionSchema).optional(),
  })
  .passthrough();

// ============================================================================
// Account Management Schemas
// ============================================================================

export const categoryTypeSchema = z
  .object({
    name: z.string().optional(),
    default: z.boolean().optional(),
  })
  .passthrough();

export const shippingServiceSchema = z
  .object({
    additionalShippingCost: amountSchema.optional(),
    buyerResponsibleForPickup: z.boolean().optional(),
    buyerResponsibleForShipping: z.boolean().optional(),
    cashOnDeliveryFee: amountSchema.optional(),
    freeShipping: z.boolean().optional(),
    shipToLocations: regionSetSchema.optional(),
    shippingCarrierCode: z.string().optional(),
    shippingCost: amountSchema.optional(),
    shippingServiceCode: z.string().optional(),
    sortOrder: z.number().optional(),
  })
  .passthrough();

export const shippingOptionSchema = z
  .object({
    costType: z.nativeEnum(ShippingCostType),
    optionType: z.nativeEnum(ShippingOptionType),
    packageHandlingCost: amountSchema.optional(),
    rateTableId: z.string().optional(),
    shippingServices: z.array(shippingServiceSchema).optional(),
  })
  .passthrough();

export const fulfillmentPolicySchema = z
  .object({
    name: z.string(),
    marketplaceId: z.string(),
    categoryTypes: z.array(categoryTypeSchema).optional(),
    description: z.string().optional(),
    freightShipping: z.boolean().optional(),
    globalShipping: z.boolean().optional(),
    handlingTime: timeDurationSchema.optional(),
    localPickup: z.boolean().optional(),
    pickupDropOff: z.boolean().optional(),
    shippingOptions: z.array(shippingOptionSchema).optional(),
    shipToLocations: regionSetSchema.optional(),
  })
  .passthrough();

export const paymentMethodSchema = z
  .object({
    paymentMethodType: z.string(),
    brands: z.array(z.string()).optional(),
    recipientAccountReference: z
      .object({
        referenceId: z.string().optional(),
        referenceType: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const depositSchema = z
  .object({
    depositAmount: amountSchema.optional(),
    depositType: z.nativeEnum(DepositType).optional(),
    dueIn: timeDurationSchema.optional(),
  })
  .passthrough();

export const paymentPolicySchema = z
  .object({
    name: z.string(),
    marketplaceId: z.string(),
    categoryTypes: z.array(categoryTypeSchema).optional(),
    description: z.string().optional(),
    deposit: depositSchema.optional(),
    fullPaymentDueIn: timeDurationSchema.optional(),
    immediatePay: z.boolean().optional(),
    paymentInstructions: z.string().optional(),
    paymentMethods: z.array(paymentMethodSchema).optional(),
  })
  .passthrough();

export const returnPolicySchema = z
  .object({
    name: z.string(),
    marketplaceId: z.string(),
    categoryTypes: z.array(categoryTypeSchema).optional(),
    description: z.string().optional(),
    extendedHolidayReturnsOffered: z.boolean().optional(),
    refundMethod: z.nativeEnum(RefundMethod).optional(),
    restockingFeePercentage: z.string().optional(),
    returnInstructions: z.string().optional(),
    returnMethod: z.nativeEnum(ReturnMethod).optional(),
    returnPeriod: timeDurationSchema.optional(),
    returnsAccepted: z.boolean().optional(),
    returnShippingCostPayer: z.nativeEnum(ReturnShippingCostPayer).optional(),
  })
  .passthrough();

export const customPolicySchema = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    policyType: z.string(),
    label: z.string().optional(),
  })
  .passthrough();

export const salesTaxBaseSchema = z
  .object({
    salesTaxPercentage: z.string(),
    shippingAndHandlingTaxed: z.boolean().optional(),
  })
  .passthrough();

export const programRequestSchema = z
  .object({
    programType: z.string(),
  })
  .passthrough();

// ============================================================================
// Inventory Management Schemas
// ============================================================================

export const availabilitySchema = z
  .object({
    shipToLocationAvailability: z
      .object({
        quantity: z.number().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const productSchema = z
  .object({
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
  })
  .passthrough();

export const inventoryItemSchema = z
  .object({
    availability: availabilitySchema.optional(),
    condition: z.nativeEnum(Condition).optional(),
    conditionDescription: z.string().optional(),
    packageWeightAndSize: z
      .object({
        dimensions: z
          .object({
            height: z.number().optional(),
            length: z.number().optional(),
            width: z.number().optional(),
            unit: z.nativeEnum(LengthUnit).optional(),
          })
          .passthrough()
          .optional(),
        packageType: z.string().optional(),
        weight: z
          .object({
            value: z.number().optional(),
            unit: z.nativeEnum(WeightUnit).optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
    product: productSchema.optional(),
  })
  .passthrough();

export const pricingSchema = z
  .object({
    price: amountSchema,
    pricingVisibility: z.nativeEnum(PricingVisibility).optional(),
    minimumAdvertisedPrice: amountSchema.optional(),
    originalRetailPrice: amountSchema.optional(),
  })
  .passthrough();

export const listingPoliciesSchema = z
  .object({
    fulfillmentPolicyId: z.string().optional(),
    paymentPolicyId: z.string().optional(),
    returnPolicyId: z.string().optional(),
    eBayPlusIfEligible: z.boolean().optional(),
    bestOfferTerms: z
      .object({
        autoAcceptPrice: amountSchema.optional(),
        autoDeclinePrice: amountSchema.optional(),
        bestOfferEnabled: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const offerSchema = z
  .object({
    sku: z.string(),
    marketplaceId: z.string(),
    format: z.nativeEnum(FormatType),
    availableQuantity: z.number().optional(),
    categoryId: z.string().optional(),
    listingDescription: z.string().optional(),
    listingPolicies: listingPoliciesSchema.optional(),
    merchantLocationKey: z.string().optional(),
    pricingSummary: pricingSchema.optional(),
    quantityLimitPerBuyer: z.number().optional(),
    tax: z
      .object({
        applyTax: z.boolean().optional(),
        thirdPartyTaxCategory: z.string().optional(),
        vatPercentage: z.number().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const productCompatibilitySchema = z
  .object({
    compatibleProducts: z
      .array(
        z
          .object({
            productIdentifier: z
              .object({
                epid: z.string().optional(),
              })
              .passthrough()
              .optional(),
            productFamilyProperties: z
              .object({
                make: z.string().optional(),
                model: z.string().optional(),
                year: z.string().optional(),
                trim: z.string().optional(),
                engine: z.string().optional(),
              })
              .passthrough()
              .optional(),
            notes: z.string().optional(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();

export const inventoryItemGroupSchema = z
  .object({
    aspects: z.record(z.array(z.string())),
    description: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
    inventoryItemGroupKey: z.string(),
    subtitle: z.string().optional(),
    title: z.string(),
    variantSKUs: z.array(z.string()).optional(),
    variesBy: z
      .object({
        specifications: z
          .array(
            z
              .object({
                name: z.string(),
                values: z.array(z.string()),
              })
              .passthrough()
          )
          .optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const locationSchema = z
  .object({
    location: z
      .object({
        address: z
          .object({
            addressLine1: z.string().optional(),
            addressLine2: z.string().optional(),
            city: z.string().optional(),
            stateOrProvince: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
    locationAdditionalInformation: z.string().optional(),
    locationInstructions: z.string().optional(),
    locationTypes: z.array(z.nativeEnum(LocationType)).optional(),
    locationWebUrl: z.string().optional(),
    merchantLocationStatus: z.nativeEnum(MerchantLocationStatus).optional(),
    name: z.string().optional(),
    operatingHours: z
      .array(
        z
          .object({
            dayOfWeekEnum: z.nativeEnum(DayOfWeek).optional(),
            intervals: z
              .array(
                z
                  .object({
                    open: z.string().optional(),
                    close: z.string().optional(),
                  })
                  .passthrough()
              )
              .optional(),
          })
          .passthrough()
      )
      .optional(),
    phone: z.string().optional(),
    specialHours: z
      .array(
        z
          .object({
            date: z.string().optional(),
            intervals: z
              .array(
                z
                  .object({
                    open: z.string().optional(),
                    close: z.string().optional(),
                  })
                  .passthrough()
              )
              .optional(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();

// ============================================================================
// Fulfillment/Order Management Schemas
// ============================================================================

export const lineItemRefundSchema = z
  .object({
    lineItemId: z.string(),
    refundAmount: amountSchema.optional(),
    legacyReference: z
      .object({
        legacyItemId: z.string().optional(),
        legacyTransactionId: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const refundDataSchema = z
  .object({
    reasonForRefund: z.nativeEnum(ReasonForRefund),
    comment: z.string().optional(),
    refundItems: z.array(lineItemRefundSchema).optional(),
    orderLevelRefundAmount: amountSchema.optional(),
  })
  .passthrough();

export const shippingFulfillmentSchema = z
  .object({
    lineItems: z.array(
      z
        .object({
          lineItemId: z.string(),
          quantity: z.number().optional(),
        })
        .passthrough()
    ),
    shippedDate: z.string().optional(),
    shippingCarrierCode: z.string().optional(),
    trackingNumber: z.string().optional(),
  })
  .passthrough();

// ============================================================================
// Marketing Schemas
// ============================================================================

export const campaignCriterionSchema = z
  .object({
    autoSelectFutureInventory: z.boolean().optional(),
    criterionType: z.string().optional(),
    selectionRules: z
      .array(
        z
          .object({
            brands: z.array(z.string()).optional(),
            categoryIds: z.array(z.string()).optional(),
            categoryScope: z.string().optional(),
            listingConditionIds: z.array(z.string()).optional(),
            maxPrice: amountSchema.optional(),
            minPrice: amountSchema.optional(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();

export const fundingStrategySchema = z
  .object({
    bidPercentage: z.string().optional(),
    fundingModel: z.nativeEnum(FundingModel).optional(),
  })
  .passthrough();

export const campaignSchema = z
  .object({
    campaignName: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    fundingStrategy: fundingStrategySchema.optional(),
    marketplaceId: z.string().optional(),
    campaignCriterion: campaignCriterionSchema.optional(),
  })
  .passthrough();

// ============================================================================
// Communication Schemas
// ============================================================================

export const messageDataSchema = z
  .object({
    messageText: z.string(),
    conversationId: z.string().optional(),
    otherPartyUsername: z.string().optional(),
    reference: z
      .object({
        referenceId: z.string().optional(),
        referenceType: z.nativeEnum(MessageReferenceType).optional(),
      })
      .passthrough()
      .optional(),
    messageMedia: z
      .array(
        z
          .object({
            mediaUrl: z.string().optional(),
            mediaType: z.string().optional(),
          })
          .passthrough()
      )
      .optional(),
    emailCopyToSender: z.boolean().optional(),
  })
  .passthrough();

export const feedbackDataSchema = z
  .object({
    orderLineItemId: z.string(),
    rating: z.nativeEnum(FeedbackRating),
    feedbackText: z.string().optional(),
  })
  .passthrough();

export const notificationConfigSchema = z
  .object({
    deliveryConfigs: z
      .array(
        z
          .object({
            endpoint: z.string().optional(),
            format: z.string().optional(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();

export const notificationDestinationSchema = z
  .object({
    name: z.string(),
    endpoint: z.string(),
    verificationToken: z.string().optional(),
  })
  .passthrough();

// ============================================================================
// Metadata/Compatibility Schemas
// ============================================================================

export const compatibilitySpecificationSchema = z
  .object({
    categoryTreeId: z.string().optional(),
    categoryId: z.string().optional(),
    compatibilityProperties: z
      .array(
        z
          .object({
            name: z.string(),
            value: z.string(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();

export const compatibilityDataSchema = z
  .object({
    categoryTreeId: z.string().optional(),
    specification: compatibilitySpecificationSchema.optional(),
  })
  .passthrough();

// ============================================================================
// Other Schemas
// ============================================================================

export const infringementDataSchema = z
  .object({
    itemId: z.string(),
    reportedItemType: z.nativeEnum(ReportedItemType).optional(),
    reportingReason: z.string().optional(),
    comments: z.string().optional(),
  })
  .passthrough();

// VERO API schemas
export const veroReportDataSchema = z
  .object({
    items: z.array(
      z.object({
        itemId: z.string(),
        reportingReason: z.string(),
      })
    ),
    rightsOwnerEmail: z.string().email().optional(),
    message: z.string().optional(),
  })
  .passthrough();

export const shippingQuoteRequestSchema = z
  .object({
    packageDetails: z
      .object({
        weight: z
          .object({
            value: z.number(),
            unit: z.string(),
          })
          .passthrough(),
        dimensions: z
          .object({
            height: z.number().optional(),
            length: z.number().optional(),
            width: z.number().optional(),
            unit: z.string().optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough(),
    shipFrom: z
      .object({
        addressLine1: z.string().optional(),
        city: z.string().optional(),
        stateOrProvince: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string(),
      })
      .passthrough(),
    shipTo: z
      .object({
        addressLine1: z.string().optional(),
        city: z.string().optional(),
        stateOrProvince: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string(),
      })
      .passthrough(),
  })
  .passthrough();

// ============================================================================
// Bulk Operation Schemas
// ============================================================================

export const bulkInventoryItemRequestSchema = z
  .object({
    requests: z.array(
      z
        .object({
          sku: z.string(),
          product: productSchema.optional(),
          availability: availabilitySchema.optional(),
          condition: z.string().optional(),
          conditionDescription: z.string().optional(),
        })
        .passthrough()
    ),
  })
  .passthrough();

export const bulkPriceQuantityRequestSchema = z
  .object({
    requests: z.array(
      z
        .object({
          offerId: z.string(),
          pricingSummary: pricingSchema.optional(),
          availableQuantity: z.number().optional(),
        })
        .passthrough()
    ),
  })
  .passthrough();

export const bulkOfferRequestSchema = z
  .object({
    requests: z.array(offerSchema),
  })
  .passthrough();

export const bulkPublishRequestSchema = z
  .object({
    requests: z.array(
      z
        .object({
          offerId: z.string(),
        })
        .passthrough()
    ),
  })
  .passthrough();

export const bulkMigrateRequestSchema = z
  .object({
    requests: z.array(
      z
        .object({
          listingId: z.string(),
        })
        .passthrough()
    ),
  })
  .passthrough();

export const bulkSalesTaxRequestSchema = z
  .object({
    requests: z.array(
      z
        .object({
          countryCode: z.string(),
          jurisdictionId: z.string(),
          salesTaxBase: salesTaxBaseSchema,
        })
        .passthrough()
    ),
  })
  .passthrough();

// ============================================================================
// Helper: Offers for listing fees
// ============================================================================

export const listingFeesRequestSchema = z
  .object({
    offers: z.array(
      z
        .object({
          offerId: z.string().optional(),
          sku: z.string().optional(),
          marketplaceId: z.string().optional(),
          format: z.nativeEnum(FormatType).optional(),
        })
        .passthrough()
    ),
  })
  .passthrough();

// ============================================================================
// Offer to interested buyers
// ============================================================================

export const offerToBuyersSchema = z
  .object({
    allowCounterOffer: z.boolean().optional(),
    message: z.string().optional(),
    offeredItems: z
      .array(
        z
          .object({
            offerId: z.string().optional(),
            availableQuantity: z.number().optional(),
            price: amountSchema.optional(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();
