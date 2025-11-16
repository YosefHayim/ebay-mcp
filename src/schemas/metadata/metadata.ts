import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

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

export const automotivePartsCompatibilityPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  compatibilityBasedOn: z.string().optional(),
  compatibleVehicleTypes: z.array(z.string()).optional(),
  maxNumberOfCompatibleVehicles: z.number().optional(),
});

export const automotivePartsCompatibilityPolicyResponseSchema = z.object({
  automotivePartsCompatibilityPolicies: z.array(automotivePartsCompatibilityPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Category Policies
// ============================================================================

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

export const categoryPolicyResponseSchema = z.object({
  categoryPolicies: z.array(categoryPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Classified Ads
// ============================================================================

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

export const classifiedAdPolicyResponseSchema = z.object({
  classifiedAdPolicies: z.array(classifiedAdPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Currencies
// ============================================================================

export const currencySchema = z.object({
  code: z.string().optional(),
  description: z.string().optional(),
});

export const getCurrenciesResponseSchema = z.object({
  defaultCurrency: currencySchema.optional(),
  marketplaceId: z.string().optional(),
});

// ============================================================================
// Marketplace Policies - Extended Producer Responsibility (EPR)
// ============================================================================

export const extendedProducerResponsibilitySchema = z.object({
  enabledForVariations: z.boolean().optional(),
  name: z.string().optional(),
  usage: z.string().optional(),
});

export const extendedProducerResponsibilityPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  supportedAttributes: z.array(extendedProducerResponsibilitySchema).optional(),
});

export const extendedProducerResponsibilityPolicyResponseSchema = z.object({
  extendedProducerResponsibilities: z.array(extendedProducerResponsibilityPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Hazardous Materials
// ============================================================================

export const signalWordSchema = z.object({
  signalWordId: z.string().optional(),
  signalWordDescription: z.string().optional(),
});

export const hazardStatementSchema = z.object({
  statementId: z.string().optional(),
  statementDescription: z.string().optional(),
});

export const pictogramSchema = z.object({
  pictogramId: z.string().optional(),
  pictogramDescription: z.string().optional(),
  pictogramUrl: z.string().optional(),
});

export const hazardousMaterialDetailsResponseSchema = z.object({
  signalWords: z.array(signalWordSchema).optional(),
  statements: z.array(hazardStatementSchema).optional(),
  pictograms: z.array(pictogramSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Item Conditions
// ============================================================================

export const itemConditionDescriptorValueConstraintSchema = z.object({
  applicableToConditionDescriptorId: z.string().optional(),
  applicableToConditionDescriptorValueIds: z.array(z.string()).optional(),
});

export const itemConditionDescriptorValueSchema = z.object({
  conditionDescriptorValueAdditionalHelpText: z.array(z.string()).optional(),
  conditionDescriptorValueConstraints: z.array(itemConditionDescriptorValueConstraintSchema).optional(),
  conditionDescriptorValueHelpText: z.string().optional(),
  conditionDescriptorValueId: z.string().optional(),
  conditionDescriptorValueName: z.string().optional(),
});

export const itemConditionDescriptorConstraintSchema = z.object({
  applicableToConditionDescriptorIds: z.array(z.string()).optional(),
  cardinality: z.string().optional(),
  defaultConditionDescriptorValueId: z.string().optional(),
  maxLength: z.number().optional(),
  mode: z.string().optional(),
  usage: z.string().optional(),
});

export const itemConditionDescriptorSchema = z.object({
  conditionDescriptorConstraint: itemConditionDescriptorConstraintSchema.optional(),
  conditionDescriptorHelpText: z.string().optional(),
  conditionDescriptorId: z.string().optional(),
  conditionDescriptorName: z.string().optional(),
  conditionDescriptorValues: z.array(itemConditionDescriptorValueSchema).optional(),
});

export const itemConditionSchema = z.object({
  conditionDescription: z.string().optional(),
  conditionDescriptors: z.array(itemConditionDescriptorSchema).optional(),
  conditionHelpText: z.string().optional(),
  conditionId: z.string().optional(),
  usage: z.string().optional(),
});

export const itemConditionPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  itemConditionRequired: z.boolean().optional(),
  itemConditions: z.array(itemConditionSchema).optional(),
});

export const itemConditionPolicyResponseSchema = z.object({
  itemConditionPolicies: z.array(itemConditionPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Listing Structure
// ============================================================================

export const listingStructurePolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  variationsSupported: z.boolean().optional(),
});

export const listingStructurePolicyResponseSchema = z.object({
  listingStructurePolicies: z.array(listingStructurePolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Listing Types
// ============================================================================

export const listingDurationSchema = z.object({
  durationValues: z.array(z.string()).optional(),
  listingType: z.string().optional(),
});

export const listingTypePolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  digitalGoodDeliveryEnabled: z.boolean().optional(),
  listingDurations: z.array(listingDurationSchema).optional(),
  pickupDropOffEnabled: z.boolean().optional(),
});

export const listingTypePoliciesResponseSchema = z.object({
  listingTypePolicies: z.array(listingTypePolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Motors Listing
// ============================================================================

export const localListingDistanceSchema = z.object({
  distances: z.array(z.number()).optional(),
  distanceType: z.string().optional(),
});

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

export const motorsListingPoliciesResponseSchema = z.object({
  motorsListingPolicies: z.array(motorsListingPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Negotiated Price
// ============================================================================

export const negotiatedPricePolicySchema = z.object({
  bestOfferAutoAcceptEnabled: z.boolean().optional(),
  bestOfferAutoDeclineEnabled: z.boolean().optional(),
  bestOfferCounterEnabled: z.boolean().optional(),
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
});

export const negotiatedPricePolicyResponseSchema = z.object({
  negotiatedPricePolicies: z.array(negotiatedPricePolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Product Safety
// ============================================================================

export const productSafetyLabelPictogramSchema = z.object({
  pictogramDescription: z.string().optional(),
  pictogramId: z.string().optional(),
  pictogramUrl: z.string().optional(),
});

export const productSafetyLabelStatementSchema = z.object({
  statementDescription: z.string().optional(),
  statementId: z.string().optional(),
});

export const productSafetyLabelsResponseSchema = z.object({
  pictograms: z.array(productSafetyLabelPictogramSchema).optional(),
  statements: z.array(productSafetyLabelStatementSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Regulatory
// ============================================================================

export const regulatoryAttributeSchema = z.object({
  name: z.string().optional(),
  usage: z.string().optional(),
});

export const regulatoryPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  supportedAttributes: z.array(regulatoryAttributeSchema).optional(),
});

export const regulatoryPolicyResponseSchema = z.object({
  regulatoryPolicies: z.array(regulatoryPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Return Policies
// ============================================================================

export const returnPolicyDetailsSchema = z.object({
  policyDescriptionEnabled: z.boolean().optional(),
  refundMethods: z.array(z.string()).optional(),
  returnMethods: z.array(z.string()).optional(),
  returnPeriods: z.array(timeDurationSchema).optional(),
  returnsAcceptanceEnabled: z.boolean().optional(),
  returnShippingCostPayers: z.array(z.string()).optional(),
});

export const returnPolicyMetadataSchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  domestic: returnPolicyDetailsSchema.optional(),
  international: returnPolicyDetailsSchema.optional(),
  required: z.boolean().optional(),
});

export const returnPolicyMetadataResponseSchema = z.object({
  returnPolicies: z.array(returnPolicyMetadataSchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Shipping
// ============================================================================

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

export const shippingPoliciesResponseSchema = z.object({
  shippingPolicies: z.array(shippingPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Marketplace Policies - Site Visibility
// ============================================================================

export const siteVisibilityPolicySchema = z.object({
  categoryId: z.string().optional(),
  categoryTreeId: z.string().optional(),
  crossBorderTradeAustraliaEnabled: z.boolean().optional(),
  crossBorderTradeGBEnabled: z.boolean().optional(),
  crossBorderTradeNorthAmericaEnabled: z.boolean().optional(),
});

export const siteVisibilityPoliciesResponseSchema = z.object({
  siteVisibilityPolicies: z.array(siteVisibilityPolicySchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Compatibility Schemas - Common
// ============================================================================

export const propertyFilterInnerSchema = z.object({
  propertyName: z.string().optional(),
  propertyValue: z.string().optional(),
  unitOfMeasurement: z.string().optional(),
  url: z.string().optional(),
});

export const compatibilityDetailsSchema = z.object({
  propertyName: z.string().optional(),
  propertyValue: z.string().optional(),
});

export const compatibilitySchema = z.object({
  compatibilityDetails: z.array(compatibilityDetailsSchema).optional(),
});

export const paginationInputSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export const paginationSchema = z.object({
  count: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  total: z.number().optional(),
});

export const sortOrderPropertiesSchema = z.object({
  order: z.string().optional(),
  propertyName: z.string().optional(),
});

export const sortOrderInnerSchema = z.object({
  sortOrder: sortOrderPropertiesSchema.optional(),
  sortPriority: z.string().optional(),
});

// ============================================================================
// Compatibility Schemas - By Specification
// ============================================================================

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

export const specificationResponseSchema = z.object({
  compatibilityDetails: z.array(compatibilitySchema).optional(),
  pagination: paginationSchema.optional(),
});

// ============================================================================
// Compatibility Schemas - Property Names
// ============================================================================

export const propertyNamesRequestSchema = z.object({
  categoryId: z.string().optional(),
  dataset: z.array(z.string()).optional(),
});

export const propertyNamesResponsePropertyNameMetadataSchema = z.object({
  displaySequence: z.number().optional(),
});

export const propertyNamesResponsePropertyNamesSchema = z.object({
  propertyDisplayName: z.string().optional(),
  propertyName: z.string().optional(),
  propertyNameMetadata: propertyNamesResponsePropertyNameMetadataSchema.optional(),
});

export const propertyNamesResponsePropertiesSchema = z.object({
  dataset: z.string().optional(),
  propertyNames: z.array(propertyNamesResponsePropertyNamesSchema).optional(),
});

export const propertyNamesResponseSchema = z.object({
  categoryId: z.string().optional(),
  properties: z.array(propertyNamesResponsePropertiesSchema).optional(),
});

// ============================================================================
// Compatibility Schemas - Property Values
// ============================================================================

export const propertyValuesRequestSchema = z.object({
  categoryId: z.string().optional(),
  propertyFilters: z.array(propertyFilterInnerSchema).optional(),
  propertyName: z.string().optional(),
  sortOrder: z.string().optional(),
});

export const propertyValuesResponseSchema = z.object({
  metadataVersion: z.string().optional(),
  propertyName: z.string().optional(),
  propertyValues: z.array(z.string()).optional(),
});

// ============================================================================
// Compatibility Schemas - Multi Property Values
// ============================================================================

export const multiCompatibilityPropertyValuesRequestSchema = z.object({
  categoryId: z.string().optional(),
  propertyFilters: z.array(propertyFilterInnerSchema).optional(),
  propertyNames: z.array(z.string()).optional(),
});

export const multiCompatibilityPropertyValuesResponseSchema = z.object({
  compatibilities: z.array(compatibilitySchema).optional(),
  metadataVersion: z.string().optional(),
});

// ============================================================================
// Compatibility Schemas - Product Compatibilities
// ============================================================================

export const disabledProductFilterSchema = z.object({
  excludeForEbayReviews: z.boolean().optional(),
  excludeForEbaySelling: z.boolean().optional(),
});

export const productIdentifierSchema = z.object({
  ean: z.string().optional(),
  epid: z.string().optional(),
  isbn: z.string().optional(),
  productId: z.string().optional(),
  upc: z.string().optional(),
});

export const productRequestSchema = z.object({
  applicationPropertyFilters: z.array(propertyFilterInnerSchema).optional(),
  dataset: z.array(z.string()).optional(),
  datasetPropertyName: z.array(z.string()).optional(),
  disabledProductFilter: disabledProductFilterSchema.optional(),
  paginationInput: paginationInputSchema.optional(),
  productIdentifier: productIdentifierSchema.optional(),
  sortOrders: z.array(sortOrderInnerSchema).optional(),
});

export const propertyValuesSchema = z.object({
  propertyName: z.string().optional(),
  propertyValue: z.string().optional(),
});

export const productResponseCompatibilityDetailsSchema = z.object({
  noteDetails: z.array(propertyFilterInnerSchema).optional(),
  productDetails: z.array(propertyValuesSchema).optional(),
});

export const productResponseSchema = z.object({
  compatibilityDetails: z.array(productResponseCompatibilityDetailsSchema).optional(),
  pagination: paginationSchema.optional(),
});

// ============================================================================
// Sales Tax Jurisdiction Schemas
// ============================================================================

export const salesTaxJurisdictionSchema = z.object({
  salesTaxJurisdictionId: z.string().optional(),
});

export const salesTaxJurisdictionsSchema = z.object({
  salesTaxJurisdictions: z.array(salesTaxJurisdictionSchema).optional(),
});

// ============================================================================
// JSON Schema Conversion Function
// ============================================================================

/**
 * Generates JSON schemas for all Metadata API endpoints
 * @returns Object containing JSON schemas for all endpoints
 */
export function getMetadataJsonSchemas() {
  return {
    // Marketplace Policies
    automotivePartsCompatibilityPolicy: zodToJsonSchema(automotivePartsCompatibilityPolicySchema, 'automotivePartsCompatibilityPolicy'),
    automotivePartsCompatibilityPolicyResponse: zodToJsonSchema(automotivePartsCompatibilityPolicyResponseSchema, 'automotivePartsCompatibilityPolicyResponse'),

    categoryPolicy: zodToJsonSchema(categoryPolicySchema, 'categoryPolicy'),
    categoryPolicyResponse: zodToJsonSchema(categoryPolicyResponseSchema, 'categoryPolicyResponse'),

    classifiedAdPolicy: zodToJsonSchema(classifiedAdPolicySchema, 'classifiedAdPolicy'),
    classifiedAdPolicyResponse: zodToJsonSchema(classifiedAdPolicyResponseSchema, 'classifiedAdPolicyResponse'),

    currency: zodToJsonSchema(currencySchema, 'currency'),
    getCurrenciesResponse: zodToJsonSchema(getCurrenciesResponseSchema, 'getCurrenciesResponse'),

    extendedProducerResponsibility: zodToJsonSchema(extendedProducerResponsibilitySchema, 'extendedProducerResponsibility'),
    extendedProducerResponsibilityPolicy: zodToJsonSchema(extendedProducerResponsibilityPolicySchema, 'extendedProducerResponsibilityPolicy'),
    extendedProducerResponsibilityPolicyResponse: zodToJsonSchema(extendedProducerResponsibilityPolicyResponseSchema, 'extendedProducerResponsibilityPolicyResponse'),

    signalWord: zodToJsonSchema(signalWordSchema, 'signalWord'),
    hazardStatement: zodToJsonSchema(hazardStatementSchema, 'hazardStatement'),
    pictogram: zodToJsonSchema(pictogramSchema, 'pictogram'),
    hazardousMaterialDetailsResponse: zodToJsonSchema(hazardousMaterialDetailsResponseSchema, 'hazardousMaterialDetailsResponse'),

    itemCondition: zodToJsonSchema(itemConditionSchema, 'itemCondition'),
    itemConditionDescriptor: zodToJsonSchema(itemConditionDescriptorSchema, 'itemConditionDescriptor'),
    itemConditionDescriptorConstraint: zodToJsonSchema(itemConditionDescriptorConstraintSchema, 'itemConditionDescriptorConstraint'),
    itemConditionDescriptorValue: zodToJsonSchema(itemConditionDescriptorValueSchema, 'itemConditionDescriptorValue'),
    itemConditionDescriptorValueConstraint: zodToJsonSchema(itemConditionDescriptorValueConstraintSchema, 'itemConditionDescriptorValueConstraint'),
    itemConditionPolicy: zodToJsonSchema(itemConditionPolicySchema, 'itemConditionPolicy'),
    itemConditionPolicyResponse: zodToJsonSchema(itemConditionPolicyResponseSchema, 'itemConditionPolicyResponse'),

    listingStructurePolicy: zodToJsonSchema(listingStructurePolicySchema, 'listingStructurePolicy'),
    listingStructurePolicyResponse: zodToJsonSchema(listingStructurePolicyResponseSchema, 'listingStructurePolicyResponse'),

    listingDuration: zodToJsonSchema(listingDurationSchema, 'listingDuration'),
    listingTypePolicy: zodToJsonSchema(listingTypePolicySchema, 'listingTypePolicy'),
    listingTypePoliciesResponse: zodToJsonSchema(listingTypePoliciesResponseSchema, 'listingTypePoliciesResponse'),

    localListingDistance: zodToJsonSchema(localListingDistanceSchema, 'localListingDistance'),
    motorsListingPolicy: zodToJsonSchema(motorsListingPolicySchema, 'motorsListingPolicy'),
    motorsListingPoliciesResponse: zodToJsonSchema(motorsListingPoliciesResponseSchema, 'motorsListingPoliciesResponse'),

    negotiatedPricePolicy: zodToJsonSchema(negotiatedPricePolicySchema, 'negotiatedPricePolicy'),
    negotiatedPricePolicyResponse: zodToJsonSchema(negotiatedPricePolicyResponseSchema, 'negotiatedPricePolicyResponse'),

    productSafetyLabelPictogram: zodToJsonSchema(productSafetyLabelPictogramSchema, 'productSafetyLabelPictogram'),
    productSafetyLabelStatement: zodToJsonSchema(productSafetyLabelStatementSchema, 'productSafetyLabelStatement'),
    productSafetyLabelsResponse: zodToJsonSchema(productSafetyLabelsResponseSchema, 'productSafetyLabelsResponse'),

    regulatoryAttribute: zodToJsonSchema(regulatoryAttributeSchema, 'regulatoryAttribute'),
    regulatoryPolicy: zodToJsonSchema(regulatoryPolicySchema, 'regulatoryPolicy'),
    regulatoryPolicyResponse: zodToJsonSchema(regulatoryPolicyResponseSchema, 'regulatoryPolicyResponse'),

    returnPolicyDetails: zodToJsonSchema(returnPolicyDetailsSchema, 'returnPolicyDetails'),
    returnPolicy: zodToJsonSchema(returnPolicyMetadataSchema, 'returnPolicy'),
    returnPolicyResponse: zodToJsonSchema(returnPolicyMetadataResponseSchema, 'returnPolicyResponse'),

    shippingPolicy: zodToJsonSchema(shippingPolicySchema, 'shippingPolicy'),
    shippingPoliciesResponse: zodToJsonSchema(shippingPoliciesResponseSchema, 'shippingPoliciesResponse'),

    siteVisibilityPolicy: zodToJsonSchema(siteVisibilityPolicySchema, 'siteVisibilityPolicy'),
    siteVisibilityPoliciesResponse: zodToJsonSchema(siteVisibilityPoliciesResponseSchema, 'siteVisibilityPoliciesResponse'),

    // Compatibility Schemas
    propertyFilterInner: zodToJsonSchema(propertyFilterInnerSchema, 'propertyFilterInner'),
    compatibilityDetails: zodToJsonSchema(compatibilityDetailsSchema, 'compatibilityDetails'),
    compatibility: zodToJsonSchema(compatibilitySchema, 'compatibility'),

    specificationRequest: zodToJsonSchema(specificationRequestSchema, 'specificationRequest'),
    specificationResponse: zodToJsonSchema(specificationResponseSchema, 'specificationResponse'),

    propertyNamesRequest: zodToJsonSchema(propertyNamesRequestSchema, 'propertyNamesRequest'),
    propertyNamesResponse: zodToJsonSchema(propertyNamesResponseSchema, 'propertyNamesResponse'),

    propertyValuesRequest: zodToJsonSchema(propertyValuesRequestSchema, 'propertyValuesRequest'),
    propertyValuesResponse: zodToJsonSchema(propertyValuesResponseSchema, 'propertyValuesResponse'),

    multiCompatibilityPropertyValuesRequest: zodToJsonSchema(multiCompatibilityPropertyValuesRequestSchema, 'multiCompatibilityPropertyValuesRequest'),
    multiCompatibilityPropertyValuesResponse: zodToJsonSchema(multiCompatibilityPropertyValuesResponseSchema, 'multiCompatibilityPropertyValuesResponse'),

    disabledProductFilter: zodToJsonSchema(disabledProductFilterSchema, 'disabledProductFilter'),
    productIdentifier: zodToJsonSchema(productIdentifierSchema, 'productIdentifier'),
    productRequest: zodToJsonSchema(productRequestSchema, 'productRequest'),
    productResponse: zodToJsonSchema(productResponseSchema, 'productResponse'),

    // Sales Tax Jurisdictions
    salesTaxJurisdiction: zodToJsonSchema(salesTaxJurisdictionSchema, 'salesTaxJurisdiction'),
    salesTaxJurisdictions: zodToJsonSchema(salesTaxJurisdictionsSchema, 'salesTaxJurisdictions'),

    // Common Schemas
    pagination: zodToJsonSchema(paginationSchema, 'pagination'),
    paginationInput: zodToJsonSchema(paginationInputSchema, 'paginationInput'),
    sortOrderInner: zodToJsonSchema(sortOrderInnerSchema, 'sortOrderInner'),
    sortOrderProperties: zodToJsonSchema(sortOrderPropertiesSchema, 'sortOrderProperties'),
    error: zodToJsonSchema(errorSchema, 'error'),
    errorParameter: zodToJsonSchema(errorParameterSchema, 'errorParameter'),
    amount: zodToJsonSchema(amountSchema, 'amount'),
    timeDuration: zodToJsonSchema(timeDurationSchema, 'timeDuration'),
  };
}
