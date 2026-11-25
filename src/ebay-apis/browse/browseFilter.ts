const RAW_PRICE_CLAUSE = /(^|,)\s*price(Currency)?:/;

function listClause(
	fieldName: "conditions" | "buyingOptions",
	entries: readonly string[] | undefined,
): string | undefined {
	const isMissing = !entries;

	if (isMissing) {
		return undefined;
	}

	const isEmpty = entries.length == 0;

	if (isEmpty) {
		return undefined;
	}

	return `${fieldName}:{${entries.join("|")}}`;
}

function readPriceRangeFromMinimum(
	priceMin: number,
	priceMax: number | undefined,
): string {
	const hasMax = priceMax !== undefined;

	if (hasMax) {
		return `[${priceMin}..${priceMax}]`;
	}

	// `price:[10]` reads as an exact match to eBay, so a lower bound on its own
	// must still emit the open-ended `[10..]` form.
	return `[${priceMin}..]`;
}

function readPriceRange(
	priceMin: number | undefined,
	priceMax: number | undefined,
): string | undefined {
	const hasMin = priceMin !== undefined;

	if (hasMin) {
		return readPriceRangeFromMinimum(priceMin, priceMax);
	}

	const hasMax = priceMax !== undefined;

	if (hasMax) {
		return `[..${priceMax}]`;
	}

	return undefined;
}

export function buildBrowseFilter(input: {
	readonly conditions?: readonly string[];
	readonly buyingOptions?: readonly string[];
	readonly priceMin?: number;
	readonly priceMax?: number;
	readonly priceCurrency?: string;
	readonly filter?: string;
}): string | undefined {
	const clauses: string[] = [];
	const conditionsFilter = listClause("conditions", input.conditions);
	const hasConditionsFilter = conditionsFilter !== undefined;

	if (hasConditionsFilter) {
		clauses.push(conditionsFilter);
	}

	const buyingOptionsFilter = listClause("buyingOptions", input.buyingOptions);
	const hasBuyingOptionsFilter = buyingOptionsFilter !== undefined;

	if (hasBuyingOptionsFilter) {
		clauses.push(buyingOptionsFilter);
	}

	const range = readPriceRange(input.priceMin, input.priceMax);
	const hasRange = range !== undefined;

	if (hasRange) {
		clauses.push(`price:${range}`);
		clauses.push(`priceCurrency:${input.priceCurrency ?? "USD"}`);
	}

	if (input.filter) {
		clauses.push(input.filter);
	}

	return clauses.length > 0 ? clauses.join(",") : undefined;
}

export function requireNoPriceFilterConflict(
	rawFilter: string | undefined,
	hasPriceBounds: boolean,
): void {
	const isFilterMissing = rawFilter === undefined;

	if (isFilterMissing) {
		return;
	}

	const isFilterEmpty = rawFilter.length == 0;

	if (isFilterEmpty) {
		return;
	}

	const hasNoPriceBounds = hasPriceBounds == false;

	if (hasNoPriceBounds) {
		return;
	}

	const hasPriceClause = RAW_PRICE_CLAUSE.test(rawFilter);

	if (hasPriceClause) {
		throw new Error(
			"filter already contains a price clause; use either priceMin/priceMax or a raw price filter, not both",
		);
	}
}
