/**
 * Fetches and parses the eBay API Status RSS feed (public, no auth).
 * Used by the ebay_get_api_status MCP tool and optionally by the docs sync script.
 */

import { XMLParser } from 'fast-xml-parser';
import { getErrorMessage } from '@/utils/errors.js';
import { httpRequestEffect, isHttpError } from './http.js';
import { Effect, Either } from 'effect';

const RSS_URL = 'https://developer.ebay.com/rss/api-status';

/**
 * Parsed eBay API status feed entry exposed to MCP tools.
 */
export interface ApiStatusItem {
  /** Feed item title. */
  title: string;
  /** Short plain-text summary. */
  summary: string;
  /** Source link for the status item. */
  link: string;
  /** eBay API named by the feed item. */
  api: string;
  /** eBay site/marketplace named by the feed item. */
  site: string;
  /** Current incident status label. */
  status: string;
  /** Last updated timestamp text from the feed. */
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

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeString = (field: unknown): string => {
  if (field == null) return '';
  if (typeof field === 'string') return field.trim();
  if (typeof field === 'number' || typeof field === 'boolean') return String(field).trim();
  return '';
};

const parseItem = (raw: RssItemRaw): ApiStatusItem => {
  const summary =
    normalizeString(raw.summary) || stripHtml(normalizeString(raw.description)).slice(0, 300) || '';
  return {
    title: normalizeString(raw.title) || 'Untitled',
    summary: summary || normalizeString(raw.title),
    link: normalizeString(raw.link) || '',
    api: normalizeString(raw.api) || '',
    site: normalizeString(raw.site) || '',
    status: normalizeString(raw.status) || '',
    lastUpdated: normalizeString(raw.lastUpdated) || '',
  };
};

interface RssRoot {
  rss?: { channel?: { item?: RssItemRaw | RssItemRaw[] } };
}

/**
 * Filters and pagination options for the eBay API status feed.
 */
export interface GetApiStatusFeedOptions {
  /** Maximum number of items to return. */
  limit?: number;
  /** Optional status filter. */
  status?: 'Resolved' | 'Unresolved';
  /** Optional API-name substring filter. */
  api?: string;
}

/** Parsed API status feed response returned to tools and docs sync. */
export interface ApiStatusFeedResult {
  /** Filtered feed items. */
  items: ApiStatusItem[];
  /** Recoverable fetch or parse error, when available. */
  error?: string;
}

/**
 * Fetches the eBay API Status RSS feed, parses it, and returns items
 * optionally filtered by status and API name, limited to `limit` items.
 *
 * @param options - Optional status/API filters and item limit.
 * @returns An Effect that succeeds with parsed feed items or a recoverable error string.
 *
 * @example
 * ```ts
 * const feed = await Effect.runPromise(getApiStatusFeed({ status: 'Unresolved', limit: 10 }));
 * ```
 */
export const getApiStatusFeed = (
  options: GetApiStatusFeedOptions = {},
): Effect.Effect<ApiStatusFeedResult> => {
  const { limit = 20, status: statusFilter, api: apiFilter } = options;

  return Effect.either(
    httpRequestEffect<string>({
      url: RSS_URL,
      timeoutMs: 15_000,
      responseType: 'text',
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
    }).pipe(
      Effect.flatMap((response) =>
        Effect.try({
          try: () => {
            const parser = new XMLParser({
              ignoreAttributes: true,
              trimValues: true,
              parseTagValue: false,
            });
            const parsed = parser.parse(response.data) as RssRoot;

            const channel = parsed?.rss?.channel;
            if (!channel) {
              return { items: [], error: 'RSS feed missing channel' };
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
                (entry) => entry.status.toLowerCase() === statusFilter.toLowerCase(),
              );
            }
            if (apiFilter?.trim()) {
              const needle = apiFilter.trim().toLowerCase();
              items = items.filter((entry) => entry.api.toLowerCase().includes(needle));
            }

            items = items.slice(0, Math.min(limit, 50));

            return { items };
          },
          catch: (error) => error,
        }),
      ),
    ),
  ).pipe(
    Effect.map((parsedFeed) => {
      if (Either.isLeft(parsedFeed)) {
        const feedError = parsedFeed.left;
        const message =
          isHttpError(feedError) && feedError.status
            ? `Feed unavailable (HTTP ${feedError.status})`
            : getErrorMessage(feedError, 'Failed to fetch API status feed');
        return { items: [], error: message };
      }

      return parsedFeed.right;
    }),
  );
};
