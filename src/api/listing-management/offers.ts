import type { EbayApiClient } from '@/api/client.js';
import {
  type EbayApiError,
  EndpointInputError,
  buildEndpointParams,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requestDeleteEffect,
  requestGetEffect,
  requestPostEffect,
  requestPutEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  components,
  operations,
} from '@/types/sell-apps/listing-management/sellInventoryV1Oas3.js';
import { Effect, Either } from 'effect';
import { validateOfferFormatEffect } from './offerFormat.js';
import { INVENTORY_BASE_PATH } from './shared.js';

/** Input accepted by getOffers. */
export interface GetOffersInput {
  /** Listing format filter sent as format. */
  readonly format?: string;
  /** Number of offers to return. */
  readonly limit?: number;
  /** Marketplace filter sent as marketplace_id. */
  readonly marketplaceId?: string;
  /** Offer page offset. */
  readonly offset?: number;
  /** Seller-defined SKU whose offers to return. */
  readonly sku: string;
}

/** Maximum number of SKU entries accepted by one batch lookup. */
export const MAX_BATCH_GET_OFFERS_SKUS = 25;

/** Maximum number of simultaneous eBay requests made by a batch lookup. */
export const BATCH_GET_OFFERS_CONCURRENCY = 3;

/** Input accepted by getOffersBySkus. Exact duplicate SKUs are queried once. */
export interface GetOffersBySkusInput {
  readonly skus: readonly string[];
  readonly format?: string;
  readonly marketplaceId?: string;
}

export type GetOffersBySkuResult =
  | { readonly sku: string; readonly status: 'success'; readonly response: GetOffersResponse }
  | {
      readonly sku: string;
      readonly status: 'failure';
      readonly error: { readonly type: string; readonly message: string };
    };

/** Aggregate response for a batch offer lookup. */
export interface GetOffersBySkusResponse {
  readonly requestedSkuCount: number;
  readonly uniqueSkuCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly results: readonly GetOffersBySkuResult[];
}

/** Input accepted by offer ID endpoints. */
export interface OfferIdInput {
  /** eBay offer identifier. */
  readonly offerId: string;
}

/** Input accepted by createOffer. */
export interface CreateOfferInput {
  /** Generated EbayOfferDetailsWithKeys body. */
  readonly body: CreateOfferRequest;
}

/** Input accepted by updateOffer. */
export interface UpdateOfferInput {
  /** eBay offer identifier. */
  readonly offerId: string;
  /** Generated EbayOfferDetailsWithId body. */
  readonly body: UpdateOfferRequest;
}

/** Input accepted by bulkCreateOffer. */
export interface BulkCreateOfferInput {
  /** Generated BulkEbayOfferDetailsWithKeys body. */
  readonly body: BulkCreateOfferRequest;
}

/** Input accepted by bulkPublishOffer. */
export interface BulkPublishOfferInput {
  /** Generated BulkOffer body. */
  readonly body: BulkPublishOfferRequest;
}

/** Input accepted by getListingFees. */
export interface GetListingFeesInput {
  /** Generated OfferKeysWithId body. */
  readonly body: GetListingFeesRequest;
}

/** Input accepted by publishOfferByInventoryItemGroup. */
export interface PublishOfferByInventoryItemGroupInput {
  /** Generated PublishByInventoryItemGroupRequest body. */
  readonly body: PublishOfferByInventoryItemGroupRequest;
}

/** Input accepted by withdrawOfferByInventoryItemGroup. */
export interface WithdrawOfferByInventoryItemGroupInput {
  /** Generated WithdrawByInventoryItemGroupRequest body. */
  readonly body: WithdrawOfferByInventoryItemGroupRequest;
}

/**
 * Request body accepted by bulkCreateOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/bulkCreateOffer
 */
export type BulkCreateOfferRequest = components['schemas']['BulkEbayOfferDetailsWithKeys'];

/**
 * Response returned by bulkCreateOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/bulkCreateOffer
 */
export type BulkCreateOfferResponse = components['schemas']['BulkOfferResponse'];

/**
 * Request body accepted by bulkPublishOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/bulkPublishOffer
 */
export type BulkPublishOfferRequest = components['schemas']['BulkOffer'];

/**
 * Response returned by bulkPublishOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/bulkPublishOffer
 */
export type BulkPublishOfferResponse = components['schemas']['BulkPublishResponse'];

/**
 * Response returned by getOffers.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getOffers
 */
export type GetOffersResponse = components['schemas']['Offers'];

/**
 * Request body accepted by createOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/createOffer
 */
export type CreateOfferRequest = components['schemas']['EbayOfferDetailsWithKeys'];

/**
 * Response returned by createOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/createOffer
 */
export type CreateOfferResponse = components['schemas']['OfferResponse'];

/**
 * Response returned by getOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getOffer
 */
export type GetOfferResponse = components['schemas']['EbayOfferDetailsWithAll'];

/**
 * Request body accepted by updateOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/updateOffer
 */
export type UpdateOfferRequest = components['schemas']['EbayOfferDetailsWithId'];

/**
 * No-content response returned by deleteOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/deleteOffer
 */
export type DeleteOfferResponse = void;

/**
 * Request body accepted by getListingFees.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getListingFees
 */
export type GetListingFeesRequest = components['schemas']['OfferKeysWithId'];

/**
 * Response returned by getListingFees.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getListingFees
 */
export type GetListingFeesResponse = components['schemas']['FeesSummaryResponse'];

/**
 * Response returned by publishOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/publishOffer
 */
export type PublishOfferResponse = components['schemas']['PublishResponse'];

/**
 * Request body accepted by publishOfferByInventoryItemGroup.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/publishOfferByInventoryItemGroup
 */
export type PublishOfferByInventoryItemGroupRequest =
  components['schemas']['PublishByInventoryItemGroupRequest'];

/**
 * Response returned by withdrawOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/withdrawOffer
 */
export type WithdrawOfferResponse = components['schemas']['WithdrawResponse'];

/**
 * Request body accepted by withdrawOfferByInventoryItemGroup.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/withdrawOfferByInventoryItemGroup
 */
export type WithdrawOfferByInventoryItemGroupRequest =
  components['schemas']['WithdrawByInventoryItemGroupRequest'];

/**
 * No-content response returned by withdrawOfferByInventoryItemGroup.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/withdrawOfferByInventoryItemGroup
 */
// biome-ignore lint/style/useExportsLast: public endpoint types intentionally precede private implementation helpers
export type WithdrawOfferByInventoryItemGroupResponse = void;

// Keep the shared request implementation private so the existing and batch methods cannot drift.
const getOffersEffect = (
  client: EbayApiClient,
  input: GetOffersInput,
): Effect.Effect<GetOffersResponse, EbayApiError | EndpointInputError> => {
  const path = `${INVENTORY_BASE_PATH}/offer`;

  return Effect.gen(function* () {
    const validatedInput = yield* requireObjectEffect<GetOffersInput>(input, 'input');
    const format = yield* optionalStringEffect(validatedInput.format, 'format');
    const limit = yield* optionalPositiveNumberEffect(validatedInput.limit, 'limit');
    const marketplaceId = yield* optionalStringEffect(
      validatedInput.marketplaceId,
      'marketplaceId',
    );
    const offset = yield* optionalNonNegativeNumberEffect(validatedInput.offset, 'offset');
    const sku = yield* requireStringEffect(validatedInput.sku, 'sku');
    const params = buildEndpointParams({
      format: { wireName: 'format', value: format },
      limit: { wireName: 'limit', value: limit === undefined ? undefined : String(limit) },
      marketplaceId: { wireName: 'marketplace_id', value: marketplaceId },
      offset: { wireName: 'offset', value: offset === undefined ? undefined : String(offset) },
      sku: { wireName: 'sku', value: sku },
    });

    return yield* requestGetEffect<GetOffersResponse>(client, path, params);
  });
};

/** Inventory API — offers methods closed over a shared client. */
export const createInventoryOffersMethods = (client: EbayApiClient) => ({
  /**
   * Creates multiple offers.
   *
   * @param input - Generated BulkEbayOfferDetailsWithKeys body.
   * @returns An Effect that succeeds with eBay's BulkOfferResponse.
   *
   * @example
   * ```ts
   * const result = await Effect.runPromise(inventoryApi.bulkCreateOffer({ body: { requests: [] } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/bulkCreateOffer
   */
  bulkCreateOffer: (
    input: BulkCreateOfferInput,
  ): Effect.Effect<BulkCreateOfferResponse, EbayApiError | EndpointInputError> => {
    const path = `${INVENTORY_BASE_PATH}/bulk_create_offer`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BulkCreateOfferInput>(input, 'input');
      const body = yield* requireObjectEffect<BulkCreateOfferRequest>(validatedInput.body, 'body');
      yield* Effect.forEach(
        body.requests ?? [],
        (request, index) => validateOfferFormatEffect(request, `body.requests[${index}]`),
        { discard: true },
      );

      return yield* requestPostEffect<BulkCreateOfferResponse>(client, path, body);
    });
  },

  /**
   * Publishes multiple offers.
   *
   * @param input - Generated BulkOffer body.
   * @returns An Effect that succeeds with eBay's BulkPublishResponse.
   *
   * @example
   * ```ts
   * const result = await Effect.runPromise(inventoryApi.bulkPublishOffer({ body: { offers: [] } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/bulkPublishOffer
   */
  bulkPublishOffer: (
    input: BulkPublishOfferInput,
  ): Effect.Effect<BulkPublishOfferResponse, EbayApiError | EndpointInputError> => {
    const path = `${INVENTORY_BASE_PATH}/bulk_publish_offer`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BulkPublishOfferInput>(input, 'input');
      const body = yield* requireObjectEffect<BulkPublishOfferRequest>(validatedInput.body, 'body');

      return yield* requestPostEffect<BulkPublishOfferResponse>(client, path, body);
    });
  },

  /**
   * Retrieves offers for one seller-defined SKU.
   *
   * @param input - Required SKU plus optional offer filters and pagination controls.
   * @returns An Effect that succeeds with eBay's Offers response.
   *
   * @example
   * ```ts
   * const offers = await Effect.runPromise(
   *   inventoryApi.getOffers({ sku: 'SKU-1', marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getOffers
   */
  getOffers: (
    input: GetOffersInput,
  ): Effect.Effect<GetOffersResponse, EbayApiError | EndpointInputError> =>
    getOffersEffect(client, input),

  /**
   * Retrieves offers for up to 25 SKUs, preserving first-occurrence order.
   *
   * Exact duplicates are requested once. At most three requests run concurrently, and request
   * failures are returned beside their SKU instead of failing the whole batch.
   */
  getOffersBySkus: (
    input: GetOffersBySkusInput,
  ): Effect.Effect<GetOffersBySkusResponse, EndpointInputError> =>
    Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetOffersBySkusInput>(input, 'input');
      if (!Array.isArray(validatedInput.skus)) {
        return yield* Effect.fail(
          new EndpointInputError({ parameter: 'skus', message: 'skus must be an array' }),
        );
      }
      if (
        validatedInput.skus.length === 0 ||
        validatedInput.skus.length > MAX_BATCH_GET_OFFERS_SKUS
      ) {
        return yield* Effect.fail(
          new EndpointInputError({
            parameter: 'skus',
            message: `skus must contain between 1 and ${MAX_BATCH_GET_OFFERS_SKUS} entries`,
          }),
        );
      }
      for (const sku of validatedInput.skus) {
        if (typeof sku !== 'string' || sku.trim().length === 0 || sku.length > 50) {
          return yield* Effect.fail(
            new EndpointInputError({
              parameter: 'skus',
              message: 'each SKU must be a non-empty string of at most 50 characters',
            }),
          );
        }
      }
      const format = yield* optionalStringEffect(validatedInput.format, 'format');
      const marketplaceId = yield* optionalStringEffect(
        validatedInput.marketplaceId,
        'marketplaceId',
      );
      const uniqueSkus = [...new Set(validatedInput.skus)];
      const results = yield* Effect.forEach(
        uniqueSkus,
        (sku) =>
          Effect.map(
            Effect.either(
              getOffersEffect(client, {
                sku,
                format,
                marketplaceId,
              }),
            ),
            (outcome): GetOffersBySkuResult =>
              Either.isRight(outcome)
                ? { sku, status: 'success', response: outcome.right }
                : {
                    sku,
                    status: 'failure',
                    error: { type: outcome.left._tag, message: outcome.left.message },
                  },
          ),
        { concurrency: BATCH_GET_OFFERS_CONCURRENCY },
      );
      const successCount = results.filter((result) => result.status === 'success').length;
      return {
        requestedSkuCount: validatedInput.skus.length,
        uniqueSkuCount: uniqueSkus.length,
        successCount,
        failureCount: results.length - successCount,
        results,
      };
    }),

  /**
   * Creates one offer.
   *
   * @param input - Generated EbayOfferDetailsWithKeys body.
   * @returns An Effect that succeeds with eBay's OfferResponse.
   *
   * @example
   * ```ts
   * const offer = await Effect.runPromise(inventoryApi.createOffer({ body: { sku: 'SKU-1' } }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/createOffer
   */
  createOffer: (
    input: CreateOfferInput,
  ): Effect.Effect<CreateOfferResponse, EbayApiError | EndpointInputError> => {
    const path = `${INVENTORY_BASE_PATH}/offer`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<CreateOfferInput>(input, 'input');
      const body = yield* requireObjectEffect<CreateOfferRequest>(validatedInput.body, 'body');
      yield* validateOfferFormatEffect(body, 'body');

      return yield* requestPostEffect<CreateOfferResponse>(client, path, body);
    });
  },

  /**
   * Retrieves one offer by ID.
   *
   * @param input - eBay offer identifier.
   * @returns An Effect that succeeds with eBay's EbayOfferDetailsWithAll response.
   *
   * @example
   * ```ts
   * const offer = await Effect.runPromise(inventoryApi.getOffer({ offerId: 'OFFER-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getOffer
   */
  getOffer: (
    input: OfferIdInput,
  ): Effect.Effect<GetOfferResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<OfferIdInput>(input, 'input');
      const offerId = yield* requireStringEffect(validatedInput.offerId, 'offerId');

      return yield* requestGetEffect<GetOfferResponse>(client, `${basePath}/offer/${offerId}`);
    });
  },

  /**
   * Updates one offer by ID.
   *
   * @param input - eBay offer identifier and generated EbayOfferDetailsWithId body.
   * @returns An Effect that succeeds with eBay's OfferResponse.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   inventoryApi.updateOffer({ offerId: 'OFFER-1', body: { offerId: 'OFFER-1' } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/updateOffer
   */
  updateOffer: (
    input: UpdateOfferInput,
  ): Effect.Effect<CreateOfferResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<UpdateOfferInput>(input, 'input');
      const offerId = yield* requireStringEffect(validatedInput.offerId, 'offerId');
      const body = yield* requireObjectEffect<UpdateOfferRequest>(validatedInput.body, 'body');
      yield* validateOfferFormatEffect(body, 'body');

      return yield* requestPutEffect<CreateOfferResponse>(
        client,
        `${basePath}/offer/${offerId}`,
        body,
      );
    });
  },

  /**
   * Deletes one offer by ID.
   *
   * @param input - eBay offer identifier.
   * @returns An Effect that succeeds when eBay returns no content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(inventoryApi.deleteOffer({ offerId: 'OFFER-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/deleteOffer
   */
  deleteOffer: (
    input: OfferIdInput,
  ): Effect.Effect<DeleteOfferResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<OfferIdInput>(input, 'input');
      const offerId = yield* requireStringEffect(validatedInput.offerId, 'offerId');

      return yield* requestDeleteEffect<DeleteOfferResponse>(
        client,
        `${basePath}/offer/${offerId}`,
      );
    });
  },

  /**
   * Retrieves listing fees for unpublished offers.
   *
   * @param input - Generated OfferKeysWithId body.
   * @returns An Effect that succeeds with eBay's FeesSummaryResponse.
   *
   * @example
   * ```ts
   * const fees = await Effect.runPromise(
   *   inventoryApi.getListingFees({ body: { offers: [{ offerId: 'OFFER-1' }] } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getListingFees
   */
  getListingFees: (
    input: GetListingFeesInput,
  ): Effect.Effect<GetListingFeesResponse, EbayApiError | EndpointInputError> => {
    const path = `${INVENTORY_BASE_PATH}/offer/get_listing_fees`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetListingFeesInput>(input, 'input');
      const body = yield* requireObjectEffect<GetListingFeesRequest>(validatedInput.body, 'body');

      return yield* requestPostEffect<GetListingFeesResponse>(client, path, body);
    });
  },

  /**
   * Publishes one offer by ID.
   *
   * @param input - eBay offer identifier.
   * @returns An Effect that succeeds with eBay's PublishResponse.
   *
   * @example
   * ```ts
   * const publish = await Effect.runPromise(inventoryApi.publishOffer({ offerId: 'OFFER-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/publishOffer
   */
  publishOffer: (
    input: OfferIdInput,
  ): Effect.Effect<PublishOfferResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<OfferIdInput>(input, 'input');
      const offerId = yield* requireStringEffect(validatedInput.offerId, 'offerId');

      return yield* requestPostEffect<PublishOfferResponse>(
        client,
        `${basePath}/offer/${offerId}/publish`,
      );
    });
  },

  /**
   * Publishes offers for one inventory item group.
   *
   * @param input - Generated PublishByInventoryItemGroupRequest body.
   * @returns An Effect that succeeds with eBay's PublishResponse.
   *
   * @example
   * ```ts
   * const publish = await Effect.runPromise(
   *   inventoryApi.publishOfferByInventoryItemGroup({
   *     body: { inventoryItemGroupKey: 'GROUP-1', marketplaceId: 'EBAY_US' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/publishOfferByInventoryItemGroup
   */
  publishOfferByInventoryItemGroup: (
    input: PublishOfferByInventoryItemGroupInput,
  ): Effect.Effect<PublishOfferResponse, EbayApiError | EndpointInputError> => {
    const path = `${INVENTORY_BASE_PATH}/offer/publish_by_inventory_item_group`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<PublishOfferByInventoryItemGroupInput>(
        input,
        'input',
      );
      const body = yield* requireObjectEffect<PublishOfferByInventoryItemGroupRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<PublishOfferResponse>(client, path, body);
    });
  },

  /**
   * Withdraws one offer by ID.
   *
   * @param input - eBay offer identifier.
   * @returns An Effect that succeeds with eBay's WithdrawResponse.
   *
   * @example
   * ```ts
   * const withdraw = await Effect.runPromise(inventoryApi.withdrawOffer({ offerId: 'OFFER-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/withdrawOffer
   */
  withdrawOffer: (
    input: OfferIdInput,
  ): Effect.Effect<WithdrawOfferResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<OfferIdInput>(input, 'input');
      const offerId = yield* requireStringEffect(validatedInput.offerId, 'offerId');

      return yield* requestPostEffect<WithdrawOfferResponse>(
        client,
        `${basePath}/offer/${offerId}/withdraw`,
      );
    });
  },

  /**
   * Withdraws offers for one inventory item group.
   *
   * @param input - Generated WithdrawByInventoryItemGroupRequest body.
   * @returns An Effect that succeeds when eBay returns no content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   inventoryApi.withdrawOfferByInventoryItemGroup({
   *     body: { inventoryItemGroupKey: 'GROUP-1', marketplaceId: 'EBAY_US' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/withdrawOfferByInventoryItemGroup
   */
  withdrawOfferByInventoryItemGroup: (
    input: WithdrawOfferByInventoryItemGroupInput,
  ): Effect.Effect<
    WithdrawOfferByInventoryItemGroupResponse,
    EbayApiError | EndpointInputError
  > => {
    const path = `${INVENTORY_BASE_PATH}/offer/withdraw_by_inventory_item_group`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<WithdrawOfferByInventoryItemGroupInput>(
        input,
        'input',
      );
      const body = yield* requireObjectEffect<WithdrawOfferByInventoryItemGroupRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<WithdrawOfferByInventoryItemGroupResponse>(
        client,
        path,
        body,
      );
    });
  },
});
