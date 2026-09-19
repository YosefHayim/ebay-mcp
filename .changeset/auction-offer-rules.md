---
"ebay-mcp": patch
---

Align auction offer validation with eBay's createOffer rules: AUCTION offers accept `availableQuantity` only as `1`, reject `eBayPlusIfEligible` and per-buyer limits, allow Best Offer unless a Buy It Now price (`pricingSummary.price`) is also set, require that Buy It Now price to be at least 30% above `auctionStartPrice`, need `listingDuration` and `auctionStartPrice` when an auction is created, and document `listingStartDate` as opt-in only because scheduled starts can incur a fee.
