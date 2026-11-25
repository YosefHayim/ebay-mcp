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

	const moneyAmount = rawMoney["value"];
	const moneyCurrency = rawMoney["currency"];
	const isNotAmountString = typeof moneyAmount != "string";

	if (isNotAmountString) {
		return;
	}

	const isNotCurrencyString = typeof moneyCurrency != "string";

	if (isNotCurrencyString) {
		return;
	}

	return { currency: moneyCurrency, value: moneyAmount };
}

function optionalString(rawField: unknown): string | undefined {
	const isNotString = typeof rawField != "string";

	if (isNotString) {
		return undefined;
	}

	const isEmpty = rawField.length == 0;

	if (isEmpty) {
		return undefined;
	}

	return rawField;
}

function pickAvailabilityContainer(
	estimatedAvailabilities: unknown,
): Record<string, unknown> | undefined {
	if (isRecord(estimatedAvailabilities)) {
		return estimatedAvailabilities;
	}

	const isList = Array.isArray(estimatedAvailabilities);

	if (isList) {
		return readListedAvailability(estimatedAvailabilities);
	}

	return undefined;
}

function readListedAvailability(
	availabilities: readonly unknown[],
): Record<string, unknown> | undefined {
	const firstAvailability = availabilities[0];
	const isFirstRecord = isRecord(firstAvailability);

	if (isFirstRecord) {
		return firstAvailability;
	}

	return undefined;
}

function isStringEntry(entry: unknown): entry is string {
	const isString = typeof entry == "string";

	return isString;
}

function isNonEmptyStringList(
	entries: readonly unknown[],
): entries is readonly string[] {
	const hasNonString = !entries.every(isStringEntry);

	if (hasNonString) {
		return false;
	}

	const isEmpty = entries.length == 0;

	if (isEmpty) {
		return false;
	}

	return true;
}

function readNonEmptyStringList(
	entries: readonly unknown[],
): readonly string[] | undefined {
	const isNonEmpty = isNonEmptyStringList(entries);

	if (isNonEmpty) {
		return entries;
	}

	return undefined;
}

function optionalStringArray(rawField: unknown): readonly string[] | undefined {
	const isList = Array.isArray(rawField);

	if (isList) {
		return readNonEmptyStringList(rawField);
	}

	return undefined;
}

function readItemIdentity(raw: Record<string, unknown>):
	| {
			readonly itemId: string;
			readonly title: string;
	  }
	| undefined {
	const itemId = optionalString(raw["itemId"]);
	const isItemIdMissing = itemId == null;

	if (isItemIdMissing) {
		return undefined;
	}

	const isItemIdEmpty = itemId.length == 0;

	if (isItemIdEmpty) {
		return undefined;
	}

	const title = optionalString(raw["title"]);
	const isTitleMissing = title == null;

	if (isTitleMissing) {
		return undefined;
	}

	const isTitleEmpty = title.length == 0;

	if (isTitleEmpty) {
		return undefined;
	}

	return { itemId, title };
}

function hasAnotherPage(nextLink: unknown): boolean {
	const isNotString = typeof nextLink != "string";

	if (isNotString) {
		return false;
	}

	const hasLink = nextLink.length > 0;

	return hasLink;
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

	const identity = readItemIdentity(raw);
	const isIdentityMissing = identity == null;

	if (isIdentityMissing) {
		return;
	}

	const seller = pickSeller(raw);

	return {
		itemId: identity.itemId,
		title: identity.title,
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
	const hasNext = hasAnotherPage(raw["next"]);

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

	const identity = readItemIdentity(raw);
	const isIdentityMissing = identity == null;

	if (isIdentityMissing) {
		return;
	}

	const seller = pickSeller(raw);

	return {
		itemId: identity.itemId,
		title: identity.title,
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
