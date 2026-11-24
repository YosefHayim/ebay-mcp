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

export type ShippingMetadataInput = z.infer<typeof shippingMetadataInputSchema>;

export type ExcludeShippingLocationsResponse =
	components["schemas"]["ShippingExcludeLocationResponse"];

export type HandlingTimesResponse =
	components["schemas"]["ShippingHandlingTimeResponse"];

export type ShippingCarriersResponse =
	components["schemas"]["ShippingCarrierResponse"];

export type ShippingLocationsResponse =
	components["schemas"]["ShippingLocationResponse"];

export type ShippingServicesResponse =
	components["schemas"]["ShippingServiceResponse"];

export function createMetadataShippingMethods(client: EbayApiClient) {
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

	const getExcludeShippingLocations = (input: ShippingMetadataInput) =>
		getShippingResource<ExcludeShippingLocationsResponse>(
			input,
			"get_exclude_shipping_locations",
		);

	const getHandlingTimes = (input: ShippingMetadataInput) =>
		getShippingResource<HandlingTimesResponse>(input, "get_handling_times");

	const getShippingCarriers = (input: ShippingMetadataInput) =>
		getShippingResource<ShippingCarriersResponse>(
			input,
			"get_shipping_carriers",
		);

	const getShippingLocations = (input: ShippingMetadataInput) =>
		getShippingResource<ShippingLocationsResponse>(
			input,
			"get_shipping_locations",
		);

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
}
