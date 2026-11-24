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

/** Generated request body for createShippingQuote. */
type ShippingQuoteRequest = components["schemas"]["ShippingQuoteRequest"];
/** Generated request body for createFromShippingQuote. */
type CreateShipmentFromQuoteRequest =
	components["schemas"]["CreateShipmentFromQuoteRequest"];
type CreateShippingQuoteInput = z.infer<typeof createShippingQuoteInputSchema>;
type CreateFromShippingQuoteInput = z.infer<
	typeof createFromShippingQuoteInputSchema
>;
type ShippingQuoteIdInput = z.infer<typeof shippingQuoteIdInputSchema>;
type ShipmentIdInput = z.infer<typeof shipmentIdInputSchema>;

/**
 * Builds the per-call marketplace header; without an override the client's configured
 * `EBAY_MARKETPLACE_ID` header still satisfies eBay's required `X-EBAY-C-MARKETPLACE-ID`.
 */
const marketplaceConfig = (
	marketplaceId: string | undefined,
): EbayRequestConfig | undefined =>
	marketplaceId === undefined
		? undefined
		: { headers: { "X-EBAY-C-MARKETPLACE-ID": marketplaceId } };

/**
 * Shipping quote returned by createShippingQuote and getShippingQuote.
 *
 * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipping_quote/methods/getShippingQuote
 */
export type ShippingQuoteResponse = components["schemas"]["ShippingQuote"];

/**
 * Shipment returned by createFromShippingQuote, getShipment, and cancelShipment.
 *
 * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/getShipment
 */
export type ShipmentResponse = components["schemas"]["Shipment"];

/**
 * Logistics API - shipping quotes, shipments, and shipping labels (limited release; needs the
 * `sell.logistics` scope). Based on: sell_logistics_v1_oas3.json
 */
export class LogisticsApi {
	private readonly basePath = "/sell/logistics/v1_beta";
	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	/**
	 * Creates a shipping quote with live USPS rates for one package.
	 *
	 * @param input - Generated ShippingQuoteRequest body plus optional marketplace header override.
	 * @returns eBay's generated ShippingQuote, including its rates.
	 *
	 * @example
	 * ```ts
	 * const quote = await logisticsApi.createShippingQuote({
	 *   shippingQuoteRequest,
	 *   marketplaceId: 'EBAY_US',
	 * });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipping_quote/methods/createShippingQuote
	 */
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

	/**
	 * Retrieves a shipping quote and its rates by ID.
	 *
	 * @param input - Shipping quote identifier returned by createShippingQuote.
	 * @returns eBay's generated ShippingQuote.
	 *
	 * @example
	 * ```ts
	 * const quote = await logisticsApi.getShippingQuote({ shippingQuoteId: 'QUOTE-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipping_quote/methods/getShippingQuote
	 */
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

	/**
	 * Purchases a shipping label by creating a shipment from one rate of a shipping quote. The
	 * seller's billing agreement is charged the rate's base cost plus any added options.
	 *
	 * @param input - Generated CreateShipmentFromQuoteRequest body plus optional marketplace header.
	 * @returns eBay's generated Shipment, including its shipmentId.
	 *
	 * @example
	 * ```ts
	 * const shipment = await logisticsApi.createFromShippingQuote({
	 *   shipmentRequest: { shippingQuoteId: 'QUOTE-1', rateId: 'RATE-1' },
	 * });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/createFromShippingQuote
	 */
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

	/**
	 * Retrieves a shipment by ID.
	 *
	 * @param input - Shipment identifier returned by createFromShippingQuote.
	 * @returns eBay's generated Shipment.
	 *
	 * @example
	 * ```ts
	 * const shipment = await logisticsApi.getShipment({ shipmentId: 'SHIP-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/getShipment
	 */
	public getShipment = async (
		input: ShipmentIdInput,
	): Promise<ShipmentResponse> =>
		requestGetEffect<ShipmentResponse>(
			this.client,
			this.shipmentPath(input, ""),
		);

	/**
	 * Cancels a shipment and deletes its shipping label; eBay refunds the total shipping cost.
	 * A shipment whose label was already used cannot be canceled.
	 *
	 * @param input - Shipment identifier returned by createFromShippingQuote.
	 * @returns eBay's generated Shipment and its cancellation status.
	 *
	 * @example
	 * ```ts
	 * const canceled = await logisticsApi.cancelShipment({ shipmentId: 'SHIP-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/cancelShipment
	 */
	public cancelShipment = async (
		input: ShipmentIdInput,
	): Promise<ShipmentResponse> =>
		requestPostEffect<ShipmentResponse>(
			this.client,
			this.shipmentPath(input, "/cancel"),
		);

	/**
	 * Downloads the shipping label generated for a shipment as a PDF.
	 *
	 * @param input - Shipment identifier returned by createFromShippingQuote.
	 * @returns The label bytes, content type, and file name.
	 * @throws {DownloadTooLargeError} When the file is too large to return inline over MCP.
	 *
	 * @example
	 * ```ts
	 * const label = await logisticsApi.downloadLabelFile({ shipmentId: 'SHIP-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/downloadLabelFile
	 */
	public downloadLabelFile = async (
		input: ShipmentIdInput,
	): Promise<DownloadedFile> => {
		const path = this.shipmentPath(input, "/download_label_file");

		return requestDownloadEffect(this.client, path, {
			headers: { Accept: "application/pdf" },
		});
	};

	/** Validates a shipment ID and builds its URL-encoded resource path plus `suffix`. */
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
