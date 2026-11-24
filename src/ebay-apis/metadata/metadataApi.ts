import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	optionalStringEffect,
	requestGetEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellMetadataV1Oas3.js";
import { createMetadataShippingMethods } from "./metadataShippingApi.js";

type MetadataShippingMethods = ReturnType<typeof createMetadataShippingMethods>;

/** Input accepted by marketplace-scoped Metadata policy endpoints. */
export interface MetadataMarketplaceInput {
	/** eBay marketplace identifier, such as EBAY_US. */
	readonly marketplaceId: string;
	/** Optional OpenAPI filter expression, usually categoryIds:{...}. */
	readonly filter?: string | undefined;
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
	components["schemas"]["AutomotivePartsCompatibilityPolicyResponse"];

/**
 * Response returned by getCategoryPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getCategoryPolicies
 */
export type CategoryPoliciesResponse =
	components["schemas"]["CategoryPolicyResponse"];

/**
 * Response returned by getExtendedProducerResponsibilityPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getExtendedProducerResponsibilityPolicies
 */
export type ExtendedProducerResponsibilityPoliciesResponse =
	components["schemas"]["ExtendedProducerResponsibilityPolicyResponse"];

/**
 * Response returned by getHazardousMaterialsLabels.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getHazardousMaterialsLabels
 */
export type HazardousMaterialsLabelsResponse =
	components["schemas"]["HazardousMaterialDetailsResponse"];

/**
 * Response returned by getItemConditionPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getItemConditionPolicies
 */
export type ItemConditionPoliciesResponse =
	components["schemas"]["ItemConditionPolicyResponse"];

/**
 * Response returned by getListingStructurePolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getListingStructurePolicies
 */
export type ListingStructurePoliciesResponse =
	components["schemas"]["ListingStructurePolicyResponse"];

/**
 * Response returned by getNegotiatedPricePolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getNegotiatedPricePolicies
 */
export type NegotiatedPricePoliciesResponse =
	components["schemas"]["NegotiatedPricePolicyResponse"];

/**
 * Response returned by getProductSafetyLabels.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getProductSafetyLabels
 */
export type ProductSafetyLabelsResponse =
	components["schemas"]["ProductSafetyLabelsResponse"];

/**
 * Response returned by getRegulatoryPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getRegulatoryPolicies
 */
export type RegulatoryPoliciesResponse =
	components["schemas"]["RegulatoryPolicyResponse"];

/**
 * Response returned by getReturnPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getReturnPolicies
 */
export type ReturnPoliciesMetadataResponse =
	components["schemas"]["ReturnPolicyResponse"];

/**
 * Response returned by getClassifiedAdPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getClassifiedAdPolicies
 */
export type ClassifiedAdPoliciesResponse =
	components["schemas"]["ClassifiedAdPolicyResponse"];

/**
 * Response returned by getCurrencies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getCurrencies
 */
export type GetCurrenciesResponse =
	components["schemas"]["GetCurrenciesResponse"];

/**
 * Response returned by getListingTypePolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getListingTypePolicies
 */
export type ListingTypePoliciesResponse =
	components["schemas"]["ListingTypePoliciesResponse"];

/**
 * Response returned by getMotorsListingPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getMotorsListingPolicies
 */
export type MotorsListingPoliciesResponse =
	components["schemas"]["MotorsListingPoliciesResponse"];

/**
 * Response returned by getShippingPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getShippingPolicies
 */
export type ShippingPoliciesMetadataResponse =
	components["schemas"]["ShippingPoliciesResponse"];

/**
 * Response returned by getSiteVisibilityPolicies.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getSiteVisibilityPolicies
 */
export type SiteVisibilityPoliciesResponse =
	components["schemas"]["SiteVisibilityPoliciesResponse"];

/**
 * Response returned by getCompatibilitiesBySpecification.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilitiesBySpecification
 */
export type SpecificationResponse =
	components["schemas"]["SpecificationResponse"];

/**
 * Response returned by getCompatibilityPropertyNames.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilityPropertyNames
 */
export type PropertyNamesResponse =
	components["schemas"]["PropertyNamesResponse"];

/**
 * Response returned by getCompatibilityPropertyValues.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilityPropertyValues
 */
export type PropertyValuesResponse =
	components["schemas"]["PropertyValuesResponse"];

/**
 * Response returned by getMultiCompatibilityPropertyValues.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getMultiCompatibilityPropertyValues
 */
export type MultiCompatibilityPropertyValuesResponse =
	components["schemas"]["MultiCompatibilityPropertyValuesResponse"];

/**
 * Response returned by getProductCompatibilities.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getProductCompatibilities
 */
export type ProductResponse = components["schemas"]["ProductResponse"];

/**
 * Response returned by getSalesTaxJurisdictions.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/country/methods/getSalesTaxJurisdictions
 */
export type SalesTaxJurisdictionsResponse =
	components["schemas"]["SalesTaxJurisdictions"];

/** One compatibility name-value filter. Optional members may be undefined. */
interface MetadataPropertyFilter {
	readonly propertyName?: string | undefined;
	readonly propertyValue?: string | undefined;
	readonly unitOfMeasurement?: string | undefined;
	readonly url?: string | undefined;
}

/** Page window on a compatibility metadata request. */
interface MetadataPagination {
	readonly limit?: number | undefined;
	readonly offset?: number | undefined;
}

/** One property used to sort compatibility results. */
interface MetadataSortProperty {
	readonly order?: string | undefined;
	readonly propertyName?: string | undefined;
}

/** Sort step, with a priority such as Sort1. */
interface MetadataSortOrder {
	readonly sortOrder?: MetadataSortProperty | undefined;
	readonly sortPriority?: string | undefined;
}

/** Generated request body for getCompatibilitiesBySpecification. */
interface SpecificationRequest {
	readonly categoryId?: string | undefined;
	readonly compatibilityPropertyFilters?:
		| readonly MetadataPropertyFilter[]
		| undefined;
	readonly dataset?: string | undefined;
	readonly datasetPropertyName?: readonly string[] | undefined;
	readonly exactMatch?: boolean | undefined;
	readonly paginationInput?: MetadataPagination | undefined;
	readonly sortOrders?: readonly MetadataSortOrder[] | undefined;
	readonly specifications?: readonly MetadataPropertyFilter[] | undefined;
}

/** Generated request body for getCompatibilityPropertyNames. */
interface PropertyNamesRequest {
	readonly categoryId?: string | undefined;
	readonly dataset?: readonly string[] | undefined;
}

/** Generated request body for getCompatibilityPropertyValues. */
interface PropertyValuesRequest {
	readonly categoryId?: string | undefined;
	readonly propertyFilters?: readonly MetadataPropertyFilter[] | undefined;
	readonly propertyName?: string | undefined;
	readonly sortOrder?: string | undefined;
}

/** Generated request body for getMultiCompatibilityPropertyValues. */
interface MultiCompatibilityPropertyValuesRequest {
	readonly categoryId?: string | undefined;
	readonly propertyFilters?: readonly MetadataPropertyFilter[] | undefined;
	readonly propertyNames?: readonly string[] | undefined;
}

/** Product identifier on a product-compatibility request. */
interface MetadataProductIdentifier {
	readonly ean?: string | undefined;
	readonly epid?: string | undefined;
	readonly isbn?: string | undefined;
	readonly productId?: string | undefined;
	readonly upc?: string | undefined;
}

/** Flags for products eBay has blocked from selling or reviews. */
interface MetadataDisabledProductFilter {
	readonly excludeForEbayReviews?: boolean | undefined;
	readonly excludeForEbaySelling?: boolean | undefined;
}

/** Generated request body for getProductCompatibilities. */
interface ProductRequest {
	readonly applicationPropertyFilters?:
		| readonly MetadataPropertyFilter[]
		| undefined;
	readonly dataset?: readonly string[] | undefined;
	readonly datasetPropertyName?: readonly string[] | undefined;
	readonly disabledProductFilter?: MetadataDisabledProductFilter | undefined;
	readonly paginationInput?: MetadataPagination | undefined;
	readonly productIdentifier?: MetadataProductIdentifier | undefined;
	readonly sortOrders?: readonly MetadataSortOrder[] | undefined;
}

/**
 * Metadata API - marketplace policies, shipping metadata, compatibility metadata, and tax
 * jurisdictions.
 */
export class MetadataApi {
	private readonly basePath = "/sell/metadata/v1";

	/** Metadata API getExcludeShippingLocations endpoint; see createMetadataShippingMethods. */
	public readonly getExcludeShippingLocations: MetadataShippingMethods["getExcludeShippingLocations"];
	/** Metadata API getHandlingTimes endpoint; see createMetadataShippingMethods. */
	public readonly getHandlingTimes: MetadataShippingMethods["getHandlingTimes"];
	/** Metadata API getShippingCarriers endpoint; see createMetadataShippingMethods. */
	public readonly getShippingCarriers: MetadataShippingMethods["getShippingCarriers"];
	/** Metadata API getShippingLocations endpoint; see createMetadataShippingMethods. */
	public readonly getShippingLocations: MetadataShippingMethods["getShippingLocations"];
	/** Metadata API getShippingServices endpoint; see createMetadataShippingMethods. */
	public readonly getShippingServices: MetadataShippingMethods["getShippingServices"];

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
	 * @returns eBay's AutomotivePartsCompatibilityPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getAutomotivePartsCompatibilityPolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getAutomotivePartsCompatibilityPolicies
	 */
	public getAutomotivePartsCompatibilityPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<AutomotivePartsCompatibilityPoliciesResponse> =>
		this.getFilteredMarketplaceResource(
			input,
			"get_automotive_parts_compatibility_policies",
		);

	/**
	 * Retrieves category policies for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's CategoryPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getCategoryPolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getCategoryPolicies
	 */
	public getCategoryPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<CategoryPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_category_policies");

	/**
	 * Retrieves extended producer responsibility policies for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's ExtendedProducerResponsibilityPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getExtendedProducerResponsibilityPolicies({ marketplaceId: 'EBAY_DE' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getExtendedProducerResponsibilityPolicies
	 */
	public getExtendedProducerResponsibilityPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ExtendedProducerResponsibilityPoliciesResponse> =>
		this.getFilteredMarketplaceResource(
			input,
			"get_extended_producer_responsibility_policies",
		);

	/**
	 * Retrieves hazardous materials labels for a marketplace.
	 *
	 * @param input - Marketplace identifier.
	 * @returns eBay's HazardousMaterialDetailsResponse.
	 *
	 * @example
	 * ```ts
	 * const labels = await metadataApi.getHazardousMaterialsLabels({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getHazardousMaterialsLabels
	 */
	public getHazardousMaterialsLabels = (
		input: MetadataMarketplaceOnlyInput,
	): Promise<HazardousMaterialsLabelsResponse> =>
		this.getMarketplaceResource(input, "get_hazardous_materials_labels");

	/**
	 * Retrieves item condition policies for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's ItemConditionPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getItemConditionPolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getItemConditionPolicies
	 */
	public getItemConditionPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ItemConditionPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_item_condition_policies");

	/**
	 * Retrieves listing structure policies for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's ListingStructurePolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getListingStructurePolicies({ marketplaceId: 'EBAY_GB' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getListingStructurePolicies
	 */
	public getListingStructurePolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ListingStructurePoliciesResponse> =>
		this.getFilteredMarketplaceResource(
			input,
			"get_listing_structure_policies",
		);

	/**
	 * Retrieves negotiated price policies for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's NegotiatedPricePolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getNegotiatedPricePolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getNegotiatedPricePolicies
	 */
	public getNegotiatedPricePolicies = (
		input: MetadataMarketplaceInput,
	): Promise<NegotiatedPricePoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_negotiated_price_policies");

	/**
	 * Retrieves product safety labels for a marketplace.
	 *
	 * @param input - Marketplace identifier.
	 * @returns eBay's ProductSafetyLabelsResponse.
	 *
	 * @example
	 * ```ts
	 * const labels = await metadataApi.getProductSafetyLabels({ marketplaceId: 'EBAY_DE' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getProductSafetyLabels
	 */
	public getProductSafetyLabels = (
		input: MetadataMarketplaceOnlyInput,
	): Promise<ProductSafetyLabelsResponse> =>
		this.getMarketplaceResource(input, "get_product_safety_labels");

	/**
	 * Retrieves regulatory policies for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's RegulatoryPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getRegulatoryPolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getRegulatoryPolicies
	 */
	public getRegulatoryPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<RegulatoryPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_regulatory_policies");

	/**
	 * Retrieves return policy metadata for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's ReturnPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getReturnPolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getReturnPolicies
	 */
	public getReturnPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ReturnPoliciesMetadataResponse> =>
		this.getFilteredMarketplaceResource(input, "get_return_policies");

	/**
	 * Retrieves classified ad policies for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's ClassifiedAdPolicyResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getClassifiedAdPolicies({ marketplaceId: 'EBAY_MOTORS_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getClassifiedAdPolicies
	 */
	public getClassifiedAdPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ClassifiedAdPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_classified_ad_policies");

	/**
	 * Retrieves currency metadata for a marketplace.
	 *
	 * @param input - Marketplace identifier.
	 * @returns eBay's GetCurrenciesResponse.
	 *
	 * @example
	 * ```ts
	 * const currencies = await metadataApi.getCurrencies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getCurrencies
	 */
	public getCurrencies = (
		input: MetadataMarketplaceOnlyInput,
	): Promise<GetCurrenciesResponse> =>
		this.getMarketplaceResource(input, "get_currencies");

	/**
	 * Retrieves listing type policies for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's ListingTypePoliciesResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getListingTypePolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getListingTypePolicies
	 */
	public getListingTypePolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ListingTypePoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_listing_type_policies");

	/**
	 * Retrieves Motors listing policies for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's MotorsListingPoliciesResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getMotorsListingPolicies({ marketplaceId: 'EBAY_MOTORS_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getMotorsListingPolicies
	 */
	public getMotorsListingPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<MotorsListingPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_motors_listing_policies");

	/**
	 * Retrieves shipping policies for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's ShippingPoliciesResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getShippingPolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getShippingPolicies
	 */
	public getShippingPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ShippingPoliciesMetadataResponse> =>
		this.getFilteredMarketplaceResource(input, "get_shipping_policies");

	/**
	 * Retrieves site visibility policies for a marketplace.
	 *
	 * @param input - Marketplace and optional category filter.
	 * @returns eBay's SiteVisibilityPoliciesResponse.
	 *
	 * @example
	 * ```ts
	 * const policies = await metadataApi.getSiteVisibilityPolicies({ marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getSiteVisibilityPolicies
	 */
	public getSiteVisibilityPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<SiteVisibilityPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_site_visibility_policies");

	/**
	 * Retrieves compatibility records matching part specifications.
	 *
	 * @param input - Marketplace header and generated SpecificationRequest body.
	 * @returns eBay's SpecificationResponse.
	 *
	 * @example
	 * ```ts
	 * const compatibilities = await metadataApi.getCompatibilitiesBySpecification({ marketplaceId: 'EBAY_US', specification: { categoryId: '6016' }, });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilitiesBySpecification
	 */
	public getCompatibilitiesBySpecification = async (
		input: GetMetadataCompatibilitiesBySpecificationInput,
	): Promise<SpecificationResponse> => {
		const validatedInput =
			requireObjectEffect<GetMetadataCompatibilitiesBySpecificationInput>(
				input,
				"input",
			);
		const marketplaceId = requireStringEffect(
			validatedInput.marketplaceId,
			"marketplaceId",
		);
		const specificationRequest = requireObjectEffect<SpecificationRequest>(
			validatedInput.specification,
			"specification",
		);

		return requestPostEffect<SpecificationResponse>(
			this.client,
			`${this.basePath}/compatibilities/get_compatibilities_by_specification`,
			specificationRequest,
			compatibilityHeaders(marketplaceId),
		);
	};

	/**
	 * Retrieves compatibility property names for a compatibility-enabled category.
	 *
	 * @param input - Marketplace header and generated PropertyNamesRequest body.
	 * @returns eBay's PropertyNamesResponse.
	 *
	 * @example
	 * ```ts
	 * const names = await metadataApi.getCompatibilityPropertyNames({ marketplaceId: 'EBAY_US', data: { categoryId: '6016' }, });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilityPropertyNames
	 */
	public getCompatibilityPropertyNames = async (
		input: GetMetadataCompatibilityPropertyNamesInput,
	): Promise<PropertyNamesResponse> => {
		const validatedInput =
			requireObjectEffect<GetMetadataCompatibilityPropertyNamesInput>(
				input,
				"input",
			);
		const marketplaceId = requireStringEffect(
			validatedInput.marketplaceId,
			"marketplaceId",
		);
		const propertyNamesRequest = requireObjectEffect<PropertyNamesRequest>(
			validatedInput.data,
			"data",
		);

		return requestPostEffect<PropertyNamesResponse>(
			this.client,
			`${this.basePath}/compatibilities/get_compatibility_property_names`,
			propertyNamesRequest,
			compatibilityHeaders(marketplaceId),
		);
	};

	/**
	 * Retrieves compatibility property values for one property.
	 *
	 * @param input - Marketplace header and generated PropertyValuesRequest body.
	 * @returns eBay's PropertyValuesResponse.
	 *
	 * @example
	 * ```ts
	 * const values = await metadataApi.getCompatibilityPropertyValues({ marketplaceId: 'EBAY_US', data: { categoryId: '6016', propertyName: 'Make' }, });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getCompatibilityPropertyValues
	 */
	public getCompatibilityPropertyValues = async (
		input: GetMetadataCompatibilityPropertyValuesInput,
	): Promise<PropertyValuesResponse> => {
		const validatedInput =
			requireObjectEffect<GetMetadataCompatibilityPropertyValuesInput>(
				input,
				"input",
			);
		const marketplaceId = requireStringEffect(
			validatedInput.marketplaceId,
			"marketplaceId",
		);
		const propertyValuesRequest = requireObjectEffect<PropertyValuesRequest>(
			validatedInput.data,
			"data",
		);

		return requestPostEffect<PropertyValuesResponse>(
			this.client,
			`${this.basePath}/compatibilities/get_compatibility_property_values`,
			propertyValuesRequest,
			compatibilityHeaders(marketplaceId),
		);
	};

	/**
	 * Retrieves values for multiple compatibility properties.
	 *
	 * @param input - Marketplace header and generated MultiCompatibilityPropertyValuesRequest body.
	 * @returns eBay's MultiCompatibilityPropertyValuesResponse.
	 *
	 * @example
	 * ```ts
	 * const values = await metadataApi.getMultiCompatibilityPropertyValues({ marketplaceId: 'EBAY_US', data: { categoryId: '6016', propertyNames: ['Make', 'Model'] }, });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getMultiCompatibilityPropertyValues
	 */
	public getMultiCompatibilityPropertyValues = async (
		input: GetMetadataMultiCompatibilityPropertyValuesInput,
	): Promise<MultiCompatibilityPropertyValuesResponse> => {
		const validatedInput =
			requireObjectEffect<GetMetadataMultiCompatibilityPropertyValuesInput>(
				input,
				"input",
			);
		const marketplaceId = requireStringEffect(
			validatedInput.marketplaceId,
			"marketplaceId",
		);
		const multiPropertyValuesRequest =
			requireObjectEffect<MultiCompatibilityPropertyValuesRequest>(
				validatedInput.data,
				"data",
			);

		return requestPostEffect<MultiCompatibilityPropertyValuesResponse>(
			this.client,
			`${this.basePath}/compatibilities/get_multi_compatibility_property_values`,
			multiPropertyValuesRequest,
			compatibilityHeaders(marketplaceId),
		);
	};

	/**
	 * Retrieves product compatibility metadata.
	 *
	 * @param input - Marketplace header and generated ProductRequest body.
	 * @returns eBay's ProductResponse.
	 *
	 * @example
	 * ```ts
	 * const products = await metadataApi.getProductCompatibilities({ marketplaceId: 'EBAY_US', data: { categoryId: '6016' }, });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/compatibilities/methods/getProductCompatibilities
	 */
	public getProductCompatibilities = async (
		input: GetMetadataProductCompatibilitiesInput,
	): Promise<ProductResponse> => {
		const validatedInput =
			requireObjectEffect<GetMetadataProductCompatibilitiesInput>(
				input,
				"input",
			);
		const marketplaceId = requireStringEffect(
			validatedInput.marketplaceId,
			"marketplaceId",
		);
		const productRequest = requireObjectEffect<ProductRequest>(
			validatedInput.data,
			"data",
		);

		return requestPostEffect<ProductResponse>(
			this.client,
			`${this.basePath}/compatibilities/get_product_compatibilities`,
			productRequest,
			compatibilityHeaders(marketplaceId),
		);
	};

	/**
	 * Retrieves sales-tax jurisdictions for a country.
	 *
	 * @param input - Country code whose sales-tax jurisdictions should be returned.
	 * @returns eBay's SalesTaxJurisdictions response.
	 *
	 * @example
	 * ```ts
	 * const jurisdictions = await metadataApi.getSalesTaxJurisdictions({ countryCode: 'US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/country/methods/getSalesTaxJurisdictions
	 */
	public getSalesTaxJurisdictions = async (
		input: GetMetadataSalesTaxJurisdictionsInput,
	): Promise<SalesTaxJurisdictionsResponse> => {
		const validatedInput =
			requireObjectEffect<GetMetadataSalesTaxJurisdictionsInput>(
				input,
				"input",
			);
		const countryCode = requireStringEffect(
			validatedInput.countryCode,
			"countryCode",
		);

		return requestGetEffect<SalesTaxJurisdictionsResponse>(
			this.client,
			`${this.basePath}/country/${countryCode}/sales_tax_jurisdiction`,
		);
	};

	private getMarketplaceResource = async <Response>(
		input: MetadataMarketplaceOnlyInput,
		endpoint: string,
	): Promise<Response> => {
		const validatedInput = requireObjectEffect<MetadataMarketplaceOnlyInput>(
			input,
			"input",
		);
		const marketplaceId = requireStringEffect(
			validatedInput.marketplaceId,
			"marketplaceId",
		);

		return requestGetEffect<Response>(
			this.client,
			`${this.basePath}/marketplace/${marketplaceId}/${endpoint}`,
		);
	};

	private getFilteredMarketplaceResource = async <Response>(
		input: MetadataMarketplaceInput,
		endpoint: string,
	): Promise<Response> => {
		const validatedInput = requireObjectEffect<MetadataMarketplaceInput>(
			input,
			"input",
		);
		const marketplaceId = requireStringEffect(
			validatedInput.marketplaceId,
			"marketplaceId",
		);
		const filter = optionalStringEffect(validatedInput.filter, "filter");
		const params = buildEndpointParams({
			filter: { wireName: "filter", value: filter },
		});

		return requestGetEffect<Response>(
			this.client,
			`${this.basePath}/marketplace/${marketplaceId}/${endpoint}`,
			params,
		);
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
export const compatibilityHeaders = (
	marketplaceId: string,
): EbayRequestConfig => ({
	headers: {
		"Content-Type": "application/json",
		"X-EBAY-C-MARKETPLACE-ID": marketplaceId,
	},
});
