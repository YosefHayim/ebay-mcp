const RAW_PRICE_CLAUSE = /(^|,)\s*price(Currency)?:/;

export function buildBrowseFilter(input: {
	readonly conditions?: readonly string[];
	readonly buyingOptions?: readonly string[];
	readonly priceMin?: number;
	readonly priceMax?: number;
	readonly priceCurrency?: string;
	readonly filter?: string;
}): string | undefined {
	const clauses: string[] = [];

	if (input.conditions && input.conditions.length > 0) {
		clauses.push(`conditions:{${input.conditions.join("|")}}`);
	}

	if (input.buyingOptions && input.buyingOptions.length > 0) {
		clauses.push(`buyingOptions:{${input.buyingOptions.join("|")}}`);
	}

	const hasMin = input.priceMin !== undefined;
	const hasMax = input.priceMax !== undefined;
	if (hasMin || hasMax) {
		// `price:[10]` reads as an exact match to eBay, so a lower bound on its own
		// must still emit the open-ended `[10..]` form.
		let range = `[..${input.priceMax}]`;
		if (hasMin && hasMax) {
			range = `[${input.priceMin}..${input.priceMax}]`;
		} else if (hasMin) {
			range = `[${input.priceMin}..]`;
		}
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
	const isRawFilterAbsent = rawFilter === undefined || rawFilter.length == 0;

	if (isRawFilterAbsent) {
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
