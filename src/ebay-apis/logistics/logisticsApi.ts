import type { z } from "zod";
import type {
	createFromShippingQuoteInputSchema,
	createShippingQuoteInputSchema,
	shipmentIdInputSchema,
	shippingQuoteIdInputSchema,
} from "@/ebay-apis/logistics/logisticsSchemas.js";
import {
	type DownloadedFile,
	requestDownloadEffect,
} from "@/ebay-client/download.js";
import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import {
	optionalStringEffect,
	requestGetEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellLogisticsV1Oas3.js";

type ShippingQuoteRequest = components["schemas"]["ShippingQuoteRequest"];
type CreateShipmentFromQuoteRequest =
	components["schemas"]["CreateShipmentFromQuoteRequest"];
type CreateShippingQuoteInput = z.infer<typeof createShippingQuoteInputSchema>;
type CreateFromShippingQuoteInput = z.infer<
	typeof createFromShippingQuoteInputSchema
>;
type ShippingQuoteIdInput = z.infer<typeof shippingQuoteIdInputSchema>;
type ShipmentIdInput = z.infer<typeof shipmentIdInputSchema>;

function marketplaceConfig(
	marketplaceId: string | undefined,
): EbayRequestConfig | undefined {
	return marketplaceId === undefined
		? undefined
		: { headers: { "X-EBAY-C-MARKETPLACE-ID": marketplaceId } };
}

export type ShippingQuoteResponse = components["schemas"]["ShippingQuote"];

export type ShipmentResponse = components["schemas"]["Shipment"];

export class LogisticsApi {
	private readonly basePath = "/sell/logistics/v1_beta";
	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	public createShippingQuote = async (
		input: CreateShippingQuoteInput,
	): Promise<ShippingQuoteResponse> => {
		const endpointInput = requireObjectEffect<CreateShippingQuoteInput>(
			input,
			"input",
		);
		const shippingQuoteRequest = requireObjectEffect<ShippingQuoteRequest>(
			endpointInput.shippingQuoteRequest,
			"shippingQuoteRequest",
		);
		const marketplaceId = optionalStringEffect(
			endpointInput.marketplaceId,
			"marketplaceId",
		);

		return requestPostEffect<ShippingQuoteResponse>(
			this.client,
			`${this.basePath}/shipping_quote`,
			shippingQuoteRequest,
			marketplaceConfig(marketplaceId),
		);
	};

	public getShippingQuote = async (
		input: ShippingQuoteIdInput,
	): Promise<ShippingQuoteResponse> => {
		const endpointInput = requireObjectEffect<ShippingQuoteIdInput>(
			input,
			"input",
		);
		const shippingQuoteId = requireStringEffect(
			endpointInput.shippingQuoteId,
			"shippingQuoteId",
		);

		return requestGetEffect<ShippingQuoteResponse>(
			this.client,
			`${this.basePath}/shipping_quote/${encodeURIComponent(shippingQuoteId)}`,
		);
	};

	public createFromShippingQuote = async (
		input: CreateFromShippingQuoteInput,
	): Promise<ShipmentResponse> => {
		const endpointInput = requireObjectEffect<CreateFromShippingQuoteInput>(
			input,
			"input",
		);
		const shipmentRequest = requireObjectEffect<CreateShipmentFromQuoteRequest>(
			endpointInput.shipmentRequest,
			"shipmentRequest",
		);
		requireStringEffect(
			shipmentRequest.shippingQuoteId,
			"shipmentRequest.shippingQuoteId",
		);
		requireStringEffect(shipmentRequest.rateId, "shipmentRequest.rateId");
		const marketplaceId = optionalStringEffect(
			endpointInput.marketplaceId,
			"marketplaceId",
		);

		return requestPostEffect<ShipmentResponse>(
			this.client,
			`${this.basePath}/shipment/create_from_shipping_quote`,
			shipmentRequest,
			marketplaceConfig(marketplaceId),
		);
	};

	public getShipment = async (
		input: ShipmentIdInput,
	): Promise<ShipmentResponse> =>
		requestGetEffect<ShipmentResponse>(
			this.client,
			this.shipmentPath(input, ""),
		);

	public cancelShipment = async (
		input: ShipmentIdInput,
	): Promise<ShipmentResponse> =>
		requestPostEffect<ShipmentResponse>(
			this.client,
			this.shipmentPath(input, "/cancel"),
		);

	public downloadLabelFile = async (
		input: ShipmentIdInput,
	): Promise<DownloadedFile> => {
		const path = this.shipmentPath(input, "/download_label_file");

		return requestDownloadEffect(this.client, path, {
			headers: { Accept: "application/pdf" },
		});
	};

	private readonly shipmentPath = (
		input: ShipmentIdInput,
		suffix: string,
	): string => {
		const endpointInput = requireObjectEffect<ShipmentIdInput>(input, "input");
		const shipmentId = requireStringEffect(
			endpointInput.shipmentId,
			"shipmentId",
		);

		return `${this.basePath}/shipment/${encodeURIComponent(shipmentId)}${suffix}`;
	};
}
