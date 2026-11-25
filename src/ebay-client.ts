import { Buffer } from 'node:buffer';
import type { EbayCredentials } from './environment.js';

interface CachedToken {
  accessToken: string;
  expiresAtMilliseconds: number;
}

type TokenKind = 'application' | 'user';

export class EbayClient {
  private applicationToken: CachedToken | null = null;
  private userToken: CachedToken | null = null;
  private readonly credentials: EbayCredentials;
  private readonly currentTimeMilliseconds: () => number;

  constructor(credentials: EbayCredentials, currentTimeMilliseconds: () => number = Date.now) {
    this.credentials = credentials;
    this.currentTimeMilliseconds = currentTimeMilliseconds;
  }

  readonly isSandbox = (): boolean => {
    const isSandboxSite = this.credentials.site == 'sandbox';
    return isSandboxSite;
  };

  readonly getJson = async (path: string, tokenKind: TokenKind): Promise<unknown> => {
    const token = await this.readToken(tokenKind);
    const url = this.endpoint(path);
    const headers = this.callHeaders(token);
    var ebayReply: Response;

    try {
      ebayReply = await fetch(url, { method: 'GET', headers });
    } catch (error) {
      throw new Error(`eBay request failed for ${path}`, { cause: error });
    }

    const isOk = ebayReply.ok;

    if (isOk == false) {
      const failureText = await this.readReplyText(ebayReply);
      throw new Error(`eBay returned ${ebayReply.status} for ${path}: ${failureText}`);
    }

    try {
      const document: unknown = await ebayReply.json();
      return document;
    } catch (error) {
      throw new Error(`eBay returned unreadable JSON for ${path}`, { cause: error });
    }
  };

  private readonly endpoint = (path: string): string => {
    const isSandboxSite = this.isSandbox();

    if (isSandboxSite) {
      return `https://api.sandbox.ebay.com${path}`;
    }

    return `https://api.ebay.com${path}`;
  };

  private readonly readToken = async (tokenKind: TokenKind): Promise<string> => {
    const cachedAccessToken = this.freshAccessToken(tokenKind);

    if (this.isAccessToken(cachedAccessToken)) {
      return cachedAccessToken;
    }

    const fetchedToken = await this.requestToken(tokenKind);
    this.saveToken(tokenKind, fetchedToken);
    return fetchedToken.accessToken;
  };

  private readonly cachedTokenFor = (tokenKind: TokenKind): CachedToken | null => {
    const isApplication = tokenKind == 'application';

    if (isApplication) {
      return this.applicationToken;
    }

    return this.userToken;
  };

  private readonly saveToken = (tokenKind: TokenKind, cachedToken: CachedToken): void => {
    const isApplication = tokenKind == 'application';

    if (isApplication) {
      this.applicationToken = cachedToken;
      return;
    }

    this.userToken = cachedToken;
  };

  private readonly isAccessToken = (token: string | null): token is string => {
    const isMissing = token == null;
    return isMissing == false;
  };

  private readonly freshAccessToken = (tokenKind: TokenKind): string | null => {
    const cachedToken = this.cachedTokenFor(tokenKind);

    const isMissing = cachedToken == null;
    if (isMissing) {
      return null;
    }

    const now = this.currentTimeMilliseconds();

    const isExpired = now >= cachedToken.expiresAtMilliseconds;
    if (isExpired) {
      return null;
    }

    return cachedToken.accessToken;
  };

  private readonly requestToken = async (tokenKind: TokenKind): Promise<CachedToken> => {
    const tokenUrl = this.endpoint('/identity/v1/oauth2/token');
    const form = this.tokenForm(tokenKind);
    const headers = this.tokenHeaders();
    var tokenReply: Response;

    try {
      tokenReply = await fetch(tokenUrl, {
        method: 'POST',
        headers,
        body: form,
      });
    } catch (error) {
      throw new Error('eBay token request failed', { cause: error });
    }

    const isOk = tokenReply.ok;

    if (isOk == false) {
      const failureText = await this.readReplyText(tokenReply);
      throw new Error(`eBay returned ${tokenReply.status} for the token request: ${failureText}`);
    }

    var tokenDocument: unknown;

    try {
      tokenDocument = await tokenReply.json();
    } catch (error) {
      throw new Error('eBay returned unreadable JSON for the token request', { cause: error });
    }

    return this.cachedToken(tokenDocument);
  };

  private readonly tokenForm = (tokenKind: TokenKind): string => {
    const isApplication = tokenKind == 'application';

    if (isApplication) {
      const scope = encodeURIComponent('https://api.ebay.com/oauth/api_scope');
      return `grant_type=client_credentials&scope=${scope}`;
    }

    const { refreshToken } = this.credentials;

    const isMissing = refreshToken == null;
    if (isMissing) {
      throw new Error('EBAY_USER_REFRESH_TOKEN is missing');
    }

    const encodedRefreshToken = encodeURIComponent(refreshToken);
    return `grant_type=refresh_token&refresh_token=${encodedRefreshToken}`;
  };

  private readonly tokenHeaders = (): Headers => {
    const pair = `${this.credentials.clientId}:${this.credentials.clientSecret}`;
    const pairBytes = Buffer.from(pair, 'utf8');
    const encodedPair = pairBytes.toString('base64');
    const headers = new Headers();
    headers.set('Authorization', `Basic ${encodedPair}`);
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
    return headers;
  };

  private readonly cachedToken = (document: unknown): CachedToken => {
    const accessToken = this.readAccessToken(document);
    const expiresInSeconds = this.readExpiresInSeconds(document);
    const slackSeconds = 60;
    const remainingSeconds = expiresInSeconds - slackSeconds;

    const isTooShort = remainingSeconds < 1;
    const lifetimeSeconds = isTooShort ? 1 : remainingSeconds;
    const millisecondsPerSecond = 1000;
    const lifetimeMilliseconds = lifetimeSeconds * millisecondsPerSecond;
    const now = this.currentTimeMilliseconds();

    return {
      accessToken,
      expiresAtMilliseconds: now + lifetimeMilliseconds,
    };
  };

  private readonly readAccessToken = (document: unknown): string => {
    const tokenDocument = this.tokenRecord(document);
    const { access_token: accessToken } = tokenDocument;

    const isToken = typeof accessToken == 'string';
    if (isToken == false) {
      throw new Error('eBay did not return an access token');
    }

    const isEmpty = accessToken == '';
    if (isEmpty) {
      throw new Error('eBay did not return an access token');
    }

    return accessToken;
  };

  private readonly readExpiresInSeconds = (document: unknown): number => {
    const tokenDocument = this.tokenRecord(document);
    const { expires_in: expiresIn } = tokenDocument;

    const isNumber = typeof expiresIn == 'number';
    if (isNumber == false) {
      throw new Error('eBay did not return expires_in');
    }

    const isPositive = expiresIn > 0;
    if (isPositive == false) {
      throw new Error('eBay did not return expires_in');
    }

    return expiresIn;
  };

  private readonly tokenRecord = (document: unknown): Record<string, unknown> => {
    const isMissing = document == null;
    if (isMissing) {
      throw new Error('eBay did not return an access token');
    }

    const isArray = Array.isArray(document);
    if (isArray) {
      throw new Error('eBay did not return an access token');
    }

    const isObject = typeof document == 'object';
    if (isObject == false) {
      throw new Error('eBay did not return an access token');
    }

    return document as Record<string, unknown>;
  };

  private readonly callHeaders = (token: string): Headers => {
    const headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Language', this.credentials.contentLanguage);
    headers.set('X-EBAY-C-MARKETPLACE-ID', this.credentials.marketplaceId);
    return headers;
  };

  private readonly readReplyText = async (ebayReply: Response): Promise<string> => {
    try {
      return await ebayReply.text();
    } catch (error) {
      throw new Error(`eBay returned ${ebayReply.status} and no error text`, { cause: error });
    }
  };
}
