import { zodToJsonSchema } from 'zod-to-json-schema';
import { Effect } from 'effect';
import { defineTool } from '@/tools/defineTool.js';
import { mapRateLimitsToStat, mapUserRateLimitsToStat } from '@/tools/ui/maps.js';
import {
  clientDetailsSchema,
  createSigningKeyInputSchema,
  getApiStatusInputSchema,
  getRateLimitsInputSchema,
  getSigningKeyInputSchema,
  getSigningKeysInputSchema,
  getUserRateLimitsInputSchema,
  querySigningKeysResponseSchema,
  rateLimitsResponseSchema,
  registerClientInputSchema,
  signingKeySchema,
} from '@/schemas/developer/developer.js';
import type { OutputArgs } from '@/tools/types.js';
import { getApiStatusFeed } from '@/utils/apiStatusFeed.js';
import type { ToolEntry } from '@/tools/registry.js';

/** Developer API tools for eBay application and keyset management. */
export const developerEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_api_status',
    description:
      'Get the latest eBay API status and incidents from the official RSS feed. Returns recent issues, fixes, and outages for eBay APIs (e.g. Trading API, Inventory API, Sandbox). Use when the user asks about API status, outages, or fixes.',
    inputSchema: getApiStatusInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string' },
              link: { type: 'string' },
              api: { type: 'string' },
              site: { type: 'string' },
              status: { type: 'string' },
              lastUpdated: { type: 'string' },
            },
          },
        },
        error: { type: 'string' },
      },
      description: 'Latest API status items from eBay developer feed',
    },
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
    outputSchema: zodToJsonSchema(rateLimitsResponseSchema, {
      name: 'GetRateLimitsOutput',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.developer.getRateLimits(args)),
    ui: { archetype: 'stat', map: mapRateLimitsToStat },
  }),
  defineTool({
    name: 'ebay_get_user_rate_limits',
    description:
      'Get user-specific rate limits for eBay APIs. Returns call quota per user for APIs that limit by user.',
    inputSchema: getUserRateLimitsInputSchema.shape,
    outputSchema: zodToJsonSchema(rateLimitsResponseSchema, {
      name: 'GetUserRateLimitsOutput',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.developer.getUserRateLimits(args)),
    ui: { archetype: 'stat', map: mapUserRateLimitsToStat },
  }),
  defineTool({
    name: 'ebay_register_client',
    description:
      'Register a third party financial application with eBay (Open Banking / PSD2). Requires valid eIDAS certificate via MTLS.',
    inputSchema: registerClientInputSchema.shape,
    outputSchema: zodToJsonSchema(clientDetailsSchema, {
      name: 'RegisterClientOutput',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.developer.registerClient(args)),
  }),
  defineTool({
    name: 'ebay_get_signing_keys',
    description:
      'Get all signing keys for the application. Returns public keys and metadata (private keys are not stored by eBay).',
    inputSchema: getSigningKeysInputSchema.shape,
    outputSchema: zodToJsonSchema(querySigningKeysResponseSchema, {
      name: 'GetSigningKeysOutput',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.developer.getSigningKeys(args)),
  }),
  defineTool({
    name: 'ebay_create_signing_key',
    description:
      'Create a new signing keypair for API digital signatures. Supports ED25519 (recommended) or RSA ciphers. IMPORTANT: Save the private key immediately as eBay does not store it. To sign the calls eBay requires signatures on for EU/UK sellers (Finances API, issueRefund), set EBAY_SIGNING_KEY_JWE to the returned jwe and EBAY_SIGNING_PRIVATE_KEY to the returned privateKey, then restart the server.',
    inputSchema: createSigningKeyInputSchema.shape,
    outputSchema: zodToJsonSchema(signingKeySchema, {
      name: 'CreateSigningKeyOutput',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.developer.createSigningKey(args)),
  }),
  defineTool({
    name: 'ebay_get_signing_key',
    description:
      'Get a specific signing key by ID. Returns public key and metadata (private key is not stored by eBay).',
    inputSchema: getSigningKeyInputSchema.shape,
    outputSchema: zodToJsonSchema(signingKeySchema, {
      name: 'GetSigningKeyOutput',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.developer.getSigningKey(args)),
  }),
];
