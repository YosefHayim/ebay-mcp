import { EbayApiError } from "@/ebay-client/request.js";

/** Resource created by an eBay endpoint that reports its identifier only in `Location`. */
export interface LocatedResource {
	/** Location header exactly as eBay returned it. */
	readonly location: string;
	/** Decoded final path segment, e.g. a task or schedule ID. */
	readonly id: string;
}

function readLocatedResource(
	location: string | undefined,
	collectionPath: string,
): LocatedResource {
	if (!location) {
		throw new Error("eBay returned no Location header");
	}

	const resourceUrl = new URL(location);
	const prefix = `${collectionPath}/`;
	const segment = resourceUrl.pathname.slice(prefix.length);
	const isHttps = resourceUrl.protocol === "https:";

	if (!isHttps) {
		throw new Error("eBay returned an invalid resource Location");
	}

	const isUnderCollection = resourceUrl.pathname.startsWith(prefix);

	if (!isUnderCollection) {
		throw new Error("eBay returned an invalid resource Location");
	}

	const isSegmentMissing = segment.length === 0;

	if (isSegmentMissing) {
		throw new Error("eBay returned an invalid resource Location");
	}

	const hasExtraSegment = segment.includes("/");

	if (hasExtraSegment) {
		throw new Error("eBay returned an invalid resource Location");
	}

	return { location, id: decodeURIComponent(segment) };
}

/**
 * Reads the created resource ID from a `Location` header and checks it points at the
 * expected collection, so a malformed or foreign header never becomes an ID.
 *
 * @param location - `Location` header from the create response, if any.
 * @param collectionPath - eBay REST collection path the resource must live under, e.g. `/sell/feed/v1/order_task`.
 * @returns The header and its decoded ID. Throws EbayApiError for a missing or invalid header.
 *
 * @example
 * ```ts
 * const task = locatedResourceId(response.headers.location, '/sell/feed/v1/order_task');
 * ```
 */
export function locatedResourceId(
	location: string | undefined,
	collectionPath: string,
): LocatedResource {
	try {
		return readLocatedResource(location, collectionPath);
	} catch (cause) {
		throw new EbayApiError({ method: "POST", path: collectionPath, cause });
	}
}
