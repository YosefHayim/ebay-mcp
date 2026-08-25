---
"ebay-mcp": patch
---

Align auction offer validation with eBay's createOffer rules: `availableQuantity` and `eBayPlusIfEligible` are rejected on AUCTION offers (eBay error 25762), `listingDuration` and `auctionStartPrice` are required when an auction is created, and `listingStartDate` is documented as opt-in only because scheduled starts can incur a fee.
