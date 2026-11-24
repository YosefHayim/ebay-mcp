import { setTimeout as sleep } from "node:timers/promises";
import type {
	EbayApiClient,
	EbayResponse,
} from "@/ebay-client/ebayApiClient.js";
import {
	createEbayRequestFailure,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/commerceMediaV1BetaOas3.js";
import { getMediaBaseUrl } from "@/shared/environment.js";
import { getErrorMessage } from "@/shared/errors.js";
import type { createInventoryItemsMethods } from "./itemsApi.js";
import {
	createMediaAttachMethods,
	type MediaAttachMethods,
} from "./mediaAttachApi.js";

import { createMediaResourceMethods } from "./mediaResourcesApi.js";

type MediaResourceMethods = ReturnType<typeof createMediaResourceMethods>;

type InventoryItemsMethods = ReturnType<typeof createInventoryItemsMethods>;

export const MEDIA_BASE_PATH = "/commerce/media/v1_beta";

const UPLOAD_TIMEOUT_MS = 10 * 60_000;

export const DEFAULT_VIDEO_WAIT_MS = 120_000;

const DEFAULT_POLL_INTERVAL_MS = 5000;

export const TERMINAL_VIDEO_STATUSES: ReadonlySet<string> = new Set([
	"LIVE",
	"BLOCKED",
	"PROCESSING_FAILED",
]);

export type ImageResponse = components["schemas"]["ImageResponse"];

export type Video = components["schemas"]["Video"];

export interface CreateVideoRequest {
	readonly classification?: readonly string[] | undefined;
	readonly description?: string | undefined;
	readonly size?: number | undefined;
	readonly title?: string | undefined;
}

export interface MediaUpload {
	readonly source: string;
	readonly fileName: string;
	readonly mimeType: string;
	readonly bytes: Uint8Array;
}

export interface UploadedImage {
	readonly source: string;
	readonly imageId?: string | undefined;
	readonly imageUrl: string;
	readonly expirationDate?: string | undefined;
}

export interface ImageIdInput {
	readonly imageId: string;
}

export interface CreateVideoInput {
	readonly title: string;
	readonly size: number;
	readonly description?: string | undefined;
}

export interface UploadVideoInput {
	readonly videoId: string;
	readonly bytes: Uint8Array;
}

export interface VideoIdInput {
	readonly videoId: string;
}

export interface WaitForVideoInput extends VideoIdInput {
	readonly maxWaitMs?: number | undefined;
	readonly pollIntervalMs?: number | undefined;
}

export interface UploadVideoFileInput {
	readonly file: MediaUpload;
	readonly title?: string | undefined;
	readonly description?: string | undefined;
	readonly maxWaitMs?: number | undefined;
	readonly pollIntervalMs?: number | undefined;
}

export interface UploadImagesResult {
	readonly images: readonly UploadedImage[];
}

function idFromLocation(location: string | undefined): string | undefined {
	return location?.split("/").filter(Boolean).at(-1);
}

function resourcePath(
	resource: "image" | "video",
	id: string,
	suffix = "",
): string {
	return `/${resource}/${encodeURIComponent(id)}${suffix}`;
}

function apiFailure(method: "GET" | "POST", path: string) {
	return (cause: unknown): Error =>
		createEbayRequestFailure(method, path, cause);
}

function videoStatusFinal(video: Video): boolean {
	return (
		video.status !== undefined && TERMINAL_VIDEO_STATUSES.has(video.status)
	);
}

function requireDurationMs(
	durationMs: number | undefined,
	fallback: number,
	name: string,
	minimum: number,
): number {
	if (durationMs === undefined) {
		return fallback;
	}

	const isNotFinite = !Number.isFinite(durationMs);

	if (isNotFinite) {
		throw new Error(
			`${name} must be a finite number of milliseconds of at least ${minimum} when provided`,
		);
	}

	const isBelowMinimum = durationMs < minimum;

	if (isBelowMinimum) {
		throw new Error(
			`${name} must be a finite number of milliseconds of at least ${minimum} when provided`,
		);
	}

	return durationMs;
}

export class MediaApi {
	private readonly client: EbayApiClient;

	public readonly attachMediaToInventoryItem: MediaAttachMethods["attachMediaToInventoryItem"];

	public readonly createImageFromUrl: MediaResourceMethods["createImageFromUrl"];
	public readonly createDocument: MediaResourceMethods["createDocument"];
	public readonly createDocumentFromUrl: MediaResourceMethods["createDocumentFromUrl"];
	public readonly getDocument: MediaResourceMethods["getDocument"];
	public readonly uploadDocument: MediaResourceMethods["uploadDocument"];
	public readonly uploadPostOrderDocument: MediaResourceMethods["uploadPostOrderDocument"];
	public readonly downloadPostOrderDocument: MediaResourceMethods["downloadPostOrderDocument"];
	public readonly removePostOrderDocument: MediaResourceMethods["removePostOrderDocument"];

	public constructor(client: EbayApiClient, items: InventoryItemsMethods) {
		this.client = client;
		const resources = createMediaResourceMethods(client);
		this.createImageFromUrl = resources.createImageFromUrl;
		this.createDocument = resources.createDocument;
		this.createDocumentFromUrl = resources.createDocumentFromUrl;
		this.getDocument = resources.getDocument;
		this.uploadDocument = resources.uploadDocument;
		this.uploadPostOrderDocument = resources.uploadPostOrderDocument;
		this.downloadPostOrderDocument = resources.downloadPostOrderDocument;
		this.removePostOrderDocument = resources.removePostOrderDocument;
		this.attachMediaToInventoryItem = createMediaAttachMethods(
			items,
			this,
		).attachMediaToInventoryItem;
	}

	private url = (suffix: string): string => {
		const config = this.client.getConfig();
		return `${getMediaBaseUrl(config.environment, config.apiBaseUrl)}${MEDIA_BASE_PATH}${suffix}`;
	};

	public createImageFromFile = async (
		input: MediaUpload,
	): Promise<UploadedImage> => {
		const client = this.client;
		const path = `${MEDIA_BASE_PATH}/image/create_image_from_file`;
		const url = this.url("/image/create_image_from_file");
		const upload = requireObjectEffect<MediaUpload>(input, "input");
		const fileName = requireStringEffect(upload.fileName, "fileName");
		const form = new FormData();
		// Copy into a fresh ArrayBuffer-backed view: Blob rejects Node's ArrayBufferLike-typed views.
		form.append(
			"image",
			new Blob([new Uint8Array(upload.bytes)], { type: upload.mimeType }),
			fileName,
		);

		var imageResponse: EbayResponse<ImageResponse | undefined>;

		try {
			imageResponse = await client.postForResponse<ImageResponse | undefined>(
				url,
				form,
				{
					absolute: true,
					timeoutMs: UPLOAD_TIMEOUT_MS,
				},
			);
		} catch (cause) {
			throw apiFailure("POST", path)(cause);
		}

		const imageUrl = imageResponse.data?.imageUrl;

		if (!imageUrl) {
			throw createEbayRequestFailure(
				"POST",
				path,
				new Error("eBay returned no imageUrl for the uploaded picture"),
			);
		}

		return {
			source: upload.source,
			imageId: idFromLocation(imageResponse.headers["location"]),
			imageUrl,
			expirationDate: imageResponse.data?.expirationDate,
		};
	};

	public uploadImageFiles = async (
		files: readonly MediaUpload[],
	): Promise<UploadImagesResult> => {
		const createImageFromFile = this.createImageFromFile;
		const uploaded: UploadedImage[] = [];

		function imageUrlOf(uploadedImage: UploadedImage): string {
			return uploadedImage.imageUrl;
		}

		for (const [index, file] of files.entries()) {
			try {
				const image = await createImageFromFile(file);
				uploaded.push(image);
			} catch (cause) {
				const hasUploadedImages = uploaded.length > 0;
				const alreadyUploaded = hasUploadedImages
					? `; already uploaded: ${uploaded.map(imageUrlOf).join(", ")}`
					: "";

				throw new Error(
					`upload of ${file.source} (file ${index + 1} of ${files.length}) failed: ${getErrorMessage(cause)}${alreadyUploaded}`,
					{ cause: cause },
				);
			}
		}

		return { images: uploaded };
	};

	public getImage = async (input: ImageIdInput): Promise<ImageResponse> => {
		const client = this.client;
		const url = (imageId: string) => this.url(resourcePath("image", imageId));
		const validated = requireObjectEffect<ImageIdInput>(input, "input");
		const imageId = requireStringEffect(validated.imageId, "imageId");

		try {
			return await client.get<ImageResponse>(url(imageId), undefined, {
				absolute: true,
			});
		} catch (cause) {
			throw apiFailure(
				"GET",
				`${MEDIA_BASE_PATH}${resourcePath("image", imageId)}`,
			)(cause);
		}
	};

	public createVideo = async (
		input: CreateVideoInput,
	): Promise<VideoIdInput> => {
		const client = this.client;
		const path = `${MEDIA_BASE_PATH}/video`;
		const url = this.url("/video");
		const validated = requireObjectEffect<CreateVideoInput>(input, "input");
		const title = requireStringEffect(validated.title, "title");
		const videoRequest: CreateVideoRequest = {
			title,
			size: validated.size,
			description: validated.description,
			classification: ["ITEM"],
		};

		var videoResponse: EbayResponse<undefined>;

		try {
			videoResponse = await client.postForResponse<undefined>(
				url,
				videoRequest,
				{ absolute: true },
			);
		} catch (cause) {
			throw apiFailure("POST", path)(cause);
		}

		const videoId = idFromLocation(videoResponse.headers["location"]);

		if (!videoId) {
			throw createEbayRequestFailure(
				"POST",
				path,
				new Error("eBay returned no Location header with the new video ID"),
			);
		}

		return { videoId };
	};

	public uploadVideo = async (input: UploadVideoInput): Promise<void> => {
		const client = this.client;
		const url = (videoId: string) =>
			this.url(resourcePath("video", videoId, "/upload"));
		const validated = requireObjectEffect<UploadVideoInput>(input, "input");
		const videoId = requireStringEffect(validated.videoId, "videoId");

		try {
			await client.post<undefined>(url(videoId), validated.bytes, {
				absolute: true,
				timeoutMs: UPLOAD_TIMEOUT_MS,
				headers: {
					"Content-Type": "application/octet-stream",
					"Content-Length": String(validated.bytes.byteLength),
				},
			});
		} catch (cause) {
			throw apiFailure(
				"POST",
				`${MEDIA_BASE_PATH}${resourcePath("video", videoId, "/upload")}`,
			)(cause);
		}
	};

	public getVideo = async (input: VideoIdInput): Promise<Video> => {
		const client = this.client;
		const url = (videoId: string) => this.url(resourcePath("video", videoId));
		const validated = requireObjectEffect<VideoIdInput>(input, "input");
		const videoId = requireStringEffect(validated.videoId, "videoId");

		try {
			return await client.get<Video>(url(videoId), undefined, {
				absolute: true,
			});
		} catch (cause) {
			throw apiFailure(
				"GET",
				`${MEDIA_BASE_PATH}${resourcePath("video", videoId)}`,
			)(cause);
		}
	};

	public waitForVideo = async (input: WaitForVideoInput): Promise<Video> => {
		const getVideo = this.getVideo;
		const maxWaitMs = requireDurationMs(
			input.maxWaitMs,
			DEFAULT_VIDEO_WAIT_MS,
			"maxWaitMs",
			0,
		);
		const pollIntervalMs = requireDurationMs(
			input.pollIntervalMs,
			DEFAULT_POLL_INTERVAL_MS,
			"pollIntervalMs",
			1,
		);
		let waitedMs = 0;
		let video = await getVideo({ videoId: input.videoId });

		while (true) {
			const isFinal = videoStatusFinal(video);

			if (isFinal) {
				break;
			}

			const isBudgetSpent = waitedMs >= maxWaitMs;

			if (isBudgetSpent) {
				break;
			}

			const sleepMs = Math.min(pollIntervalMs, maxWaitMs - waitedMs);
			await sleep(sleepMs);
			waitedMs += sleepMs;
			video = await getVideo({ videoId: input.videoId });
		}

		return video;
	};

	public uploadVideoFile = async (
		input: UploadVideoFileInput,
	): Promise<Video> => {
		const { createVideo, uploadVideo, waitForVideo } = this;
		const { videoId } = await createVideo({
			title: input.title ?? input.file.fileName,
			size: input.file.bytes.byteLength,
			description: input.description,
		});
		await uploadVideo({ videoId, bytes: input.file.bytes });
		const video = await waitForVideo({
			videoId,
			maxWaitMs: input.maxWaitMs,
			pollIntervalMs: input.pollIntervalMs,
		});

		return { ...video, videoId: video.videoId ?? videoId };
	};
}
