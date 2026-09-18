---
'ebay-mcp': patch
---

Keep the request deadline armed until the eBay response body has been read, so a stalled response stream fails with a timeout instead of hanging a tool call forever.
