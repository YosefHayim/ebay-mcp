import type { EbayApiClient, EbayRequestConfig } from '@/api/client/ebayApiClient.js';
import {
  type DownloadedFile,
  type DownloadTooLargeError,
  requestDownloadEffect,
} from '@/api/shared/download.js';
import {
  type EbayApiError,
  type EndpointInputError,
  optionalStringEffect,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  createFromShippingQuoteInputSchema,
  createShippingQuoteInputSchema,
  shipmentIdInputSchema,
  shippingQuoteIdInputSchema,
} from '@/schemas/fulfillment/logistics.js';
import type { components } from '@/types/sell-apps/order-management/sellLogisticsV1Oas3.js';
import type { InferEffectSchema } from '@/utils/effectSchemaTypes.js';
import { Effect } from 'effect';

/** Generated request body for createShippingQuote. */
type ShippingQuoteRequest = components['schemas']['ShippingQuoteRequest'];
/** Generated request body for createFromShippingQuote. */
type CreateShipmentFromQuoteRequest = components['schemas']['CreateShipmentFromQuoteRequest'];
type CreateShippingQuoteInput = InferEffectSchema<typeof createShippingQuoteInputSchema>;
type CreateFromShippingQuoteInput = InferEffectSchema<typeof createFromShippingQuoteInputSchema>;
type ShippingQuoteIdInput = InferEffectSchema<typeof shippingQuoteIdInputSchema>;
type ShipmentIdInput = InferEffectSchema<typeof shipmentIdInputSchema>;

/**
 * Builds the per-call marketplace header; without an override the client's configured
 * `EBAY_MARKETPLACE_ID` header still satisfies eBay's required `X-EBAY-C-MARKETPLACE-ID`.
 */
const marketplaceConfig = (marketplaceId: string | undefined): EbayRequestConfig | undefined =>
  marketplaceId === undefined
    ? undefined
    : { headers: { 'X-EBAY-C-MARKETPLACE-ID': marketplaceId } };

/**
 * Shipping quote returned by createShippingQuote and getShippingQuote.
 *
 * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipping_quote/methods/getShippingQuote
 */
export type ShippingQuoteResponse = components['schemas']['ShippingQuote'];

/**
 * Shipment returned by createFromShippingQuote, getShipment, and cancelShipment.
 *
 * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/getShipment
 */
export type ShipmentResponse = components['schemas']['Shipment'];

/**
 * Logistics API - shipping quotes, shipments, and shipping labels (limited release; needs the
 * `sell.logistics` scope). Based on: sell_logistics_v1_oas3.json
 */
export class LogisticsApi {
  private readonly basePath = '/sell/logistics/v1_beta';
  private readonly client: EbayApiClient;

  public constructor(client: EbayApiClient) {
    this.client = client;
  }

  /**
   * Creates a shipping quote with live USPS rates for one package.
   *
   * @param input - Generated ShippingQuoteRequest body plus optional marketplace header override.
   * @returns An Effect that succeeds with eBay's generated ShippingQuote, including its rates.
   *
   * @example
   * ```ts
   * const quote = await Effect.runPromise(
   *   logisticsApi.createShippingQuote({ shippingQuoteRequest, marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipping_quote/methods/createShippingQuote
   */
  public createShippingQuote = (
    input: CreateShippingQuoteInput,
  ): Effect.Effect<ShippingQuoteResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/shipping_quote`;

    return Effect.gen(function* () {
      const endpointInput = yield* requireObjectEffect<CreateShippingQuoteInput>(input, 'input');
      const body = yield* requireObjectEffect<ShippingQuoteRequest>(
        endpointInput.shippingQuoteRequest,
        'shippingQuoteRequest',
      );
      const marketplaceId = yield* optionalStringEffect(
        endpointInput.marketplaceId,
        'marketplaceId',
      );

      return yield* requestPostEffect<ShippingQuoteResponse>(
        client,
        path,
        body,
        marketplaceConfig(marketplaceId),
      );
    });
  };

  /**
   * Retrieves a shipping quote and its rates by ID.
   *
   * @param input - Shipping quote identifier returned by createShippingQuote.
   * @returns An Effect that succeeds with eBay's generated ShippingQuote.
   *
   * @example
   * ```ts
   * const quote = await Effect.runPromise(
   *   logisticsApi.getShippingQuote({ shippingQuoteId: 'QUOTE-1' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipping_quote/methods/getShippingQuote
   */
  public getShippingQuote = (
    input: ShippingQuoteIdInput,
  ): Effect.Effect<ShippingQuoteResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const endpointInput = yield* requireObjectEffect<ShippingQuoteIdInput>(input, 'input');
      const shippingQuoteId = yield* requireStringEffect(
        endpointInput.shippingQuoteId,
        'shippingQuoteId',
      );

      return yield* requestGetEffect<ShippingQuoteResponse>(
        client,
        `${basePath}/shipping_quote/${encodeURIComponent(shippingQuoteId)}`,
      );
    });
  };

  /**
   * Purchases a shipping label by creating a shipment from one rate of a shipping quote. The
   * seller's billing agreement is charged the rate's base cost plus any added options.
   *
   * @param input - Generated CreateShipmentFromQuoteRequest body plus optional marketplace header.
   * @returns An Effect that succeeds with eBay's generated Shipment, including its shipmentId.
   *
   * @example
   * ```ts
   * const shipment = await Effect.runPromise(
   *   logisticsApi.createFromShippingQuote({
   *     shipmentRequest: { shippingQuoteId: 'QUOTE-1', rateId: 'RATE-1' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/createFromShippingQuote
   */
  public createFromShippingQuote = (
    input: CreateFromShippingQuoteInput,
  ): Effect.Effect<ShipmentResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/shipment/create_from_shipping_quote`;

    return Effect.gen(function* () {
      const endpointInput = yield* requireObjectEffect<CreateFromShippingQuoteInput>(
        input,
        'input',
      );
      const body = yield* requireObjectEffect<CreateShipmentFromQuoteRequest>(
        endpointInput.shipmentRequest,
        'shipmentRequest',
      );
      yield* requireStringEffect(body.shippingQuoteId, 'shipmentRequest.shippingQuoteId');
      yield* requireStringEffect(body.rateId, 'shipmentRequest.rateId');
      const marketplaceId = yield* optionalStringEffect(
        endpointInput.marketplaceId,
        'marketplaceId',
      );

      return yield* requestPostEffect<ShipmentResponse>(
        client,
        path,
        body,
        marketplaceConfig(marketplaceId),
      );
    });
  };

  /**
   * Retrieves a shipment by ID.
   *
   * @param input - Shipment identifier returned by createFromShippingQuote.
   * @returns An Effect that succeeds with eBay's generated Shipment.
   *
   * @example
   * ```ts
   * const shipment = await Effect.runPromise(logisticsApi.getShipment({ shipmentId: 'SHIP-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/getShipment
   */
  public getShipment = (
    input: ShipmentIdInput,
  ): Effect.Effect<ShipmentResponse, EbayApiError | EndpointInputError> =>
    this.shipmentPath(input, '').pipe(
      Effect.flatMap((path) => requestGetEffect<ShipmentResponse>(this.client, path)),
    );

  /**
   * Cancels a shipment and deletes its shipping label; eBay refunds the total shipping cost.
   * A shipment whose label was already used cannot be canceled.
   *
   * @param input - Shipment identifier returned by createFromShippingQuote.
   * @returns An Effect that succeeds with eBay's generated Shipment and its cancellation status.
   *
   * @example
   * ```ts
   * const canceled = await Effect.runPromise(
   *   logisticsApi.cancelShipment({ shipmentId: 'SHIP-1' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/cancelShipment
   */
  public cancelShipment = (
    input: ShipmentIdInput,
  ): Effect.Effect<ShipmentResponse, EbayApiError | EndpointInputError> =>
    this.shipmentPath(input, '/cancel').pipe(
      Effect.flatMap((path) => requestPostEffect<ShipmentResponse>(this.client, path)),
    );

  /**
   * Downloads the shipping label generated for a shipment as a PDF.
   *
   * @param input - Shipment identifier returned by createFromShippingQuote.
   * @returns An Effect that succeeds with the label bytes, content type, and file name; fails
   * with DownloadTooLargeError when the file is too large to return inline over MCP.
   *
   * @example
   * ```ts
   * const label = await Effect.runPromise(
   *   logisticsApi.downloadLabelFile({ shipmentId: 'SHIP-1' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/logistics/resources/shipment/methods/downloadLabelFile
   */
  public downloadLabelFile = (
    input: ShipmentIdInput,
  ): Effect.Effect<DownloadedFile, EbayApiError | EndpointInputError | DownloadTooLargeError> =>
    this.shipmentPath(input, '/download_label_file').pipe(
      Effect.flatMap((path) =>
        requestDownloadEffect(this.client, path, { headers: { Accept: 'application/pdf' } }),
      ),
    );

  /** Validates a shipment ID and builds its URL-encoded resource path plus `suffix`. */
  private readonly shipmentPath = (
    input: ShipmentIdInput,
    suffix: string,
  ): Effect.Effect<string, EndpointInputError> =>
    requireObjectEffect<ShipmentIdInput>(input, 'input').pipe(
      Effect.flatMap((endpointInput) =>
        requireStringEffect(endpointInput.shipmentId, 'shipmentId'),
      ),
      Effect.map(
        (shipmentId) => `${this.basePath}/shipment/${encodeURIComponent(shipmentId)}${suffix}`,
      ),
    );
}
