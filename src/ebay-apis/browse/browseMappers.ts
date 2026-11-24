import type {
	ActiveItemSummary,
	BrowseMoney,
	ItemDetails,
	SearchActiveItemsResult,
} from "@/ebay-apis/browse/browseTypes.js";
import { defined } from "@/shared/objects.js";
import { isRecord } from "@/shared/typeGuards.js";

function parseBrowseMoney(rawMoney: unknown): BrowseMoney | undefined {
	if (!isRecord(rawMoney)) {
		return;
	}

	if (
		typeof rawMoney["value"] == "string" &&
		typeof rawMoney["currency"] == "string"
	) {
		return { currency: rawMoney["currency"], value: rawMoney["value"] };
	}

	return undefined;
}

function optionalString(rawField: unknown): string | undefined {
	return typeof rawField == "string" && rawField.length > 0
		? rawField
		: undefined;
}

function pickAvailabilityContainer(
	estimatedAvailabilities: unknown,
): Record<string, unknown> | undefined {
	if (isRecord(estimatedAvailabilities)) {
		return estimatedAvailabilities;
	}

	if (
		Array.isArray(estimatedAvailabilities) &&
		isRecord(estimatedAvailabilities[0])
	) {
		return estimatedAvailabilities[0];
	}

	return undefined;
}

function optionalStringArray(rawField: unknown): readonly string[] | undefined {
	return Array.isArray(rawField) &&
		rawField.every((entry) => typeof entry == "string") &&
		rawField.length > 0
		? rawField
		: undefined;
}

function pickSeller(raw: Record<string, unknown>): {
	username?: string;
	feedbackPercentage?: string;
} {
	const seller = isRecord(raw["seller"]) ? raw["seller"] : undefined;
	return defined({
		username: optionalString(seller?.["username"]),
		feedbackPercentage: optionalString(seller?.["feedbackPercentage"]),
	});
}

function pickImageUrl(raw: Record<string, unknown>): string | undefined {
	return isRecord(raw["image"])
		? optionalString(raw["image"]["imageUrl"])
		: undefined;
}

function pickShippingCost(
	raw: Record<string, unknown>,
): BrowseMoney | undefined {
	const options = Array.isArray(raw["shippingOptions"])
		? raw["shippingOptions"]
		: [];
	const first = isRecord(options[0]) ? options[0] : undefined;
	return parseBrowseMoney(first?.["shippingCost"]);
}

function pickAvailableQuantity(
	raw: Record<string, unknown>,
): number | undefined {
	const availability = pickAvailabilityContainer(
		raw["estimatedAvailabilities"],
	);
	return typeof availability?.["estimatedAvailableQuantity"] == "number"
		? availability["estimatedAvailableQuantity"]
		: undefined;
}

function pickItemLocation(raw: Record<string, unknown>): string | undefined {
	const location = isRecord(raw["itemLocation"])
		? raw["itemLocation"]
		: undefined;
	const parts = [
		optionalString(location?.["city"]),
		optionalString(location?.["stateOrProvince"]),
		optionalString(location?.["country"]),
	].filter((part): part is string => part !== undefined);
	return parts.length > 0 ? parts.join(", ") : undefined;
}

function pickReturnsAccepted(
	raw: Record<string, unknown>,
): boolean | undefined {
	const terms = isRecord(raw["returnTerms"]) ? raw["returnTerms"] : undefined;
	return typeof terms?.["returnsAccepted"] == "boolean"
		? terms["returnsAccepted"]
		: undefined;
}

export function mapItemSummary(raw: unknown): ActiveItemSummary | undefined {
	if (!isRecord(raw)) {
		return;
	}

	const itemId = optionalString(raw["itemId"]);
	const title = optionalString(raw["title"]);
	if (!(itemId && title)) {
		return;
	}

	const seller = pickSeller(raw);

	return {
		itemId,
		title,
		...defined({
			// Auction-only listings carry no `price`; their live figure is
			// currentBidPrice. buyingOptions still discloses which one this is.
			price:
				parseBrowseMoney(raw["price"]) ??
				parseBrowseMoney(raw["currentBidPrice"]),
			bidCount:
				typeof raw["bidCount"] == "number" ? raw["bidCount"] : undefined,
			condition: optionalString(raw["condition"]),
			buyingOptions: optionalStringArray(raw["buyingOptions"]),
			itemWebUrl: optionalString(raw["itemWebUrl"]),
			imageUrl: pickImageUrl(raw),
			seller: seller.username,
			sellerFeedbackPercentage: seller.feedbackPercentage,
			shippingCost: pickShippingCost(raw),
			itemEndDate: optionalString(raw["itemEndDate"]),
			itemLocationCountry: optionalString(
				isRecord(raw["itemLocation"])
					? raw["itemLocation"]["country"]
					: undefined,
			),
		}),
	};
}

export function mapSearchActiveItemsResponse(
	raw: unknown,
	context: {
		readonly query: string;
		readonly offset: number;
		readonly limit: number;
	},
): SearchActiveItemsResult {
	const base: SearchActiveItemsResult = {
		items: [],
		hasNext: false,
		...context,
	};
	if (!isRecord(raw)) {
		return base;
	}

	const rawItems = Array.isArray(raw["itemSummaries"])
		? raw["itemSummaries"]
		: [];
	const items: ActiveItemSummary[] = [];
	for (const entry of rawItems) {
		const mapped = mapItemSummary(entry);
		if (mapped) {
			items.push(mapped);
		}
	}

	const total = typeof raw["total"] == "number" ? raw["total"] : undefined;

	// eBay's SearchPagedCollection contract makes `next` the authoritative
	// "another page exists" signal. The link itself is an authenticated API URL
	// the caller cannot follow without our credentials, so only its presence is
	// surfaced.
	const hasNext = typeof raw["next"] == "string" && raw["next"].length > 0;

	// eBay may clamp the requested window (e.g. an offset past the result set),
	// so the response values win when present; the request values are only a
	// fallback for payloads that omit them.
	const offset =
		typeof raw["offset"] == "number" ? raw["offset"] : context.offset;
	const limit = typeof raw["limit"] == "number" ? raw["limit"] : context.limit;

	return {
		...base,
		items,
		hasNext,
		offset,
		limit,
		...(total === undefined ? {} : { total }),
	};
}

export function mapItemDetailsResponse(raw: unknown): ItemDetails | undefined {
	if (!isRecord(raw)) {
		return;
	}

	const itemId = optionalString(raw["itemId"]);
	const title = optionalString(raw["title"]);
	if (!(itemId && title)) {
		return;
	}

	const seller = pickSeller(raw);

	return {
		itemId,
		title,
		...defined({
			price:
				parseBrowseMoney(raw["price"]) ??
				parseBrowseMoney(raw["currentBidPrice"]),
			bidCount:
				typeof raw["bidCount"] == "number" ? raw["bidCount"] : undefined,
			condition: optionalString(raw["condition"]),
			conditionDescription: optionalString(raw["conditionDescription"]),
			shortDescription: optionalString(raw["shortDescription"]),
			categoryPath: optionalString(raw["categoryPath"]),
			buyingOptions: optionalStringArray(raw["buyingOptions"]),
			itemWebUrl: optionalString(raw["itemWebUrl"]),
			imageUrl: pickImageUrl(raw),
			additionalImageCount: Array.isArray(raw["additionalImages"])
				? raw["additionalImages"].length
				: undefined,
			seller: seller.username,
			sellerFeedbackPercentage: seller.feedbackPercentage,
			estimatedAvailableQuantity: pickAvailableQuantity(raw),
			itemEndDate: optionalString(raw["itemEndDate"]),
			itemLocation: pickItemLocation(raw),
			returnsAccepted: pickReturnsAccepted(raw),
		}),
	};
}
