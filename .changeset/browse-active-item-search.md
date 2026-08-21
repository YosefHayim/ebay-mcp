---
"ebay-mcp": minor
---

Add `ebay_find_active_items` and `ebay_get_item_details`, active-listing marketplace search and item detail via the Buy Browse API.

The `browse` family previously exposed only `ebay_find_completed_items` (sold comps), so there was no way to search live listings — the Finding API's `findItemsAdvanced` was decommissioned in February 2025, leaving Browse as eBay's only supported item-search API. `ebay_find_active_items` wraps `item_summary/search` with pagination, sort, category restriction, condition/buying-option/price filters, and a raw filter passthrough; `ebay_get_item_details` wraps the item resource for one listing. Both are read-only and work with the existing application token under the basic `api_scope`, so no new credentials or scopes are required.
