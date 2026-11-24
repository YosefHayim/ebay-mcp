import {
	BROWSE_SORT_VALUES,
	type BrowseSortValue,
} from "@/ebay-apis/browse/browseTypes.js";
import { optionalStringEffect } from "@/ebay-client/request.js";

const MAX_LIMIT = 200;

const MAX_OFFSET = 10_000;

function requireIntegerInRange(
	value: number,
	parameter: string,
	min: number,
	max: number,
): number {
	const isOutsideRange = !Number.isInteger(value) || value < min || value > max;

	if (isOutsideRange) {
		throw new Error(
			`${parameter} must be an integer between ${min} and ${max}`,
		);
	}

	return value;
}

function nonFinitePriceError(
	priceBound: number | undefined,
	parameter: string,
): Error | undefined {
	if (priceBound === undefined || Number.isFinite(priceBound)) {
		return;
	}

	return new Error(`${parameter} must be a finite number; got ${priceBound}`);
}

export const DEFAULT_LIMIT = 20;

export function optionalStringArrayEffect(
	value: unknown,
	parameter: string,
): readonly string[] | undefined {
	if (value === undefined) {
		return undefined;
	}

	const isStringArray =
		Array.isArray(value) &&
		value.every((entry) => typeof entry == "string" && entry.length > 0);

	if (!isStringArray) {
		throw new Error(`${parameter} must be an array of non-empty strings`);
	}

	return value;
}

export function optionalNonBlankStringEffect(
	value: unknown,
	parameter: string,
): string | undefined {
	const text = optionalStringEffect(value, parameter);

	if (text === undefined) {
		return undefined;
	}

	const trimmed = text.trim();
	const isBlank = trimmed.length == 0;

	if (isBlank) {
		throw new Error(`${parameter} must be a non-empty string when provided`);
	}

	return trimmed;
}

export function requireOffsetInRange(offset: number, limit: number): number {
	const validated = requireIntegerInRange(offset, "offset", 0, MAX_OFFSET);
	// Browse rejects an offset that is not a whole number of pages (error 12515)
	// with an opaque 400, so the page arithmetic is enforced here instead.
	const isMisalignedPage = validated % limit != 0;

	if (isMisalignedPage) {
		throw new Error(
			`offset must be zero or a multiple of limit (${limit}); got ${validated}`,
		);
	}

	return validated;
}

export function requireCoherentPriceRange(
	priceMin: number | undefined,
	priceMax: number | undefined,
): void {
	const nonFinite =
		nonFinitePriceError(priceMin, "priceMin") ??
		nonFinitePriceError(priceMax, "priceMax");

	if (nonFinite) {
		throw nonFinite;
	}

	const isInverted =
		priceMin !== undefined && priceMax !== undefined && priceMin > priceMax;

	if (isInverted) {
		throw new Error(
			`priceMin (${priceMin}) must not exceed priceMax (${priceMax})`,
		);
	}
}

export function requireLimitInRange(limit: number): number {
	return requireIntegerInRange(limit, "limit", 1, MAX_LIMIT);
}

export function requireSupportedSort(
	sort: string | undefined,
): BrowseSortValue | undefined {
	if (sort === undefined) {
		return undefined;
	}

	const isSupported = (BROWSE_SORT_VALUES as readonly string[]).includes(sort);

	if (!isSupported) {
		throw new Error(`sort must be one of: ${BROWSE_SORT_VALUES.join(", ")}`);
	}

	return sort as BrowseSortValue;
}
