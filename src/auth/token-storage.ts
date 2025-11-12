import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { StoredTokenData } from '../types/ebay.js';

/**
 * Get the project root directory
 */
const getProjectRoot = (): string => {
  // Get current file's directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Go up two levels from src/auth/ to project root
  return join(__dirname, '..', '..');
};

/**
 * Token storage file path (in project root directory)
 */
const TOKEN_FILE_PATH = join(getProjectRoot(), '.ebay-mcp-tokens.json');

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

      // Validate token structure - at minimum we need a refresh token
      // Access token can be empty if it needs to be refreshed
      if (!tokens.userRefreshToken) {
        return null;
      }

      return tokens;
    } catch (error) {
      console.error(error)
      return null;
    }
  }

  /**
   * Save tokens to file
   */
  static async saveTokens(tokens: StoredTokenData): Promise<void> {
    try {
      await fs.writeFile(TOKEN_FILE_PATH, JSON.stringify(tokens, null, 2), 'utf-8');
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
   * Check if user access token is expired
   */
  static isUserAccessTokenExpired(tokens: StoredTokenData): boolean {
    return Date.now() >= tokens.userAccessTokenExpiry;
  }

  /**
   * Check if user refresh token is expired
   */
  static isUserRefreshTokenExpired(tokens: StoredTokenData): boolean {
    return Date.now() >= tokens.userRefreshTokenExpiry;
  }

  /**
   * Get token file path for debugging
   */
  static getTokenFilePath(): string {
    return TOKEN_FILE_PATH;
  }
}
