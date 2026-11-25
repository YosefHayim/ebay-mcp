import { XMLParser } from "fast-xml-parser";
import { getErrorMessage } from "@/shared/errors.js";
import { httpRequestEffect } from "./http.js";

const RSS_URL = "https://developer.ebay.com/rss/api-status";

export interface ApiStatusItem {
	title: string;
	summary: string;
	link: string;
	api: string;
	site: string;
	status: string;
	lastUpdated: string;
}

interface RssItemRaw {
	title?: string;
	description?: string;
	link?: string;
	summary?: string;
	api?: string;
	site?: string;
	status?: string;
	lastUpdated?: string;
}

function stripHtml(html: string): string {
	return html
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function normalizeString(field: unknown): string {
	const isMissing = field == null;

	if (isMissing) {
		return "";
	}

	const isString = typeof field == "string";

	if (isString) {
		return field.trim();
	}

	const isNumber = typeof field == "number";

	if (isNumber) {
		return String(field).trim();
	}

	const isBoolean = typeof field == "boolean";

	if (isBoolean) {
		return String(field).trim();
	}

	return "";
}

function parseItem(raw: RssItemRaw): ApiStatusItem {
	const summary =
		normalizeString(raw.summary) ||
		stripHtml(normalizeString(raw.description)).slice(0, 300) ||
		"";
	return {
		title: normalizeString(raw.title) || "Untitled",
		summary: summary || normalizeString(raw.title),
		link: normalizeString(raw.link) || "",
		api: normalizeString(raw.api) || "",
		site: normalizeString(raw.site) || "",
		status: normalizeString(raw.status) || "",
		lastUpdated: normalizeString(raw.lastUpdated) || "",
	};
}

interface RssRoot {
	rss?: { channel?: { item?: RssItemRaw | RssItemRaw[] } };
}

export interface GetApiStatusFeedOptions {
	limit?: number;
	status?: "Resolved" | "Unresolved";
	api?: string;
}

export interface ApiStatusFeedResult {
	items: ApiStatusItem[];
	error?: string;
}

function isFailedHttpStatus(httpStatus: number): boolean {
	const isBelowSuccess = httpStatus < 200;

	if (isBelowSuccess) {
		return true;
	}

	const isAboveSuccess = httpStatus > 299;

	if (isAboveSuccess) {
		return true;
	}

	return false;
}

export async function getApiStatusFeed(
	options: GetApiStatusFeedOptions = {},
): Promise<ApiStatusFeedResult> {
	const { limit = 20, status: statusFilter, api: apiFilter } = options;

	try {
		const feedResponse = await httpRequestEffect<string>({
			url: RSS_URL,
			timeoutMs: 15_000,
			responseType: "text",
			headers: { Accept: "application/rss+xml, application/xml, text/xml" },
		});
		const httpStatus = feedResponse.status;
		const isFailedStatus = isFailedHttpStatus(httpStatus);

		if (isFailedStatus) {
			return { items: [], error: `Feed unavailable (HTTP ${httpStatus})` };
		}

		const parser = new XMLParser({
			ignoreAttributes: true,
			trimValues: true,
			parseTagValue: false,
		});
		const parsed = parser.parse(feedResponse.data) as RssRoot;
		const channel = parsed?.rss?.channel;

		if (!channel) {
			return { items: [], error: "RSS feed missing channel" };
		}

		let rawItems: RssItemRaw[] = [];

		if (Array.isArray(channel.item)) {
			rawItems = channel.item;
		} else if (channel.item) {
			rawItems = [channel.item];
		}

		let items: ApiStatusItem[] = rawItems.map(parseItem);

		if (statusFilter) {
			items = items.filter(
				(entry) => entry.status.toLowerCase() == statusFilter.toLowerCase(),
			);
		}

		const apiNeedle = apiFilter?.trim().toLowerCase();

		if (apiNeedle) {
			items = items.filter((entry) =>
				entry.api.toLowerCase().includes(apiNeedle),
			);
		}

		const itemLimit = Math.min(limit, 50);

		return { items: items.slice(0, itemLimit) };
	} catch (feedError) {
		return {
			items: [],
			error: getErrorMessage(feedError, "Failed to fetch API status feed"),
		};
	}
}
