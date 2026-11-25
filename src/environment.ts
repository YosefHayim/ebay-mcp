import process from 'node:process';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EBAY_CLIENT_ID?: string;
      EBAY_CLIENT_SECRET?: string;
      EBAY_ENVIRONMENT?: string;
      EBAY_USER_REFRESH_TOKEN?: string;
      EBAY_MARKETPLACE_ID?: string;
      EBAY_CONTENT_LANGUAGE?: string;
    }
  }
}

export interface EbayCredentials {
  clientId: string;
  clientSecret: string;
  site: 'sandbox' | 'production';
  refreshToken: string | null;
  marketplaceId: string;
  contentLanguage: string;
}

export function readCredentials(): EbayCredentials {
  const clientId = process.env.EBAY_CLIENT_ID ?? '';
  const isClientIdMissing = clientId == '';

  if (isClientIdMissing) {
    throw new Error('EBAY_CLIENT_ID is missing');
  }

  const clientSecret = process.env.EBAY_CLIENT_SECRET ?? '';
  const isClientSecretMissing = clientSecret == '';

  if (isClientSecretMissing) {
    throw new Error('EBAY_CLIENT_SECRET is missing');
  }

  const refreshTokenText = process.env.EBAY_USER_REFRESH_TOKEN ?? '';
  const isRefreshMissing = refreshTokenText == '';
  const refreshToken = isRefreshMissing ? null : refreshTokenText;
  const marketplaceId = process.env.EBAY_MARKETPLACE_ID ?? 'EBAY_US';
  const contentLanguage = process.env.EBAY_CONTENT_LANGUAGE ?? 'en-US';
  const siteName = process.env.EBAY_ENVIRONMENT ?? 'sandbox';
  const isSandbox = siteName == 'sandbox';

  if (isSandbox) {
    return {
      clientId,
      clientSecret,
      site: 'sandbox',
      refreshToken,
      marketplaceId,
      contentLanguage,
    };
  }

  const isProduction = siteName == 'production';

  if (isProduction == false) {
    throw new Error('EBAY_ENVIRONMENT must be sandbox or production');
  }

  return {
    clientId,
    clientSecret,
    site: 'production',
    refreshToken,
    marketplaceId,
    contentLanguage,
  };
}
