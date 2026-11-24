import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MediaApi } from "@/ebay-apis/inventory/mediaApi.js";
import { createMediaAttachMethods } from "@/ebay-apis/inventory/mediaAttachApi.js";

import type { LocalMediaFile } from "@/shared/localMedia.js";

type AttachItems = Parameters<typeof createMediaAttachMethods>[0];

const mediaFile = (
	source: string,
	kind: "image" | "video",
): LocalMediaFile => ({
	source,
	path: source,
	fileName: source.split("/").at(-1) ?? source,
	mimeType: kind === "image" ? "image/jpeg" : "video/mp4",
	size: 4,
	kind,
	bytes: Buffer.from([1, 2, 3, 4]),
});

const existingItem = {
	sku: "SKU-1",
	locale: "en_US",
	condition: "USED_GOOD",
	availability: { shipToLocationAvailability: { quantity: 1 } },
	product: {
		title: "Mega Drive",
		imageUrls: ["https://i.ebayimg.com/old.jpg"],
		aspects: { Brand: ["Sega"] },
	},
	groupIds: ["G1"],
};

interface MockItems {
	getInventoryItem: ReturnType<typeof vi.fn>;
	createOrReplaceInventoryItem: ReturnType<typeof vi.fn>;
}

interface MockMedia {
	createImageFromFile: ReturnType<typeof vi.fn>;
	uploadVideoFile: ReturnType<typeof vi.fn>;
}

describe("attachMediaToInventoryItem", () => {
	let items: MockItems;
	let media: MockMedia;
	let attach: ReturnType<
		typeof createMediaAttachMethods
	>["attachMediaToInventoryItem"];

	beforeEach(() => {
		items = {
			getInventoryItem: vi.fn().mockReturnValue(Promise.resolve(existingItem)),
			createOrReplaceInventoryItem: vi
				.fn()
				.mockReturnValue(Promise.resolve(undefined)),
		};
		media = {
			createImageFromFile: vi.fn((file: LocalMediaFile) =>
				Promise.resolve({
					source: file.source,
					imageUrl: `https://i.ebayimg.com/${file.fileName}`,
				}),
			),
			uploadVideoFile: vi.fn(() =>
				Promise.resolve({ videoId: "VID-1", status: "LIVE" }),
			),
		};
		({ attachMediaToInventoryItem: attach } = createMediaAttachMethods(
			items as unknown as AttachItems,
			media as unknown as MediaApi,
		));
	});

	it("appends uploaded media in order and preserves the rest of the item", async () => {
		const attachment = await attach({
			sku: "SKU-1",
			images: [mediaFile("/m/a.jpg", "image"), mediaFile("/m/b.jpg", "image")],
			videos: [mediaFile("/m/clip.mp4", "video")],
		});

		expect(attachment.updated).toBe(true);
		expect(attachment.imageUrls).toEqual([
			"https://i.ebayimg.com/old.jpg",
			"https://i.ebayimg.com/a.jpg",
			"https://i.ebayimg.com/b.jpg",
		]);
		expect(attachment.videoIds).toEqual(["VID-1"]);
		expect(items.createOrReplaceInventoryItem).toHaveBeenCalledWith({
			sku: "SKU-1",
			contentLanguage: "en-US",
			body: {
				availability: existingItem.availability,
				condition: "USED_GOOD",
				conditionDescription: undefined,
				conditionDescriptors: undefined,
				packageWeightAndSize: undefined,
				product: {
					title: "Mega Drive",
					aspects: { Brand: ["Sega"] },
					imageUrls: attachment.imageUrls,
					videoIds: ["VID-1"],
				},
			},
		});
	});

	it("replaces existing media when asked", async () => {
		const attachment = await attach({
			sku: "SKU-1",
			images: [mediaFile("/m/a.jpg", "image")],
			videos: [],
			replaceExisting: true,
		});

		expect(attachment.imageUrls).toEqual(["https://i.ebayimg.com/a.jpg"]);
	});

	it("replaces only the media family the caller supplied", async () => {
		const withVideo = {
			...existingItem,
			product: { ...existingItem.product, videoIds: ["VID-OLD"] },
		};
		items.getInventoryItem.mockReturnValue(Promise.resolve(withVideo));

		const imagesOnly = await attach({
			sku: "SKU-1",
			images: [mediaFile("/m/a.jpg", "image")],
			videos: [],
			replaceExisting: true,
		});
		expect(imagesOnly.imageUrls).toEqual(["https://i.ebayimg.com/a.jpg"]);
		expect(imagesOnly.videoIds).toEqual(["VID-OLD"]);

		const videosOnly = await attach({
			sku: "SKU-1",
			images: [],
			videos: [mediaFile("/m/clip.mp4", "video")],
			replaceExisting: true,
		});
		expect(videosOnly.imageUrls).toEqual(["https://i.ebayimg.com/old.jpg"]);
		expect(videosOnly.videoIds).toEqual(["VID-1"]);
		expect(items.createOrReplaceInventoryItem).toHaveBeenLastCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({
					product: expect.objectContaining({
						imageUrls: ["https://i.ebayimg.com/old.jpg"],
						videoIds: ["VID-1"],
					}),
				}),
			}),
		);
	});

	it("writes onto the item as it is right before the update, not the earlier snapshot", async () => {
		const edited = {
			...existingItem,
			availability: { shipToLocationAvailability: { quantity: 7 } },
			product: {
				...existingItem.product,
				title: "Mega Drive II",
				imageUrls: [
					"https://i.ebayimg.com/old.jpg",
					"https://i.ebayimg.com/meanwhile.jpg",
				],
			},
		};
		items.getInventoryItem
			.mockReturnValueOnce(Promise.resolve(existingItem))
			.mockReturnValueOnce(Promise.resolve(edited));

		const attachment = await attach({
			sku: "SKU-1",
			images: [mediaFile("/m/a.jpg", "image")],
			videos: [],
		});

		expect(items.getInventoryItem).toHaveBeenCalledTimes(2);
		expect(attachment.imageUrls).toEqual([
			"https://i.ebayimg.com/old.jpg",
			"https://i.ebayimg.com/meanwhile.jpg",
			"https://i.ebayimg.com/a.jpg",
		]);
		expect(items.createOrReplaceInventoryItem).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({
					availability: { shipToLocationAvailability: { quantity: 7 } },
					product: expect.objectContaining({
						title: "Mega Drive II",
						imageUrls: attachment.imageUrls,
					}),
				}),
			}),
		);
	});

	it("sends the item locale as Content-Language and omits it when eBay returned none", async () => {
		items.getInventoryItem.mockReturnValue(
			Promise.resolve({ ...existingItem, locale: "de_DE" }),
		);
		await attach({
			sku: "SKU-1",
			images: [mediaFile("/m/a.jpg", "image")],
			videos: [],
		});
		expect(items.createOrReplaceInventoryItem).toHaveBeenLastCalledWith(
			expect.objectContaining({ contentLanguage: "de-DE" }),
		);

		items.getInventoryItem.mockReturnValue(
			Promise.resolve({ ...existingItem, locale: undefined }),
		);
		await attach({
			sku: "SKU-1",
			images: [mediaFile("/m/a.jpg", "image")],
			videos: [],
		});
		expect(items.createOrReplaceInventoryItem).toHaveBeenLastCalledWith(
			expect.objectContaining({ contentLanguage: undefined }),
		);
	});

	it("leaves the item untouched when any upload fails", async () => {
		media.createImageFromFile.mockImplementationOnce(() =>
			Promise.reject(new Error("EPS down")),
		);

		let error: unknown;

		try {
			await attach({
				sku: "SKU-1",
				images: [
					mediaFile("/m/a.jpg", "image"),
					mediaFile("/m/b.jpg", "image"),
				],
				videos: [],
			});
		} catch (caught) {
			error = caught;
		}

		expect(error).toBeInstanceOf(Error);

		if (error instanceof Error) {
			expect(error.message).toContain("Results:");
			expect(error.message).toContain("1 of 2 uploads failed");
			expect(error.message).toContain("allowPartial");
			expect(error.message).toContain("/m/a.jpg");
			expect(error.message).toContain("EPS down");
			expect(error.message).toContain("/m/b.jpg");
		}
		expect(items.createOrReplaceInventoryItem).not.toHaveBeenCalled();
		expect(items.getInventoryItem).toHaveBeenCalledTimes(1);
	});

	it("attaches the successful uploads when allowPartial is set", async () => {
		media.createImageFromFile.mockImplementationOnce(() =>
			Promise.reject(new Error("EPS down")),
		);

		const attachment = await attach({
			sku: "SKU-1",
			images: [mediaFile("/m/a.jpg", "image"), mediaFile("/m/b.jpg", "image")],
			videos: [],
			allowPartial: true,
		});

		expect(attachment.updated).toBe(true);
		expect(attachment.imageUrls).toEqual([
			"https://i.ebayimg.com/old.jpg",
			"https://i.ebayimg.com/b.jpg",
		]);
		expect(attachment.images[0].status).toBe("failed");
	});

	it("treats a blocked video as a failure and a processing one as attachable", async () => {
		media.uploadVideoFile
			.mockReturnValueOnce(
				Promise.resolve({
					videoId: "VID-BAD",
					status: "BLOCKED",
					moderation: { rejectReasons: ["COPYRIGHT"] },
				}),
			)
			.mockReturnValueOnce(
				Promise.resolve({ videoId: "VID-SLOW", status: "PROCESSING" }),
			);

		let blocked: unknown;

		try {
			await attach({
				sku: "SKU-1",
				images: [],
				videos: [mediaFile("/m/bad.mp4", "video")],
			});
		} catch (caught) {
			blocked = caught;
		}

		expect(blocked).toBeInstanceOf(Error);

		if (blocked instanceof Error) {
			expect(blocked.message).toContain("COPYRIGHT");
		}

		const slow = await attach({
			sku: "SKU-1",
			images: [],
			videos: [mediaFile("/m/slow.mp4", "video")],
		});
		expect(slow.videos[0]).toMatchObject({
			status: "processing",
			videoId: "VID-SLOW",
		});
		expect(slow.videoIds).toEqual(["VID-SLOW"]);
	});

	it("fails before reading the item when nothing was given", async () => {
		let error: unknown;

		try {
			await attach({ sku: "SKU-1", images: [], videos: [] });
		} catch (caught) {
			error = caught;
		}

		expect(error).toBeInstanceOf(Error);

		if (error instanceof Error) {
			expect(error).toBeInstanceOf(Error);
		}
		expect(items.getInventoryItem).not.toHaveBeenCalled();
	});

	it("propagates a missing inventory item without uploading anything", async () => {
		items.getInventoryItem.mockReturnValue(Promise.reject(new Error("404")));

		await expect(
			attach({
				sku: "SKU-404",
				images: [mediaFile("/m/a.jpg", "image")],
				videos: [],
			}),
		).rejects.toThrow("404");
		expect(media.createImageFromFile).not.toHaveBeenCalled();
	});
});
