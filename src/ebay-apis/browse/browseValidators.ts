import {
	BROWSE_SORT_VALUES,
	type BrowseSortValue,
} from "@/ebay-apis/browse/browseTypes.js";
import { optionalStringEffect } from "@/ebay-client/request.js";

const MAX_LIMIT = 200;

function isNonEmptyString(entry: unknown): entry is string {
	const isNotString = typeof entry != "string";

	if (isNotString) {
		return false;
	}

	const isEmpty = entry.length == 0;

	if (isEmpty) {
		return false;
	}

	return true;
}

function isArrayOfNonEmptyStrings(
	entries: readonly unknown[],
): entries is readonly string[] {
	return entries.every(isNonEmptyString);
}

const MAX_OFFSET = 10_000;

function requireIntegerInRange(
	value: number,
	parameter: string,
	min: number,
	max: number,
): number {
	const isNotWholeNumber = !Number.isInteger(value);

	if (isNotWholeNumber) {
		throw new Error(
			`${parameter} must be an integer between ${min} and ${max}`,
		);
	}

	const isBelowMin = value < min;

	if (isBelowMin) {
		throw new Error(
			`${parameter} must be an integer between ${min} and ${max}`,
		);
	}

	const isAboveMax = value > max;

	if (isAboveMax) {
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
	const isPriceOmitted = priceBound === undefined;

	if (isPriceOmitted) {
		return;
	}

	const isFinitePrice = Number.isFinite(priceBound);

	if (isFinitePrice) {
		return;
	}

	return new Error(`${parameter} must be a finite number; got ${priceBound}`);
}

export const DEFAULT_LIMIT = 20;

function requireStringEntries(
	entries: readonly unknown[],
	parameter: string,
): readonly string[] {
	const isStringArray = isArrayOfNonEmptyStrings(entries);

	if (isStringArray) {
		return entries;
	}

	throw new Error(`${parameter} must be an array of non-empty strings`);
}

export function optionalStringArrayEffect(
	value: unknown,
	parameter: string,
): readonly string[] | undefined {
	const isOmitted = value === undefined;

	if (isOmitted) {
		return undefined;
	}

	const isArray = Array.isArray(value);

	if (isArray) {
		return requireStringEntries(value, parameter);
	}

	throw new Error(`${parameter} must be an array of non-empty strings`);
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

	const isMinMissing = priceMin === undefined;

	if (isMinMissing) {
		return;
	}

	const isMaxMissing = priceMax === undefined;

	if (isMaxMissing) {
		return;
	}

	const isMinAboveMax = priceMin > priceMax;

	if (isMinAboveMax) {
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
