import { parseEnv } from "node:util";
import {
	closeSync,
	existsSync,
	fsyncSync,
	openSync,
	readFileSync,
	writeFileSync,
} from "fs";
import { CREDENTIAL_ENV_PATH } from "@/shared/credentialFile.js";
import type {
	EbayConfig,
	EbayUserToken,
	StoredTokenData,
} from "@/shared/ebay.js";
import { stringifyEnv } from "@/shared/envFile.js";

export type EbayUserTokenResponse = Pick<
	EbayUserToken,
	"access_token" | "expires_in"
> &
	Partial<Omit<EbayUserToken, "access_token" | "expires_in">>;

export class CredentialStoreError extends Error {
	readonly envPath: string;

	constructor(failure: {
		envPath: string;
		message: string;
		cause: unknown;
	}) {
		super(failure.message, { cause: failure.cause });
		this.name = "CredentialStoreError";
		this.envPath = failure.envPath;
	}
}

export interface CredentialStore {
	write(updates: Record<string, string>): Promise<void>;
}

const writeTailByEnvPath = new Map<string, Promise<void>>();

function queueCredentialWrite(
	envPath: string,
	writeFile: () => void,
): Promise<void> {
	const earlierWrite = writeTailByEnvPath.get(envPath) ?? Promise.resolve();
	const queuedWrite = runCredentialWrite(earlierWrite, envPath, writeFile);

	writeTailByEnvPath.set(envPath, waitForEarlierWrite(queuedWrite));

	return queuedWrite;
}

async function waitForEarlierWrite(earlierWrite: Promise<void>): Promise<void> {
	try {
		await earlierWrite;
	} catch (error) {
		console.error({ message: "earlier credential write failed", error });
	}
}

async function runCredentialWrite(
	earlierWrite: Promise<void>,
	envPath: string,
	writeFile: () => void,
): Promise<void> {
	await earlierWrite;

	try {
		writeFile();
	} catch (cause) {
		throw new CredentialStoreError({
			envPath,
			message: `Failed to write credential updates to ${envPath}`,
			cause,
		});
	}
}

function keepStringUpdates(
	updates: Record<string, string>,
): Record<string, string> {
	const stringUpdates: Record<string, string> = {};

	for (const [name, envValue] of Object.entries(updates)) {
		const isString = typeof envValue === "string";

		if (isString) {
			stringUpdates[name] = envValue;
		}
	}

	return stringUpdates;
}

function readExistingEnv(envPath: string): Record<string, string> {
	const fileIsMissing = !existsSync(envPath);

	if (fileIsMissing) {
		return {};
	}

	const parsed = parseEnv(readFileSync(envPath, "utf-8"));
	const existing: Record<string, string> = {};

	for (const [name, envValue] of Object.entries(parsed)) {
		if (typeof envValue === "string") {
			existing[name] = envValue;
		}
	}

	return existing;
}

function flushCredentialFile(envPath: string): void {
	const fileIsMissing = !existsSync(envPath);

	if (fileIsMissing) {
		return;
	}

	try {
		const fileDescriptor = openSync(envPath, "r+");

		try {
			fsyncSync(fileDescriptor);
		} finally {
			closeSync(fileDescriptor);
		}
	} catch (error) {
		console.error({
			message: "credential file flush failed after the write",
			envPath,
			error,
		});
	}
}

function writeCredentialEnvFile(
	envPath: string,
	updates: Record<string, string>,
): void {
	const stringUpdates = keepStringUpdates(updates);
	const existingEnv = readExistingEnv(envPath);
	const mergedEnv = { ...existingEnv, ...stringUpdates };
	const envFileText = stringifyEnv(mergedEnv);

	writeFileSync(envPath, envFileText, "utf-8");
	flushCredentialFile(envPath);
}

export class DotEnvCredentialStore implements CredentialStore {
	constructor(
		private readonly getEnvPath: () => string = () => CREDENTIAL_ENV_PATH,
	) {}

	async write(updates: Record<string, string>): Promise<void> {
		const envPath = this.getEnvPath();

		await queueCredentialWrite(envPath, function writeQueuedEnvFile() {
			writeCredentialEnvFile(envPath, updates);
		});
	}
}

export function maskToken(token: string): string {
	const isTooShortToMask = token.length < 12;

	if (isTooShortToMask) {
		return "***";
	}

	const prefix = token.substring(0, 6);
	const suffix = token.substring(token.length - 6);

	return `${prefix}...${suffix}`;
}

export function createExpiryTimestamp(
	expiresInSeconds: number,
	now = Date.now(),
): number {
	const lifetimeMilliseconds = expiresInSeconds * 1000;

	return now + lifetimeMilliseconds;
}

export function createDefaultAccessTokenExpiry(now = Date.now()): number {
	return createExpiryTimestamp(7200, now);
}

export function createDefaultRefreshTokenExpiry(now = Date.now()): number {
	return createExpiryTimestamp(18 * 30 * 24 * 60 * 60, now);
}

export function createAppAccessTokenExpiry(
	expiresInSeconds: number,
	now = Date.now(),
): number {
	const lifetimeWithBufferSeconds = Math.max(0, expiresInSeconds - 60);

	return createExpiryTimestamp(lifetimeWithBufferSeconds, now);
}

export function isTokenExpired(
	expiry: number | null | undefined,
	now = Date.now(),
): boolean {
	if (!expiry) {
		return true;
	}

	return now >= expiry;
}

export interface CreateStoredUserTokensInput {
	accessToken: string;
	accessTokenExpiry?: number | undefined;
	config: EbayConfig;
	envAppToken?: string | undefined;
	now?: number;
	refreshToken: string;
	refreshTokenExpiry?: number | undefined;
	scope?: string | undefined;
	tokenType?: string | undefined;
}

export function createStoredUserTokens(
	input: CreateStoredUserTokensInput,
): StoredTokenData {
	const now = input.now ?? Date.now();
	const envAppToken = input.envAppToken ?? input.config.appAccessToken;
	const tokenType = input.tokenType ?? "Bearer";
	const accessTokenExpiry =
		input.accessTokenExpiry ?? createDefaultAccessTokenExpiry(now);
	const refreshTokenExpiry =
		input.refreshTokenExpiry ?? createDefaultRefreshTokenExpiry(now);

	return {
		clientId: input.config.clientId,
		clientSecret: input.config.clientSecret,
		redirectUri: input.config.redirectUri,
		locale: input.config.locale,
		marketplaceId: input.config.marketplaceId,
		contentLanguage: input.config.contentLanguage,
		envAppToken,
		userAccessToken: input.accessToken,
		userRefreshToken: input.refreshToken,
		tokenType,
		userAccessTokenExpiry: accessTokenExpiry,
		userRefreshTokenExpiry: refreshTokenExpiry,
		scope: input.scope,
	};
}

export interface CreateStoredUserTokensFromResponseInput {
	config: EbayConfig;
	envAppToken?: string;
	previousTokens?: StoredTokenData | null;
	tokenData: EbayUserTokenResponse;
	now?: number;
}

function pickRefreshTokenExpiry(
	freshLifetimeSeconds: number | undefined,
	previousExpiry: number | undefined,
	now: number,
): number | undefined {
	if (freshLifetimeSeconds) {
		return createExpiryTimestamp(freshLifetimeSeconds, now);
	}

	return previousExpiry;
}

export function createStoredUserTokensFromResponse(
	input: CreateStoredUserTokensFromResponseInput,
): StoredTokenData {
	const now = input.now ?? Date.now();
	const previousTokens = input.previousTokens;
	const freshToken = input.tokenData;

	const envAppTokenFromCaller = input.envAppToken;
	const envAppTokenFromPreviousSave = previousTokens?.envAppToken;
	const envAppTokenFromConfig = input.config.appAccessToken;
	const envAppToken =
		envAppTokenFromCaller ??
		envAppTokenFromPreviousSave ??
		envAppTokenFromConfig;

	const refreshTokenFromEbay = freshToken.refresh_token;
	const refreshTokenFromPreviousSave = previousTokens?.userRefreshToken;
	const refreshToken =
		refreshTokenFromEbay ?? refreshTokenFromPreviousSave ?? "";

	const tokenTypeFromEbay = freshToken.token_type;
	const tokenTypeFromPreviousSave = previousTokens?.tokenType;
	const tokenType = tokenTypeFromEbay ?? tokenTypeFromPreviousSave ?? "Bearer";

	const scopeFromEbay = freshToken.scope;
	const scopeFromPreviousSave = previousTokens?.scope;
	const scope = scopeFromEbay ?? scopeFromPreviousSave;

	const accessTokenExpiry = createExpiryTimestamp(freshToken.expires_in, now);
	const refreshTokenExpiry = pickRefreshTokenExpiry(
		freshToken.refresh_token_expires_in,
		previousTokens?.userRefreshTokenExpiry,
		now,
	);

	return createStoredUserTokens({
		config: input.config,
		envAppToken,
		accessToken: freshToken.access_token,
		refreshToken,
		tokenType,
		accessTokenExpiry,
		refreshTokenExpiry,
		scope,
		now,
	});
}

function hasSecretText(secret: string | null | undefined): secret is string {
	if (secret === null) {
		return false;
	}

	if (secret === undefined) {
		return false;
	}

	return secret.length > 0;
}

function showMaskedSecret(
	secret: string | null | undefined,
	missingLabel: string,
): string {
	if (!hasSecretText(secret)) {
		return missingLabel;
	}

	return maskToken(secret);
}

function showClientSecret(clientSecret: string | null | undefined): string {
	if (!hasSecretText(clientSecret)) {
		return "Not set";
	}

	return "****** (set)";
}

function showRedirectUri(redirectUri: string | null | undefined): string {
	if (!hasSecretText(redirectUri)) {
		return "Not set";
	}

	return redirectUri;
}

function describeTokenExpiry(expiry: number | null | undefined) {
	if (!expiry) {
		return "Not available";
	}

	const expired = Date.now() >= expiry;

	return {
		timestamp: expiry,
		date: new Date(expiry).toISOString(),
		expired,
	};
}

function describeCurrentToken(tokenInfo: {
	hasUserToken: boolean;
	hasAppAccessToken: boolean;
}): string {
	if (tokenInfo.hasUserToken) {
		return "user_token (10,000-50,000 req/day)";
	}

	if (tokenInfo.hasAppAccessToken) {
		return "app_access_token (1,000 req/day)";
	}

	return "none";
}

function listGrantedScopes(scope: string | null | undefined): string[] {
	if (!hasSecretText(scope)) {
		return [];
	}

	return scope.split(" ");
}

export interface CredentialDisplayInput {
	appAccessToken: string | null | undefined;
	appAccessTokenExpiry: number | null | undefined;
	authenticated: boolean;
	config: EbayConfig;
	tokenInfo: {
		hasAppAccessToken: boolean;
		hasUserToken: boolean;
	};
	userTokens: StoredTokenData | null;
}

export function buildCredentialDisplay(input: CredentialDisplayInput) {
	const {
		appAccessToken,
		appAccessTokenExpiry,
		authenticated,
		config,
		tokenInfo,
		userTokens,
	} = input;
	const refreshTokenFromConfig = config.refreshToken;
	const refreshTokenFromSave = userTokens?.userRefreshToken;
	const refreshToken = refreshTokenFromConfig ?? refreshTokenFromSave ?? "";

	return {
		credentials: {
			clientId: showMaskedSecret(config.clientId, "Not set"),
			clientSecret: showClientSecret(config.clientSecret),
			environment: config.environment,
			redirectUri: showRedirectUri(config.redirectUri),
		},
		tokens: {
			refreshToken: showMaskedSecret(refreshToken, "Not set (in .env)"),
			accessToken: showMaskedSecret(
				userTokens?.userAccessToken,
				"Not available",
			),
			accessTokenExpiry: describeTokenExpiry(userTokens?.userAccessTokenExpiry),
			refreshTokenExpiry: describeTokenExpiry(
				userTokens?.userRefreshTokenExpiry,
			),
			appToken: showMaskedSecret(appAccessToken, "Not cached"),
			appTokenExpiry: describeTokenExpiry(appAccessTokenExpiry),
		},
		status: {
			hasUserToken: tokenInfo.hasUserToken,
			hasAppAccessToken: tokenInfo.hasAppAccessToken,
			authenticated,
			currentTokenType: describeCurrentToken(tokenInfo),
		},
		scopes: listGrantedScopes(userTokens?.scope),
	};
}
