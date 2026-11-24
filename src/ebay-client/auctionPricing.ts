const MARGIN_NUMERATOR = 13;

const MARGIN_DENOMINATOR = 10;

export const BUY_IT_NOW_MIN_RATIO = MARGIN_NUMERATOR / MARGIN_DENOMINATOR;

export const BUY_IT_NOW_MARGIN_LABEL = "30%";

function toCents(amount: number): number {
	return Math.round(amount * 100);
}

function requiredBuyItNowCents(startPrice: number): number {
	return Math.ceil(
		(toCents(startPrice) * MARGIN_NUMERATOR) / MARGIN_DENOMINATOR,
	);
}

export function meetsBuyItNowMargin(
	startPrice: number,
	buyItNowPrice: number,
): boolean {
	return toCents(buyItNowPrice) >= requiredBuyItNowCents(startPrice);
}
