
import { Effect } from 'effect';
import { defineTool } from '@/tool-registry/define-tool.js';
import { mapRateLimitsToStat, mapUserRateLimitsToStat } from '@/tool-registry/ui/maps.js';
import {
  createSigningKeyInputSchema,
  getApiStatusInputSchema,
  getRateLimitsInputSchema,
  getSigningKeyInputSchema,
  getSigningKeysInputSchema,
  getUserRateLimitsInputSchema,
  registerClientInputSchema,
} from '@/ebay-apis/developer/developer-schemas.js';
import { getApiStatusFeed } from '@/shared/api-status-feed.js';
import type { ToolEntry } from '@/tool-registry/registry.js';

/** Developer API tools for eBay application and keyset management. */
export const developerEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_api_status',
    description:
      'Get the latest eBay API status and incidents from the official RSS feed. Returns recent issues, fixes, and outages for eBay APIs (e.g. Trading API, Inventory API, Sandbox). Use when the user asks about API status, outages, or fixes.',
    inputSchema: getApiStatusInputSchema.shape,
    handler: (_api, args) =>
      Effect.runPromise(
        getApiStatusFeed(args).pipe(
          Effect.map((feed) => ({ items: feed.items, ...(feed.error && { error: feed.error }) })),
        ),
      ),
  }),
  defineTool({
    name: 'ebay_get_rate_limits',
    description:
      'Get application rate limits for eBay APIs. Returns call quota, remaining calls, and time until reset for each API resource.',
    inputSchema: getRateLimitsInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.developer.getRateLimits(args)),
    ui: { archetype: 'stat', map: mapRateLimitsToStat },
  }),
  defineTool({
    name: 'ebay_get_user_rate_limits',
    description:
      'Get user-specific rate limits for eBay APIs. Returns call quota per user for APIs that limit by user.',
    inputSchema: getUserRateLimitsInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.developer.getUserRateLimits(args)),
    ui: { archetype: 'stat', map: mapUserRateLimitsToStat },
  }),
  defineTool({
    name: 'ebay_register_client',
    description:
      'Register a third party financial application with eBay (Open Banking / PSD2). Requires valid eIDAS certificate via MTLS.',
    inputSchema: registerClientInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.developer.registerClient(args)),
  }),
  defineTool({
    name: 'ebay_get_signing_keys',
    description:
      'Get all signing keys for the application. Returns public keys and metadata (private keys are not stored by eBay).',
    inputSchema: getSigningKeysInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.developer.getSigningKeys(args)),
  }),
  defineTool({
    name: 'ebay_create_signing_key',
    description:
      'Create a new signing keypair for API digital signatures. Supports ED25519 (recommended) or RSA ciphers. IMPORTANT: Save the private key immediately as eBay does not store it. To sign the calls eBay requires signatures on for EU/UK sellers (Finances API, issueRefund), set EBAY_SIGNING_KEY_JWE to the returned jwe and EBAY_SIGNING_PRIVATE_KEY to the returned privateKey, then restart the server.',
    inputSchema: createSigningKeyInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.developer.createSigningKey(args)),
  }),
  defineTool({
    name: 'ebay_get_signing_key',
    description:
      'Get a specific signing key by ID. Returns public key and metadata (private key is not stored by eBay).',
    inputSchema: getSigningKeyInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.developer.getSigningKey(args)),
  }),
];
