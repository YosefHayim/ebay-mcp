import type { components } from "@/ebay-openapi-types/sellInventoryV1Oas3.js";
import { getErrorMessage } from "@/shared/errors.js";
import type { LocalMediaFile } from "@/shared/localMedia.js";
import type { createInventoryItemsMethods, InventoryItem } from "./itemsApi.js";
import type { MediaApi, UploadedImage, Video } from "./mediaApi.js";

type InventoryItemsMethods = ReturnType<typeof createInventoryItemsMethods>;

type InventoryItemWithSku =
	components["schemas"]["InventoryItemWithSkuLocaleGroupid"];
type Product = components["schemas"]["Product"];

/** Input accepted by attachMediaToInventoryItem. */
export interface AttachMediaInput {
	/** Seller-defined SKU of the inventory item to update. */
	readonly sku: string;
	/** Validated image files in listing order. */
	readonly images: readonly LocalMediaFile[];
	/** Validated video files. */
	readonly videos: readonly LocalMediaFile[];
	/**
	 * Replace the item's current media instead of appending to it. Only the
	 * families with supplied files are replaced: images-only input keeps the
	 * item's videos, and videos-only input keeps its images.
	 */
	readonly replaceExisting?: boolean | undefined;
	/** Update the item with the successful uploads even when some failed. */
	readonly allowPartial?: boolean | undefined;
	/** Longest time to wait for each video to process. */
	readonly maxWaitMs?: number | undefined;
	/** Delay between video status polls. */
	readonly pollIntervalMs?: number | undefined;
}

/** Per-file outcome of an attach run. */
export interface MediaUploadOutcome {
	/** Caller-supplied reference. */
	readonly source: string;
	/** Media family. */
	readonly kind: "image" | "video";
	/** `uploaded` is final; `processing` means eBay is still transcoding the video; `failed` was not attached. */
	readonly status: "uploaded" | "processing" | "failed";
	/** EPS URL for uploaded images. */
	readonly imageUrl?: string | undefined;
	/** Media API image ID when eBay returned one. */
	readonly imageId?: string | undefined;
	/** Expiry of an unused image. */
	readonly expirationDate?: string | undefined;
	/** Video ID for uploaded or processing videos. */
	readonly videoId?: string | undefined;
	/** eBay's video status. */
	readonly videoStatus?: string | undefined;
	/** Why the upload failed. */
	readonly error?: string | undefined;
}

/** Result of attachMediaToInventoryItem. */
export interface AttachMediaResult {
	/** Seller-defined SKU. */
	readonly sku: string;
	/** Whether the inventory item was rewritten. */
	readonly updated: boolean;
	/** Image outcomes in input order. */
	readonly images: readonly MediaUploadOutcome[];
	/** Video outcomes in input order. */
	readonly videos: readonly MediaUploadOutcome[];
	/** `product.imageUrls` after the update (or as it would have been). */
	readonly imageUrls: readonly string[];
	/** `product.videoIds` after the update (or as it would have been). */
	readonly videoIds: readonly string[];
}

/** Attach run that uploaded media but left the inventory item untouched. */

/** Methods added onto {@link MediaApi} by {@link createMediaAttachMethods}. */
export interface MediaAttachMethods {
	attachMediaToInventoryItem: (
		input: AttachMediaInput,
	) => Promise<AttachMediaResult>;
}

/** Media fields of `product` that the attach run rewrites. */
interface ProductMedia {
	readonly imageUrls: string[];
	readonly videoIds: string[];
}

const dedupe = (values: readonly string[]): string[] => [...new Set(values)];

/** Keeps only the fields createOrReplaceInventoryItem accepts (drops sku/group metadata). */
const toInventoryItemBody = (
	inventoryItem: InventoryItemWithSku,
): InventoryItem => ({
	availability: inventoryItem.availability,
	condition: inventoryItem.condition,
	conditionDescription: inventoryItem.conditionDescription,
	conditionDescriptors: inventoryItem.conditionDescriptors,
	packageWeightAndSize: inventoryItem.packageWeightAndSize,
	product: inventoryItem.product,
});

/** `Content-Language` value for an inventory item locale such as `en_US`. */
const contentLanguageOf = (locale: string | undefined): string | undefined =>
	locale?.replace("_", "-");

/**
 * Merges freshly uploaded media into the product's current media. With
 * `replaceExisting`, a family is replaced only when the caller supplied files
 * for it; the other family is carried over untouched.
 */
const mergeMedia = (
	product: Product,
	input: AttachMediaInput,
	uploaded: ProductMedia,
): ProductMedia => {
	const replaceImages =
		input.replaceExisting === true && input.images.length > 0;
	const replaceVideos =
		input.replaceExisting === true && input.videos.length > 0;
	return {
		imageUrls: dedupe(
			replaceImages
				? uploaded.imageUrls
				: [...(product.imageUrls ?? []), ...uploaded.imageUrls],
		),
		videoIds: dedupe(
			replaceVideos
				? uploaded.videoIds
				: [...(product.videoIds ?? []), ...uploaded.videoIds],
		),
	};
};

/** Media references from the outcomes that can go onto the item. */
const uploadedMedia = (
	images: readonly MediaUploadOutcome[],
	videos: readonly MediaUploadOutcome[],
): ProductMedia => ({
	imageUrls: images.flatMap((outcome) =>
		outcome.imageUrl ? [outcome.imageUrl] : [],
	),
	videoIds: videos.flatMap((outcome) =>
		outcome.status !== "failed" && outcome.videoId ? [outcome.videoId] : [],
	),
});

const imageOutcome = (image: UploadedImage): MediaUploadOutcome => ({
	source: image.source,
	kind: "image",
	status: "uploaded",
	imageUrl: image.imageUrl,
	imageId: image.imageId,
	expirationDate: image.expirationDate,
});

const videoOutcome = (source: string, video: Video): MediaUploadOutcome => {
	const base = {
		source,
		kind: "video" as const,
		videoId: video.videoId,
		videoStatus: video.status,
	};
	if (video.status === "LIVE") {
		return { ...base, status: "uploaded" };
	}
	if (video.status === "BLOCKED" || video.status === "PROCESSING_FAILED") {
		const reasons = video.moderation?.rejectReasons?.join(", ");
		return {
			...base,
			status: "failed",
			error: video.statusMessage ?? reasons ?? `eBay reported ${video.status}`,
		};
	}
	return { ...base, status: "processing" };
};

const failedOutcome = (
	file: LocalMediaFile,
	kind: "image" | "video",
	cause: unknown,
): MediaUploadOutcome => ({
	source: file.source,
	kind,
	status: "failed",
	error: getErrorMessage(cause),
});

const attachFailure = (
	summary: string,
	attachResult: AttachMediaResult,
): Error =>
	new Error(
		`${summary}. Results: ${JSON.stringify({ images: attachResult.images, videos: attachResult.videos })}`,
	);

/** Uploads every file, turning each failure into a `failed` outcome instead of aborting. */
async function uploadAll(
	media: MediaApi,
	input: AttachMediaInput,
): Promise<{
	images: MediaUploadOutcome[];
	videos: MediaUploadOutcome[];
}> {
	const images: MediaUploadOutcome[] = [];

	for (const file of input.images) {
		try {
			const image = await media.createImageFromFile(file);
			images.push(imageOutcome(image));
		} catch (cause) {
			images.push(failedOutcome(file, "image", cause));
		}
	}

	const videos: MediaUploadOutcome[] = [];

	for (const file of input.videos) {
		try {
			const video = await media.uploadVideoFile({
				file,
				maxWaitMs: input.maxWaitMs,
				pollIntervalMs: input.pollIntervalMs,
			});
			videos.push(videoOutcome(file.source, video));
		} catch (cause) {
			videos.push(failedOutcome(file, "video", cause));
		}
	}

	return { images, videos };
}

function shouldLeaveItemUntouched(
	failedCount: number,
	allowPartial: boolean | undefined,
): boolean {
	if (failedCount === 0) {
		return false;
	}

	return allowPartial !== true;
}

/**
 * Builds the attach orchestration over the inventory-item and media primitives.
 *
 * This is deliberately the one composite in the media surface: it checks that the
 * inventory item exists, uploads every file, then reads the item again right
 * before the write and rewrites only `product.imageUrls` / `product.videoIds`
 * on that fresh copy, so edits made during the uploads survive. It never
 * publishes an offer, and it leaves the item untouched when any upload fails
 * unless `allowPartial` is set.
 *
 * @param items - Inventory item methods used to read and rewrite the item.
 * @param media - Media API used for the uploads.
 * @returns The attach method map to merge onto {@link MediaApi}.
 *
 * @example
 * ```ts
 * const { attachMediaToInventoryItem } = createMediaAttachMethods(items, media);
 * ```
 */
export const createMediaAttachMethods = (
	items: InventoryItemsMethods,
	media: MediaApi,
): MediaAttachMethods => ({
	attachMediaToInventoryItem: async (input) => {
		const total = input.images.length + input.videos.length;
		const isEmpty = total === 0;

		if (isEmpty) {
			throw new Error("provide at least one image or video to attach");
		}

		// Existence check before any upload; the write below re-reads the item.
		const snapshot = await items.getInventoryItem({ sku: input.sku });
		const { images, videos } = await uploadAll(media, input);

		function isFailedUpload(outcome: MediaUploadOutcome): boolean {
			return outcome.status === "failed";
		}

		const failed = [...images, ...videos].filter(isFailedUpload);
		const uploaded = uploadedMedia(images, videos);
		const attachResult: AttachMediaResult = {
			sku: input.sku,
			updated: false,
			images,
			videos,
			...mergeMedia(snapshot.product ?? {}, input, uploaded),
		};
		const leaveUntouched = shouldLeaveItemUntouched(
			failed.length,
			input.allowPartial,
		);

		if (leaveUntouched) {
			throw attachFailure(
				`${failed.length} of ${total} uploads failed; inventory item ${input.sku} was not updated (pass allowPartial: true to attach the successful ones)`,
				attachResult,
			);
		}

		const uploadedCount = uploaded.imageUrls.length + uploaded.videoIds.length;
		const isNothingUploaded = uploadedCount === 0;

		if (isNothingUploaded) {
			throw attachFailure(
				`no media was uploaded successfully; inventory item ${input.sku} was not updated`,
				attachResult,
			);
		}

		// Re-read right before the complete-replacement PUT: the uploads can take
		// minutes, and the earlier snapshot must not overwrite edits made meanwhile.
		const latest = await items.getInventoryItem({ sku: input.sku });
		const product = latest.product ?? {};
		const merged = mergeMedia(product, input, uploaded);
		await items.createOrReplaceInventoryItem({
			sku: input.sku,
			contentLanguage: contentLanguageOf(latest.locale),
			body: {
				...toInventoryItemBody(latest),
				product: { ...product, ...merged },
			},
		});

		return { ...attachResult, ...merged, updated: true };
	},
});
