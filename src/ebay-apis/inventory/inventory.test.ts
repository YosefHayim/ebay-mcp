import { invalidInput } from "@tests/helpers/invalidInput.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InventoryApi } from "@/ebay-apis/inventory/inventoryApi.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import { EbayApiError, EndpointInputError } from "@/ebay-client/request.js";

const expectEndpointInputError = async (
	program: Promise<unknown>,
	parameter: string,
): Promise<void> => {
	let thrown: unknown;

	try {
		await program;
	} catch (error) {
		thrown = error;
	}

	expect(thrown).toBeInstanceOf(EndpointInputError);

	if (thrown instanceof EndpointInputError) {
		expect(thrown._tag).toBe("EndpointInputError");
		expect(thrown.parameter).toBe(parameter);
	}
};

describe("InventoryApi", () => {
	let client: EbayApiClient;
	let api: InventoryApi;

	beforeEach(() => {
		client = {
			get: vi.fn(),
			post: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		} as unknown as EbayApiClient;
		api = new InventoryApi(client);
	});

	describe("inventory items", () => {
		it("gets inventory items without query params", async () => {
			const stubInventoryItems = { inventoryItems: [] };
			vi.mocked(client.get).mockResolvedValue(stubInventoryItems);

			const inventoryItems = await api.getInventoryItems();

			expect(client.get).toHaveBeenCalledWith(
				"/sell/inventory/v1/inventory_item",
			);
			expect(inventoryItems).toBe(stubInventoryItems);
		});

		it("gets inventory items with validated pagination query params", async () => {
			vi.mocked(client.get).mockResolvedValue({ inventoryItems: [] });

			await api.getInventoryItems({ limit: 10, offset: 5 });

			expect(client.get).toHaveBeenCalledWith(
				"/sell/inventory/v1/inventory_item",
				{
					limit: "10",
					offset: "5",
				},
			);
		});

		it("rejects invalid inventory item pagination before calling eBay", async () => {
			await expectEndpointInputError(
				api.getInventoryItems({ limit: 0 }),
				"limit",
			);
			await expectEndpointInputError(
				api.getInventoryItems({ limit: 10, offset: -1 }),
				"offset",
			);

			expect(client.get).not.toHaveBeenCalled();
		});

		it("gets one inventory item by SKU", async () => {
			const stubInventoryItem = { sku: "SKU-1" };
			vi.mocked(client.get).mockResolvedValue(stubInventoryItem);

			const inventoryItem = await api.getInventoryItem({ sku: "SKU-1" });

			expect(client.get).toHaveBeenCalledWith(
				"/sell/inventory/v1/inventory_item/SKU-1",
			);
			expect(inventoryItem).toBe(stubInventoryItem);
		});

		it("creates or replaces one inventory item by SKU", async () => {
			const newItem = { product: { title: "Test Product" }, condition: "NEW" };
			vi.mocked(client.put).mockResolvedValue({ warnings: [] });

			await api.createOrReplaceInventoryItem({ sku: "SKU-1", body: newItem });

			expect(client.put).toHaveBeenCalledWith(
				"/sell/inventory/v1/inventory_item/SKU-1",
				newItem,
			);
		});

		it("deletes one inventory item by SKU", async () => {
			vi.mocked(client.delete).mockResolvedValue(undefined);

			await api.deleteInventoryItem({ sku: "SKU-1" });

			expect(client.delete).toHaveBeenCalledWith(
				"/sell/inventory/v1/inventory_item/SKU-1",
			);
		});

		it("rejects missing inventory item fields before calling eBay", async () => {
			await expectEndpointInputError(api.getInventoryItem({ sku: "" }), "sku");
			await expectEndpointInputError(
				api.createOrReplaceInventoryItem({
					sku: "SKU-1",
					body: invalidInput(undefined),
				}),
				"body",
			);

			expect(client.get).not.toHaveBeenCalled();
			expect(client.put).not.toHaveBeenCalled();
		});
	});

	describe("bulk inventory and compatibility", () => {
		it("posts bulk inventory item requests", async () => {
			const bulkInventoryRequest = { requests: [{ sku: "SKU-1" }] };
			vi.mocked(client.post).mockResolvedValue({ responses: [] });

			await api.bulkCreateOrReplaceInventoryItem({
				body: bulkInventoryRequest,
			});
			await api.bulkGetInventoryItem({ body: bulkInventoryRequest });

			expect(client.post).toHaveBeenNthCalledWith(
				1,
				"/sell/inventory/v1/bulk_create_or_replace_inventory_item",
				bulkInventoryRequest,
			);
			expect(client.post).toHaveBeenNthCalledWith(
				2,
				"/sell/inventory/v1/bulk_get_inventory_item",
				bulkInventoryRequest,
			);
		});

		it("posts bulk price and quantity requests", async () => {
			const priceQuantityRequest = {
				requests: [{ offerId: "OFFER-1", availableQuantity: 3 }],
			};
			vi.mocked(client.post).mockResolvedValue({ responses: [] });

			await api.bulkUpdatePriceQuantity({ body: priceQuantityRequest });

			expect(client.post).toHaveBeenCalledWith(
				"/sell/inventory/v1/bulk_update_price_quantity",
				priceQuantityRequest,
			);
		});

		it("gets, writes, and deletes product compatibility", async () => {
			const compatibility = { compatibleProducts: [] };
			vi.mocked(client.get).mockResolvedValue(compatibility);
			vi.mocked(client.put).mockResolvedValue({ warnings: [] });
			vi.mocked(client.delete).mockResolvedValue(undefined);

			await api.getProductCompatibility({ sku: "SKU-1" });
			await api.createOrReplaceProductCompatibility({
				sku: "SKU-1",
				body: compatibility,
			});
			await api.deleteProductCompatibility({ sku: "SKU-1" });

			expect(client.get).toHaveBeenCalledWith(
				"/sell/inventory/v1/inventory_item/SKU-1/product_compatibility",
			);
			expect(client.put).toHaveBeenCalledWith(
				"/sell/inventory/v1/inventory_item/SKU-1/product_compatibility",
				compatibility,
			);
			expect(client.delete).toHaveBeenCalledWith(
				"/sell/inventory/v1/inventory_item/SKU-1/product_compatibility",
			);
		});
	});

	describe("inventory item groups", () => {
		it("gets, writes, and deletes inventory item groups", async () => {
			const itemGroup = {
				aspects: {},
				inventoryItemGroupKey: "GROUP-1",
				title: "Test Group",
				variantSKUs: ["SKU-1"],
			};
			vi.mocked(client.get).mockResolvedValue(itemGroup);
			vi.mocked(client.put).mockResolvedValue({ warnings: [] });
			vi.mocked(client.delete).mockResolvedValue(undefined);

			await api.getInventoryItemGroup({ inventoryItemGroupKey: "GROUP-1" });
			await api.createOrReplaceInventoryItemGroup({
				inventoryItemGroupKey: "GROUP-1",
				body: itemGroup,
			});
			await api.deleteInventoryItemGroup({ inventoryItemGroupKey: "GROUP-1" });

			expect(client.get).toHaveBeenCalledWith(
				"/sell/inventory/v1/inventory_item_group/GROUP-1",
			);
			expect(client.put).toHaveBeenCalledWith(
				"/sell/inventory/v1/inventory_item_group/GROUP-1",
				itemGroup,
			);
			expect(client.delete).toHaveBeenCalledWith(
				"/sell/inventory/v1/inventory_item_group/GROUP-1",
			);
		});
	});

	describe("SKU location mappings", () => {
		it("gets, writes, and deletes SKU location mappings by generated operation names", async () => {
			const locationMapping = {
				locations: [{ merchantLocationKey: "LOC-1" }],
			};
			vi.mocked(client.get).mockResolvedValue(locationMapping);
			vi.mocked(client.put).mockResolvedValue(undefined);
			vi.mocked(client.delete).mockResolvedValue(undefined);

			await api.getSkuLocationMapping({ listingId: "LISTING-1", sku: "SKU-1" });
			await api.createOrReplaceSkuLocationMapping({
				listingId: "LISTING-1",
				sku: "SKU-1",
				body: locationMapping,
			});
			await api.deleteSkuLocationMapping({
				listingId: "LISTING-1",
				sku: "SKU-1",
			});

			expect(client.get).toHaveBeenCalledWith(
				"/sell/inventory/v1/listing/LISTING-1/sku/SKU-1/locations",
			);
			expect(client.put).toHaveBeenCalledWith(
				"/sell/inventory/v1/listing/LISTING-1/sku/SKU-1/locations",
				locationMapping,
			);
			expect(client.delete).toHaveBeenCalledWith(
				"/sell/inventory/v1/listing/LISTING-1/sku/SKU-1/locations",
			);
		});

		it("rejects missing SKU location mapping IDs before calling eBay", async () => {
			await expectEndpointInputError(
				api.getSkuLocationMapping({ listingId: "", sku: "SKU-1" }),
				"listingId",
			);
			await expectEndpointInputError(
				api.deleteSkuLocationMapping({ listingId: "LISTING-1", sku: "" }),
				"sku",
			);

			expect(client.get).not.toHaveBeenCalled();
			expect(client.delete).not.toHaveBeenCalled();
		});
	});

	describe("offers", () => {
		it("gets offers with generated query parameter names", async () => {
			vi.mocked(client.get).mockResolvedValue({ offers: [] });

			await api.getOffers({
				format: "FIXED_PRICE",
				limit: 25,
				marketplaceId: "EBAY_US",
				offset: 50,
				sku: "SKU-1",
			});

			expect(client.get).toHaveBeenCalledWith("/sell/inventory/v1/offer", {
				format: "FIXED_PRICE",
				limit: "25",
				marketplace_id: "EBAY_US",
				offset: "50",
				sku: "SKU-1",
			});
		});

		it("creates, gets, updates, and deletes offers", async () => {
			const offer = {
				sku: "SKU-1",
				marketplaceId: "EBAY_US",
				format: "FIXED_PRICE",
			};
			vi.mocked(client.post).mockResolvedValue({ offerId: "OFFER-1" });
			vi.mocked(client.get).mockResolvedValue({ offerId: "OFFER-1" });
			vi.mocked(client.put).mockResolvedValue({ offerId: "OFFER-1" });
			vi.mocked(client.delete).mockResolvedValue(undefined);

			await api.createOffer({ body: offer });
			await api.getOffer({ offerId: "OFFER-1" });
			await api.updateOffer({ offerId: "OFFER-1", body: offer });
			await api.deleteOffer({ offerId: "OFFER-1" });

			expect(client.post).toHaveBeenCalledWith(
				"/sell/inventory/v1/offer",
				offer,
			);
			expect(client.get).toHaveBeenCalledWith(
				"/sell/inventory/v1/offer/OFFER-1",
			);
			expect(client.put).toHaveBeenCalledWith(
				"/sell/inventory/v1/offer/OFFER-1",
				offer,
			);
			expect(client.delete).toHaveBeenCalledWith(
				"/sell/inventory/v1/offer/OFFER-1",
			);
		});

		it("publishes and withdraws offers without synthetic request bodies", async () => {
			vi.mocked(client.post).mockResolvedValue({ listingId: "LISTING-1" });

			await api.publishOffer({ offerId: "OFFER-1" });
			await api.withdrawOffer({ offerId: "OFFER-1" });

			expect(client.post).toHaveBeenNthCalledWith(
				1,
				"/sell/inventory/v1/offer/OFFER-1/publish",
			);
			expect(client.post).toHaveBeenNthCalledWith(
				2,
				"/sell/inventory/v1/offer/OFFER-1/withdraw",
			);
		});

		it("posts offer bulk and fee request bodies", async () => {
			const bulkCreateBody = { requests: [{ sku: "SKU-1" }] };
			const bulkPublishBody = { requests: [{ offerId: "OFFER-1" }] };
			const feesBody = { offers: [{ offerId: "OFFER-1" }] };
			vi.mocked(client.post).mockResolvedValue({ responses: [] });

			await api.bulkCreateOffer({ body: bulkCreateBody });
			await api.bulkPublishOffer({ body: bulkPublishBody });
			await api.getListingFees({ body: feesBody });

			expect(client.post).toHaveBeenNthCalledWith(
				1,
				"/sell/inventory/v1/bulk_create_offer",
				bulkCreateBody,
			);
			expect(client.post).toHaveBeenNthCalledWith(
				2,
				"/sell/inventory/v1/bulk_publish_offer",
				bulkPublishBody,
			);
			expect(client.post).toHaveBeenNthCalledWith(
				3,
				"/sell/inventory/v1/offer/get_listing_fees",
				feesBody,
			);
		});

		it("posts inventory item group offer request bodies", async () => {
			const itemGroupOfferRequest = {
				inventoryItemGroupKey: "GROUP-1",
				marketplaceId: "EBAY_US",
			};
			vi.mocked(client.post).mockResolvedValue({ listingId: "LISTING-1" });

			await api.publishOfferByInventoryItemGroup({
				body: itemGroupOfferRequest,
			});
			await api.withdrawOfferByInventoryItemGroup({
				body: itemGroupOfferRequest,
			});

			expect(client.post).toHaveBeenNthCalledWith(
				1,
				"/sell/inventory/v1/offer/publish_by_inventory_item_group",
				itemGroupOfferRequest,
			);
			expect(client.post).toHaveBeenNthCalledWith(
				2,
				"/sell/inventory/v1/offer/withdraw_by_inventory_item_group",
				itemGroupOfferRequest,
			);
		});
	});

	describe("inventory locations", () => {
		it("gets inventory locations with validated pagination query params", async () => {
			vi.mocked(client.get).mockResolvedValue({ locations: [] });

			await api.getInventoryLocations({ limit: 20, offset: 40 });

			expect(client.get).toHaveBeenCalledWith("/sell/inventory/v1/location", {
				limit: "20",
				offset: "40",
			});
		});

		it("gets, creates, updates, and deletes inventory locations", async () => {
			const location = { name: "Warehouse", locationTypes: ["WAREHOUSE"] };
			vi.mocked(client.get).mockResolvedValue({ merchantLocationKey: "LOC-1" });
			vi.mocked(client.post).mockResolvedValue(undefined);
			vi.mocked(client.delete).mockResolvedValue(undefined);

			await api.getInventoryLocation({ merchantLocationKey: "LOC-1" });
			await api.createInventoryLocation({
				merchantLocationKey: "LOC-1",
				body: location,
			});
			await api.updateInventoryLocation({
				merchantLocationKey: "LOC-1",
				body: location,
			});
			await api.deleteInventoryLocation({ merchantLocationKey: "LOC-1" });

			expect(client.get).toHaveBeenCalledWith(
				"/sell/inventory/v1/location/LOC-1",
			);
			expect(client.post).toHaveBeenNthCalledWith(
				1,
				"/sell/inventory/v1/location/LOC-1",
				location,
			);
			expect(client.post).toHaveBeenNthCalledWith(
				2,
				"/sell/inventory/v1/location/LOC-1/update_location_details",
				location,
			);
			expect(client.delete).toHaveBeenCalledWith(
				"/sell/inventory/v1/location/LOC-1",
			);
		});

		it("enables and disables inventory locations without synthetic request bodies", async () => {
			vi.mocked(client.post).mockResolvedValue(undefined);

			await api.disableInventoryLocation({ merchantLocationKey: "LOC-1" });
			await api.enableInventoryLocation({ merchantLocationKey: "LOC-1" });

			expect(client.post).toHaveBeenNthCalledWith(
				1,
				"/sell/inventory/v1/location/LOC-1/disable",
			);
			expect(client.post).toHaveBeenNthCalledWith(
				2,
				"/sell/inventory/v1/location/LOC-1/enable",
			);
		});

		it("rejects missing inventory location fields before calling eBay", async () => {
			await expectEndpointInputError(
				api.getInventoryLocation({ merchantLocationKey: "" }),
				"merchantLocationKey",
			);
			await expectEndpointInputError(
				api.createInventoryLocation({
					merchantLocationKey: "LOC-1",
					body: invalidInput(undefined),
				}),
				"body",
			);

			expect(client.get).not.toHaveBeenCalled();
			expect(client.post).not.toHaveBeenCalled();
		});
	});

	describe("listing migration and request failures", () => {
		it("posts bulk migrate listing request bodies", async () => {
			const migrateRequest = { requests: [{ listingId: "LISTING-1" }] };
			vi.mocked(client.post).mockResolvedValue({ responses: [] });

			await api.bulkMigrateListing({ body: migrateRequest });

			expect(client.post).toHaveBeenCalledWith(
				"/sell/inventory/v1/bulk_migrate_listing",
				migrateRequest,
			);
		});

		it("returns tagged API errors for transport failures", async () => {
			vi.mocked(client.get).mockRejectedValue(new Error("Not Found"));

			let thrown: unknown;

			try {
				await api.getInventoryItem({ sku: "SKU-1" });
			} catch (error) {
				thrown = error;
			}

			expect(thrown).toBeInstanceOf(EbayApiError);

			if (thrown instanceof EbayApiError) {
				expect(thrown._tag).toBe("EbayApiError");
				expect(thrown.method).toBe("GET");
				expect(thrown.path).toBe("/sell/inventory/v1/inventory_item/SKU-1");
			}
		});
	});
});
