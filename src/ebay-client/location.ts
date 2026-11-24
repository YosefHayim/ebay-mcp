export interface LocatedResource {
	readonly location: string;
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
	const isHttps = resourceUrl.protocol == "https:";

	if (!isHttps) {
		throw new Error("eBay returned an invalid resource Location");
	}

	const isUnderCollection = resourceUrl.pathname.startsWith(prefix);

	if (!isUnderCollection) {
		throw new Error("eBay returned an invalid resource Location");
	}

	const isSegmentMissing = segment.length == 0;

	if (isSegmentMissing) {
		throw new Error("eBay returned an invalid resource Location");
	}

	const hasExtraSegment = segment.includes("/");

	if (hasExtraSegment) {
		throw new Error("eBay returned an invalid resource Location");
	}

	return { location, id: decodeURIComponent(segment) };
}

export function locatedResourceId(
	location: string | undefined,
	collectionPath: string,
): LocatedResource {
	try {
		return readLocatedResource(location, collectionPath);
	} catch (cause) {
		const detail = cause instanceof Error ? cause.message : String(cause);

		throw new Error(`eBay POST ${collectionPath} failed: ${detail}`, {
			cause,
		});
	}
}
