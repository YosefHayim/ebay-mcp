import { describe, expect, it } from "vitest";
import {
	findTradingListingFormatViolation,
	resolveTradingFormat,
	tradingCallName,
	validateTradingEndingReasonEffect,
	validateTradingListingFormatEffect,
} from "@/ebay-apis/trading/listingFormatHelpers.js";

import { FormatType } from "@/shared/ebayEnums.js";

const auctionItem = {
	Title: "Rare coin",
	StartPrice: 9.99,
	ListingDuration: "Days_7",
};

const auctionCreate = (tradingItem: Record<string, unknown>) =>
	findTradingListingFormatViolation({
		item: tradingItem,
		format: FormatType.AUCTION,
		parameter: "item",
		isCreate: true,
	});

const auctionRevise = (tradingItem: Record<string, unknown>) =>
	findTradingListingFormatViolation({
		item: tradingItem,
		format: FormatType.AUCTION,
		parameter: "fields",
		isCreate: false,
	});

const fixedPrice = (tradingItem: Record<string, unknown>) =>
	findTradingListingFormatViolation({
		item: tradingItem,
		format: FormatType.FIXED_PRICE,
		parameter: "item",
		isCreate: true,
	});

describe("auction Item rules", () => {
	it("accepts a complete auction with reserve and Buy It Now above the opening bid", () => {
		expect(
			auctionCreate({
				...auctionItem,
				ReservePrice: 25,
				BuyItNowPrice: 49.99,
				Quantity: 1,
			}),
		).toBeUndefined();
	});

	it("accepts attributed XML amounts", () => {
		expect(
			auctionCreate({
				...auctionItem,
				StartPrice: { "#text": "9.99", "@_currencyID": "USD" },
				ReservePrice: { "#text": 25, "@_currencyID": "USD" },
			}),
		).toBeUndefined();
	});

	it("accepts an explicit Chinese ListingType", () => {
		expect(
			auctionCreate({ ...auctionItem, ListingType: "Chinese" }),
		).toBeUndefined();
	});

	it("rejects a non-auction ListingType", () => {
		const violation = auctionCreate({
			...auctionItem,
			ListingType: "FixedPriceItem",
		});

		expect(violation?.message).toContain("item.ListingType");
		expect(violation?.message).toContain("Chinese");
	});

	it("rejects GTC", () => {
		const violation = auctionCreate({ ...auctionItem, ListingDuration: "GTC" });

		expect(violation?.message).toContain("item.ListingDuration");
		expect(violation?.message).toContain("Days_7");
	});

	it("rejects a quantity other than one", () => {
		expect(auctionCreate({ ...auctionItem, Quantity: 3 })?.message).toContain(
			"item.Quantity",
		);
		expect(auctionCreate({ ...auctionItem, Quantity: "1" })).toBeUndefined();
	});

	it("allows Best Offer on its own but not together with Buy It Now", () => {
		const bestOffer = { BestOfferDetails: { BestOfferEnabled: true } };

		expect(auctionCreate({ ...auctionItem, ...bestOffer })).toBeUndefined();
		expect(auctionRevise(bestOffer)).toBeUndefined();
		expect(
			auctionCreate({ ...auctionItem, ...bestOffer, BuyItNowPrice: 49.99 })
				?.message,
		).toContain("item.BestOfferDetails.BestOfferEnabled");
		expect(
			auctionCreate({
				...auctionItem,
				BestOfferDetails: { BestOfferEnabled: "true" },
				BuyItNowPrice: 49.99,
			})?.message,
		).toContain("item.BestOfferDetails.BestOfferEnabled");
		expect(
			auctionCreate({
				...auctionItem,
				BestOfferDetails: { BestOfferEnabled: false },
				BuyItNowPrice: 49.99,
			}),
		).toBeUndefined();
	});

	it("requires a duration and opening bid on create only", () => {
		expect(
			auctionCreate({ Title: "No duration", StartPrice: 5 })?.message,
		).toContain("item.ListingDuration");
		expect(
			auctionCreate({ Title: "No bid", ListingDuration: "Days_3" })?.message,
		).toContain("item.StartPrice");
		expect(auctionRevise({ Title: "Renamed" })).toBeUndefined();
	});

	it("rejects a reserve at or below the opening bid", () => {
		const violation = auctionCreate({ ...auctionItem, ReservePrice: 9.99 });

		expect(violation?.message).toContain("item.ReservePrice");
		expect(violation?.message).toContain("higher than StartPrice");
	});

	it("requires the Buy It Now price to sit at least 30% above the opening bid", () => {
		expect(
			auctionRevise({ StartPrice: 10, BuyItNowPrice: 13 }),
		).toBeUndefined();
		expect(
			auctionRevise({ StartPrice: 9.99, BuyItNowPrice: 12.99 }),
		).toBeUndefined();

		const justBelow = auctionRevise({ StartPrice: 10, BuyItNowPrice: 12.99 });
		expect(justBelow?.message).toContain("fields.BuyItNowPrice");
		expect(justBelow?.message).toContain("30%");
		expect(
			auctionRevise({ StartPrice: 10, BuyItNowPrice: 10 })?.message,
		).toContain("fields.BuyItNowPrice");
		expect(
			auctionRevise({ StartPrice: 10, BuyItNowPrice: 8 })?.message,
		).toContain("fields.BuyItNowPrice");
	});

	it("skips price comparisons when the opening bid is not in the payload", () => {
		expect(auctionRevise({ ReservePrice: 30 })).toBeUndefined();
	});
});

describe("fixed-price Item rules", () => {
	it("accepts a fixed-price item", () => {
		expect(
			fixedPrice({
				Title: "Widget",
				StartPrice: 14.99,
				Quantity: 10,
				ListingDuration: "GTC",
			}),
		).toBeUndefined();
	});

	it("rejects the auction ListingType", () => {
		const violation = fixedPrice({ Title: "Widget", ListingType: "Chinese" });

		expect(violation?.message).toContain("item.ListingType");
		expect(violation?.message).toContain("format AUCTION");
	});

	it("only accepts GTC as a fixed-price duration and does not demand one", () => {
		const violation = fixedPrice({
			Title: "Widget",
			StartPrice: 14.99,
			ListingDuration: "Days_7",
		});

		expect(violation?.message).toContain("item.ListingDuration");
		expect(violation?.message).toContain("GTC");
		expect(fixedPrice({ Title: "Widget", StartPrice: 14.99 })).toBeUndefined();
	});

	it("rejects auction-only prices", () => {
		expect(fixedPrice({ StartPrice: 10, ReservePrice: 20 })?.message).toContain(
			"item.ReservePrice",
		);
		expect(
			fixedPrice({ StartPrice: 10, BuyItNowPrice: 20 })?.message,
		).toContain("item.BuyItNowPrice");
	});
});

describe("format checks and call names", () => {
	it("fails with a tagged input error", () => {
		let error: Error | undefined;

		try {
			validateTradingListingFormatEffect({
				item: { ...auctionItem, ListingDuration: "GTC" },
				format: FormatType.AUCTION,
				parameter: "item",
				isCreate: true,
			});
		} catch (caught) {
			error = caught as Error;
		}

		expect(error).toBeInstanceOf(Error);
		expect(error?.message).toContain("item.ListingDuration");
	});

	it("only allows SellToHighBidder on auctions", () => {
		validateTradingEndingReasonEffect(
			"SellToHighBidder",
			FormatType.AUCTION,
			"reason",
		);
		validateTradingEndingReasonEffect(
			undefined,
			FormatType.FIXED_PRICE,
			"reason",
		);

		let error: Error | undefined;

		try {
			validateTradingEndingReasonEffect(
				"SellToHighBidder",
				FormatType.FIXED_PRICE,
				"reason",
			);
		} catch (caught) {
			error = caught as Error;
		}

		expect(error).toBeInstanceOf(Error);
		expect(error?.message).toContain("reason");
	});

	it("maps each operation to the format-specific Trading call", () => {
		expect(tradingCallName("create", FormatType.AUCTION)).toBe("AddItem");
		expect(tradingCallName("create", FormatType.FIXED_PRICE)).toBe(
			"AddFixedPriceItem",
		);
		expect(tradingCallName("revise", FormatType.AUCTION)).toBe("ReviseItem");
		expect(tradingCallName("end", FormatType.AUCTION)).toBe("EndItem");
		expect(tradingCallName("relist", FormatType.AUCTION)).toBe("RelistItem");
		expect(tradingCallName("relist", FormatType.FIXED_PRICE)).toBe(
			"RelistFixedPriceItem",
		);
	});

	it("defaults the format to fixed price", () => {
		expect(resolveTradingFormat(undefined)).toBe(FormatType.FIXED_PRICE);
		expect(resolveTradingFormat(FormatType.AUCTION)).toBe(FormatType.AUCTION);
	});
});
