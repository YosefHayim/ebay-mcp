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

export interface MetadataMarketplaceInput {
	readonly marketplaceId: string;
	readonly filter?: string | undefined;
}

export interface MetadataMarketplaceOnlyInput {
	readonly marketplaceId: string;
}

export interface GetMetadataCompatibilitiesBySpecificationInput {
	readonly marketplaceId: string;
	readonly specification: SpecificationRequest;
}

export interface GetMetadataCompatibilityPropertyNamesInput {
	readonly marketplaceId: string;
	readonly data: PropertyNamesRequest;
}

export interface GetMetadataCompatibilityPropertyValuesInput {
	readonly marketplaceId: string;
	readonly data: PropertyValuesRequest;
}

export interface GetMetadataMultiCompatibilityPropertyValuesInput {
	readonly marketplaceId: string;
	readonly data: MultiCompatibilityPropertyValuesRequest;
}

export interface GetMetadataProductCompatibilitiesInput {
	readonly marketplaceId: string;
	readonly data: ProductRequest;
}

export interface GetMetadataSalesTaxJurisdictionsInput {
	readonly countryCode: string;
}

export type AutomotivePartsCompatibilityPoliciesResponse =
	components["schemas"]["AutomotivePartsCompatibilityPolicyResponse"];

export type CategoryPoliciesResponse =
	components["schemas"]["CategoryPolicyResponse"];

export type ExtendedProducerResponsibilityPoliciesResponse =
	components["schemas"]["ExtendedProducerResponsibilityPolicyResponse"];

export type HazardousMaterialsLabelsResponse =
	components["schemas"]["HazardousMaterialDetailsResponse"];

export type ItemConditionPoliciesResponse =
	components["schemas"]["ItemConditionPolicyResponse"];

export type ListingStructurePoliciesResponse =
	components["schemas"]["ListingStructurePolicyResponse"];

export type NegotiatedPricePoliciesResponse =
	components["schemas"]["NegotiatedPricePolicyResponse"];

export type ProductSafetyLabelsResponse =
	components["schemas"]["ProductSafetyLabelsResponse"];

export type RegulatoryPoliciesResponse =
	components["schemas"]["RegulatoryPolicyResponse"];

export type ReturnPoliciesMetadataResponse =
	components["schemas"]["ReturnPolicyResponse"];

export type ClassifiedAdPoliciesResponse =
	components["schemas"]["ClassifiedAdPolicyResponse"];

export type GetCurrenciesResponse =
	components["schemas"]["GetCurrenciesResponse"];

export type ListingTypePoliciesResponse =
	components["schemas"]["ListingTypePoliciesResponse"];

export type MotorsListingPoliciesResponse =
	components["schemas"]["MotorsListingPoliciesResponse"];

export type ShippingPoliciesMetadataResponse =
	components["schemas"]["ShippingPoliciesResponse"];

export type SiteVisibilityPoliciesResponse =
	components["schemas"]["SiteVisibilityPoliciesResponse"];

export type SpecificationResponse =
	components["schemas"]["SpecificationResponse"];

export type PropertyNamesResponse =
	components["schemas"]["PropertyNamesResponse"];

export type PropertyValuesResponse =
	components["schemas"]["PropertyValuesResponse"];

export type MultiCompatibilityPropertyValuesResponse =
	components["schemas"]["MultiCompatibilityPropertyValuesResponse"];

export type ProductResponse = components["schemas"]["ProductResponse"];

export type SalesTaxJurisdictionsResponse =
	components["schemas"]["SalesTaxJurisdictions"];

interface MetadataPropertyFilter {
	readonly propertyName?: string | undefined;
	readonly propertyValue?: string | undefined;
	readonly unitOfMeasurement?: string | undefined;
	readonly url?: string | undefined;
}

interface MetadataPagination {
	readonly limit?: number | undefined;
	readonly offset?: number | undefined;
}

interface MetadataSortProperty {
	readonly order?: string | undefined;
	readonly propertyName?: string | undefined;
}

interface MetadataSortOrder {
	readonly sortOrder?: MetadataSortProperty | undefined;
	readonly sortPriority?: string | undefined;
}

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

interface PropertyNamesRequest {
	readonly categoryId?: string | undefined;
	readonly dataset?: readonly string[] | undefined;
}

interface PropertyValuesRequest {
	readonly categoryId?: string | undefined;
	readonly propertyFilters?: readonly MetadataPropertyFilter[] | undefined;
	readonly propertyName?: string | undefined;
	readonly sortOrder?: string | undefined;
}

interface MultiCompatibilityPropertyValuesRequest {
	readonly categoryId?: string | undefined;
	readonly propertyFilters?: readonly MetadataPropertyFilter[] | undefined;
	readonly propertyNames?: readonly string[] | undefined;
}

interface MetadataProductIdentifier {
	readonly ean?: string | undefined;
	readonly epid?: string | undefined;
	readonly isbn?: string | undefined;
	readonly productId?: string | undefined;
	readonly upc?: string | undefined;
}

interface MetadataDisabledProductFilter {
	readonly excludeForEbayReviews?: boolean | undefined;
	readonly excludeForEbaySelling?: boolean | undefined;
}

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

export class MetadataApi {
	private readonly basePath = "/sell/metadata/v1";

	public readonly getExcludeShippingLocations: MetadataShippingMethods["getExcludeShippingLocations"];
	public readonly getHandlingTimes: MetadataShippingMethods["getHandlingTimes"];
	public readonly getShippingCarriers: MetadataShippingMethods["getShippingCarriers"];
	public readonly getShippingLocations: MetadataShippingMethods["getShippingLocations"];
	public readonly getShippingServices: MetadataShippingMethods["getShippingServices"];

	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
		const shipping = createMetadataShippingMethods(client);
		this.getExcludeShippingLocations = shipping.getExcludeShippingLocations;
		this.getHandlingTimes = shipping.getHandlingTimes;
		this.getShippingCarriers = shipping.getShippingCarriers;
		this.getShippingLocations = shipping.getShippingLocations;
		this.getShippingServices = shipping.getShippingServices;
	}

	public getAutomotivePartsCompatibilityPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<AutomotivePartsCompatibilityPoliciesResponse> =>
		this.getFilteredMarketplaceResource(
			input,
			"get_automotive_parts_compatibility_policies",
		);

	public getCategoryPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<CategoryPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_category_policies");

	public getExtendedProducerResponsibilityPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ExtendedProducerResponsibilityPoliciesResponse> =>
		this.getFilteredMarketplaceResource(
			input,
			"get_extended_producer_responsibility_policies",
		);

	public getHazardousMaterialsLabels = (
		input: MetadataMarketplaceOnlyInput,
	): Promise<HazardousMaterialsLabelsResponse> =>
		this.getMarketplaceResource(input, "get_hazardous_materials_labels");

	public getItemConditionPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ItemConditionPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_item_condition_policies");

	public getListingStructurePolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ListingStructurePoliciesResponse> =>
		this.getFilteredMarketplaceResource(
			input,
			"get_listing_structure_policies",
		);

	public getNegotiatedPricePolicies = (
		input: MetadataMarketplaceInput,
	): Promise<NegotiatedPricePoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_negotiated_price_policies");

	public getProductSafetyLabels = (
		input: MetadataMarketplaceOnlyInput,
	): Promise<ProductSafetyLabelsResponse> =>
		this.getMarketplaceResource(input, "get_product_safety_labels");

	public getRegulatoryPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<RegulatoryPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_regulatory_policies");

	public getReturnPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ReturnPoliciesMetadataResponse> =>
		this.getFilteredMarketplaceResource(input, "get_return_policies");

	public getClassifiedAdPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ClassifiedAdPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_classified_ad_policies");

	public getCurrencies = (
		input: MetadataMarketplaceOnlyInput,
	): Promise<GetCurrenciesResponse> =>
		this.getMarketplaceResource(input, "get_currencies");

	public getListingTypePolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ListingTypePoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_listing_type_policies");

	public getMotorsListingPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<MotorsListingPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_motors_listing_policies");

	public getShippingPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<ShippingPoliciesMetadataResponse> =>
		this.getFilteredMarketplaceResource(input, "get_shipping_policies");

	public getSiteVisibilityPolicies = (
		input: MetadataMarketplaceInput,
	): Promise<SiteVisibilityPoliciesResponse> =>
		this.getFilteredMarketplaceResource(input, "get_site_visibility_policies");

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

export function compatibilityHeaders(marketplaceId: string): EbayRequestConfig {
	return {
		headers: {
			"Content-Type": "application/json",
			"X-EBAY-C-MARKETPLACE-ID": marketplaceId,
		},
	};
}
