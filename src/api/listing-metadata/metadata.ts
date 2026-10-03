import type { EbayApiClient, EbayRequestConfig } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  type EndpointInputError,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
  optionalStringEffect,
} from '@/api/shared/request.js';
import type { components } from '@/types/sell-apps/listing-metadata/sellMetadataV1Oas3.js';
import { Effect } from 'effect';
import { createMetadataShippingMethods } from './metadataShipping.js';

type MetadataShippingMethods = ReturnType<typeof createMetadataShippingMethods>;

/** Input accepted by marketplace-scoped Metadata policy endpoints. */
export interface MetadataMarketplaceInput {
  /** eBay marketplace identifier, such as EBAY_US. */
  readonly marketplaceId: string;
  /** Optional OpenAPI filter expression, usually categoryIds:{...}. */
  readonly filter?: string;
}

/** Input accepted by marketplace-scoped Metadata endpoints with no filter. */
export interface MetadataMarketplaceOnlyInput {
  /** eBay marketplace identifier, such as EBAY_US. */
  readonly marketplaceId: string;
}

/** Input accepted by Metadata getCompatibilitiesBySpecification. */
export interface GetMetadataCompatibilitiesBySpecificationInput {
  /** Marketplace header required by compatibility metadata endpoints. */
  readonly marketplaceId: string;
  /** Generated SpecificationRequest body. */
  readonly specification: SpecificationRequest;
}

/** Input accepted by Metadata getCompatibilityPropertyNames. */
export interface GetMetadataCompatibilityPropertyNamesInput {
  /** Marketplace header required by compatibility metadata endpoints. */
  readonly marketplaceId: string;
  /** Generated PropertyNamesRequest body. */
  readonly data: PropertyNamesRequest;
}

/** Input accepted by Metadata getCompatibilityPropertyValues. */
export interface GetMetadataCompatibilityPropertyValuesInput {
  /** Marketplace header required by compatibility metadata endpoints. */
  readonly marketplaceId: string;
  /** Generated PropertyValuesRequest body. */
  readonly data: PropertyValuesRequest;
}

/** Input accepted by Metadata getMultiCompatibilityPropertyValues. */
export interface GetMetadataMultiCompatibilityPropertyValuesInput {
  /** Marketplace header required by compatibility metadata endpoints. */
  readonly marketplaceId: string;
  /** Generated MultiCompatibilityPropertyValuesRequest body. */
  readonly data: MultiCompatibilityPropertyValuesRequest;
}

/** Input accepted by Metadata getProductCompatibilities. */
export interface GetMetadataProductCompatibilitiesInput {
  /** Marketplace header required by compatibility metadata endpoints. */
  readonly marketplaceId: string;
  /** Generated ProductRequest body. */
  readonly data: ProductRequest;
}

/** Input accepted by Metadata getSalesTaxJurisdictions. */
export interface GetMetadataSalesTaxJurisdictionsInput {
  /** Two-letter ISO country code, currently US or CA for eBay sales-tax tables. */
  readonly countryCode: string;
}

/**
 * Response returned by getAutomotivePartsCompatibilityPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getAutomotivePartsCompatibilityPolicies
 */
export type AutomotivePartsCompatibilityPoliciesResponse =
  components['schemas']['AutomotivePartsCompatibilityPolicyResponse'];

/**
 * Response returned by getCategoryPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getCategoryPolicies
 */
export type CategoryPoliciesResponse = components['schemas']['CategoryPolicyResponse'];

/**
 * Response returned by getExtendedProducerResponsibilityPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getExtendedProducerResponsibilityPolicies
 */
export type ExtendedProducerResponsibilityPoliciesResponse =
  components['schemas']['ExtendedProducerResponsibilityPolicyResponse'];

/**
 * Response returned by getHazardousMaterialsLabels.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getHazardousMaterialsLabels
 */
export type HazardousMaterialsLabelsResponse =
  components['schemas']['HazardousMaterialDetailsResponse'];

/**
 * Response returned by getItemConditionPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getItemConditionPolicies
 */
export type ItemConditionPoliciesResponse = components['schemas']['ItemConditionPolicyResponse'];

/**
 * Response returned by getListingStructurePolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getListingStructurePolicies
 */
export type ListingStructurePoliciesResponse =
  components['schemas']['ListingStructurePolicyResponse'];

/**
 * Response returned by getNegotiatedPricePolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getNegotiatedPricePolicies
 */
export type NegotiatedPricePoliciesResponse =
  components['schemas']['NegotiatedPricePolicyResponse'];

/**
 * Response returned by getProductSafetyLabels.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getProductSafetyLabels
 */
export type ProductSafetyLabelsResponse = components['schemas']['ProductSafetyLabelsResponse'];

/**
 * Response returned by getRegulatoryPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getRegulatoryPolicies
 */
export type RegulatoryPoliciesResponse = components['schemas']['RegulatoryPolicyResponse'];

/**
 * Response returned by getReturnPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getReturnPolicies
 */
export type ReturnPoliciesMetadataResponse = components['schemas']['ReturnPolicyResponse'];

/**
 * Response returned by getClassifiedAdPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getClassifiedAdPolicies
 */
export type ClassifiedAdPoliciesResponse = components['schemas']['ClassifiedAdPolicyResponse'];

/**
 * Response returned by getCurrencies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getCurrencies
 */
export type GetCurrenciesResponse = components['schemas']['GetCurrenciesResponse'];

/**
 * Response returned by getListingTypePolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getListingTypePolicies
 */
export type ListingTypePoliciesResponse = components['schemas']['ListingTypePoliciesResponse'];

/**
 * Response returned by getMotorsListingPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getMotorsListingPolicies
 */
export type MotorsListingPoliciesResponse = components['schemas']['MotorsListingPoliciesResponse'];

/**
 * Response returned by getShippingPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getShippingPolicies
 */
export type ShippingPoliciesMetadataResponse = components['schemas']['ShippingPoliciesResponse'];

/**
 * Response returned by getSiteVisibilityPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getSiteVisibilityPolicies
 */
export type SiteVisibilityPoliciesResponse =
  components['schemas']['SiteVisibilityPoliciesResponse'];

/**
 * Response returned by getCompatibilitiesBySpecification.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilitiesBySpecification
 */
export type SpecificationResponse = components['schemas']['SpecificationResponse'];

/**
 * Response returned by getCompatibilityPropertyNames.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilityPropertyNames
 */
export type PropertyNamesResponse = components['schemas']['PropertyNamesResponse'];

/**
 * Response returned by getCompatibilityPropertyValues.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilityPropertyValues
 */
export type PropertyValuesResponse = components['schemas']['PropertyValuesResponse'];

/**
 * Response returned by getMultiCompatibilityPropertyValues.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getMultiCompatibilityPropertyValues
 */
export type MultiCompatibilityPropertyValuesResponse =
  components['schemas']['MultiCompatibilityPropertyValuesResponse'];

/**
 * Response returned by getProductCompatibilities.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getProductCompatibilities
 */
export type ProductResponse = components['schemas']['ProductResponse'];

/**
 * Response returned by getSalesTaxJurisdictions.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/country/methods/getSalesTaxJurisdictions
 */
export type SalesTaxJurisdictionsResponse = components['schemas']['SalesTaxJurisdictions'];

/** Generated request body for getCompatibilitiesBySpecification. */
type SpecificationRequest = components['schemas']['SpecificationRequest'];
/** Generated request body for getCompatibilityPropertyNames. */
type PropertyNamesRequest = components['schemas']['PropertyNamesRequest'];
/** Generated request body for getCompatibilityPropertyValues. */
type PropertyValuesRequest = components['schemas']['PropertyValuesRequest'];
/** Generated request body for getMultiCompatibilityPropertyValues. */
type MultiCompatibilityPropertyValuesRequest =
  components['schemas']['MultiCompatibilityPropertyValuesRequest'];
/** Generated request body for getProductCompatibilities. */
type ProductRequest = components['schemas']['ProductRequest'];

/**
 * Metadata API - marketplace policies, shipping metadata, compatibility metadata, and tax
 * jurisdictions.
 */
export class MetadataApi {
  private readonly basePath = '/sell/metadata/v1';

  /** Metadata API getExcludeShippingLocations endpoint; see createMetadataShippingMethods. */
  public readonly getExcludeShippingLocations: MetadataShippingMethods['getExcludeShippingLocations'];
  /** Metadata API getHandlingTimes endpoint; see createMetadataShippingMethods. */
  public readonly getHandlingTimes: MetadataShippingMethods['getHandlingTimes'];
  /** Metadata API getShippingCarriers endpoint; see createMetadataShippingMethods. */
  public readonly getShippingCarriers: MetadataShippingMethods['getShippingCarriers'];
  /** Metadata API getShippingLocations endpoint; see createMetadataShippingMethods. */
  public readonly getShippingLocations: MetadataShippingMethods['getShippingLocations'];
  /** Metadata API getShippingServices endpoint; see createMetadataShippingMethods. */
  public readonly getShippingServices: MetadataShippingMethods['getShippingServices'];

  public constructor(private readonly client: EbayApiClient) {
    const shipping = createMetadataShippingMethods(client);
    this.getExcludeShippingLocations = shipping.getExcludeShippingLocations;
    this.getHandlingTimes = shipping.getHandlingTimes;
    this.getShippingCarriers = shipping.getShippingCarriers;
    this.getShippingLocations = shipping.getShippingLocations;
    this.getShippingServices = shipping.getShippingServices;
  }

  /**
   * Retrieves automotive parts compatibility policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's AutomotivePartsCompatibilityPolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getAutomotivePartsCompatibilityPolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getAutomotivePartsCompatibilityPolicies
   */
  public getAutomotivePartsCompatibilityPolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<
    AutomotivePartsCompatibilityPoliciesResponse,
    EbayApiError | EndpointInputError
  > =>
    this.getFilteredMarketplaceResource(
      input,
      'get_automotive_parts_compatibility_policies',
      'getAutomotivePartsCompatibilityPolicies',
    );

  /**
   * Retrieves category policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's CategoryPolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getCategoryPolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getCategoryPolicies
   */
  public getCategoryPolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<CategoryPoliciesResponse, EbayApiError | EndpointInputError> =>
    this.getFilteredMarketplaceResource(input, 'get_category_policies', 'getCategoryPolicies');

  /**
   * Retrieves extended producer responsibility policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's ExtendedProducerResponsibilityPolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getExtendedProducerResponsibilityPolicies({ marketplaceId: 'EBAY_DE' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getExtendedProducerResponsibilityPolicies
   */
  public getExtendedProducerResponsibilityPolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<
    ExtendedProducerResponsibilityPoliciesResponse,
    EbayApiError | EndpointInputError
  > =>
    this.getFilteredMarketplaceResource(
      input,
      'get_extended_producer_responsibility_policies',
      'getExtendedProducerResponsibilityPolicies',
    );

  /**
   * Retrieves hazardous materials labels for a marketplace.
   *
   * @param input - Marketplace identifier.
   * @returns An Effect that succeeds with eBay's HazardousMaterialDetailsResponse.
   *
   * @example
   * ```ts
   * const labels = await Effect.runPromise(
   *   metadataApi.getHazardousMaterialsLabels({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getHazardousMaterialsLabels
   */
  public getHazardousMaterialsLabels = (
    input: MetadataMarketplaceOnlyInput,
  ): Effect.Effect<HazardousMaterialsLabelsResponse, EbayApiError | EndpointInputError> =>
    this.getMarketplaceResource(
      input,
      'get_hazardous_materials_labels',
      'getHazardousMaterialsLabels',
    );

  /**
   * Retrieves item condition policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's ItemConditionPolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getItemConditionPolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getItemConditionPolicies
   */
  public getItemConditionPolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<ItemConditionPoliciesResponse, EbayApiError | EndpointInputError> =>
    this.getFilteredMarketplaceResource(
      input,
      'get_item_condition_policies',
      'getItemConditionPolicies',
    );

  /**
   * Retrieves listing structure policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's ListingStructurePolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getListingStructurePolicies({ marketplaceId: 'EBAY_GB' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getListingStructurePolicies
   */
  public getListingStructurePolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<ListingStructurePoliciesResponse, EbayApiError | EndpointInputError> =>
    this.getFilteredMarketplaceResource(
      input,
      'get_listing_structure_policies',
      'getListingStructurePolicies',
    );

  /**
   * Retrieves negotiated price policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's NegotiatedPricePolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getNegotiatedPricePolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getNegotiatedPricePolicies
   */
  public getNegotiatedPricePolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<NegotiatedPricePoliciesResponse, EbayApiError | EndpointInputError> =>
    this.getFilteredMarketplaceResource(
      input,
      'get_negotiated_price_policies',
      'getNegotiatedPricePolicies',
    );

  /**
   * Retrieves product safety labels for a marketplace.
   *
   * @param input - Marketplace identifier.
   * @returns An Effect that succeeds with eBay's ProductSafetyLabelsResponse.
   *
   * @example
   * ```ts
   * const labels = await Effect.runPromise(
   *   metadataApi.getProductSafetyLabels({ marketplaceId: 'EBAY_DE' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getProductSafetyLabels
   */
  public getProductSafetyLabels = (
    input: MetadataMarketplaceOnlyInput,
  ): Effect.Effect<ProductSafetyLabelsResponse, EbayApiError | EndpointInputError> =>
    this.getMarketplaceResource(input, 'get_product_safety_labels', 'getProductSafetyLabels');

  /**
   * Retrieves regulatory policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's RegulatoryPolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getRegulatoryPolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getRegulatoryPolicies
   */
  public getRegulatoryPolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<RegulatoryPoliciesResponse, EbayApiError | EndpointInputError> =>
    this.getFilteredMarketplaceResource(input, 'get_regulatory_policies', 'getRegulatoryPolicies');

  /**
   * Retrieves return policy metadata for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's ReturnPolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getReturnPolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getReturnPolicies
   */
  public getReturnPolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<ReturnPoliciesMetadataResponse, EbayApiError | EndpointInputError> =>
    this.getFilteredMarketplaceResource(input, 'get_return_policies', 'getReturnPolicies');

  /**
   * Retrieves classified ad policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's ClassifiedAdPolicyResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getClassifiedAdPolicies({ marketplaceId: 'EBAY_MOTORS_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getClassifiedAdPolicies
   */
  public getClassifiedAdPolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<ClassifiedAdPoliciesResponse, EbayApiError | EndpointInputError> =>
    this.getFilteredMarketplaceResource(
      input,
      'get_classified_ad_policies',
      'getClassifiedAdPolicies',
    );

  /**
   * Retrieves currency metadata for a marketplace.
   *
   * @param input - Marketplace identifier.
   * @returns An Effect that succeeds with eBay's GetCurrenciesResponse.
   *
   * @example
   * ```ts
   * const currencies = await Effect.runPromise(metadataApi.getCurrencies({ marketplaceId: 'EBAY_US' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getCurrencies
   */
  public getCurrencies = (
    input: MetadataMarketplaceOnlyInput,
  ): Effect.Effect<GetCurrenciesResponse, EbayApiError | EndpointInputError> =>
    this.getMarketplaceResource(input, 'get_currencies', 'getCurrencies');

  /**
   * Retrieves listing type policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's ListingTypePoliciesResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getListingTypePolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getListingTypePolicies
   */
  public getListingTypePolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<ListingTypePoliciesResponse, EbayApiError | EndpointInputError> =>
    this.getFilteredMarketplaceResource(
      input,
      'get_listing_type_policies',
      'getListingTypePolicies',
    );

  /**
   * Retrieves Motors listing policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's MotorsListingPoliciesResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getMotorsListingPolicies({ marketplaceId: 'EBAY_MOTORS_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getMotorsListingPolicies
   */
  public getMotorsListingPolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<MotorsListingPoliciesResponse, EbayApiError | EndpointInputError> =>
    this.getFilteredMarketplaceResource(
      input,
      'get_motors_listing_policies',
      'getMotorsListingPolicies',
    );

  /**
   * Retrieves shipping policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's ShippingPoliciesResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getShippingPolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getShippingPolicies
   */
  public getShippingPolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<ShippingPoliciesMetadataResponse, EbayApiError | EndpointInputError> =>
    this.getFilteredMarketplaceResource(input, 'get_shipping_policies', 'getShippingPolicies');

  /**
   * Retrieves site visibility policies for a marketplace.
   *
   * @param input - Marketplace and optional category filter.
   * @returns An Effect that succeeds with eBay's SiteVisibilityPoliciesResponse.
   *
   * @example
   * ```ts
   * const policies = await Effect.runPromise(
   *   metadataApi.getSiteVisibilityPolicies({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getSiteVisibilityPolicies
   */
  public getSiteVisibilityPolicies = (
    input: MetadataMarketplaceInput,
  ): Effect.Effect<SiteVisibilityPoliciesResponse, EbayApiError | EndpointInputError> =>
    this.getFilteredMarketplaceResource(
      input,
      'get_site_visibility_policies',
      'getSiteVisibilityPolicies',
    );

  /**
   * Retrieves compatibility records matching part specifications.
   *
   * @param input - Marketplace header and generated SpecificationRequest body.
   * @returns An Effect that succeeds with eBay's SpecificationResponse.
   *
   * @example
   * ```ts
   * const compatibilities = await Effect.runPromise(
   *   metadataApi.getCompatibilitiesBySpecification({
   *     marketplaceId: 'EBAY_US',
   *     specification: { categoryId: '6016' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilitiesBySpecification
   */
  public getCompatibilitiesBySpecification = (
    input: GetMetadataCompatibilitiesBySpecificationInput,
  ): Effect.Effect<SpecificationResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/compatibilities/get_compatibilities_by_specification`;

    return Effect.gen(function* () {
      const validatedInput =
        yield* requireObjectEffect<GetMetadataCompatibilitiesBySpecificationInput>(input, 'input');
      const marketplaceId = yield* requireStringEffect(
        validatedInput.marketplaceId,
        'marketplaceId',
      );
      const specificationRequest = yield* requireObjectEffect<SpecificationRequest>(
        validatedInput.specification,
        'specification',
      );

      return yield* requestPostEffect<SpecificationResponse>(
        client,
        path,
        specificationRequest,
        compatibilityHeaders(marketplaceId),
      );
    });
  };

  /**
   * Retrieves compatibility property names for a compatibility-enabled category.
   *
   * @param input - Marketplace header and generated PropertyNamesRequest body.
   * @returns An Effect that succeeds with eBay's PropertyNamesResponse.
   *
   * @example
   * ```ts
   * const names = await Effect.runPromise(
   *   metadataApi.getCompatibilityPropertyNames({
   *     marketplaceId: 'EBAY_US',
   *     data: { categoryId: '6016' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilityPropertyNames
   */
  public getCompatibilityPropertyNames = (
    input: GetMetadataCompatibilityPropertyNamesInput,
  ): Effect.Effect<PropertyNamesResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/compatibilities/get_compatibility_property_names`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetMetadataCompatibilityPropertyNamesInput>(
        input,
        'input',
      );
      const marketplaceId = yield* requireStringEffect(
        validatedInput.marketplaceId,
        'marketplaceId',
      );
      const propertyNamesRequest = yield* requireObjectEffect<PropertyNamesRequest>(
        validatedInput.data,
        'data',
      );

      return yield* requestPostEffect<PropertyNamesResponse>(
        client,
        path,
        propertyNamesRequest,
        compatibilityHeaders(marketplaceId),
      );
    });
  };

  /**
   * Retrieves compatibility property values for one property.
   *
   * @param input - Marketplace header and generated PropertyValuesRequest body.
   * @returns An Effect that succeeds with eBay's PropertyValuesResponse.
   *
   * @example
   * ```ts
   * const values = await Effect.runPromise(
   *   metadataApi.getCompatibilityPropertyValues({
   *     marketplaceId: 'EBAY_US',
   *     data: { categoryId: '6016', propertyName: 'Make' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilityPropertyValues
   */
  public getCompatibilityPropertyValues = (
    input: GetMetadataCompatibilityPropertyValuesInput,
  ): Effect.Effect<PropertyValuesResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/compatibilities/get_compatibility_property_values`;

    return Effect.gen(function* () {
      const validatedInput =
        yield* requireObjectEffect<GetMetadataCompatibilityPropertyValuesInput>(input, 'input');
      const marketplaceId = yield* requireStringEffect(
        validatedInput.marketplaceId,
        'marketplaceId',
      );
      const propertyValuesRequest = yield* requireObjectEffect<PropertyValuesRequest>(
        validatedInput.data,
        'data',
      );

      return yield* requestPostEffect<PropertyValuesResponse>(
        client,
        path,
        propertyValuesRequest,
        compatibilityHeaders(marketplaceId),
      );
    });
  };

  /**
   * Retrieves values for multiple compatibility properties.
   *
   * @param input - Marketplace header and generated MultiCompatibilityPropertyValuesRequest body.
   * @returns An Effect that succeeds with eBay's MultiCompatibilityPropertyValuesResponse.
   *
   * @example
   * ```ts
   * const values = await Effect.runPromise(
   *   metadataApi.getMultiCompatibilityPropertyValues({
   *     marketplaceId: 'EBAY_US',
   *     data: { categoryId: '6016', propertyNames: ['Make', 'Model'] },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getMultiCompatibilityPropertyValues
   */
  public getMultiCompatibilityPropertyValues = (
    input: GetMetadataMultiCompatibilityPropertyValuesInput,
  ): Effect.Effect<MultiCompatibilityPropertyValuesResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/compatibilities/get_multi_compatibility_property_values`;

    return Effect.gen(function* () {
      const validatedInput =
        yield* requireObjectEffect<GetMetadataMultiCompatibilityPropertyValuesInput>(
          input,
          'input',
        );
      const marketplaceId = yield* requireStringEffect(
        validatedInput.marketplaceId,
        'marketplaceId',
      );
      const multiPropertyValuesRequest =
        yield* requireObjectEffect<MultiCompatibilityPropertyValuesRequest>(
          validatedInput.data,
          'data',
        );

      return yield* requestPostEffect<MultiCompatibilityPropertyValuesResponse>(
        client,
        path,
        multiPropertyValuesRequest,
        compatibilityHeaders(marketplaceId),
      );
    });
  };

  /**
   * Retrieves product compatibility metadata.
   *
   * @param input - Marketplace header and generated ProductRequest body.
   * @returns An Effect that succeeds with eBay's ProductResponse.
   *
   * @example
   * ```ts
   * const products = await Effect.runPromise(
   *   metadataApi.getProductCompatibilities({
   *     marketplaceId: 'EBAY_US',
   *     data: { categoryId: '6016' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getProductCompatibilities
   */
  public getProductCompatibilities = (
    input: GetMetadataProductCompatibilitiesInput,
  ): Effect.Effect<ProductResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/compatibilities/get_product_compatibilities`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetMetadataProductCompatibilitiesInput>(
        input,
        'input',
      );
      const marketplaceId = yield* requireStringEffect(
        validatedInput.marketplaceId,
        'marketplaceId',
      );
      const productRequest = yield* requireObjectEffect<ProductRequest>(
        validatedInput.data,
        'data',
      );

      return yield* requestPostEffect<ProductResponse>(
        client,
        path,
        productRequest,
        compatibilityHeaders(marketplaceId),
      );
    });
  };

  /**
   * Retrieves sales-tax jurisdictions for a country.
   *
   * @param input - Country code whose sales-tax jurisdictions should be returned.
   * @returns An Effect that succeeds with eBay's SalesTaxJurisdictions response.
   *
   * @example
   * ```ts
   * const jurisdictions = await Effect.runPromise(
   *   metadataApi.getSalesTaxJurisdictions({ countryCode: 'US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/metadata/resources/country/methods/getSalesTaxJurisdictions
   */
  public getSalesTaxJurisdictions = (
    input: GetMetadataSalesTaxJurisdictionsInput,
  ): Effect.Effect<SalesTaxJurisdictionsResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetMetadataSalesTaxJurisdictionsInput>(
        input,
        'input',
      );
      const countryCode = yield* requireStringEffect(validatedInput.countryCode, 'countryCode');

      return yield* requestGetEffect<SalesTaxJurisdictionsResponse>(
        client,
        `${basePath}/country/${countryCode}/sales_tax_jurisdiction`,
      );
    });
  };

  private getMarketplaceResource = <Response>(
    input: MetadataMarketplaceOnlyInput,
    endpoint: string,
    parameterName: string,
  ): Effect.Effect<Response, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<MetadataMarketplaceOnlyInput>(
        input,
        'input',
      );
      const marketplaceId = yield* requireStringEffect(
        validatedInput.marketplaceId,
        'marketplaceId',
      );

      return yield* requestGetEffect<Response>(
        client,
        `${basePath}/marketplace/${marketplaceId}/${endpoint}`,
      );
    }).pipe(Effect.withSpan(`metadata.${parameterName}`));
  };

  private getFilteredMarketplaceResource = <Response>(
    input: MetadataMarketplaceInput,
    endpoint: string,
    parameterName: string,
  ): Effect.Effect<Response, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<MetadataMarketplaceInput>(input, 'input');
      const marketplaceId = yield* requireStringEffect(
        validatedInput.marketplaceId,
        'marketplaceId',
      );
      const filter = yield* optionalStringEffect(validatedInput.filter, 'filter');
      const params = buildEndpointParams({
        filter: { wireName: 'filter', value: filter },
      });

      return yield* requestGetEffect<Response>(
        client,
        `${basePath}/marketplace/${marketplaceId}/${endpoint}`,
        params,
      );
    }).pipe(Effect.withSpan(`metadata.${parameterName}`));
  };
}

/**
 * Builds required headers for Metadata compatibility POST endpoints.
 *
 * @param marketplaceId - eBay marketplace identifier sent as X-EBAY-C-MARKETPLACE-ID.
 * @returns Request config with the compatibility headers required by the OpenAPI spec.
 *
 * @example
 * ```ts
 * const config = compatibilityHeaders('EBAY_US');
 * ```
 */
export const compatibilityHeaders = (marketplaceId: string): EbayRequestConfig => ({
  headers: {
    'Content-Type': 'application/json',
    'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
  },
});
