import type { z } from "zod";
import { shippingMetadataInputSchema } from "@/ebay-apis/metadata/metadataShippingSchemas.js";
import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import {
	decodeEndpointInputEffect,
	requestGetEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellMetadataV1Oas3.js";

const SHIPPING_MARKETPLACE_PATH = "/sell/metadata/v1/shipping/marketplace";

/** Marketplace and optional Accept-Language accepted by every Metadata shipping method. */
export type ShippingMetadataInput = z.infer<typeof shippingMetadataInputSchema>;

/**
 * Response returned by getExcludeShippingLocations.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/shipping:marketplace/methods/getExcludeShippingLocations
 */
export type ExcludeShippingLocationsResponse =
	components["schemas"]["ShippingExcludeLocationResponse"];

/**
 * Response returned by getHandlingTimes.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/shipping:marketplace/methods/getHandlingTimes
 */
export type HandlingTimesResponse =
	components["schemas"]["ShippingHandlingTimeResponse"];

/**
 * Response returned by getShippingCarriers.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/shipping:marketplace/methods/getShippingCarriers
 */
export type ShippingCarriersResponse =
	components["schemas"]["ShippingCarrierResponse"];

/**
 * Response returned by getShippingLocations.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/shipping:marketplace/methods/getShippingLocations
 */
export type ShippingLocationsResponse =
	components["schemas"]["ShippingLocationResponse"];

/**
 * Response returned by getShippingServices.
 *
 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/shipping:marketplace/methods/getShippingServices
 */
export type ShippingServicesResponse =
	components["schemas"]["ShippingServiceResponse"];

/**
 * Creates the Metadata API `shipping:marketplace` endpoint methods composed into MetadataApi.
 *
 * @param client - Shared authenticated eBay REST client.
 * @returns Endpoint methods keyed by their eBay operationId.
 *
 * @example
 * ```ts
 * const shipping = createMetadataShippingMethods(client);
 * const carriers = await shipping.getShippingCarriers({ marketplaceId: MarketplaceId.EBAY_US });
 * ```
 */
export const createMetadataShippingMethods = (client: EbayApiClient) => {
	const getShippingResource = async <Response>(
		input: ShippingMetadataInput,
		resource: string,
	): Promise<Response> => {
		const { marketplaceId, acceptLanguage } = decodeEndpointInputEffect(
			shippingMetadataInputSchema,
			input,
		);
		const path = `${SHIPPING_MARKETPLACE_PATH}/${encodeURIComponent(marketplaceId)}/${resource}`;
		const hasAcceptLanguage = acceptLanguage !== undefined;

		if (hasAcceptLanguage) {
			const config: EbayRequestConfig = {
				headers: { "Accept-Language": acceptLanguage },
			};

			return requestGetEffect<Response>(client, path, undefined, config);
		}

		return requestGetEffect<Response>(client, path);
	};

	/**
	 * Retrieves the locations a seller can exclude from shipping on a marketplace.
	 *
	 * @param input - Marketplace ID and optional Accept-Language (fr-CA, fr-BE, nl-BE).
	 * @returns eBay's ShippingExcludeLocationResponse.
	 *
	 * @example
	 * ```ts
	 * const excluded = await metadataApi.getExcludeShippingLocations({ marketplaceId: MarketplaceId.EBAY_US });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/shipping:marketplace/methods/getExcludeShippingLocations
	 */
	const getExcludeShippingLocations = (input: ShippingMetadataInput) =>
		getShippingResource<ExcludeShippingLocationsResponse>(
			input,
			"get_exclude_shipping_locations",
		);

	/**
	 * Retrieves the handling times a marketplace allows for shipping after cleared payment.
	 *
	 * @param input - Marketplace ID and optional Accept-Language (fr-CA, fr-BE, nl-BE).
	 * @returns eBay's ShippingHandlingTimeResponse.
	 *
	 * @example
	 * ```ts
	 * const times = await metadataApi.getHandlingTimes({ marketplaceId: MarketplaceId.EBAY_GB });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/shipping:marketplace/methods/getHandlingTimes
	 */
	const getHandlingTimes = (input: ShippingMetadataInput) =>
		getShippingResource<HandlingTimesResponse>(input, "get_handling_times");

	/**
	 * Retrieves the shipping carriers supported on a marketplace, including the carrier enum
	 * values required when supplying shipment tracking.
	 *
	 * @param input - Marketplace ID and optional Accept-Language (fr-CA, fr-BE, nl-BE).
	 * @returns eBay's ShippingCarrierResponse.
	 *
	 * @example
	 * ```ts
	 * const carriers = await metadataApi.getShippingCarriers({ marketplaceId: MarketplaceId.EBAY_US });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/shipping:marketplace/methods/getShippingCarriers
	 */
	const getShippingCarriers = (input: ShippingMetadataInput) =>
		getShippingResource<ShippingCarriersResponse>(
			input,
			"get_shipping_carriers",
		);

	/**
	 * Retrieves the regions, countries, and special locations a seller can ship to.
	 *
	 * @param input - Marketplace ID and optional Accept-Language (fr-CA, fr-BE, nl-BE).
	 * @returns eBay's ShippingLocationResponse.
	 *
	 * @example
	 * ```ts
	 * const locations = await metadataApi.getShippingLocations({ marketplaceId: MarketplaceId.EBAY_DE });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/shipping:marketplace/methods/getShippingLocations
	 */
	const getShippingLocations = (input: ShippingMetadataInput) =>
		getShippingResource<ShippingLocationsResponse>(
			input,
			"get_shipping_locations",
		);

	/**
	 * Retrieves the shipping services available on a marketplace, with shipping times and
	 * package limits.
	 *
	 * @param input - Marketplace ID and optional Accept-Language (fr-CA, fr-BE, nl-BE).
	 * @returns eBay's ShippingServiceResponse.
	 *
	 * @example
	 * ```ts
	 * const services = await metadataApi.getShippingServices({ marketplaceId: MarketplaceId.EBAY_CA, acceptLanguage: 'fr-CA' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/metadata/resources/shipping:marketplace/methods/getShippingServices
	 */
	const getShippingServices = (input: ShippingMetadataInput) =>
		getShippingResource<ShippingServicesResponse>(
			input,
			"get_shipping_services",
		);

	return {
		getExcludeShippingLocations,
		getHandlingTimes,
		getShippingCarriers,
		getShippingLocations,
		getShippingServices,
	};
};
