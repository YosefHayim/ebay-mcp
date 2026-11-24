import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	EbayApiError,
	EndpointInputError,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	optionalStringEffect,
	requestDeleteEffect,
	requestGetEffect,
	requestPostEffect,
	requestPutEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellInventoryV1Oas3.js";
import { INVENTORY_BASE_PATH } from "./inventorySharedApi.js";
import { validateOfferFormatEffect } from "./offerFormatApi.js";

/** Input accepted by getOffers. */
export interface GetOffersInput {
	/** Listing format filter sent as format. */
	readonly format?: string | undefined;
	/** Number of offers to return. */
	readonly limit?: number | undefined;
	/** Marketplace filter sent as marketplace_id. */
	readonly marketplaceId?: string | undefined;
	/** Offer page offset. */
	readonly offset?: number | undefined;
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
	readonly format?: string | undefined;
	readonly marketplaceId?: string | undefined;
}

export type GetOffersBySkuResult =
	| {
			readonly sku: string;
			readonly status: "success";
			readonly response: GetOffersResponse;
	  }
	| {
			readonly sku: string;
			readonly status: "failure";
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

/** Money amount on an offer. Optional members may be omitted or undefined. */
interface OfferAmount {
	readonly currency?: string | undefined;
	readonly value?: string | undefined;
}

/** Best Offer prices and switch on an offer's listing policies. */
interface OfferBestOfferTerms {
	readonly autoAcceptPrice?: OfferAmount | undefined;
	readonly autoDeclinePrice?: OfferAmount | undefined;
	readonly bestOfferEnabled?: boolean | undefined;
}

/** Listing policies supplied when creating or updating an offer. */
interface OfferListingPolicies {
	readonly bestOfferTerms?: OfferBestOfferTerms | undefined;
	readonly eBayPlusIfEligible?: boolean | undefined;
	readonly fulfillmentPolicyId?: string | undefined;
	readonly paymentPolicyId?: string | undefined;
	readonly productCompliancePolicyIds?: readonly string[] | undefined;
	readonly returnPolicyId?: string | undefined;
	readonly takeBackPolicyIds?: readonly string[] | undefined;
}

/** Prices for a fixed-price or auction offer. */
interface OfferPricingSummary {
	readonly auctionReservePrice?: OfferAmount | undefined;
	readonly auctionStartPrice?: OfferAmount | undefined;
	readonly minimumAdvertisedPrice?: OfferAmount | undefined;
	readonly originalRetailPrice?: OfferAmount | undefined;
	readonly price?: OfferAmount | undefined;
	readonly pricingVisibility?: string | undefined;
}

/** Charity donation selected for an offer. */
interface OfferCharity {
	readonly charityId?: string | undefined;
	readonly donationPercentage?: string | undefined;
}

/** Eco-participation identifiers on an offer. */
interface OfferProducerResponsibility {
	readonly producerProductId?: string | undefined;
	readonly productDocumentationId?: string | undefined;
	readonly productPackageId?: string | undefined;
	readonly shipmentPackageId?: string | undefined;
}

/** Sales tax or VAT settings on an offer. */
interface OfferTax {
	readonly applyTax?: boolean | undefined;
	readonly thirdPartyTaxCategory?: string | undefined;
	readonly vatPercentage?: number | undefined;
}

/**
 * Offer body accepted from tool input. Every optional field may be undefined
 * because parsed input keeps missing keys as undefined.
 */
interface OfferWrite {
	readonly availableQuantity?: number | undefined;
	readonly categoryId?: string | undefined;
	readonly charity?: OfferCharity | undefined;
	readonly extendedProducerResponsibility?:
		| OfferProducerResponsibility
		| undefined;
	readonly format?: string | undefined;
	readonly hideBuyerDetails?: boolean | undefined;
	readonly includeCatalogProductDetails?: boolean | undefined;
	readonly listingDescription?: string | undefined;
	readonly listingDuration?: string | undefined;
	readonly listingPolicies?: OfferListingPolicies | undefined;
	readonly listingStartDate?: string | undefined;
	readonly lotSize?: number | undefined;
	readonly marketplaceId?: string | undefined;
	readonly merchantLocationKey?: string | undefined;
	readonly pricingSummary?: OfferPricingSummary | undefined;
	readonly quantityLimitPerBuyer?: number | undefined;
	readonly secondaryCategoryId?: string | undefined;
	readonly sku?: string | undefined;
	readonly storeCategoryNames?: readonly string[] | undefined;
	readonly tax?: OfferTax | undefined;
}

/** Several offers created in one bulk request. */
interface BulkOfferWrite {
	readonly requests?: readonly OfferWrite[] | undefined;
}

/** Input accepted by createOffer. */
export interface CreateOfferInput {
	/** Generated EbayOfferDetailsWithKeys body. */
	readonly body: OfferWrite;
}

/** Input accepted by updateOffer. */
export interface UpdateOfferInput {
	/** eBay offer identifier. */
	readonly offerId: string;
	/** Generated EbayOfferDetailsWithId body. */
	readonly body: OfferWrite;
}

/** Input accepted by bulkCreateOffer. */
export interface BulkCreateOfferInput {
	/** Generated BulkEbayOfferDetailsWithKeys body. */
	readonly body: BulkOfferWrite;
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
export type BulkCreateOfferRequest =
	components["schemas"]["BulkEbayOfferDetailsWithKeys"];

/**
 * Response returned by bulkCreateOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/bulkCreateOffer
 */
export type BulkCreateOfferResponse =
	components["schemas"]["BulkOfferResponse"];

/**
 * Request body accepted by bulkPublishOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/bulkPublishOffer
 */
export type BulkPublishOfferRequest = components["schemas"]["BulkOffer"];

/**
 * Response returned by bulkPublishOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/bulkPublishOffer
 */
export type BulkPublishOfferResponse =
	components["schemas"]["BulkPublishResponse"];

/**
 * Response returned by getOffers.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getOffers
 */
export type GetOffersResponse = components["schemas"]["Offers"];

/**
 * Request body accepted by createOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/createOffer
 */
export type CreateOfferRequest =
	components["schemas"]["EbayOfferDetailsWithKeys"];

/**
 * Response returned by createOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/createOffer
 */
export type CreateOfferResponse = components["schemas"]["OfferResponse"];

/**
 * Response returned by getOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getOffer
 */
export type GetOfferResponse = components["schemas"]["EbayOfferDetailsWithAll"];

/**
 * Request body accepted by updateOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/updateOffer
 */
export type UpdateOfferRequest =
	components["schemas"]["EbayOfferDetailsWithId"];

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
export type GetListingFeesRequest = components["schemas"]["OfferKeysWithId"];

/**
 * Response returned by getListingFees.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/getListingFees
 */
export type GetListingFeesResponse =
	components["schemas"]["FeesSummaryResponse"];

/**
 * Response returned by publishOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/publishOffer
 */
export type PublishOfferResponse = components["schemas"]["PublishResponse"];

/**
 * Request body accepted by publishOfferByInventoryItemGroup.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/publishOfferByInventoryItemGroup
 */
export type PublishOfferByInventoryItemGroupRequest =
	components["schemas"]["PublishByInventoryItemGroupRequest"];

/**
 * Response returned by withdrawOffer.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/withdrawOffer
 */
export type WithdrawOfferResponse = components["schemas"]["WithdrawResponse"];

/**
 * Request body accepted by withdrawOfferByInventoryItemGroup.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/withdrawOfferByInventoryItemGroup
 */
export type WithdrawOfferByInventoryItemGroupRequest =
	components["schemas"]["WithdrawByInventoryItemGroupRequest"];

/**
 * No-content response returned by withdrawOfferByInventoryItemGroup.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/withdrawOfferByInventoryItemGroup
 */
// biome-ignore lint/style/useExportsLast: public endpoint types intentionally precede private implementation helpers
export type WithdrawOfferByInventoryItemGroupResponse = void;

// Keep the shared request implementation private so the existing and batch methods cannot drift.
const getOffersEffect = async (
	client: EbayApiClient,
	input: GetOffersInput,
): Promise<GetOffersResponse> => {
	const path = `${INVENTORY_BASE_PATH}/offer`;

	const validatedInput = requireObjectEffect<GetOffersInput>(input, "input");
	const format = optionalStringEffect(validatedInput.format, "format");
	const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
	const marketplaceId = optionalStringEffect(
		validatedInput.marketplaceId,
		"marketplaceId",
	);
	const offset = optionalNonNegativeNumberEffect(
		validatedInput.offset,
		"offset",
	);
	const sku = requireStringEffect(validatedInput.sku, "sku");
	const params = buildEndpointParams({
		format: { wireName: "format", value: format },
		limit: {
			wireName: "limit",
			value: limit === undefined ? undefined : String(limit),
		},
		marketplaceId: { wireName: "marketplace_id", value: marketplaceId },
		offset: {
			wireName: "offset",
			value: offset === undefined ? undefined : String(offset),
		},
		sku: { wireName: "sku", value: sku },
	});

	return requestGetEffect<GetOffersResponse>(client, path, params);
};

function isOffersRequestError(
	cause: unknown,
): cause is EbayApiError | EndpointInputError {
	if (cause instanceof EbayApiError) {
		return true;
	}

	return cause instanceof EndpointInputError;
}

async function collectWithConcurrency<Item, Mapped>(
	items: readonly Item[],
	concurrency: number,
	convertItem: (item: Item) => Promise<Mapped>,
): Promise<Mapped[]> {
	const mapped = new Array<Mapped>(items.length);
	let nextIndex = 0;

	async function convertNext(): Promise<void> {
		const index = nextIndex;
		nextIndex += 1;
		const isDone = index >= items.length;

		if (isDone) {
			return;
		}

		const item = items.at(index);

		if (item === undefined) {
			return;
		}

		mapped[index] = await convertItem(item);
		await convertNext();
	}

	const workerCount = Math.min(concurrency, items.length);
	const workers: Promise<void>[] = [];

	for (let workerIndex = 0; workerIndex < workerCount; workerIndex += 1) {
		workers.push(convertNext());
	}

	await Promise.all(workers);
	return mapped;
}

async function readOffersForSku(request: {
	client: EbayApiClient;
	sku: string;
	format: string | undefined;
	marketplaceId: string | undefined;
}): Promise<GetOffersBySkuResult> {
	try {
		const offers = await getOffersEffect(request.client, {
			sku: request.sku,
			format: request.format,
			marketplaceId: request.marketplaceId,
		});

		return { sku: request.sku, status: "success", response: offers };
	} catch (cause) {
		const isHandled = isOffersRequestError(cause);

		if (!isHandled) {
			throw cause;
		}

		const outcome = { left: cause };

		return {
			sku: request.sku,
			status: "failure",
			error: {
				type: outcome.left._tag,
				message: outcome.left.message,
			},
		};
	}
}

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
	 * const createdOffers = await Effect.runPromise(inventoryApi.bulkCreateOffer({ body: { requests: [] } }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/bulkCreateOffer
	 */
	bulkCreateOffer: async (
		input: BulkCreateOfferInput,
	): Promise<BulkCreateOfferResponse> => {
		const path = `${INVENTORY_BASE_PATH}/bulk_create_offer`;

		const validatedInput = requireObjectEffect<BulkCreateOfferInput>(
			input,
			"input",
		);
		const bulkOfferRequest = requireObjectEffect<BulkCreateOfferRequest>(
			validatedInput.body,
			"body",
		);
		const requests = bulkOfferRequest.requests ?? [];

		for (const [index, offerRequest] of requests.entries()) {
			validateOfferFormatEffect(offerRequest, `body.requests[${index}]`);
		}

		return requestPostEffect<BulkCreateOfferResponse>(
			client,
			path,
			bulkOfferRequest,
		);
	},

	/**
	 * Publishes multiple offers.
	 *
	 * @param input - Generated BulkOffer body.
	 * @returns An Effect that succeeds with eBay's BulkPublishResponse.
	 *
	 * @example
	 * ```ts
	 * const publishedOffers = await Effect.runPromise(inventoryApi.bulkPublishOffer({ body: { offers: [] } }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/offer/methods/bulkPublishOffer
	 */
	bulkPublishOffer: async (
		input: BulkPublishOfferInput,
	): Promise<BulkPublishOfferResponse> => {
		const path = `${INVENTORY_BASE_PATH}/bulk_publish_offer`;

		const validatedInput = requireObjectEffect<BulkPublishOfferInput>(
			input,
			"input",
		);
		const bulkPublishRequest = requireObjectEffect<BulkPublishOfferRequest>(
			validatedInput.body,
			"body",
		);

		return requestPostEffect<BulkPublishOfferResponse>(
			client,
			path,
			bulkPublishRequest,
		);
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
	getOffers: (input: GetOffersInput): Promise<GetOffersResponse> =>
		getOffersEffect(client, input),

	/**
	 * Retrieves offers for up to 25 SKUs, preserving first-occurrence order.
	 *
	 * Exact duplicates are requested once. At most three requests run concurrently, and request
	 * failures are returned beside their SKU instead of failing the whole batch.
	 */
	getOffersBySkus: async (
		input: GetOffersBySkusInput,
	): Promise<GetOffersBySkusResponse> => {
		const validatedInput = requireObjectEffect<GetOffersBySkusInput>(
			input,
			"input",
		);

		if (!Array.isArray(validatedInput.skus)) {
			throw new EndpointInputError({
				parameter: "skus",
				message: "skus must be an array",
			});
		}

		if (
			validatedInput.skus.length === 0 ||
			validatedInput.skus.length > MAX_BATCH_GET_OFFERS_SKUS
		) {
			throw new EndpointInputError({
				parameter: "skus",
				message: `skus must contain between 1 and ${MAX_BATCH_GET_OFFERS_SKUS} entries`,
			});
		}

		for (const sku of validatedInput.skus) {
			if (
				typeof sku !== "string" ||
				sku.trim().length === 0 ||
				sku.length > 50
			) {
				throw new EndpointInputError({
					parameter: "skus",
					message:
						"each SKU must be a non-empty string of at most 50 characters",
				});
			}
		}

		const format = optionalStringEffect(validatedInput.format, "format");
		const marketplaceId = optionalStringEffect(
			validatedInput.marketplaceId,
			"marketplaceId",
		);
		const uniqueSkus = [...new Set(validatedInput.skus)];

		function readSku(sku: string): Promise<GetOffersBySkuResult> {
			return readOffersForSku({
				client,
				sku,
				format,
				marketplaceId,
			});
		}

		const skuResults = await collectWithConcurrency(
			uniqueSkus,
			BATCH_GET_OFFERS_CONCURRENCY,
			readSku,
		);

		function isSuccessfulSku(skuResult: GetOffersBySkuResult): boolean {
			return skuResult.status === "success";
		}

		const successCount = skuResults.filter(isSuccessfulSku).length;

		return {
			requestedSkuCount: validatedInput.skus.length,
			uniqueSkuCount: uniqueSkus.length,
			successCount,
			failureCount: skuResults.length - successCount,
			results: skuResults,
		};
	},

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
	createOffer: async (
		input: CreateOfferInput,
	): Promise<CreateOfferResponse> => {
		const path = `${INVENTORY_BASE_PATH}/offer`;

		const validatedInput = requireObjectEffect<CreateOfferInput>(
			input,
			"input",
		);
		const offerDetails = requireObjectEffect<CreateOfferRequest>(
			validatedInput.body,
			"body",
		);
		validateOfferFormatEffect(offerDetails, "body");

		return requestPostEffect<CreateOfferResponse>(client, path, offerDetails);
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
	getOffer: async (input: OfferIdInput): Promise<GetOfferResponse> => {
		const basePath = INVENTORY_BASE_PATH;

		const validatedInput = requireObjectEffect<OfferIdInput>(input, "input");
		const offerId = requireStringEffect(validatedInput.offerId, "offerId");

		return requestGetEffect<GetOfferResponse>(
			client,
			`${basePath}/offer/${offerId}`,
		);
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
	updateOffer: async (
		input: UpdateOfferInput,
	): Promise<CreateOfferResponse> => {
		const basePath = INVENTORY_BASE_PATH;

		const validatedInput = requireObjectEffect<UpdateOfferInput>(
			input,
			"input",
		);
		const offerId = requireStringEffect(validatedInput.offerId, "offerId");
		const offerUpdate = requireObjectEffect<UpdateOfferRequest>(
			validatedInput.body,
			"body",
		);
		validateOfferFormatEffect(offerUpdate, "body");

		return requestPutEffect<CreateOfferResponse>(
			client,
			`${basePath}/offer/${offerId}`,
			offerUpdate,
		);
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
	deleteOffer: async (input: OfferIdInput): Promise<DeleteOfferResponse> => {
		const basePath = INVENTORY_BASE_PATH;

		const validatedInput = requireObjectEffect<OfferIdInput>(input, "input");
		const offerId = requireStringEffect(validatedInput.offerId, "offerId");

		return requestDeleteEffect<DeleteOfferResponse>(
			client,
			`${basePath}/offer/${offerId}`,
		);
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
	getListingFees: async (
		input: GetListingFeesInput,
	): Promise<GetListingFeesResponse> => {
		const path = `${INVENTORY_BASE_PATH}/offer/get_listing_fees`;

		const validatedInput = requireObjectEffect<GetListingFeesInput>(
			input,
			"input",
		);
		const listingFeesRequest = requireObjectEffect<GetListingFeesRequest>(
			validatedInput.body,
			"body",
		);

		return requestPostEffect<GetListingFeesResponse>(
			client,
			path,
			listingFeesRequest,
		);
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
	publishOffer: async (input: OfferIdInput): Promise<PublishOfferResponse> => {
		const basePath = INVENTORY_BASE_PATH;

		const validatedInput = requireObjectEffect<OfferIdInput>(input, "input");
		const offerId = requireStringEffect(validatedInput.offerId, "offerId");

		return requestPostEffect<PublishOfferResponse>(
			client,
			`${basePath}/offer/${offerId}/publish`,
		);
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
	publishOfferByInventoryItemGroup: async (
		input: PublishOfferByInventoryItemGroupInput,
	): Promise<PublishOfferResponse> => {
		const path = `${INVENTORY_BASE_PATH}/offer/publish_by_inventory_item_group`;

		const validatedInput =
			requireObjectEffect<PublishOfferByInventoryItemGroupInput>(
				input,
				"input",
			);
		const publishGroupRequest =
			requireObjectEffect<PublishOfferByInventoryItemGroupRequest>(
				validatedInput.body,
				"body",
			);

		return requestPostEffect<PublishOfferResponse>(
			client,
			path,
			publishGroupRequest,
		);
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
	withdrawOffer: async (
		input: OfferIdInput,
	): Promise<WithdrawOfferResponse> => {
		const basePath = INVENTORY_BASE_PATH;

		const validatedInput = requireObjectEffect<OfferIdInput>(input, "input");
		const offerId = requireStringEffect(validatedInput.offerId, "offerId");

		return requestPostEffect<WithdrawOfferResponse>(
			client,
			`${basePath}/offer/${offerId}/withdraw`,
		);
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
	withdrawOfferByInventoryItemGroup: async (
		input: WithdrawOfferByInventoryItemGroupInput,
	): Promise<WithdrawOfferByInventoryItemGroupResponse> => {
		const path = `${INVENTORY_BASE_PATH}/offer/withdraw_by_inventory_item_group`;

		const validatedInput =
			requireObjectEffect<WithdrawOfferByInventoryItemGroupInput>(
				input,
				"input",
			);
		const withdrawGroupRequest =
			requireObjectEffect<WithdrawOfferByInventoryItemGroupRequest>(
				validatedInput.body,
				"body",
			);

		return requestPostEffect<WithdrawOfferByInventoryItemGroupResponse>(
			client,
			path,
			withdrawGroupRequest,
		);
	},
});
