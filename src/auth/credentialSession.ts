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
		throw new Error(`Failed to write credential updates to ${envPath}`, {
			cause,
		});
	}
}

function keepStringUpdates(
	updates: Record<string, string>,
): Record<string, string> {
	const stringUpdates: Record<string, string> = {};

	for (const [name, envValue] of Object.entries(updates)) {
		const isString = typeof envValue == "string";

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
		if (typeof envValue == "string") {
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
	private readonly getEnvPath: () => string;

	constructor(getEnvPath: () => string = () => CREDENTIAL_ENV_PATH) {
		this.getEnvPath = getEnvPath;
	}

	write = async (updates: Record<string, string>): Promise<void> => {
		const envPath = this.getEnvPath();

		await queueCredentialWrite(envPath, function writeQueuedEnvFile() {
			writeCredentialEnvFile(envPath, updates);
		});
	};
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

export class AccessTokenLifetime {
	private readonly expiry: number | null;
	private readonly now: number;

	constructor(expiry: number | null | undefined, now = Date.now()) {
		const hasNoExpiry = expiry == null;

		if (hasNoExpiry) {
			this.expiry = null;
			this.now = now;
			return;
		}

		this.expiry = expiry;
		this.now = now;
	}

	hasExpired = (): boolean => {
		const expiry = this.expiry;
		const hasNoExpiry = expiry == null;

		if (hasNoExpiry) {
			return true;
		}

		const expiryIsZero = expiry == 0;

		if (expiryIsZero) {
			return true;
		}

		const expiryIsNotANumber = Number.isNaN(expiry);

		if (expiryIsNotANumber) {
			return true;
		}

		const expiryHasPassed = this.now >= expiry;

		return expiryHasPassed;
	};
}

export function isTokenExpired(
	expiry: number | null | undefined,
	now = Date.now(),
): boolean {
	return new AccessTokenLifetime(expiry, now).hasExpired();
}

interface StoredUserTokenFields {
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
	tokenFields: StoredUserTokenFields,
): StoredTokenData {
	const now = tokenFields.now ?? Date.now();
	const envAppToken =
		tokenFields.envAppToken ?? tokenFields.config.appAccessToken;
	const tokenType = tokenFields.tokenType ?? "Bearer";
	const accessTokenExpiry =
		tokenFields.accessTokenExpiry ?? createDefaultAccessTokenExpiry(now);
	const refreshTokenExpiry =
		tokenFields.refreshTokenExpiry ?? createDefaultRefreshTokenExpiry(now);

	return {
		clientId: tokenFields.config.clientId,
		clientSecret: tokenFields.config.clientSecret,
		redirectUri: tokenFields.config.redirectUri,
		locale: tokenFields.config.locale,
		marketplaceId: tokenFields.config.marketplaceId,
		contentLanguage: tokenFields.config.contentLanguage,
		envAppToken,
		userAccessToken: tokenFields.accessToken,
		userRefreshToken: tokenFields.refreshToken,
		tokenType,
		userAccessTokenExpiry: accessTokenExpiry,
		userRefreshTokenExpiry: refreshTokenExpiry,
		scope: tokenFields.scope,
	};
}

interface MergeEbayUserTokens {
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

export function mergeEbayUserTokens(
	tokenSave: MergeEbayUserTokens,
): StoredTokenData {
	const now = tokenSave.now ?? Date.now();
	const previousTokens = tokenSave.previousTokens;
	const freshToken = tokenSave.tokenData;

	const envAppTokenFromCaller = tokenSave.envAppToken;
	const envAppTokenFromPreviousSave = previousTokens?.envAppToken;
	const envAppTokenFromConfig = tokenSave.config.appAccessToken;
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
		config: tokenSave.config,
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
	const expiryIsMissing = expiry == null;

	if (expiryIsMissing) {
		return "Not available";
	}

	const expiryIsZero = expiry == 0;

	if (expiryIsZero) {
		return "Not available";
	}

	const expiryIsNotANumber = Number.isNaN(expiry);

	if (expiryIsNotANumber) {
		return "Not available";
	}

	const accessTokenLifetime = new AccessTokenLifetime(expiry);
	const expired = accessTokenLifetime.hasExpired();
	const expiryDate = new Date(expiry);

	return {
		timestamp: expiry,
		date: expiryDate.toISOString(),
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
