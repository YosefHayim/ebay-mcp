import axios from 'axios';
import { getAuthUrl, getBaseUrl, getDefaultScopes } from '@/config/environment.js';
import type {
  EbayAppAccessTokenResponse,
  EbayConfig,
  EbayUserToken,
  StoredTokenData,
} from '@/types/ebay.js';
import { LocaleEnum } from '@/types/ebay-enums.js';

/**
 * Manages eBay OAuth 2.0 authentication
 * Loads tokens exclusively from environment variables (.env file)
 * Supports both client credentials (app tokens) and user access tokens with refresh
 */
export class EbayOAuthClient {
  private appAccessToken: string | null = null;
  private appAccessTokenExpiry = 0;
  private userTokens: StoredTokenData | null = null;

  constructor(private config: EbayConfig) { }

  /**
   * Initialize user tokens from environment variables only
   * If EBAY_USER_REFRESH_TOKEN exists, automatically refresh to get a valid access token
   */
  async initialize(): Promise<void> {
    const envRefreshToken = process.env.EBAY_USER_REFRESH_TOKEN;
    const envAccessToken = process.env.EBAY_USER_ACCESS_TOKEN;
    const envAppToken = process.env.EBAY_APP_ACCESS_TOKEN ?? '';
    const locale = this.config?.locale || LocaleEnum.en_US;


    if (envRefreshToken && envAccessToken) {
      console.log('📝 Loading refresh token, access token and app to env file...');

      // Create token object with just the refresh token from environment
      // Note: We don't set scopes here - eBay will return the scopes when we refresh
      const now = Date.now();
      this.userTokens = {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        userAccessToken: envAccessToken, // Empty, will be filled by refresh
        userRefreshToken: envRefreshToken,
        redirectUri: this.config.redirectUri,
        envAppToken,
        tokenType: 'Bearer',
        locale,
        userAccessTokenExpiry: now + 7200 * 1000, // Default 2 hours
        userRefreshTokenExpiry: now + 18 * 30 * 24 * 60 * 60 * 1000, // Default 18 months
        // scope is not set - will be populated by the refresh response
      };

      // Immediately refresh to get a valid access token and scopes
      console.log('🔄 Refreshing access token using refresh token from .env...');
      try {
        await this.refreshUserToken();
        console.log('✅ Access token refreshed successfully from .env configuration.');

        await this.getOrRefreshAppAccessToken()
      } catch (error) {
        console.error(
          '❌ Failed to refresh access token:',
          error instanceof Error ? error.message : error
        );
        console.error('   The EBAY_USER_REFRESH_TOKEN in .env may be invalid or expired.');
        console.error(
          '   Please update EBAY_USER_REFRESH_TOKEN or use ebay_set_user_tokens_with_expiry tool.'
        );
        // Clear invalid tokens
        this.userTokens = null;
      }
    }
  }

  /**
   * Check if user tokens are available
   */
  hasUserTokens(): boolean {
    return this.userTokens !== null;
  }

  /**
   * Check if user access token is expired
   */
  private isUserAccessTokenExpired(tokens: StoredTokenData): boolean {
    return tokens.userAccessTokenExpiry ? Date.now() >= tokens.userAccessTokenExpiry : true;
  }

  /**
   * Check if user refresh token is expired
   */
  private isUserRefreshTokenExpired(tokens: StoredTokenData): boolean {
    return tokens.userRefreshTokenExpiry ? Date.now() >= tokens.userRefreshTokenExpiry : true;
  }

  /**
   * Get a valid access token, with priority order:
   * 1. User access token (if available and valid, or refreshable)
   * 2. App access token from client credentials (fallback)
   */
  async getAccessToken(): Promise<string> {
    // Try to use user token first
    if (this.userTokens) {
      // Check if access token is still valid
      if (!this.isUserAccessTokenExpired(this.userTokens)) {
        return this.userTokens.userAccessToken;
      }

      // Try to refresh if refresh token is valid
      if (!this.isUserRefreshTokenExpired(this.userTokens)) {
        try {
          await this.refreshUserToken();
          return this.userTokens.userAccessToken;
        } catch (error) {
          console.error('Failed to refresh user token, falling back to app access token:', error);
          // Clear invalid tokens
          this.userTokens = null;
        }
      } else {
        // Refresh token expired
        console.error('User refresh token expired. User needs to re-authorize.');
        this.userTokens = null;
        throw new Error(
          'User authorization expired. Please update EBAY_USER_REFRESH_TOKEN in .env with a new refresh token.'
        );
      }
    }

    // Fallback to app access token (client credentials)
    if (this.appAccessToken && Date.now() < this.appAccessTokenExpiry) {
      return this.appAccessToken;
    }

    await this.getOrRefreshAppAccessToken();
    return this.appAccessToken!;
  }

  /**
   * Set user access token and refresh token in memory
   * Note: Tokens are loaded from .env and stored in memory only
   * To persist tokens, update the .env file with EBAY_USER_REFRESH_TOKEN
   */
  setUserTokens(
    accessToken: string,
    refreshToken: string,
  ): void {
    // Store tokens in memory with default expiry
    // Access tokens typically expire in 2 hours (7200 seconds)
    // Refresh tokens typically expire in 18 months
    const now = Date.now();
    this.userTokens = {
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri,
      userAccessToken: accessToken,
      userRefreshToken: refreshToken,
      tokenType: 'Bearer',
      userAccessTokenExpiry: now + 7200 * 1000, // Default 2 hours
      userRefreshTokenExpiry: now + 18 * 30 * 24 * 60 * 60 * 1000, // Default 18 months
    };
  }

  /**
   * Get or refresh the app access token using the client credentials flow.
   * This method ensures that a valid app access token is always available.
   * Rate limit: 1,000 requests/day
   */
  async getOrRefreshAppAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.appAccessToken) {
      return this.appAccessToken;
    }

    const authUrl = `${getBaseUrl(this.config.environment)}/identity/v1/oauth2/token`;
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString(
      'base64'
    );

    // Client credentials flow only supports basic scope
    // User authorization flows can request additional scopes
    const scopeParam = 'https://api.ebay.com/oauth/api_scope';

    try {
      const response = await axios.post<EbayAppAccessTokenResponse>(
        authUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          scope: scopeParam,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      this.appAccessToken = response.data.access_token;
      // Set expiry with 60 second buffer
      this.appAccessTokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

      return this.appAccessToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get app access token: ${error.response?.data?.error_description || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Exchange authorization code for user access token
   * Note: After receiving tokens, manually add EBAY_USER_REFRESH_TOKEN to .env file
   */
  async exchangeCodeForToken(code: string): Promise<EbayUserToken> {
    if (!this.config.redirectUri) {
      throw new Error('Redirect URI is required for authorization code exchange');
    }

    const authUrl = getAuthUrl(this.config.clientId, this.config.redirectUri, this.config.environment, this.config.locale, 'login', 'code');
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString(
      'base64'
    );

    try {
      const response = await axios.post(
        authUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      const tokenData: EbayUserToken = response.data;

      // Store the user tokens in memory
      const now = Date.now();
      this.userTokens = {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        redirectUri: this.config.redirectUri,
        userAccessToken: tokenData.access_token,
        userRefreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type,
        userAccessTokenExpiry: now + tokenData.expires_in * 1000,
        userRefreshTokenExpiry: now + tokenData.refresh_token_expires_in * 1000,
        scope: tokenData.scope,
      };

      // Inform user to save refresh token to .env
      console.log('\nToken exchange successful!');
      console.log('To persist your authentication, add this to your .env file:');
      console.log(`EBAY_USER_REFRESH_TOKEN="${tokenData.refresh_token}"\n`);

      return tokenData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to exchange code for token: ${error.response?.data?.error_description || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Refresh user access token using refresh token from .env
   * This method is public and can be called by LLMs when encountering authentication errors
   */
  async refreshUserToken(): Promise<void> {
    if (!this.userTokens) {
      throw new Error('No user tokens available to refresh');
    }

    const authUrl = getAuthUrl(this.config.clientId, this.config.redirectUri, this.config.environment, this.config.locale, 'login', 'code');
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString(
      'base64'
    );

    try {
      // Prepare refresh token request parameters
      // Note: We do NOT include scopes in refresh requests as eBay will return
      // the scopes that were originally granted to the refresh token
      const params: Record<string, string> = {
        grant_type: 'refresh_token',
        refresh_token: this.userTokens.userRefreshToken,
      };

      const response = await axios.post(authUrl, new URLSearchParams(params).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      });

      const tokenData: EbayUserToken = response.data;

      // Update tokens in memory
      const now = Date.now();
      this.userTokens = {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        redirectUri: this.config.redirectUri,
        userAccessToken: tokenData.access_token,
        userRefreshToken: tokenData.refresh_token || this.userTokens.userRefreshToken, // Use new refresh token if provided
        tokenType: tokenData.token_type,
        userAccessTokenExpiry: now + tokenData.expires_in * 1000,
        userRefreshTokenExpiry: tokenData.refresh_token_expires_in
          ? now + tokenData.refresh_token_expires_in * 1000
          : this.userTokens.userRefreshTokenExpiry, // Keep existing expiry if not provided
        // eBay may not return scope in refresh response - preserve existing scope if not returned
        scope: tokenData.scope || this.userTokens.scope,
      };

      // If eBay provided a new refresh token, inform user to update .env
      if (
        tokenData.refresh_token &&
        tokenData.refresh_token !== process.env.EBAY_USER_REFRESH_TOKEN
      ) {
        console.error('\neBay issued a new refresh token!');
        console.error('Please update your .env file with:');
        console.error(`EBAY_USER_REFRESH_TOKEN="${tokenData.refresh_token}"\n`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to refresh token: ${error.response?.data?.error_description || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Check if currently authenticated (either user or app credentials)
   */
  isAuthenticated(): boolean {
    if (this.userTokens && !this.isUserAccessTokenExpired(this.userTokens)) {
      return true;
    }
    return this.appAccessToken !== null && Date.now() < this.appAccessTokenExpiry;
  }

  /**
   * Clear all authentication tokens from memory
   * Note: To persist this change, remove EBAY_USER_REFRESH_TOKEN from .env
   */
  clearAllTokens(): void {
    this.appAccessToken = null;
    this.appAccessTokenExpiry = 0;
    this.userTokens = null;
  }

  /**
   * Get current token info for debugging
   */
  getTokenInfo(): {
    hasUserToken: boolean;
    hasAppAccessToken: boolean;
    scopeInfo?: { tokenScopes: string[]; environmentScopes: string[]; missingScopes: string[] };
  } {
    const info: {
      hasUserToken: boolean;
      hasAppAccessToken: boolean;
      scopeInfo?: { tokenScopes: string[]; environmentScopes: string[]; missingScopes: string[] };
    } = {
      hasUserToken: this.userTokens !== null && !this.isUserAccessTokenExpired(this.userTokens),
      hasAppAccessToken: this.appAccessToken !== null && Date.now() < this.appAccessTokenExpiry,
    };

    // Add scope comparison info if user tokens are available
    if (this.userTokens?.scope) {
      const tokenScopes = this.userTokens.scope.split(' ');
      const environmentScopes = getDefaultScopes(this.config.environment);
      const tokenScopeSet = new Set(tokenScopes);
      const missingScopes = environmentScopes.filter((scope) => !tokenScopeSet.has(scope));

      info.scopeInfo = {
        tokenScopes,
        environmentScopes,
        missingScopes,
      };
    }

    return info;
  }

  /**
   * Get internal user tokens (for debugging/status tools)
   * @internal
   */
  getUserTokens(): StoredTokenData | null {
    return this.userTokens;
  }

  /**
   * Get internal app access token cached value (for debugging/status tools)
   * @internal
   */
  getCachedAppAccessToken(): string | null {
    return this.appAccessToken;
  }

  /**
   * Get internal app access token expiry (for debugging/status tools)
   * @internal
   */
  getCachedAppAccessTokenExpiry(): number {
    return this.appAccessTokenExpiry;
  }
}
