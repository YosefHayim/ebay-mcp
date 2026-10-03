# eBay MCP API Schemas

Zod schemas for every eBay endpoint the server exposes, grouped by API family. Each
endpoint input schema is the single source of truth for three things: the JSON Schema
that MCP clients see (the SDK converts the Zod shape), the runtime validation in
`defineTool` and `decodeEndpointInputEffect`, and the TypeScript types of handler
arguments (`z.infer`).

## Layout

| Folder | API family |
| --- | --- |
| `account-management/` | Account v1/v2 policies and programs, Finances |
| `analytics/` | Seller standards, traffic reports, customer-service metrics |
| `communication/` | Messages, feedback, negotiations, notifications |
| `developer/` | Rate limits, client registration, signing keys |
| `fulfillment/` | Orders, shipping, refunds, disputes, Logistics |
| `inventory-management/` | Inventory items, offers, locations, Feed, Media, Stores |
| `marketing/` | Campaigns, ads, keywords, promotions, reports |
| `metadata/` | Marketplace policies, compatibility, shipping metadata |
| `other/` | Identity, compliance, VeRO, translation, eDelivery, Browse/Finding |
| `taxonomy/` | Category trees, item aspects, Charity |

## Schema ownership

| Surface | Owns |
| --- | --- |
| `src/tools/schemas.ts` | Shared primitives reused across families |
| `src/schemas/<family>/` | Endpoint/tool input (and optional response) schemas for that family |
| `src/types/**` | Generated eBay DTOs — regenerate with `pnpm sync`; never hand-edit |

## Writing a schema

```typescript
import { z } from 'zod';

/**
 * Validates the Inventory Management API get inventory item request payload.
 */
export const getInventoryItemInputSchema = z.object({
  sku: z.string().describe('The seller-defined SKU value for the inventory item'),
});
```

- Describe every field with `.describe()` — the text is what the AI client reads.
- Derive related schemas (`.extend`, `.pick`) instead of duplicating fields.
- Register the tool with `inputSchema: getInventoryItemInputSchema.shape` in
  `src/tools/categories/<family>.ts`.
