---
"ebay-mcp": minor
---

Add local photo and video upload through eBay's Media API: `ebay_upload_images` returns EPS image URLs in order, `ebay_upload_video` runs the create → upload → process lifecycle and returns the `videoId`, `ebay_get_video` re-checks processing, and `ebay_attach_media_to_inventory_item` uploads and rewrites only `product.imageUrls` / `product.videoIds` on an existing item (never publishing; untouched on partial failure unless `allowPartial`). Filesystem access is opt-in via `EBAY_MCP_MEDIA_DIRS` / `EBAY_MCP_MEDIA_ROOT`, with symlinks resolved before the containment check.
