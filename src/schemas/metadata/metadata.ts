import { z } from 'zod';

/**
 * Metadata API Schemas
 *
 * This file contains Zod schemas for all Metadata API endpoints.
 * Schemas are organized by endpoint and include both input and output validation.
 */

// ============================================================================
// Common/Shared Schemas
// ============================================================================

const errorParameterSchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
});

const errorSchema = z.object({
  category: z.string().optional(),
  domain: z.string().optional(),
  errorId: z.number().optional(),
  inputRefIds: z.array(z.string()).optional(),
  longMessage: z.string().optional(),
  message: z.string().optional(),
  outputRefIds: z.array(z.string()).optional(),
  parameters: z.array(errorParameterSchema).optional(),
  subdomain: z.string().optional(),
});

const amountSchema = z.object({
  currency: z.string().optional(),
  value: z.string().optional(),
});

const timeDurationSchema = z.object({
  unit: z.string().optional(),
  value: z.number().optional(),
});

// ============================================================================
// Marketplace Policies - Automotive Compatibility
// ============================================================================

/**
 * Validates the Metadata API automotive parts compatibility policy model.
 */
export const automotivePartsCompatibilityPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  compatibilityBasedOn: z.string().optional(),
  compatibleVehicleTypes: z.array(z.string()).optional(),
  maxNumberOfCompatibleVehicles: z.number().optional(),
});

/**
 * Validates the Metadata API automotive parts compatibility policy response payload.
 */
export const automotivePartsCompatibilityPolicyResponseSchema = z.object({
  automotivePartsCompatibilityPolicies: z
    .array(automotivePartsCompatibilityPolicySchema)
    .optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Category Policies
// ============================================================================

/**
 * Validates the Metadata API category policy model.
 */
export const categoryPolicySchema = z.object({
  autoPayEnabled: z.boolean().optional(),
  b2bVatEnabled: z.boolean().optional(),
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  eanSupport: z.string().optional(),
  expired: z.boolean().optional(),
  intangibleEnabled: z.boolean().optional(),
  isbnSupport: z.string().optional(),
  lsd: z.boolean().optional(),
  minimumReservePrice: z.number().optional(),
  orpa: z.boolean().optional(),
  orra: z.boolean().optional(),
  paymentMethods: z.array(z.string()).optional(),
  reduceReserveAllowed: z.boolean().optional(),
  upcSupport: z.string().optional(),
  valueCategory: z.boolean().optional(),
  virtual: z.boolean().optional(),
});

/**
 * Validates the Metadata API category policy response payload.
 */
export const categoryPolicyResponseSchema = z.object({
  categoryPolicies: z.array(categoryPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Classified Ads
// ============================================================================

/**
 * Validates the Metadata API classified ad policy model.
 */
export const classifiedAdPolicySchema = z.object({
  adFormatEnabled: z.string().optional(),
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  classifiedAdAutoAcceptEnabled: z.boolean().optional(),
  classifiedAdAutoDeclineEnabled: z.boolean().optional(),
  classifiedAdBestOfferEnabled: z.string().optional(),
  classifiedAdCompanyNameEnabled: z.boolean().optional(),
  classifiedAdContactByAddressEnabled: z.boolean().optional(),
  classifiedAdContactByEmailEnabled: z.boolean().optional(),
  classifiedAdContactByPhoneEnabled: z.boolean().optional(),
  classifiedAdCounterOfferEnabled: z.boolean().optional(),
  classifiedAdPaymentMethodEnabled: z.string().optional(),
  classifiedAdPhoneCount: z.number().optional(),
  classifiedAdShippingMethodEnabled: z.boolean().optional(),
  classifiedAdStreetCount: z.number().optional(),
  sellerContactDetailsEnabled: z.boolean().optional(),
});

/**
 * Validates the Metadata API classified ad policy response payload.
 */
export const classifiedAdPolicyResponseSchema = z.object({
  classifiedAdPolicies: z.array(classifiedAdPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Currencies
// ============================================================================

/**
 * Validates the Metadata API currency model.
 */
export const currencySchema = z.object({
  code: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Validates the Metadata API get currencies response payload.
 */
export const getCurrenciesResponseSchema = z.object({
  defaultCurrency: currencySchema.optional(),
  marketplaceId: z.string().optional(),
});

// ============================================================================
// Marketplace Policies - Extended Producer Responsibility (EPR)
// ============================================================================

/**
 * Validates the Metadata API extended producer responsibility model.
 */
export const extendedProducerResponsibilitySchema = z.object({
  enabledForVariations: z.boolean().optional(),
  name: z.string().optional(),
  usage: z.string().optional(),
});

/**
 * Validates the Metadata API extended producer responsibility policy model.
 */
export const extendedProducerResponsibilityPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  supportedAttributes: z.array(extendedProducerResponsibilitySchema).optional(),
});

/**
 * Validates the Metadata API extended producer responsibility policy response payload.
 */
export const extendedProducerResponsibilityPolicyResponseSchema = z.object({
  extendedProducerResponsibilities: z.array(extendedProducerResponsibilityPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Hazardous Materials
// ============================================================================

/**
 * Validates the Metadata API signal word model.
 */
export const signalWordSchema = z.object({
  signalWordId: z.string().optional(),
  signalWordDescription: z.string().optional(),
});

/**
 * Validates the Metadata API hazard statement model.
 */
export const hazardStatementSchema = z.object({
  statementId: z.string().optional(),
  statementDescription: z.string().optional(),
});

/**
 * Validates the Metadata API pictogram model.
 */
export const pictogramSchema = z.object({
  pictogramId: z.string().optional(),
  pictogramDescription: z.string().optional(),
  pictogramUrl: z.string().optional(),
});

/**
 * Validates the Metadata API hazardous material details response payload.
 */
export const hazardousMaterialDetailsResponseSchema = z.object({
  signalWords: z.array(signalWordSchema).optional(),
  statements: z.array(hazardStatementSchema).optional(),
  pictograms: z.array(pictogramSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Item Conditions
// ============================================================================

/**
 * Validates the Metadata API item condition descriptor value constraint model.
 */
export const itemConditionDescriptorValueConstraintSchema = z.object({
  applicableToConditionDescriptorId: z.string().optional(),
  applicableToConditionDescriptorValueIds: z.array(z.string()).optional(),
});

/**
 * Validates the Metadata API item condition descriptor value model.
 */
export const itemConditionDescriptorValueSchema = z.object({
  conditionDescriptorValueAdditionalHelpText: z.array(z.string()).optional(),
  conditionDescriptorValueConstraints: z
    .array(itemConditionDescriptorValueConstraintSchema)
    .optional(),
  conditionDescriptorValueHelpText: z.string().optional(),
  conditionDescriptorValueId: z.string().optional(),
  conditionDescriptorValueName: z.string().optional(),
});

/**
 * Validates the Metadata API item condition descriptor constraint model.
 */
export const itemConditionDescriptorConstraintSchema = z.object({
  applicableToConditionDescriptorIds: z.array(z.string()).optional(),
  cardinality: z.string().optional(),
  defaultConditionDescriptorValueId: z.string().optional(),
  maxLength: z.number().optional(),
  mode: z.string().optional(),
  usage: z.string().optional(),
});

/**
 * Validates the Metadata API item condition descriptor model.
 */
export const itemConditionDescriptorSchema = z.object({
  conditionDescriptorConstraint: itemConditionDescriptorConstraintSchema.optional(),
  conditionDescriptorHelpText: z.string().optional(),
  conditionDescriptorId: z.string().optional(),
  conditionDescriptorName: z.string().optional(),
  conditionDescriptorValues: z.array(itemConditionDescriptorValueSchema).optional(),
});

/**
 * Validates the Metadata API item condition model.
 */
export const itemConditionSchema = z.object({
  conditionDescription: z.string().optional(),
  conditionDescriptors: z.array(itemConditionDescriptorSchema).optional(),
  conditionHelpText: z.string().optional(),
  conditionId: z.string().optional(),
  usage: z.string().optional(),
});

/**
 * Validates the Metadata API item condition policy model.
 */
export const itemConditionPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  itemConditionRequired: z.boolean().optional(),
  itemConditions: z.array(itemConditionSchema).optional(),
});

/**
 * Validates the Metadata API item condition policy response payload.
 */
export const itemConditionPolicyResponseSchema = z.object({
  itemConditionPolicies: z.array(itemConditionPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Listing Structure
// ============================================================================

/**
 * Validates the Metadata API listing structure policy model.
 */
export const listingStructurePolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  variationsSupported: z.boolean().optional(),
});

/**
 * Validates the Metadata API listing structure policy response payload.
 */
export const listingStructurePolicyResponseSchema = z.object({
  listingStructurePolicies: z.array(listingStructurePolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Listing Types
// ============================================================================

/**
 * Validates the Metadata API listing duration model.
 */
export const listingDurationSchema = z.object({
  durationValues: z.array(z.string()).optional(),
  listingType: z.string().optional(),
});

/**
 * Validates the Metadata API listing type policy model.
 */
export const listingTypePolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  digitalGoodDeliveryEnabled: z.boolean().optional(),
  listingDurations: z.array(listingDurationSchema).optional(),
  pickupDropOffEnabled: z.boolean().optional(),
});

/**
 * Validates the Metadata API listing type policies response payload.
 */
export const listingTypePoliciesResponseSchema = z.object({
  listingTypePolicies: z.array(listingTypePolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Motors Listing
// ============================================================================

/**
 * Validates the Metadata API local listing distance model.
 */
export const localListingDistanceSchema = z.object({
  distances: z.array(z.number()).optional(),
  distanceType: z.string().optional(),
});

/**
 * Validates the Metadata API motors listing policy model.
 */
export const motorsListingPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  depositSupported: z.boolean().optional(),
  ebayMotorsProAdFormatEnabled: z.string().optional(),
  ebayMotorsProAutoAcceptEnabled: z.boolean().optional(),
  ebayMotorsProAutoDeclineEnabled: z.boolean().optional(),
  ebayMotorsProBestOfferEnabled: z.string().optional(),
  ebayMotorsProCompanyNameEnabled: z.boolean().optional(),
  ebayMotorsProContactByAddressEnabled: z.boolean().optional(),
  ebayMotorsProContactByEmailEnabled: z.boolean().optional(),
  ebayMotorsProContactByPhoneEnabled: z.boolean().optional(),
  ebayMotorsProCounterOfferEnabled: z.boolean().optional(),
  ebayMotorsProPaymentMethodCheckOutEnabled: z.string().optional(),
  ebayMotorsProPhoneCount: z.number().optional(),
  ebayMotorsProSellerContactDetailsEnabled: z.boolean().optional(),
  ebayMotorsProShippingMethodEnabled: z.boolean().optional(),
  ebayMotorsProStreetCount: z.number().optional(),
  epidSupported: z.boolean().optional(),
  kTypeSupported: z.boolean().optional(),
  localListingDistances: z.array(localListingDistanceSchema).optional(),
  localMarketAdFormatEnabled: z.string().optional(),
  localMarketAutoAcceptEnabled: z.boolean().optional(),
  localMarketAutoDeclineEnabled: z.boolean().optional(),
  localMarketBestOfferEnabled: z.string().optional(),
  localMarketCompanyNameEnabled: z.boolean().optional(),
  localMarketContactByAddressEnabled: z.boolean().optional(),
  localMarketContactByEmailEnabled: z.boolean().optional(),
  localMarketContactByPhoneEnabled: z.boolean().optional(),
  localMarketCounterOfferEnabled: z.boolean().optional(),
  localMarketNonSubscription: z.boolean().optional(),
  localMarketPaymentMethodCheckOutEnabled: z.string().optional(),
  localMarketPhoneCount: z.number().optional(),
  localMarketPremiumSubscription: z.boolean().optional(),
  localMarketRegularSubscription: z.boolean().optional(),
  localMarketSellerContactDetailsEnabled: z.boolean().optional(),
  localMarketShippingMethodEnabled: z.boolean().optional(),
  localMarketSpecialitySubscription: z.boolean().optional(),
  localMarketStreetCount: z.number().optional(),
  maxGranularFitmentCount: z.number().optional(),
  maxItemCompatibility: z.number().optional(),
  minItemCompatibility: z.number().optional(),
  nonSubscription: z.string().optional(),
  premiumSubscription: z.string().optional(),
  regularSubscription: z.string().optional(),
  sellerProvidedTitleSupported: z.boolean().optional(),
  specialitySubscription: z.string().optional(),
  vinSupported: z.boolean().optional(),
  vrmSupported: z.boolean().optional(),
});

/**
 * Validates the Metadata API motors listing policies response payload.
 */
export const motorsListingPoliciesResponseSchema = z.object({
  motorsListingPolicies: z.array(motorsListingPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Negotiated Price
// ============================================================================

/**
 * Validates the Metadata API negotiated price policy model.
 */
export const negotiatedPricePolicySchema = z.object({
  bestOfferAutoAcceptEnabled: z.boolean().optional(),
  bestOfferAutoDeclineEnabled: z.boolean().optional(),
  bestOfferCounterEnabled: z.boolean().optional(),
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
});

/**
 * Validates the Metadata API negotiated price policy response payload.
 */
export const negotiatedPricePolicyResponseSchema = z.object({
  negotiatedPricePolicies: z.array(negotiatedPricePolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Product Safety
// ============================================================================

/**
 * Validates the Metadata API product safety label pictogram model.
 */
export const productSafetyLabelPictogramSchema = z.object({
  pictogramDescription: z.string().optional(),
  pictogramId: z.string().optional(),
  pictogramUrl: z.string().optional(),
});

/**
 * Validates the Metadata API product safety label statement model.
 */
export const productSafetyLabelStatementSchema = z.object({
  statementDescription: z.string().optional(),
  statementId: z.string().optional(),
});

/**
 * Validates the Metadata API product safety labels response payload.
 */
export const productSafetyLabelsResponseSchema = z.object({
  pictograms: z.array(productSafetyLabelPictogramSchema).optional(),
  statements: z.array(productSafetyLabelStatementSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Regulatory
// ============================================================================

/**
 * Validates the Metadata API regulatory attribute model.
 */
export const regulatoryAttributeSchema = z.object({
  name: z.string().optional(),
  usage: z.string().optional(),
});

/**
 * Validates the Metadata API regulatory policy model.
 */
export const regulatoryPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  supportedAttributes: z.array(regulatoryAttributeSchema).optional(),
});

/**
 * Validates the Metadata API regulatory policy response payload.
 */
export const regulatoryPolicyResponseSchema = z.object({
  regulatoryPolicies: z.array(regulatoryPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Return Policies
// ============================================================================

/**
 * Validates the Metadata API return policy details model.
 */
export const returnPolicyDetailsSchema = z.object({
  policyDescriptionEnabled: z.boolean().optional(),
  refundMethods: z.array(z.string()).optional(),
  returnMethods: z.array(z.string()).optional(),
  returnPeriods: z.array(timeDurationSchema).optional(),
  returnsAcceptanceEnabled: z.boolean().optional(),
  returnShippingCostPayers: z.array(z.string()).optional(),
});

/**
 * Validates the Metadata API return policy metadata model.
 */
export const returnPolicyMetadataSchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  domestic: returnPolicyDetailsSchema.optional(),
  international: returnPolicyDetailsSchema.optional(),
  required: z.boolean().optional(),
});

/**
 * Validates the Metadata API return policy metadata response payload.
 */
export const returnPolicyMetadataResponseSchema = z.object({
  returnPolicies: z.array(returnPolicyMetadataSchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Shipping
// ============================================================================

/**
 * Validates the Metadata API shipping policy model.
 */
export const shippingPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  globalShippingEnabled: z.boolean().optional(),
  group1MaxFlatShippingCost: amountSchema.optional(),
  group2MaxFlatShippingCost: amountSchema.optional(),
  group3MaxFlatShippingCost: amountSchema.optional(),
  handlingTimeEnabled: z.boolean().optional(),
  maxFlatShippingCost: amountSchema.optional(),
  shippingTermsRequired: z.boolean().optional(),
});

/**
 * Validates the Metadata API shipping policies response payload.
 */
export const shippingPoliciesResponseSchema = z.object({
  shippingPolicies: z.array(shippingPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Site Visibility
// ============================================================================

/**
 * Validates the Metadata API site visibility policy model.
 */
export const siteVisibilityPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  crossBorderTradeAustraliaEnabled: z.boolean().optional(),
  crossBorderTradeGBEnabled: z.boolean().optional(),
  crossBorderTradeNorthAmericaEnabled: z.boolean().optional(),
});

/**
 * Validates the Metadata API site visibility policies response payload.
 */
export const siteVisibilityPoliciesResponseSchema = z.object({
  siteVisibilityPolicies: z.array(siteVisibilityPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Compatibility Schemas - Common
// ============================================================================

/**
 * Validates the Metadata API property filter inner model.
 */
export const propertyFilterInnerSchema = z.object({
  propertyName: z.string().optional(),
  propertyValue: z.string().optional(),
  unitOfMeasurement: z.string().optional(),
  url: z.string().optional(),
});

/**
 * Validates the Metadata API compatibility details model.
 */
export const compatibilityDetailsSchema = z.object({
  propertyName: z.string().optional(),
  propertyValue: z.string().optional(),
});

/**
 * Validates the Metadata API compatibility model.
 */
export const compatibilitySchema = z.object({
  compatibilityDetails: z.array(compatibilityDetailsSchema).optional(),
});

/**
 * Validates the Metadata API pagination request payload.
 */
export const paginationInputSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
});

/**
 * Validates the Metadata API pagination model.
 */
export const paginationSchema = z.object({
  count: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  total: z.number().optional(),
});

/**
 * Validates the Metadata API sort order properties model.
 */
export const sortOrderPropertiesSchema = z.object({
  order: z.string().optional(),
  propertyName: z.string().optional(),
});

/**
 * Validates the Metadata API sort order inner model.
 */
export const sortOrderInnerSchema = z.object({
  sortOrder: sortOrderPropertiesSchema.optional(),
  sortPriority: z.string().optional(),
});

// ============================================================================
// Compatibility Schemas - By Specification
// ============================================================================

/**
 * Validates the Metadata API specification request model.
 */
export const specificationRequestSchema = z.object({
  categoryId: z.string().optional(),
  compatibilityPropertyFilters: z.array(propertyFilterInnerSchema).optional(),
  dataset: z.string().optional(),
  datasetPropertyName: z.array(z.string()).optional(),
  exactMatch: z.boolean().optional(),
  paginationInput: paginationInputSchema.optional(),
  sortOrders: z.array(sortOrderInnerSchema).optional(),
  specifications: z.array(propertyFilterInnerSchema).optional(),
});

/**
 * Validates the Metadata API specification response payload.
 */
export const specificationResponseSchema = z.object({
  compatibilityDetails: z.array(compatibilitySchema).optional(),
  pagination: paginationSchema.optional(),
});

// ============================================================================
// Compatibility Schemas - Property Names
// ============================================================================

/**
 * Validates the Metadata API property names request model.
 */
export const propertyNamesRequestSchema = z.object({
  categoryId: z.string().optional(),
  dataset: z.array(z.string()).optional(),
});

/**
 * Validates the Metadata API property names response property name metadata model.
 */
export const propertyNamesResponsePropertyNameMetadataSchema = z.object({
  displaySequence: z.number().optional(),
});

/**
 * Validates the Metadata API property names response property names model.
 */
export const propertyNamesResponsePropertyNamesSchema = z.object({
  propertyDisplayName: z.string().optional(),
  propertyName: z.string().optional(),
  propertyNameMetadata: propertyNamesResponsePropertyNameMetadataSchema.optional(),
});

/**
 * Validates the Metadata API property names response properties model.
 */
export const propertyNamesResponsePropertiesSchema = z.object({
  dataset: z.string().optional(),
  propertyNames: z.array(propertyNamesResponsePropertyNamesSchema).optional(),
});

/**
 * Validates the Metadata API property names response payload.
 */
export const propertyNamesResponseSchema = z.object({
  categoryId: z.string().optional(),
  properties: z.array(propertyNamesResponsePropertiesSchema).optional(),
});

// ============================================================================
// Compatibility Schemas - Property Values
// ============================================================================

/**
 * Validates the Metadata API property values request model.
 */
export const propertyValuesRequestSchema = z.object({
  categoryId: z.string().optional(),
  propertyFilters: z.array(propertyFilterInnerSchema).optional(),
  propertyName: z.string().optional(),
  sortOrder: z.string().optional(),
});

/**
 * Validates the Metadata API property values response payload.
 */
export const propertyValuesResponseSchema = z.object({
  metadataVersion: z.string().optional(),
  propertyName: z.string().optional(),
  propertyValues: z.array(z.string()).optional(),
});

// ============================================================================
// Compatibility Schemas - Multi Property Values
// ============================================================================

/**
 * Validates the Metadata API multi compatibility property values request model.
 */
export const multiCompatibilityPropertyValuesRequestSchema = z.object({
  categoryId: z.string().optional(),
  propertyFilters: z.array(propertyFilterInnerSchema).optional(),
  propertyNames: z.array(z.string()).optional(),
});

/**
 * Validates the Metadata API multi compatibility property values response payload.
 */
export const multiCompatibilityPropertyValuesResponseSchema = z.object({
  compatibilities: z.array(compatibilitySchema).optional(),
  metadataVersion: z.string().optional(),
});

// ============================================================================
// Compatibility Schemas - Product Compatibilities
// ============================================================================

/**
 * Validates the Metadata API disabled product filter model.
 */
export const disabledProductFilterSchema = z.object({
  excludeForEbayReviews: z.boolean().optional(),
  excludeForEbaySelling: z.boolean().optional(),
});

/**
 * Validates the Metadata API product identifier model.
 */
export const productIdentifierSchema = z.object({
  ean: z.string().optional(),
  epid: z.string().optional(),
  isbn: z.string().optional(),
  productId: z.string().optional(),
  upc: z.string().optional(),
});

/**
 * Validates the Metadata API product request model.
 */
export const productRequestSchema = z.object({
  applicationPropertyFilters: z.array(propertyFilterInnerSchema).optional(),
  dataset: z.array(z.string()).optional(),
  datasetPropertyName: z.array(z.string()).optional(),
  disabledProductFilter: disabledProductFilterSchema.optional(),
  paginationInput: paginationInputSchema.optional(),
  productIdentifier: productIdentifierSchema.optional(),
  sortOrders: z.array(sortOrderInnerSchema).optional(),
});

/**
 * Validates the Metadata API property values model.
 */
export const propertyValuesSchema = z.object({
  propertyName: z.string().optional(),
  propertyValue: z.string().optional(),
});

/**
 * Validates the Metadata API product response compatibility details model.
 */
export const productResponseCompatibilityDetailsSchema = z.object({
  noteDetails: z.array(propertyFilterInnerSchema).optional(),
  productDetails: z.array(propertyValuesSchema).optional(),
});

/**
 * Validates the Metadata API product response payload.
 */
export const productResponseSchema = z.object({
  compatibilityDetails: z.array(productResponseCompatibilityDetailsSchema).optional(),
  pagination: paginationSchema.optional(),
});

// ============================================================================
// Sales Tax Jurisdiction Schemas
// ============================================================================

/**
 * Validates the Metadata API sales tax jurisdiction model.
 */
export const salesTaxJurisdictionSchema = z.object({
  salesTaxJurisdictionId: z.string().optional(),
});

/**
 * Validates the Metadata API sales tax jurisdictions model.
 */
export const salesTaxJurisdictionsSchema = z.object({
  salesTaxJurisdictions: z.array(salesTaxJurisdictionSchema).optional(),
});

// ============================================================================
// JSON Schema Conversion Function
// ============================================================================
