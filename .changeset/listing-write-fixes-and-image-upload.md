---
"ebay-mcp": minor
---

Unblock end-to-end listing creation and surface real eBay errors.

- Add `ebay_upload_site_hosted_pictures` — upload a local file, base64, or external URL to eBay Picture Services (EPS) via the Trading API and get a hosted image URL for `PictureDetails.PictureURL`. The real image format is detected from the content (so PNG/GIF/WebP are not mislabeled as JPEG), base64 input is validated, and uploads are capped at eBay's ~12 MB limit.
- Fix inventory write tools (e.g. `ebay_create_inventory_location`, `ebay_create_or_replace_inventory_item`) rejecting valid input: request-body schemas now advertise `type: object` instead of an opaque schema, so MCP hosts send a JSON object instead of a stringified one.
- Surface eBay's real error payload (errorId, message, longMessage, parameters, HTTP status) from write tools instead of masking failures as "An error has occurred". The REST client rejects with the tagged error and the tool boundary unwraps the Effect `FiberFailure` cause chain.
- Return `{ success: true }` for 204 No Content responses instead of emitting non-string content the MCP result schema rejects.
- Drop `commerce.feedback.readonly` from the authorization-code scope list — it is client-credentials-only and made eBay reject user consent with `invalid_scope`.
