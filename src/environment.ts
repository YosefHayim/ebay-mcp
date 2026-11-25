import process from 'node:process';

type EbaySite = 'sandbox' | 'production';

interface EbayCredentials {
  clientId: string;
  clientSecret: string;
  site: EbaySite;
  refreshToken: string | null;
  marketplaceId: string;
  contentLanguage: string;
}

function readClientId(): string {
  const clientId = process.env.EBAY_CLIENT_ID ?? '';

  const isMissing = clientId == '';
  if (isMissing) {
    throw new Error('EBAY_CLIENT_ID is missing');
  }

  return clientId;
}

function readClientSecret(): string {
  const clientSecret = process.env.EBAY_CLIENT_SECRET ?? '';

  const isMissing = clientSecret == '';
  if (isMissing) {
    throw new Error('EBAY_CLIENT_SECRET is missing');
  }

  return clientSecret;
}

function readRefreshToken(): string | null {
  const refreshToken = process.env.EBAY_USER_REFRESH_TOKEN ?? '';

  const isMissing = refreshToken == '';
  if (isMissing) {
    return null;
  }

  return refreshToken;
}

function readSite(): EbaySite {
  const siteName = process.env.EBAY_ENVIRONMENT ?? 'sandbox';

  const isSandbox = siteName == 'sandbox';
  if (isSandbox) {
    return 'sandbox';
  }

  const isProduction = siteName == 'production';
  if (isProduction) {
    return 'production';
  }

  throw new Error('EBAY_ENVIRONMENT must be sandbox or production');
}

export function readCredentials(): EbayCredentials {
  const clientId = readClientId();
  const clientSecret = readClientSecret();
  const site = readSite();
  const refreshToken = readRefreshToken();
  const marketplaceId = process.env.EBAY_MARKETPLACE_ID ?? 'EBAY_US';
  const contentLanguage = process.env.EBAY_CONTENT_LANGUAGE ?? 'en-US';

  return {
    clientId,
    clientSecret,
    site,
    refreshToken,
    marketplaceId,
    contentLanguage,
  };
}

export type { EbayCredentials, EbaySite };
