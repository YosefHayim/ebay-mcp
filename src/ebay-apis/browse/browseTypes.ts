export const BROWSE_SORT_VALUES = [
	"price",
	"-price",
	"newlyListed",
	"endingSoonest",
] as const;

export type BrowseSortValue = (typeof BROWSE_SORT_VALUES)[number];

export interface SearchActiveItemsInput {
	readonly query: string;
	readonly limit?: number;
	readonly offset?: number;
	readonly sort?: BrowseSortValue;
	readonly categoryIds?: string;
	readonly conditions?: readonly string[];
	readonly buyingOptions?: readonly string[];
	readonly priceMin?: number;
	readonly priceMax?: number;
	readonly priceCurrency?: string;
	readonly filter?: string;
}

export interface GetItemDetailsInput {
	readonly itemId: string;
}

export interface BrowseMoney {
	readonly currency: string;
	readonly value: string;
}

export interface ActiveItemSummary {
	readonly itemId: string;
	readonly title: string;
	readonly price?: BrowseMoney;
	readonly bidCount?: number;
	readonly condition?: string;
	readonly buyingOptions?: readonly string[];
	readonly itemWebUrl?: string;
	readonly imageUrl?: string;
	readonly seller?: string;
	readonly sellerFeedbackPercentage?: string;
	readonly shippingCost?: BrowseMoney;
	readonly itemEndDate?: string;
	readonly itemLocationCountry?: string;
}

export interface SearchActiveItemsResult {
	readonly items: ActiveItemSummary[];
	readonly hasNext: boolean;
	readonly total?: number;
	readonly offset: number;
	readonly limit: number;
	readonly query: string;
}

export interface ItemDetails {
	readonly itemId: string;
	readonly title: string;
	readonly price?: BrowseMoney;
	readonly bidCount?: number;
	readonly condition?: string;
	readonly conditionDescription?: string;
	readonly shortDescription?: string;
	readonly categoryPath?: string;
	readonly buyingOptions?: readonly string[];
	readonly itemWebUrl?: string;
	readonly imageUrl?: string;
	readonly additionalImageCount?: number;
	readonly seller?: string;
	readonly sellerFeedbackPercentage?: string;
	readonly estimatedAvailableQuantity?: number;
	readonly itemEndDate?: string;
	readonly itemLocation?: string;
	readonly returnsAccepted?: boolean;
}
