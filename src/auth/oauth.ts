import {
	type CredentialStore,
	CredentialStoreError,
	createAppAccessTokenExpiry,
	createStoredUserTokens,
	createStoredUserTokensFromResponse,
	DotEnvCredentialStore,
	type EbayUserTokenResponse,
	isTokenExpired,
} from "@/auth/credentialSession.js";
import type {
	EbayAppAccessTokenResponse,
	EbayConfig,
	EbayUserToken,
	StoredTokenData,
} from "@/shared/ebay.js";
import { LocaleEnum } from "@/shared/ebayEnums.js";
import { getBaseUrl, getDefaultScopes } from "@/shared/environment.js";
import { getErrorMessage } from "@/shared/errors.js";
import {
	describeHttpError,
	type HttpRequestOptions,
	httpRequestEffect,
} from "@/shared/http.js";
import { authLogger } from "@/shared/logger.js";

type OAuthOperation =
	| "initialize"
	| "getAccessToken"
	| "getOrRefreshAppAccessToken"
	| "exchangeCodeForToken"
	| "refreshUserToken"
	| "setUserTokens";

export class EbayOAuthError extends Error {
	readonly _tag = "EbayOAuthError";
	readonly operation: OAuthOperation;

	constructor(failure: {
		readonly operation: OAuthOperation;
		readonly message: string;
		readonly cause?: unknown;
	}) {
		super(failure.message);
		this.name = "EbayOAuthError";
		this.operation = failure.operation;

		if (failure.cause !== undefined) {
			this.cause = failure.cause;
		}
	}
}

export interface OAuthTokenScopeInfo {
	readonly tokenScopes: string[];
	readonly environmentScopes: string[];
	readonly missingScopes: string[];
}

export interface OAuthTokenInfo {
	readonly hasUserToken: boolean;
	readonly hasAppAccessToken: boolean;
	readonly scopeInfo?: OAuthTokenScopeInfo;
}

const mapCredentialStoreError = (
	operation: OAuthOperation,
	message: string,
	cause: CredentialStoreError,
): EbayOAuthError =>
	new EbayOAuthError({
		operation,
		message: `${message}: ${cause.message}`,
		cause,
	});

const isCredentialPersistenceError = (error: EbayOAuthError): boolean =>
	error.cause instanceof CredentialStoreError;

function readCredentialStoreError(cause: unknown): CredentialStoreError {
	if (cause instanceof CredentialStoreError) {
		return cause;
	}

	const message = cause instanceof Error ? cause.message : String(cause);

	return new CredentialStoreError({
		envPath: "",
		message,
		cause,
	});
}

async function persistCredentialUpdates(
	operation: OAuthOperation,
	message: string,
	writeUpdates: Promise<void>,
): Promise<void> {
	try {
		await writeUpdates;
	} catch (cause) {
		throw mapCredentialStoreError(
			operation,
			message,
			readCredentialStoreError(cause),
		);
	}
}

export class EbayOAuthClient {
	private appAccessToken: string | null = null;
	private appAccessTokenExpiry = 0;
	private userTokens: StoredTokenData | null = null;

	constructor(
		private config: EbayConfig,
		private credentialStore: CredentialStore = new DotEnvCredentialStore(),
	) {}

	private requestOAuthToken = async <TokenBody>(
		operation: OAuthOperation,
		failureMessage: string,
		options: HttpRequestOptions,
	): Promise<TokenBody> => {
		try {
			const tokenResponse = await httpRequestEffect<TokenBody>(options);
			return tokenResponse.data;
		} catch (cause) {
			throw new EbayOAuthError({
				operation,
				message: `${failureMessage}: ${describeHttpError(cause)}`,
				cause,
			});
		}
	};

	private createTokenRequest = (
		formFields: Record<string, string>,
	): HttpRequestOptions => {
		const tokenUrl = `${getBaseUrl(this.config.environment, this.config.apiBaseUrl)}/identity/v1/oauth2/token`;
		const encodedCredentials = Buffer.from(
			`${this.config.clientId}:${this.config.clientSecret}`,
		).toString("base64");

		return {
			method: "POST",
			url: tokenUrl,
			body: new URLSearchParams(formFields),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${encodedCredentials}`,
			},
		};
	};

	initialize = async (): Promise<void> => {
		const configRefreshToken = this.config.refreshToken;
		const hasNoRefreshToken = !configRefreshToken;

		if (hasNoRefreshToken) {
			return;
		}

		const configAccessToken = this.config.accessToken ?? "";
		const configAppToken = this.config.appAccessToken ?? "";
		const locale = this.config?.locale || LocaleEnum.en_US;

		authLogger.info("Loading tokens from runtime config");
		this.userTokens = createStoredUserTokens({
			config: { ...this.config, locale },
			envAppToken: configAppToken,
			accessToken: configAccessToken,
			refreshToken: configRefreshToken,
		});
		authLogger.info("Refreshing access token using refresh token from .env");

		try {
			await this.refreshUserToken();
			authLogger.info("Access token refreshed successfully");
			await this.getOrRefreshAppAccessToken();
		} catch (error) {
			const isOAuthFailure = error instanceof EbayOAuthError;

			if (!isOAuthFailure) {
				throw error;
			}

			const isPersistenceFailure = isCredentialPersistenceError(error);

			if (isPersistenceFailure) {
				authLogger.error("Access token refreshed but could not be persisted", {
					error: getErrorMessage(error, String(error)),
					hint: "The refreshed token remains available for this process, but the credential file must be writable to survive a restart",
				});
				return;
			}

			authLogger.error("Failed to refresh access token", {
				error: getErrorMessage(error, String(error)),
				hint: "The configured EBAY_USER_REFRESH_TOKEN may be invalid or expired",
			});
			this.userTokens = null;
		}
	};

	hasUserTokens(): boolean {
		return this.userTokens !== null;
	}

	private isUserAccessTokenExpired(tokens: StoredTokenData): boolean {
		return isTokenExpired(tokens.userAccessTokenExpiry);
	}

	private isUserRefreshTokenExpired(tokens: StoredTokenData): boolean {
		return isTokenExpired(tokens.userRefreshTokenExpiry);
	}

	getAccessToken = async (): Promise<string> => {
		const loadedUserTokens = this.userTokens;

		if (loadedUserTokens !== null) {
			return await this.readUserAccessToken(loadedUserTokens);
		}

		return await this.readAppAccessToken();
	};

	private readUserAccessToken = async (
		loadedUserTokens: StoredTokenData,
	): Promise<string> => {
		const accessTokenIsCurrent =
			!this.isUserAccessTokenExpired(loadedUserTokens);

		if (accessTokenIsCurrent) {
			return loadedUserTokens.userAccessToken;
		}

		const refreshTokenIsExpired =
			this.isUserRefreshTokenExpired(loadedUserTokens);

		if (refreshTokenIsExpired) {
			authLogger.error(
				"User refresh token expired. User needs to re-authorize.",
			);
			this.userTokens = null;
			throw new EbayOAuthError({
				operation: "getAccessToken",
				message:
					"User authorization expired. Please update EBAY_USER_REFRESH_TOKEN in .env with a new refresh token.",
			});
		}

		try {
			await this.refreshUserToken();
		} catch (error) {
			const isOAuthFailure = error instanceof EbayOAuthError;

			if (!isOAuthFailure) {
				throw error;
			}

			const keptAccessToken = this.readUnpersistedAccessToken(error);

			if (keptAccessToken !== null) {
				authLogger.error("User token refreshed but could not be persisted", {
					error: getErrorMessage(error, String(error)),
					hint: "Using the valid refreshed token for this process only",
				});
				return keptAccessToken;
			}

			authLogger.error(
				"Failed to refresh user token, falling back to app access token",
				{
					error: getErrorMessage(error, String(error)),
				},
			);
			this.userTokens = null;
			return await this.readAppAccessToken();
		}

		const refreshedTokens = this.userTokens;

		if (refreshedTokens !== null) {
			return refreshedTokens.userAccessToken;
		}

		return await this.readAppAccessToken();
	};

	private readUnpersistedAccessToken = (
		error: EbayOAuthError,
	): string | null => {
		const isPersistenceFailure = isCredentialPersistenceError(error);

		if (!isPersistenceFailure) {
			return null;
		}

		const keptTokens = this.userTokens;

		if (keptTokens === null) {
			return null;
		}

		const accessTokenIsUsable = !this.isUserAccessTokenExpired(keptTokens);

		if (!accessTokenIsUsable) {
			return null;
		}

		return keptTokens.userAccessToken;
	};

	private readAppAccessToken = async (): Promise<string> => {
		const cachedAppToken = this.appAccessToken;

		if (cachedAppToken === null) {
			return await this.getOrRefreshAppAccessToken();
		}

		const appTokenIsExpired = isTokenExpired(this.appAccessTokenExpiry);

		if (appTokenIsExpired) {
			return await this.getOrRefreshAppAccessToken();
		}

		return cachedAppToken;
	};

	setUserTokens = async (
		accessToken: string,
		refreshToken: string,
		accessTokenExpiry?: number,
		refreshTokenExpiry?: number,
	): Promise<void> => {
		this.userTokens = createStoredUserTokens({
			config: this.config,
			accessToken,
			refreshToken,
			accessTokenExpiry,
			refreshTokenExpiry,
		});

		await persistCredentialUpdates(
			"setUserTokens",
			"Failed to persist user tokens",
			this.credentialStore.write({
				EBAY_USER_ACCESS_TOKEN: accessToken,
				EBAY_USER_REFRESH_TOKEN: refreshToken,
			}),
		);
	};

	getOrRefreshAppAccessToken = async (): Promise<string> => {
		const cachedAppToken = this.appAccessToken;
		const appTokenIsCurrent =
			cachedAppToken !== null && !isTokenExpired(this.appAccessTokenExpiry);

		if (cachedAppToken !== null && appTokenIsCurrent) {
			return cachedAppToken;
		}

		const tokenRequest = this.createTokenRequest({
			grant_type: "client_credentials",
			scope: "https://api.ebay.com/oauth/api_scope",
		});
		const tokenData = await this.requestOAuthToken<EbayAppAccessTokenResponse>(
			"getOrRefreshAppAccessToken",
			"Failed to get app access token",
			tokenRequest,
		);

		const mintedAppToken = tokenData.access_token;
		this.appAccessToken = mintedAppToken;
		this.appAccessTokenExpiry = createAppAccessTokenExpiry(
			tokenData.expires_in,
		);

		await persistCredentialUpdates(
			"getOrRefreshAppAccessToken",
			"Failed to persist app access token",
			this.credentialStore.write({
				EBAY_APP_ACCESS_TOKEN: mintedAppToken,
			}),
		);
		this.config = {
			...this.config,
			appAccessToken: mintedAppToken,
		};

		return mintedAppToken;
	};

	exchangeCodeForToken = async (code: string): Promise<EbayUserToken> => {
		const redirectUri = this.config.redirectUri;

		if (redirectUri == null) {
			throw new EbayOAuthError({
				operation: "exchangeCodeForToken",
				message: "Redirect URI is required for authorization code exchange",
			});
		}

		if (redirectUri === "") {
			throw new EbayOAuthError({
				operation: "exchangeCodeForToken",
				message: "Redirect URI is required for authorization code exchange",
			});
		}

		const tokenRequest = this.createTokenRequest({
			grant_type: "authorization_code",
			code,
			redirect_uri: redirectUri,
		});
		const tokenData = await this.requestOAuthToken<EbayUserToken>(
			"exchangeCodeForToken",
			"Failed to exchange code for token",
			tokenRequest,
		);
		const refreshToken = tokenData.refresh_token;
		const refreshTokenIsMissing = typeof refreshToken !== "string";

		if (refreshTokenIsMissing) {
			throw new EbayOAuthError({
				operation: "exchangeCodeForToken",
				message:
					"eBay token response did not include a non-empty refresh_token; cannot complete authorization code exchange",
			});
		}

		const refreshTokenIsEmpty = refreshToken.length === 0;

		if (refreshTokenIsEmpty) {
			throw new EbayOAuthError({
				operation: "exchangeCodeForToken",
				message:
					"eBay token response did not include a non-empty refresh_token; cannot complete authorization code exchange",
			});
		}

		this.userTokens = createStoredUserTokensFromResponse({
			config: this.config,
			tokenData,
		});

		await persistCredentialUpdates(
			"exchangeCodeForToken",
			"Failed to persist exchanged user tokens",
			this.credentialStore.write({
				EBAY_USER_ACCESS_TOKEN: tokenData.access_token,
				EBAY_USER_REFRESH_TOKEN: refreshToken,
			}),
		);
		this.config = {
			...this.config,
			accessToken: tokenData.access_token,
			refreshToken,
		};

		return tokenData;
	};

	refreshUserToken = async (): Promise<void> => {
		const loadedUserTokens = this.userTokens;

		if (loadedUserTokens === null) {
			throw new EbayOAuthError({
				operation: "refreshUserToken",
				message: "No user tokens available to refresh",
			});
		}

		const tokenRequest = this.createTokenRequest({
			grant_type: "refresh_token",
			refresh_token: loadedUserTokens.userRefreshToken,
		});
		const tokenData = await this.requestOAuthToken<EbayUserTokenResponse>(
			"refreshUserToken",
			"Failed to refresh token",
			tokenRequest,
		);

		const refreshedTokens = createStoredUserTokensFromResponse({
			config: this.config,
			previousTokens: loadedUserTokens,
			tokenData,
		});
		this.userTokens = refreshedTokens;
		const envUpdates: Record<string, string> = {
			EBAY_USER_ACCESS_TOKEN: tokenData.access_token,
		};
		const refreshTokenChanged =
			refreshedTokens.userRefreshToken !== this.config.refreshToken;

		if (refreshTokenChanged) {
			envUpdates["EBAY_USER_REFRESH_TOKEN"] = refreshedTokens.userRefreshToken;
		}

		await persistCredentialUpdates(
			"refreshUserToken",
			"Failed to persist refreshed user token",
			this.credentialStore.write(envUpdates),
		);
		this.config = {
			...this.config,
			accessToken: tokenData.access_token,
			refreshToken: refreshedTokens.userRefreshToken,
		};
	};

	isAuthenticated(): boolean {
		if (this.userTokens && !this.isUserAccessTokenExpired(this.userTokens)) {
			return true;
		}
		return (
			this.appAccessToken !== null && !isTokenExpired(this.appAccessTokenExpiry)
		);
	}

	clearAllTokens(): void {
		this.appAccessToken = null;
		this.appAccessTokenExpiry = 0;
		this.userTokens = null;
	}

	getTokenInfo(): OAuthTokenInfo {
		const tokenInfo: OAuthTokenInfo = {
			hasUserToken:
				this.userTokens !== null &&
				!this.isUserAccessTokenExpired(this.userTokens),
			hasAppAccessToken:
				this.appAccessToken !== null && Date.now() < this.appAccessTokenExpiry,
		};

		if (this.userTokens?.scope) {
			const tokenScopes = this.userTokens.scope.split(" ");
			const environmentScopes = getDefaultScopes(this.config.environment);
			const tokenScopeSet = new Set(tokenScopes);
			const missingScopes = environmentScopes.filter(
				(scope) => !tokenScopeSet.has(scope),
			);

			return {
				...tokenInfo,
				scopeInfo: {
					tokenScopes,
					environmentScopes,
					missingScopes,
				},
			};
		}

		return tokenInfo;
	}

	getUserTokens(): StoredTokenData | null {
		return this.userTokens;
	}

	getCachedAppAccessToken(): string | null {
		return this.appAccessToken;
	}

	getCachedAppAccessTokenExpiry(): number {
		return this.appAccessTokenExpiry;
	}
}
