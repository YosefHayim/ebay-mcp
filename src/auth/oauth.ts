import axios from "axios";
import { getAuthUrl } from "../config/environment.js";
import type {
  EbayAuthToken,
  EbayConfig,
  EbayUserToken,
  StoredTokenData,
} from "../types/ebay.js";
import { TokenStorage } from "./token-storage.js";

/**
 * Manages eBay OAuth 2.0 authentication
 * Supports both client credentials (app tokens) and user access tokens with refresh
 */
export class EbayOAuthClient {
  private token: EbayAuthToken | null = null;
  private tokenExpiry: number = 0;
  private userTokens: StoredTokenData | null = null;

  constructor(private config: EbayConfig) { }

  /**
   * Initialize user tokens from storage if available
   */
  async initialize(): Promise<void> {
    if (await TokenStorage.hasTokens()) {
      this.userTokens = await TokenStorage.loadTokens();
    }
  }

  /**
   * Check if user tokens are available
   */
  hasUserTokens(): boolean {
    return this.userTokens !== null;
  }

  /**
   * Get a valid access token, with priority order:
   * 1. User access token (if available and valid, or refreshable)
   * 2. Client credentials token (fallback)
   */
  async getAccessToken(): Promise<string> {
    // Try to use user token first
    if (this.userTokens) {
      // Check if access token is still valid
      if (!TokenStorage.isAccessTokenExpired(this.userTokens)) {
        return this.userTokens.accessToken;
      }

      // Try to refresh if refresh token is valid
      if (!TokenStorage.isRefreshTokenExpired(this.userTokens)) {
        try {
          await this.refreshUserToken();
          return this.userTokens!.accessToken;
        } catch (error) {
          console.error(
            "Failed to refresh user token, falling back to client credentials:",
            error,
          );
          // Clear invalid tokens
          this.userTokens = null;
          await TokenStorage.clearTokens();
        }
      } else {
        // Refresh token expired
        console.error("Refresh token expired. User needs to re-authorize.");
        this.userTokens = null;
        await TokenStorage.clearTokens();
        throw new Error(
          "User authorization expired. Please provide new access and refresh tokens.",
        );
      }
    }

    // Fallback to client credentials
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token.access_token;
    }

    await this.authenticateClientCredentials();
    return this.token!.access_token;
  }

  /**
   * Set user access token and refresh token
   * This is called when user provides their tokens
   */
  async setUserTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    // Store tokens with default expiry (adjust based on actual token response)
    // Access tokens typically expire in 2 hours (7200 seconds)
    // Refresh tokens typically expire in 18 months
    const now = Date.now();
    const storedTokens: StoredTokenData = {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      accessTokenExpiry: now + 7200 * 1000, // 2 hours
      refreshTokenExpiry: now + 18 * 30 * 24 * 60 * 60 * 1000, // ~18 months
    };

    this.userTokens = storedTokens;
    await TokenStorage.saveTokens(storedTokens);
  }

  /**
   * Exchange authorization code for user access token
   */
  async exchangeCodeForToken(code: string): Promise<EbayUserToken> {
    if (!this.config.redirectUri) {
      throw new Error(
        "Redirect URI is required for authorization code exchange",
      );
    }

    const authUrl = getAuthUrl(this.config.environment);
    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");

    try {
      const response = await axios.post(
        authUrl,
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: this.config.redirectUri,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credentials}`,
          },
        },
      );

      const tokenData: EbayUserToken = response.data;

      // Store the user tokens
      const now = Date.now();
      const storedTokens: StoredTokenData = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type,
        accessTokenExpiry: now + tokenData.expires_in * 1000,
        refreshTokenExpiry: now + tokenData.refresh_token_expires_in * 1000,
        scope: tokenData.scope,
      };

      this.userTokens = storedTokens;
      await TokenStorage.saveTokens(storedTokens);

      return tokenData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to exchange code for token: ${error.response?.data?.error_description || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * Refresh user access token using refresh token
   */
  private async refreshUserToken(): Promise<void> {
    if (!this.userTokens) {
      throw new Error("No user tokens available to refresh");
    }

    const authUrl = getAuthUrl(this.config.environment);
    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");

    try {
      const response = await axios.post(
        authUrl,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.userTokens.refreshToken,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credentials}`,
          },
        },
      );

      const tokenData: EbayUserToken = response.data;

      // Update stored tokens
      const now = Date.now();
      const updatedTokens: StoredTokenData = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || this.userTokens.refreshToken, // Use new refresh token if provided
        tokenType: tokenData.token_type,
        accessTokenExpiry: now + tokenData.expires_in * 1000,
        refreshTokenExpiry: tokenData.refresh_token_expires_in
          ? now + tokenData.refresh_token_expires_in * 1000
          : this.userTokens.refreshTokenExpiry, // Keep existing expiry if not provided
        scope: tokenData.scope,
      };

      this.userTokens = updatedTokens;
      await TokenStorage.saveTokens(updatedTokens);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to refresh token: ${error.response?.data?.error_description || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * Authenticate using client credentials flow (application token)
   * Used as fallback when no user token is available
   * Rate limit: 1,000 requests/day
   */
  private async authenticateClientCredentials(): Promise<void> {
    const authUrl = getAuthUrl(this.config.environment);
    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");

    try {
      const response = await axios.post(
        authUrl,
        "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credentials}`,
          },
        },
      );

      this.token = response.data;
      // Set expiry with 60 second buffer
      this.tokenExpiry = Date.now() + (this.token!.expires_in - 60) * 1000;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `eBay authentication failed: ${error.response?.data?.error_description || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * Check if currently authenticated (either user or client credentials)
   */
  isAuthenticated(): boolean {
    if (
      this.userTokens &&
      !TokenStorage.isAccessTokenExpired(this.userTokens)
    ) {
      return true;
    }
    return this.token !== null && Date.now() < this.tokenExpiry;
  }

  /**
   * Clear all authentication tokens
   */
  async clearAllTokens(): Promise<void> {
    this.token = null;
    this.tokenExpiry = 0;
    this.userTokens = null;
    await TokenStorage.clearTokens();
  }

  /**
   * Get current token info for debugging
   */
  getTokenInfo(): { hasUserToken: boolean; hasClientToken: boolean } {
    return {
      hasUserToken:
        this.userTokens !== null &&
        !TokenStorage.isAccessTokenExpired(this.userTokens),
      hasClientToken: this.token !== null && Date.now() < this.tokenExpiry,
    };
  }
}
