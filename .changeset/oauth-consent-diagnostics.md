---
'ebay-mcp': patch
---

Make the OAuth consent step diagnosable: warn at startup when `EBAY_REDIRECT_URI` holds a URL instead of a RuName (eBay reports that as `temporarily_unavailable`), and add `EBAY_OAUTH_SCOPES` so the authorization request can name exactly the scopes a keyset was granted instead of failing with `invalid_scope`.
