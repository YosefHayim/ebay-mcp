---
"ebay-mcp": minor
---

Add auction support to the Trading (legacy XML) listing tools: `ebay_create_listing`, `ebay_revise_listing`, `ebay_end_listing`, and `ebay_relist_item` take a `format` argument (`FIXED_PRICE` by default) and route `AUCTION` through `AddItem`, `ReviseItem`, `EndItem`, and `RelistItem` with `ListingType` Chinese; auction `Item` payloads that use GTC, a quantity above one, Best Offer, or a reserve or Buy It Now price at or below the opening bid are rejected before any eBay request, and fixed-price payloads cannot carry auction prices.
