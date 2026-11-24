import { z } from "zod";

export const getApiStatusInputSchema = z.object({
	limit: z
		.number()
		.int()
		.min(1)
		.max(50)
		.optional()
		.describe("Maximum number of feed items to return"),
	status: z
		.enum(["Resolved", "Unresolved"])
		.optional()
		.describe("Optional incident status filter"),
	api: z.string().optional().describe("Optional API-name substring filter"),
});

export const getRateLimitsInputSchema = z.object({
	apiContext: z
		.string()
		.optional()
		.describe(
			"Optional API context filter, e.g. buy, sell, commerce, developer, or tradingapi",
		),
	apiName: z
		.string()
		.optional()
		.describe(
			"Optional API name filter, e.g. browse, inventory, taxonomy, or tradingapi",
		),
});

export const getUserRateLimitsInputSchema = getRateLimitsInputSchema;

export const clientSettingsSchema = z.object({
	client_name: z
		.string()
		.optional()
		.describe("User-friendly name for the application"),
	contacts: z
		.array(z.string())
		.optional()
		.describe("Contact email addresses for the registrant"),
	policy_uri: z
		.string()
		.optional()
		.describe("HTTPS URL to the application privacy policy"),
	redirect_uris: z.array(z.string()).optional().describe("OAuth redirect URIs"),
	software_id: z
		.string()
		.optional()
		.describe("Stable identifier for the client software"),
	software_statement: z
		.string()
		.optional()
		.describe("Base64-encoded Software Statement Assertion JWT"),
});

export const registerClientInputSchema = z.object({
	clientSettings: clientSettingsSchema.describe(
		"Generated ClientSettings request body",
	),
});

export const getSigningKeysInputSchema = z.object({});

export const createSigningKeyRequestSchema = z.object({
	signingKeyCipher: z
		.string()
		.optional()
		.describe("Cipher for the generated keypair, e.g. ED25519 or RSA"),
});

export const createSigningKeyInputSchema = z.object({
	request: createSigningKeyRequestSchema
		.optional()
		.describe("Optional signing-key request body"),
});

export const getSigningKeyInputSchema = z.object({
	signingKeyId: z
		.string()
		.describe("System-generated eBay signing key identifier"),
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

export const rateLimitsResponseSchema = z.object({
	rateLimits: z.array(rateLimitSchema).optional(),
});

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

export const signingKeySchema = z.object({
	creationTime: z.number().int().optional(),
	expirationTime: z.number().int().optional(),
	jwe: z.string().optional(),
	privateKey: z.string().optional(),
	publicKey: z.string().optional(),
	signingKeyCipher: z.string().optional(),
	signingKeyId: z.string().optional(),
});

export const querySigningKeysResponseSchema = z.object({
	signingKeys: z.array(signingKeySchema).optional(),
});
