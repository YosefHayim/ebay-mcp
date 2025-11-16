import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Taxonomy/Metadata API Schemas
 *
 * This file contains Zod schemas for the Sell Metadata API (Taxonomy section).
 * Schemas are organized by policy type and include category-related metadata.
 */

// ============================================================================
// Common Schemas
// ============================================================================

const errorParameterSchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
});

const errorSchema = z.object({
  category: z.string().optional(),
  domain: z.string().optional(),
  errorId: z.number().int().optional(),
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
  value: z.number().int().optional(),
});

// ============================================================================
// Category Policy Schemas
// ============================================================================

const categoryPolicySchema = z.object({
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

const categoryPolicyResponseSchema = z.object({
  categoryPolicies: z.array(categoryPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Item Condition Policy Schemas
// ============================================================================

const itemConditionDescriptorValueConstraintSchema = z.object({
  applicableToConditionDescriptorId: z.string().optional(),
  applicableToConditionDescriptorValueIds: z.array(z.string()).optional(),
});

const itemConditionDescriptorValueSchema = z.object({
  conditionDescriptorValueAdditionalHelpText: z.array(z.string()).optional(),
  conditionDescriptorValueConstraints: z.array(itemConditionDescriptorValueConstraintSchema).optional(),
  conditionDescriptorValueHelpText: z.string().optional(),
  conditionDescriptorValueId: z.string().optional(),
  conditionDescriptorValueName: z.string().optional(),
});

const itemConditionDescriptorConstraintSchema = z.object({
  applicableToConditionDescriptorIds: z.array(z.string()).optional(),
  cardinality: z.string().optional(),
  defaultConditionDescriptorValueId: z.string().optional(),
  maxLength: z.number().int().optional(),
  mode: z.string().optional(),
  usage: z.string().optional(),
});

const itemConditionDescriptorSchema = z.object({
  conditionDescriptorConstraint: itemConditionDescriptorConstraintSchema.optional(),
  conditionDescriptorHelpText: z.string().optional(),
  conditionDescriptorId: z.string().optional(),
  conditionDescriptorName: z.string().optional(),
  conditionDescriptorValues: z.array(itemConditionDescriptorValueSchema).optional(),
});

const itemConditionSchema = z.object({
  conditionDescription: z.string().optional(),
  conditionDescriptors: z.array(itemConditionDescriptorSchema).optional(),
  conditionHelpText: z.string().optional(),
  conditionId: z.string().optional(),
  usage: z.string().optional(),
});

const itemConditionPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  itemConditionRequired: z.boolean().optional(),
  itemConditions: z.array(itemConditionSchema).optional(),
});

const itemConditionPolicyResponseSchema = z.object({
  itemConditionPolicies: z.array(itemConditionPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Return Policy Schemas
// ============================================================================

const returnPolicyDetailsSchema = z.object({
  policyDescriptionEnabled: z.boolean().optional(),
  refundMethods: z.array(z.string()).optional(),
  returnMethods: z.array(z.string()).optional(),
  returnPeriods: z.array(timeDurationSchema).optional(),
  returnsAcceptanceEnabled: z.boolean().optional(),
  returnShippingCostPayers: z.array(z.string()).optional(),
});

const returnPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  domestic: returnPolicyDetailsSchema.optional(),
  international: returnPolicyDetailsSchema.optional(),
  required: z.boolean().optional(),
});

const returnPolicyResponseSchema = z.object({
  returnPolicies: z.array(returnPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Listing Structure Policy Schemas
// ============================================================================

const listingStructurePolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  variationsSupported: z.boolean().optional(),
});

const listingStructurePolicyResponseSchema = z.object({
  listingStructurePolicies: z.array(listingStructurePolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Listing Type Policy Schemas
// ============================================================================

const listingDurationSchema = z.object({
  durationValues: z.array(z.string()).optional(),
  listingType: z.string().optional(),
});

const listingTypePolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  digitalGoodDeliveryEnabled: z.boolean().optional(),
  listingDurations: z.array(listingDurationSchema).optional(),
  pickupDropOffEnabled: z.boolean().optional(),
});

const listingTypePoliciesResponseSchema = z.object({
  listingTypePolicies: z.array(listingTypePolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Negotiated Price Policy Schemas
// ============================================================================

const negotiatedPricePolicySchema = z.object({
  bestOfferAutoAcceptEnabled: z.boolean().optional(),
  bestOfferAutoDeclineEnabled: z.boolean().optional(),
  bestOfferCounterEnabled: z.boolean().optional(),
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
});

const negotiatedPricePolicyResponseSchema = z.object({
  negotiatedPricePolicies: z.array(negotiatedPricePolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Shipping Policy Schemas
// ============================================================================

const shippingPolicySchema = z.object({
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

const shippingPoliciesResponseSchema = z.object({
  shippingPolicies: z.array(shippingPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Automotive Parts Compatibility Policy Schemas
// ============================================================================

const automotivePartsCompatibilityPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  compatibilityBasedOn: z.string().optional(),
  compatibleVehicleTypes: z.array(z.string()).optional(),
  maxNumberOfCompatibleVehicles: z.number().int().optional(),
});

const automotivePartsCompatibilityPolicyResponseSchema = z.object({
  automotivePartsCompatibilityPolicies: z.array(automotivePartsCompatibilityPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Classified Ad Policy Schemas
// ============================================================================

const classifiedAdPolicySchema = z.object({
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
  classifiedAdPhoneCount: z.number().int().optional(),
  classifiedAdShippingMethodEnabled: z.boolean().optional(),
  classifiedAdStreetCount: z.number().int().optional(),
  sellerContactDetailsEnabled: z.boolean().optional(),
});

const classifiedAdPolicyResponseSchema = z.object({
  classifiedAdPolicies: z.array(classifiedAdPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Motors Listing Policy Schemas
// ============================================================================

const localListingDistanceSchema = z.object({
  distances: z.array(z.number()).optional(),
  distanceType: z.string().optional(),
});

const motorsListingPolicySchema = z.object({
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
  ebayMotorsProPhoneCount: z.number().int().optional(),
  ebayMotorsProSellerContactDetailsEnabled: z.boolean().optional(),
  ebayMotorsProShippingMethodEnabled: z.boolean().optional(),
  ebayMotorsProStreetCount: z.number().int().optional(),
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
  localMarketPhoneCount: z.number().int().optional(),
  localMarketPremiumSubscription: z.boolean().optional(),
  localMarketRegularSubscription: z.boolean().optional(),
  localMarketSellerContactDetailsEnabled: z.boolean().optional(),
  localMarketShippingMethodEnabled: z.boolean().optional(),
  localMarketSpecialitySubscription: z.boolean().optional(),
  localMarketStreetCount: z.number().int().optional(),
  maxGranularFitmentCount: z.number().int().optional(),
  maxItemCompatibility: z.number().int().optional(),
  minItemCompatibility: z.number().int().optional(),
  nonSubscription: z.string().optional(),
  premiumSubscription: z.string().optional(),
  regularSubscription: z.string().optional(),
  sellerProvidedTitleSupported: z.boolean().optional(),
  specialitySubscription: z.string().optional(),
  vinSupported: z.boolean().optional(),
  vrmSupported: z.boolean().optional(),
});

const motorsListingPoliciesResponseSchema = z.object({
  motorsListingPolicies: z.array(motorsListingPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Currency Schemas
// ============================================================================

const currencySchema = z.object({
  code: z.string().optional(),
  description: z.string().optional(),
});

const getCurrenciesResponseSchema = z.object({
  defaultCurrency: currencySchema.optional(),
  marketplaceId: z.string().optional(),
});

// ============================================================================
// Extended Producer Responsibility Schemas
// ============================================================================

const extendedProducerResponsibilitySchema = z.object({
  enabledForVariations: z.boolean().optional(),
  name: z.string().optional(),
  usage: z.string().optional(),
});

const extendedProducerResponsibilityPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  supportedAttributes: z.array(extendedProducerResponsibilitySchema).optional(),
});

const extendedProducerResponsibilityPolicyResponseSchema = z.object({
  extendedProducerResponsibilities: z.array(extendedProducerResponsibilityPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Hazardous Materials Label Schemas
// ============================================================================

const signalWordSchema = z.object({
  signalWordId: z.string().optional(),
  signalWordDescription: z.string().optional(),
});

const hazardStatementSchema = z.object({
  statementId: z.string().optional(),
  statementDescription: z.string().optional(),
});

const pictogramSchema = z.object({
  pictogramId: z.string().optional(),
  pictogramDescription: z.string().optional(),
  pictogramUrl: z.string().optional(),
});

const hazardousMaterialDetailsResponseSchema = z.object({
  signalWords: z.array(signalWordSchema).optional(),
  statements: z.array(hazardStatementSchema).optional(),
  pictograms: z.array(pictogramSchema).optional(),
});

// ============================================================================
// Product Safety Label Schemas
// ============================================================================

const productSafetyLabelPictogramSchema = z.object({
  pictogramDescription: z.string().optional(),
  pictogramId: z.string().optional(),
  pictogramUrl: z.string().optional(),
});

const productSafetyLabelStatementSchema = z.object({
  statementDescription: z.string().optional(),
  statementId: z.string().optional(),
});

const productSafetyLabelsResponseSchema = z.object({
  pictograms: z.array(productSafetyLabelPictogramSchema).optional(),
  statements: z.array(productSafetyLabelStatementSchema).optional(),
});

// ============================================================================
// Regulatory Policy Schemas
// ============================================================================

const regulatoryAttributeSchema = z.object({
  name: z.string().optional(),
  usage: z.string().optional(),
});

const regulatoryPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  supportedAttributes: z.array(regulatoryAttributeSchema).optional(),
});

const regulatoryPolicyResponseSchema = z.object({
  regulatoryPolicies: z.array(regulatoryPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Site Visibility Policy Schemas
// ============================================================================

const siteVisibilityPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  crossBorderTradeAustraliaEnabled: z.boolean().optional(),
  crossBorderTradeGBEnabled: z.boolean().optional(),
  crossBorderTradeNorthAmericaEnabled: z.boolean().optional(),
});

const siteVisibilityPoliciesResponseSchema = z.object({
  siteVisibilityPolicies: z.array(siteVisibilityPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Compatibility Schemas
// ============================================================================

const compatibilityDetailsSchema = z.object({
  propertyName: z.string().optional(),
  propertyValue: z.string().optional(),
});

const compatibilitySchema = z.object({
  compatibilityDetails: z.array(compatibilityDetailsSchema).optional(),
});

const propertyFilterInnerSchema = z.object({
  propertyName: z.string().optional(),
  propertyValue: z.string().optional(),
  unitOfMeasurement: z.string().optional(),
  url: z.string().optional(),
});

const propertyNamesResponsePropertyNameMetadataSchema = z.object({
  displaySequence: z.number().int().optional(),
});

const propertyNamesResponsePropertyNamesSchema = z.object({
  propertyDisplayName: z.string().optional(),
  propertyName: z.string().optional(),
  propertyNameMetadata: propertyNamesResponsePropertyNameMetadataSchema.optional(),
});

const propertyNamesResponsePropertiesSchema = z.object({
  dataset: z.string().optional(),
  propertyNames: z.array(propertyNamesResponsePropertyNamesSchema).optional(),
});

const propertyNamesResponseSchema = z.object({
  categoryId: z.string().optional(),
  properties: z.array(propertyNamesResponsePropertiesSchema).optional(),
});

const propertyValuesResponseSchema = z.object({
  metadataVersion: z.string().optional(),
  propertyName: z.string().optional(),
  propertyValues: z.array(z.string()).optional(),
});

const multiCompatibilityPropertyValuesResponseSchema = z.object({
  compatibilities: z.array(compatibilitySchema).optional(),
  metadataVersion: z.string().optional(),
});

const paginationSchema = z.object({
  count: z.number().int().optional(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
  total: z.number().int().optional(),
});

const paginationInputSchema = z.object({
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
});

const productIdentifierSchema = z.object({
  ean: z.string().optional(),
  epid: z.string().optional(),
  isbn: z.string().optional(),
  productId: z.string().optional(),
  upc: z.string().optional(),
});

const propertyValuesSchema = z.object({
  propertyName: z.string().optional(),
  propertyValue: z.string().optional(),
});

const productResponseCompatibilityDetailsSchema = z.object({
  noteDetails: z.array(propertyFilterInnerSchema).optional(),
  productDetails: z.array(propertyValuesSchema).optional(),
});

const productResponseSchema = z.object({
  compatibilityDetails: z.array(productResponseCompatibilityDetailsSchema).optional(),
  pagination: paginationSchema.optional(),
});

const specificationResponseSchema = z.object({
  compatibilityDetails: z.array(compatibilitySchema).optional(),
  pagination: paginationSchema.optional(),
});

// ============================================================================
// Input Schemas
// ============================================================================

const propertyNamesRequestSchema = z.object({
  categoryId: z.string().optional(),
  dataset: z.array(z.string()).optional(),
});

const propertyValuesRequestSchema = z.object({
  categoryId: z.string().optional(),
  propertyFilters: z.array(propertyFilterInnerSchema).optional(),
  propertyName: z.string().optional(),
  sortOrder: z.string().optional(),
});

const multiCompatibilityPropertyValuesRequestSchema = z.object({
  categoryId: z.string().optional(),
  propertyFilters: z.array(propertyFilterInnerSchema).optional(),
  propertyNames: z.array(z.string()).optional(),
});

const disabledProductFilterSchema = z.object({
  excludeForEbayReviews: z.boolean().optional(),
  excludeForEbaySelling: z.boolean().optional(),
});

const sortOrderPropertiesSchema = z.object({
  order: z.string().optional(),
  propertyName: z.string().optional(),
});

const sortOrderInnerSchema = z.object({
  sortOrder: sortOrderPropertiesSchema.optional(),
  sortPriority: z.string().optional(),
});

const productRequestSchema = z.object({
  applicationPropertyFilters: z.array(propertyFilterInnerSchema).optional(),
  dataset: z.array(z.string()).optional(),
  datasetPropertyName: z.array(z.string()).optional(),
  disabledProductFilter: disabledProductFilterSchema.optional(),
  paginationInput: paginationInputSchema.optional(),
  productIdentifier: productIdentifierSchema.optional(),
  sortOrders: z.array(sortOrderInnerSchema).optional(),
});

const specificationRequestSchema = z.object({
  categoryId: z.string().optional(),
  compatibilityPropertyFilters: z.array(propertyFilterInnerSchema).optional(),
  dataset: z.string().optional(),
  datasetPropertyName: z.array(z.string()).optional(),
  exactMatch: z.boolean().optional(),
  paginationInput: paginationInputSchema.optional(),
  sortOrders: z.array(sortOrderInnerSchema).optional(),
  specifications: z.array(propertyFilterInnerSchema).optional(),
});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================

/**
 * Convert Zod schemas to JSON Schema format for MCP tools
 */
export function getTaxonomyJsonSchemas() {
  return {
    // Category Policies
    getCategoryPoliciesOutput: zodToJsonSchema(categoryPolicyResponseSchema, 'getCategoryPoliciesOutput'),

    // Item Condition Policies
    getItemConditionPoliciesOutput: zodToJsonSchema(itemConditionPolicyResponseSchema, 'getItemConditionPoliciesOutput'),

    // Return Policies
    getReturnPoliciesOutput: zodToJsonSchema(returnPolicyResponseSchema, 'getReturnPoliciesOutput'),

    // Listing Structure Policies
    getListingStructurePoliciesOutput: zodToJsonSchema(listingStructurePolicyResponseSchema, 'getListingStructurePoliciesOutput'),

    // Listing Type Policies
    getListingTypePoliciesOutput: zodToJsonSchema(listingTypePoliciesResponseSchema, 'getListingTypePoliciesOutput'),

    // Negotiated Price Policies
    getNegotiatedPricePoliciesOutput: zodToJsonSchema(negotiatedPricePolicyResponseSchema, 'getNegotiatedPricePoliciesOutput'),

    // Shipping Policies
    getShippingPoliciesOutput: zodToJsonSchema(shippingPoliciesResponseSchema, 'getShippingPoliciesOutput'),

    // Automotive Parts Compatibility Policies
    getAutomotivePartsCompatibilityPoliciesOutput: zodToJsonSchema(automotivePartsCompatibilityPolicyResponseSchema, 'getAutomotivePartsCompatibilityPoliciesOutput'),

    // Classified Ad Policies
    getClassifiedAdPoliciesOutput: zodToJsonSchema(classifiedAdPolicyResponseSchema, 'getClassifiedAdPoliciesOutput'),

    // Motors Listing Policies
    getMotorsListingPoliciesOutput: zodToJsonSchema(motorsListingPoliciesResponseSchema, 'getMotorsListingPoliciesOutput'),

    // Currencies
    getCurrenciesOutput: zodToJsonSchema(getCurrenciesResponseSchema, 'getCurrenciesOutput'),

    // Extended Producer Responsibility
    getExtendedProducerResponsibilityPoliciesOutput: zodToJsonSchema(extendedProducerResponsibilityPolicyResponseSchema, 'getExtendedProducerResponsibilityPoliciesOutput'),

    // Hazardous Materials Labels
    getHazardousMaterialsLabelsOutput: zodToJsonSchema(hazardousMaterialDetailsResponseSchema, 'getHazardousMaterialsLabelsOutput'),

    // Product Safety Labels
    getProductSafetyLabelsOutput: zodToJsonSchema(productSafetyLabelsResponseSchema, 'getProductSafetyLabelsOutput'),

    // Regulatory Policies
    getRegulatoryPoliciesOutput: zodToJsonSchema(regulatoryPolicyResponseSchema, 'getRegulatoryPoliciesOutput'),

    // Site Visibility Policies
    getSiteVisibilityPoliciesOutput: zodToJsonSchema(siteVisibilityPoliciesResponseSchema, 'getSiteVisibilityPoliciesOutput'),

    // Compatibility Methods
    getCompatibilityPropertyNamesInput: zodToJsonSchema(propertyNamesRequestSchema, 'getCompatibilityPropertyNamesInput'),
    getCompatibilityPropertyNamesOutput: zodToJsonSchema(propertyNamesResponseSchema, 'getCompatibilityPropertyNamesOutput'),
    getCompatibilityPropertyValuesInput: zodToJsonSchema(propertyValuesRequestSchema, 'getCompatibilityPropertyValuesInput'),
    getCompatibilityPropertyValuesOutput: zodToJsonSchema(propertyValuesResponseSchema, 'getCompatibilityPropertyValuesOutput'),
    getMultiCompatibilityPropertyValuesInput: zodToJsonSchema(multiCompatibilityPropertyValuesRequestSchema, 'getMultiCompatibilityPropertyValuesInput'),
    getMultiCompatibilityPropertyValuesOutput: zodToJsonSchema(multiCompatibilityPropertyValuesResponseSchema, 'getMultiCompatibilityPropertyValuesOutput'),
    getProductCompatibilitiesInput: zodToJsonSchema(productRequestSchema, 'getProductCompatibilitiesInput'),
    getProductCompatibilitiesOutput: zodToJsonSchema(productResponseSchema, 'getProductCompatibilitiesOutput'),
    getCompatibilitiesBySpecificationInput: zodToJsonSchema(specificationRequestSchema, 'getCompatibilitiesBySpecificationInput'),
    getCompatibilitiesBySpecificationOutput: zodToJsonSchema(specificationResponseSchema, 'getCompatibilitiesBySpecificationOutput'),

    // Common Types
    amount: zodToJsonSchema(amountSchema, 'amount'),
    error: zodToJsonSchema(errorSchema, 'error'),
    errorParameter: zodToJsonSchema(errorParameterSchema, 'errorParameter'),
    timeDuration: zodToJsonSchema(timeDurationSchema, 'timeDuration'),
    pagination: zodToJsonSchema(paginationSchema, 'pagination'),
    compatibility: zodToJsonSchema(compatibilitySchema, 'compatibility'),
    compatibilityDetails: zodToJsonSchema(compatibilityDetailsSchema, 'compatibilityDetails'),
    propertyFilterInner: zodToJsonSchema(propertyFilterInnerSchema, 'propertyFilterInner'),
    productIdentifier: zodToJsonSchema(productIdentifierSchema, 'productIdentifier'),
  };
}
