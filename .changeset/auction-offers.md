---
"ebay-mcp": minor
---

Add auction support to the Inventory offer tools: `ebay_create_offer`, `ebay_update_offer`, and `ebay_bulk_create_offer` now advertise `auctionStartPrice`, `auctionReservePrice`, and a `listingDuration` enum, reject bodies that mix AUCTION and FIXED_PRICE rules before any eBay request, and render auction bids, reserves, and durations in offer cards and tables.
