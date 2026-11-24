import {
	type DownloadedFile,
	requestDownloadEffect,
} from "@/ebay-client/download.js";
import type {
	EbayApiClient,
	EbayRequestConfig,
	EbayResponse,
} from "@/ebay-client/ebayApiClient.js";
import {
	type LocatedResource,
	locatedResourceId,
} from "@/ebay-client/location.js";
import {
	buildEndpointParams,
	createEbayRequestFailure,
	type QueryParams,
} from "@/ebay-client/request.js";

export const FEED_BASE_PATH = "/sell/feed/v1";

export interface FeedListQuery {
	readonly feedType?: string | undefined;
	readonly scheduleId?: string | undefined;
	readonly dateRange?: string | undefined;
	readonly lookBackDays?: number | undefined;
	readonly limit?: number | undefined;
	readonly offset?: number | undefined;
}

export interface CreatedFeedTask {
	readonly taskId: string;
	readonly location: string;
}

export function feedResourcePath(
	collection: string,
	id: string,
	suffix = "",
): string {
	return `${FEED_BASE_PATH}${collection}/${encodeURIComponent(id)}${suffix}`;
}

export function feedListParams(query: FeedListQuery): QueryParams | undefined {
	return buildEndpointParams({
		feedType: { wireName: "feed_type", value: query.feedType },
		scheduleId: { wireName: "schedule_id", value: query.scheduleId },
		dateRange: { wireName: "date_range", value: query.dateRange },
		lookBackDays: { wireName: "look_back_days", value: query.lookBackDays },
		limit: { wireName: "limit", value: query.limit },
		offset: { wireName: "offset", value: query.offset },
	});
}

export function exclusiveFeedFilters<TQuery extends FeedListQuery>(
	query: TQuery,
): TQuery {
	if (query.feedType !== undefined && query.scheduleId !== undefined) {
		throw new Error("Pass feedType or scheduleId, not both");
	}

	if (query.dateRange !== undefined && query.lookBackDays !== undefined) {
		throw new Error("Pass dateRange or lookBackDays, not both");
	}

	return query;
}

export async function postFeedResource(
	client: EbayApiClient,
	collection: string,
	createRequest: unknown,
	config?: EbayRequestConfig,
): Promise<LocatedResource> {
	const path = `${FEED_BASE_PATH}${collection}`;
	let createdResponse: EbayResponse<unknown>;

	try {
		createdResponse = await client.postForResponse<unknown>(
			path,
			createRequest,
			config,
		);
	} catch (cause) {
		throw createEbayRequestFailure("POST", path, cause);
	}

	return locatedResourceId(createdResponse.headers["location"], path);
}

export async function postFeedTask(
	client: EbayApiClient,
	collection: string,
	taskRequest: unknown,
	headers?: Record<string, string>,
): Promise<CreatedFeedTask> {
	const requestConfig = headers === undefined ? undefined : { headers };
	const located = await postFeedResource(
		client,
		collection,
		taskRequest,
		requestConfig,
	);

	return { taskId: located.id, location: located.location };
}

export function downloadFeedFile(
	client: EbayApiClient,
	path: string,
): Promise<DownloadedFile> {
	return requestDownloadEffect(client, path, {
		headers: { Accept: "application/octet-stream" },
	});
}
