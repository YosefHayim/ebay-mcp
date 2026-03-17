import { z } from 'zod';
import type { OutputArgs, ToolAnnotations } from '../tool-definitions.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
  title?: string;
  outputSchema?: OutputArgs;
  annotations?: ToolAnnotations;
  _meta?: Record<string, unknown>;
}

export const developerTools: ToolDefinition[] = [
  {
    name: 'ebay_get_api_status',
    description:
      'Get the latest eBay API status and incidents from the official RSS feed. Returns recent issues, fixes, and outages for eBay APIs (e.g. Trading API, Inventory API, Sandbox). Use when the user asks about API status, outages, or fixes.',
    inputSchema: {
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe('Maximum number of items to return (default 20)'),
      status: z
        .enum(['Resolved', 'Unresolved'])
        .optional()
        .describe('Filter by status: Resolved or Unresolved'),
      api: z
        .string()
        .optional()
        .describe('Filter by API name (e.g. "Trading API", "Inventory API", "Sandbox")'),
    },
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
    } as OutputArgs,
  },
  {
    name: 'ebay_get_rate_limits',
    description:
      'Get application rate limits for eBay APIs. Returns call quota, remaining calls, and time until reset for each API resource.',
    inputSchema: {
      apiContext: z
        .string()
        .optional()
        .describe('Filter by API context: buy, sell, commerce, developer, or tradingapi'),
      apiName: z
        .string()
        .optional()
        .describe('Filter by specific API name: browse, inventory, taxonomy, tradingapi, etc.'),
    },
    outputSchema: {
      type: 'object',
      properties: {
        rateLimits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              apiContext: { type: 'string' },
              apiName: { type: 'string' },
              apiVersion: { type: 'string' },
              resources: { type: 'array' },
            },
          },
        },
      },
    } as OutputArgs,
  },
  {
    name: 'ebay_get_user_rate_limits',
    description:
      'Get user-specific rate limits for eBay APIs. Returns call quota per user for APIs that limit by user.',
    inputSchema: {
      apiContext: z
        .string()
        .optional()
        .describe('Filter by API context: buy, sell, commerce, developer, or tradingapi'),
      apiName: z
        .string()
        .optional()
        .describe('Filter by specific API name: browse, inventory, taxonomy, tradingapi, etc.'),
    },
    outputSchema: {
      type: 'object',
      properties: {
        rateLimits: { type: 'array' },
      },
    } as OutputArgs,
  },
  {
    name: 'ebay_register_client',
    description:
      'Register a third party financial application with eBay (Open Banking / PSD2). Requires valid eIDAS certificate via MTLS.',
    inputSchema: {
      clientSettings: z
        .object({
          client_name: z.string().optional().describe('User-friendly name for the application'),
          contacts: z.array(z.string()).optional().describe('Array of contact email addresses'),
          policy_uri: z.string().optional().describe('HTTPS URL to privacy policy document'),
          redirect_uris: z.array(z.string()).optional().describe('Array of redirect URIs'),
          software_id: z.string().optional().describe('Unique identifier for the client software'),
          software_statement: z
            .string()
            .optional()
            .describe('Base64-encoded Software Statement Assertion (SSA) JWT'),
        })
        .describe('Client registration settings'),
    },
    outputSchema: {
      type: 'object',
      properties: {
        client_id: { type: 'string' },
        client_secret: { type: 'string' },
        client_id_issued_at: { type: 'number' },
        client_secret_expires_at: { type: 'number' },
      },
    } as OutputArgs,
  },
  {
    name: 'ebay_get_signing_keys',
    description:
      'Get all signing keys for the application. Returns public keys and metadata (private keys are not stored by eBay).',
    inputSchema: {},
    outputSchema: {
      type: 'object',
      properties: {
        signingKeys: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              signingKeyId: { type: 'string' },
              signingKeyCipher: { type: 'string' },
              publicKey: { type: 'string' },
              jwe: { type: 'string' },
              creationTime: { type: 'number' },
              expirationTime: { type: 'number' },
            },
          },
        },
      },
    } as OutputArgs,
  },
  {
    name: 'ebay_create_signing_key',
    description:
      'Create a new signing keypair for API digital signatures. Supports ED25519 (recommended) or RSA ciphers. IMPORTANT: Save the private key immediately as eBay does not store it.',
    inputSchema: {
      signingKeyCipher: z
        .enum(['ED25519', 'RSA'])
        .optional()
        .describe(
          'Cipher to use for keypair: ED25519 (recommended, shorter keys) or RSA (legacy support)'
        ),
    },
    outputSchema: {
      type: 'object',
      properties: {
        signingKeyId: { type: 'string' },
        signingKeyCipher: { type: 'string' },
        privateKey: { type: 'string' },
        publicKey: { type: 'string' },
        jwe: { type: 'string' },
        creationTime: { type: 'number' },
        expirationTime: { type: 'number' },
      },
    } as OutputArgs,
  },
  {
    name: 'ebay_get_signing_key',
    description:
      'Get a specific signing key by ID. Returns public key and metadata (private key is not stored by eBay).',
    inputSchema: {
      signingKeyId: z.string().describe('The system-generated eBay ID of the signing key'),
    },
    outputSchema: {
      type: 'object',
      properties: {
        signingKeyId: { type: 'string' },
        signingKeyCipher: { type: 'string' },
        publicKey: { type: 'string' },
        jwe: { type: 'string' },
        creationTime: { type: 'number' },
        expirationTime: { type: 'number' },
      },
    } as OutputArgs,
  },
];
