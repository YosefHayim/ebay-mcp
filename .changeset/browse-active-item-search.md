---
"ebay-mcp": minor
---

Add `ebay_find_active_items` and `ebay_get_item_details`, active-listing marketplace search and item detail via the Buy Browse API.

The `browse` family previously exposed only `ebay_find_completed_items` (sold comps), so there was no way to search live listings — the Finding API's `findItemsAdvanced` was decommissioned in February 2025, leaving Browse as eBay's only supported item-search API. `ebay_find_active_items` wraps `item_summary/search` with pagination, sort, category restriction, condition/buying-option/price filters, and a raw filter passthrough; `ebay_get_item_details` wraps the item resource for one listing. Both are read-only and work with the existing application token under the basic `api_scope`, so no new credentials or scopes are required.

Search input is validated before the request is built: `limit` (1–200), `offset` (0–10,000), sort order, string-array filters, non-negative and non-inverted price bounds, and a raw `filter` whose price clause would collide with `priceMin`/`priceMax` — each surfaced as a tagged input error rather than an opaque eBay 400. Pagination in the result reflects the window eBay returned, falling back to the requested one.

Auction listings report their live figure: eBay omits `price` on auction-only items and returns `currentBidPrice` instead, so `price` now falls back to it and `bidCount` is surfaced alongside. `offset` is validated as zero or a whole multiple of `limit`, which Browse requires and otherwise rejects with an opaque 400 (error 12515).
