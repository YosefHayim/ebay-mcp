import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { StoredTokenData } from '../types/ebay.js';

/**
 * Token storage file path (in user's home directory)
 * Falls back to /tmp if home directory is not writable
 */
const getTokenFilePath = (): string => {
  try {
    return join(homedir(), '.ebay-mcp-tokens.json');
  } catch {
    return join('/tmp', '.ebay-mcp-tokens.json');
  }
};

const TOKEN_FILE_PATH = getTokenFilePath();

/**
 * Manages persistent storage of OAuth tokens
 */
export class TokenStorage {
  /**
   * Check if token file exists
   */
  static async hasTokens(): Promise<boolean> {
    try {
      await fs.access(TOKEN_FILE_PATH);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load tokens from file
   */
  static async loadTokens(): Promise<StoredTokenData | null> {
    try {
      const data = await fs.readFile(TOKEN_FILE_PATH, 'utf-8');
      const tokens = JSON.parse(data) as StoredTokenData;

      // Validate token structure
      if (!tokens.accessToken || !tokens.refreshToken) {
        return null;
      }

      return tokens;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save tokens to file
   */
  static async saveTokens(tokens: StoredTokenData): Promise<void> {
    try {
      await fs.writeFile(
        TOKEN_FILE_PATH,
        JSON.stringify(tokens, null, 2),
        'utf-8'
      );
    } catch (error) {
      throw new Error(
        `Failed to save tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete token file
   */
  static async clearTokens(): Promise<void> {
    try {
      await fs.unlink(TOKEN_FILE_PATH);
    } catch (error) {
      // Ignore error if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Check if access token is expired
   */
  static isAccessTokenExpired(tokens: StoredTokenData): boolean {
    return Date.now() >= tokens.accessTokenExpiry;
  }

  /**
   * Check if refresh token is expired
   */
  static isRefreshTokenExpired(tokens: StoredTokenData): boolean {
    return Date.now() >= tokens.refreshTokenExpiry;
  }

  /**
   * Get token file path for debugging
   */
  static getTokenFilePath(): string {
    return TOKEN_FILE_PATH;
  }
}
