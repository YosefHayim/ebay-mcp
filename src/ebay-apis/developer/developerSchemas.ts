import { z } from 'zod';

/** Input accepted by the public eBay API status feed tool. */
export const getApiStatusInputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe('Maximum number of feed items to return'),
  status: z.enum(['Resolved', 'Unresolved']).optional().describe('Optional incident status filter'),
  api: z.string().optional().describe('Optional API-name substring filter'),
});

/** Input accepted by Developer Analytics API getRateLimits. */
export const getRateLimitsInputSchema = z.object({
  apiContext: z
    .string()
    .optional()
    .describe('Optional API context filter, e.g. buy, sell, commerce, developer, or tradingapi'),
  apiName: z
    .string()
    .optional()
    .describe('Optional API name filter, e.g. browse, inventory, taxonomy, or tradingapi'),
});

/** Input accepted by Developer Analytics API getUserRateLimits. */
export const getUserRateLimitsInputSchema = getRateLimitsInputSchema;

/** Generated client-registration request fields accepted by eBay. */
export const clientSettingsSchema = z.object({
  client_name: z.string().optional().describe('User-friendly name for the application'),
  contacts: z.array(z.string()).optional().describe('Contact email addresses for the registrant'),
  policy_uri: z.string().optional().describe('HTTPS URL to the application privacy policy'),
  redirect_uris: z.array(z.string()).optional().describe('OAuth redirect URIs'),
  software_id: z.string().optional().describe('Stable identifier for the client software'),
  software_statement: z
    .string()
    .optional()
    .describe('Base64-encoded Software Statement Assertion JWT'),
});

/** Input accepted by Developer Client Registration API registerClient. */
export const registerClientInputSchema = z.object({
  clientSettings: clientSettingsSchema.describe('Generated ClientSettings request body'),
});

/** Input accepted by Developer Key Management API getSigningKeys. */
export const getSigningKeysInputSchema = z.object({});

/** Generated create-signing-key request body accepted by eBay. */
export const createSigningKeyRequestSchema = z.object({
  signingKeyCipher: z
    .string()
    .optional()
    .describe('Cipher for the generated keypair, e.g. ED25519 or RSA'),
});

/** Input accepted by Developer Key Management API createSigningKey. */
export const createSigningKeyInputSchema = z.object({
  request: createSigningKeyRequestSchema.optional().describe('Optional signing-key request body'),
});

/** Input accepted by Developer Key Management API getSigningKey. */
export const getSigningKeyInputSchema = z.object({
  signingKeyId: z.string().describe('System-generated eBay signing key identifier'),
});

const rateSchema = z.object({
  count: z.number().int().optional(),
  limit: z.number().int().optional(),
  remaining: z.number().int().optional(),
  reset: z.string().optional(),
  timeWindow: z.number().int().optional(),
});

const resourceSchema = z.object({
  name: z.string().optional(),
  rates: z.array(rateSchema).optional(),
});

const rateLimitSchema = z.object({
  apiContext: z.string().optional(),
  apiName: z.string().optional(),
  apiVersion: z.string().optional(),
  resources: z.array(resourceSchema).optional(),
});

/** Response returned by Developer Analytics rate-limit endpoints. */
export const rateLimitsResponseSchema = z.object({
  rateLimits: z.array(rateLimitSchema).optional(),
});

/** Response returned by Developer Client Registration API registerClient. */
export const clientDetailsSchema = z.object({
  client_id: z.string().optional(),
  client_id_issued_at: z.number().int().optional(),
  client_name: z.string().optional(),
  client_secret: z.string().optional(),
  client_secret_expires_at: z.number().int().optional(),
  contacts: z.array(z.string()).optional(),
  grant_types: z.array(z.string()).optional(),
  policy_uri: z.string().optional(),
  redirect_uris: z.array(z.string()).optional(),
  scope: z.string().optional(),
  software_id: z.string().optional(),
  software_statement: z.string().optional(),
});

/** Response returned by Developer Key Management signing-key endpoints. */
export const signingKeySchema = z.object({
  creationTime: z.number().int().optional(),
  expirationTime: z.number().int().optional(),
  jwe: z.string().optional(),
  privateKey: z.string().optional(),
  publicKey: z.string().optional(),
  signingKeyCipher: z.string().optional(),
  signingKeyId: z.string().optional(),
});

/** Response returned by Developer Key Management API getSigningKeys. */
export const querySigningKeysResponseSchema = z.object({
  signingKeys: z.array(signingKeySchema).optional(),
});
