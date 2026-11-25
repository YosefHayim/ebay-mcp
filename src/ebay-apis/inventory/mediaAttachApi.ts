import type { components } from "@/ebay-openapi-types/sellInventoryV1Oas3.js";
import { getErrorMessage } from "@/shared/errors.js";
import type { LocalMediaFile } from "@/shared/localMedia.js";
import type { createInventoryItemsMethods, InventoryItem } from "./itemsApi.js";
import type { MediaApi, UploadedImage, Video } from "./mediaApi.js";

type InventoryItemsMethods = ReturnType<typeof createInventoryItemsMethods>;

type InventoryItemWithSku =
	components["schemas"]["InventoryItemWithSkuLocaleGroupid"];
type Product = components["schemas"]["Product"];

export interface AttachMediaInput {
	readonly sku: string;
	readonly images: readonly LocalMediaFile[];
	readonly videos: readonly LocalMediaFile[];
	readonly replaceExisting?: boolean | undefined;
	readonly allowPartial?: boolean | undefined;
	readonly maxWaitMs?: number | undefined;
	readonly pollIntervalMs?: number | undefined;
}

export interface MediaUploadOutcome {
	readonly source: string;
	readonly kind: "image" | "video";
	readonly status: "uploaded" | "processing" | "failed";
	readonly imageUrl?: string | undefined;
	readonly imageId?: string | undefined;
	readonly expirationDate?: string | undefined;
	readonly videoId?: string | undefined;
	readonly videoStatus?: string | undefined;
	readonly error?: string | undefined;
}

export interface AttachMediaResult {
	readonly sku: string;
	readonly updated: boolean;
	readonly images: readonly MediaUploadOutcome[];
	readonly videos: readonly MediaUploadOutcome[];
	readonly imageUrls: readonly string[];
	readonly videoIds: readonly string[];
}

export interface MediaAttachMethods {
	attachMediaToInventoryItem: (
		input: AttachMediaInput,
	) => Promise<AttachMediaResult>;
}

interface ProductMedia {
	readonly imageUrls: string[];
	readonly videoIds: string[];
}

function dedupe(values: readonly string[]): string[] {
	return [...new Set(values)];
}

function toInventoryItemBody(
	inventoryItem: InventoryItemWithSku,
): InventoryItem {
	return {
		availability: inventoryItem.availability,
		condition: inventoryItem.condition,
		conditionDescription: inventoryItem.conditionDescription,
		conditionDescriptors: inventoryItem.conditionDescriptors,
		packageWeightAndSize: inventoryItem.packageWeightAndSize,
		product: inventoryItem.product,
	};
}

function contentLanguageOf(locale: string | undefined): string | undefined {
	return locale?.replace("_", "-");
}

function isReplacingImages(input: AttachMediaInput): boolean {
	const isKeepingExisting = input.replaceExisting != true;

	if (isKeepingExisting) {
		return false;
	}

	const hasImages = input.images.length > 0;

	return hasImages;
}

function isReplacingVideos(input: AttachMediaInput): boolean {
	const isKeepingExisting = input.replaceExisting != true;

	if (isKeepingExisting) {
		return false;
	}

	const hasVideos = input.videos.length > 0;

	return hasVideos;
}

function pickUploadedImageUrl(outcome: MediaUploadOutcome): string[] {
	const imageUrl = outcome.imageUrl;
	const isImageUrlMissing = !imageUrl;

	if (isImageUrlMissing) {
		return [];
	}

	return [imageUrl];
}

function pickUploadedVideoId(outcome: MediaUploadOutcome): string[] {
	const isFailed = outcome.status == "failed";

	if (isFailed) {
		return [];
	}

	const videoId = outcome.videoId;
	const isVideoIdMissing = !videoId;

	if (isVideoIdMissing) {
		return [];
	}

	return [videoId];
}

function isFailedVideoStatus(status: string | undefined): boolean {
	const isBlocked = status == "BLOCKED";

	if (isBlocked) {
		return true;
	}

	const isProcessingFailed = status == "PROCESSING_FAILED";

	return isProcessingFailed;
}

function mergeMedia(
	product: Product,
	input: AttachMediaInput,
	uploaded: ProductMedia,
): ProductMedia {
	const replaceImages = isReplacingImages(input);
	const replaceVideos = isReplacingVideos(input);
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
}

function uploadedMedia(
	images: readonly MediaUploadOutcome[],
	videos: readonly MediaUploadOutcome[],
): ProductMedia {
	return {
		imageUrls: images.flatMap(pickUploadedImageUrl),
		videoIds: videos.flatMap(pickUploadedVideoId),
	};
}

function imageOutcome(image: UploadedImage): MediaUploadOutcome {
	return {
		source: image.source,
		kind: "image",
		status: "uploaded",
		imageUrl: image.imageUrl,
		imageId: image.imageId,
		expirationDate: image.expirationDate,
	};
}

function videoOutcome(source: string, video: Video): MediaUploadOutcome {
	const base = {
		source,
		kind: "video" as const,
		videoId: video.videoId,
		videoStatus: video.status,
	};
	const isLive = video.status == "LIVE";

	if (isLive) {
		return { ...base, status: "uploaded" };
	}

	const isFailed = isFailedVideoStatus(video.status);

	if (isFailed) {
		const reasons = video.moderation?.rejectReasons?.join(", ");
		return {
			...base,
			status: "failed",
			error: video.statusMessage ?? reasons ?? `eBay reported ${video.status}`,
		};
	}

	return { ...base, status: "processing" };
}

function failedOutcome(
	file: LocalMediaFile,
	kind: "image" | "video",
	cause: unknown,
): MediaUploadOutcome {
	return {
		source: file.source,
		kind,
		status: "failed",
		error: getErrorMessage(cause),
	};
}

function attachFailure(
	summary: string,
	attachResult: AttachMediaResult,
): Error {
	return new Error(
		`${summary}. Results: ${JSON.stringify({ images: attachResult.images, videos: attachResult.videos })}`,
	);
}

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
	if (failedCount == 0) {
		return false;
	}

	return allowPartial != true;
}

export function createMediaAttachMethods(
	items: InventoryItemsMethods,
	media: MediaApi,
): MediaAttachMethods {
	return {
		attachMediaToInventoryItem: async (input) => {
			const total = input.images.length + input.videos.length;
			const isEmpty = total == 0;

			if (isEmpty) {
				throw new Error("provide at least one image or video to attach");
			}

			// Existence check before any upload; the write below re-reads the item.
			const snapshot = await items.getInventoryItem({ sku: input.sku });
			const { images, videos } = await uploadAll(media, input);

			function isFailedUpload(outcome: MediaUploadOutcome): boolean {
				return outcome.status == "failed";
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

			const uploadedCount =
				uploaded.imageUrls.length + uploaded.videoIds.length;
			const isNothingUploaded = uploadedCount == 0;

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
	};
}
