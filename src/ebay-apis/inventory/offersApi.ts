import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
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
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellInventoryV1Oas3.js";
import { INVENTORY_BASE_PATH } from "./inventorySharedApi.js";
import { validateOfferFormatEffect } from "./offerFormatApi.js";

export interface GetOffersInput {
	readonly format?: string | undefined;
	readonly limit?: number | undefined;
	readonly marketplaceId?: string | undefined;
	readonly offset?: number | undefined;
	readonly sku: string;
}

export const MAX_BATCH_GET_OFFERS_SKUS = 25;

export const BATCH_GET_OFFERS_CONCURRENCY = 3;

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

export interface GetOffersBySkusResponse {
	readonly requestedSkuCount: number;
	readonly uniqueSkuCount: number;
	readonly successCount: number;
	readonly failureCount: number;
	readonly results: readonly GetOffersBySkuResult[];
}

export interface OfferIdInput {
	readonly offerId: string;
}

interface OfferAmount {
	readonly currency?: string | undefined;
	readonly value?: string | undefined;
}

interface OfferBestOfferTerms {
	readonly autoAcceptPrice?: OfferAmount | undefined;
	readonly autoDeclinePrice?: OfferAmount | undefined;
	readonly bestOfferEnabled?: boolean | undefined;
}

interface OfferListingPolicies {
	readonly bestOfferTerms?: OfferBestOfferTerms | undefined;
	readonly eBayPlusIfEligible?: boolean | undefined;
	readonly fulfillmentPolicyId?: string | undefined;
	readonly paymentPolicyId?: string | undefined;
	readonly productCompliancePolicyIds?: readonly string[] | undefined;
	readonly returnPolicyId?: string | undefined;
	readonly takeBackPolicyIds?: readonly string[] | undefined;
}

interface OfferPricingSummary {
	readonly auctionReservePrice?: OfferAmount | undefined;
	readonly auctionStartPrice?: OfferAmount | undefined;
	readonly minimumAdvertisedPrice?: OfferAmount | undefined;
	readonly originalRetailPrice?: OfferAmount | undefined;
	readonly price?: OfferAmount | undefined;
	readonly pricingVisibility?: string | undefined;
}

interface OfferCharity {
	readonly charityId?: string | undefined;
	readonly donationPercentage?: string | undefined;
}

interface OfferProducerResponsibility {
	readonly producerProductId?: string | undefined;
	readonly productDocumentationId?: string | undefined;
	readonly productPackageId?: string | undefined;
	readonly shipmentPackageId?: string | undefined;
}

interface OfferTax {
	readonly applyTax?: boolean | undefined;
	readonly thirdPartyTaxCategory?: string | undefined;
	readonly vatPercentage?: number | undefined;
}

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

interface BulkOfferWrite {
	readonly requests?: readonly OfferWrite[] | undefined;
}

export interface CreateOfferInput {
	readonly body: OfferWrite;
}

export interface UpdateOfferInput {
	readonly offerId: string;
	readonly body: OfferWrite;
}

export interface BulkCreateOfferInput {
	readonly body: BulkOfferWrite;
}

export interface BulkPublishOfferInput {
	readonly body: BulkPublishOfferRequest;
}

export interface GetListingFeesInput {
	readonly body: GetListingFeesRequest;
}

export interface PublishOfferByInventoryItemGroupInput {
	readonly body: PublishOfferByInventoryItemGroupRequest;
}

export interface WithdrawOfferByInventoryItemGroupInput {
	readonly body: WithdrawOfferByInventoryItemGroupRequest;
}

export type BulkCreateOfferRequest =
	components["schemas"]["BulkEbayOfferDetailsWithKeys"];

export type BulkCreateOfferResponse =
	components["schemas"]["BulkOfferResponse"];

export type BulkPublishOfferRequest = components["schemas"]["BulkOffer"];

export type BulkPublishOfferResponse =
	components["schemas"]["BulkPublishResponse"];

export type GetOffersResponse = components["schemas"]["Offers"];

export type CreateOfferRequest =
	components["schemas"]["EbayOfferDetailsWithKeys"];

export type CreateOfferResponse = components["schemas"]["OfferResponse"];

export type GetOfferResponse = components["schemas"]["EbayOfferDetailsWithAll"];

export type UpdateOfferRequest =
	components["schemas"]["EbayOfferDetailsWithId"];

export type DeleteOfferResponse = void;

export type GetListingFeesRequest = components["schemas"]["OfferKeysWithId"];

export type GetListingFeesResponse =
	components["schemas"]["FeesSummaryResponse"];

export type PublishOfferResponse = components["schemas"]["PublishResponse"];

export type PublishOfferByInventoryItemGroupRequest =
	components["schemas"]["PublishByInventoryItemGroupRequest"];

export type WithdrawOfferResponse = components["schemas"]["WithdrawResponse"];

export type WithdrawOfferByInventoryItemGroupRequest =
	components["schemas"]["WithdrawByInventoryItemGroupRequest"];

// biome-ignore lint/style/useExportsLast: public endpoint types intentionally precede private implementation helpers
export type WithdrawOfferByInventoryItemGroupResponse = void;

// Keep the shared request implementation private so the existing and batch methods cannot drift.
async function getOffersEffect(
	client: EbayApiClient,
	input: GetOffersInput,
): Promise<GetOffersResponse> {
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
}

function isOffersRequestError(cause: unknown): cause is Error {
	return cause instanceof Error;
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

		let failureType = "EndpointInputError";

		if (cause.message.startsWith("eBay ")) {
			failureType = "EbayApiError";
		}

		return {
			sku: request.sku,
			status: "failure",
			error: {
				type: failureType,
				message: cause.message,
			},
		};
	}
}

export function createInventoryOffersMethods(client: EbayApiClient) {
	return {
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

		getOffers: (input: GetOffersInput): Promise<GetOffersResponse> =>
			getOffersEffect(client, input),

		getOffersBySkus: async (
			input: GetOffersBySkusInput,
		): Promise<GetOffersBySkusResponse> => {
			const validatedInput = requireObjectEffect<GetOffersBySkusInput>(
				input,
				"input",
			);

			if (!Array.isArray(validatedInput.skus)) {
				throw new Error("skus must be an array");
			}

			if (
				validatedInput.skus.length == 0 ||
				validatedInput.skus.length > MAX_BATCH_GET_OFFERS_SKUS
			) {
				throw new Error(
					`skus must contain between 1 and ${MAX_BATCH_GET_OFFERS_SKUS} entries`,
				);
			}

			for (const sku of validatedInput.skus) {
				if (
					typeof sku != "string" ||
					sku.trim().length == 0 ||
					sku.length > 50
				) {
					throw new Error(
						"each SKU must be a non-empty string of at most 50 characters",
					);
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
				return skuResult.status == "success";
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

		getOffer: async (input: OfferIdInput): Promise<GetOfferResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput = requireObjectEffect<OfferIdInput>(input, "input");
			const offerId = requireStringEffect(validatedInput.offerId, "offerId");

			return requestGetEffect<GetOfferResponse>(
				client,
				`${basePath}/offer/${offerId}`,
			);
		},

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

		deleteOffer: async (input: OfferIdInput): Promise<DeleteOfferResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput = requireObjectEffect<OfferIdInput>(input, "input");
			const offerId = requireStringEffect(validatedInput.offerId, "offerId");

			return requestDeleteEffect<DeleteOfferResponse>(
				client,
				`${basePath}/offer/${offerId}`,
			);
		},

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

		publishOffer: async (
			input: OfferIdInput,
		): Promise<PublishOfferResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput = requireObjectEffect<OfferIdInput>(input, "input");
			const offerId = requireStringEffect(validatedInput.offerId, "offerId");

			return requestPostEffect<PublishOfferResponse>(
				client,
				`${basePath}/offer/${offerId}/publish`,
			);
		},

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
	};
}
