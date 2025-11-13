import type { EbaySellerApi } from '@/api/index.js';
import { getOAuthAuthorizationUrl, validateScopes } from '@/config/environment.js';
import {
  accountTools,
  analyticsTools,
  communicationTools,
  fulfillmentTools,
  inventoryTools,
  marketingTools,
  metadataTools,
  otherApiTools,
  taxonomyTools,
  tokenManagementTools,
  type ToolDefinition,
} from '@/tools/definitions/index.js';
import { convertToTimestamp, validateTokenExpiry } from '@/utils/date-converter.js';

// Import Zod schemas for input validation
import {
  getAwaitingFeedbackSchema,
  getFeedbackRatingSummarySchema,
  getFeedbackSchema,
  leaveFeedbackForBuyerSchema,
  respondToFeedbackSchema,
} from '@/utils/communication/feedback.js';
import {
  bulkUpdateConversationSchema,
  getConversationSchema,
  getConversationsSchema,
  sendMessageSchema,
  updateConversationSchema,
} from '@/utils/communication/message.js';
import {
  findEligibleItemsSchema,
  getOffersToBuyersSchema,
  sendOfferToInterestedBuyersSchema,
} from '@/utils/communication/negotiation.js';
import {
  createDestinationSchema,
  createSubscriptionFilterSchema,
  createSubscriptionSchema,
  deleteDestinationSchema,
  deleteSubscriptionFilterSchema,
  deleteSubscriptionSchema,
  disableSubscriptionSchema,
  enableSubscriptionSchema,
  getConfigSchema,
  getDestinationSchema,
  getPublicKeySchema,
  getSubscriptionFilterSchema,
  getSubscriptionSchema,
  getSubscriptionsSchema,
  getTopicSchema,
  getTopicsSchema,
  testSubscriptionSchema,
  updateConfigSchema,
  updateDestinationSchema,
  updateSubscriptionSchema,
} from '@/utils/communication/notification.js';

export type { ToolDefinition };

/**
 * Get all tool definitions for the MCP server
 */
export function getToolDefinitions(): ToolDefinition[] {
  return [
    ...tokenManagementTools,
    ...accountTools,
    ...inventoryTools,
    ...fulfillmentTools,
    ...marketingTools,
    ...analyticsTools,
    ...metadataTools,
    ...taxonomyTools,
    ...communicationTools,
    ...otherApiTools,
  ];
}

/**
 * Execute a tool based on its name
 */
export async function executeTool(
  api: EbaySellerApi,
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    // ChatGPT Connector Tools
    case 'search': {
      // For this example, we'll treat the query as a search for inventory items.
      // A more robust implementation might search across different types of content.
      const response = await api.inventory.getInventoryItems((args.limit as number) ?? 10);
      const results =
        response.inventoryItems?.map((item, index) => ({
          id: `item-${index}`,
          title: item.product?.title ?? 'No Title',
          // The URL should be a canonical link to the item, which we don't have here.
          // We'll use a placeholder.
          url: `https://www.ebay.com/`, // Placeholder URL
        })) ?? [];

      // Format the response as required by the ChatGPT connector spec.
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ results }),
          },
        ],
      };
    }

    case 'fetch': {
      const sku = args.id as string;
      const item = await api.inventory.getInventoryItem(sku);

      // Format the response as required by the ChatGPT connector spec.
      const result = {
        id: sku,
        title: item.product?.title ?? 'No Title',
        text: item.product?.description ?? 'No description available.',
        url: `https://www.ebay.com/`, // Placeholder URL
        metadata: {
          source: 'ebay_inventory',
          aspects: item.product?.aspects,
          condition: item.condition,
        },
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      };
    }

    case 'ebay_get_oauth_url': {
      // Get config from environment
      const clientId = process.env.EBAY_CLIENT_ID ?? '';
      const environment = (process.env.EBAY_ENVIRONMENT ?? 'sandbox') as 'production' | 'sandbox';
      const envRedirectUri = process.env.EBAY_REDIRECT_URI;

      // Use redirectUri from args if provided, otherwise use from .env
      const redirectUri = (args.redirectUri as string | undefined) ?? envRedirectUri;
      const scopes = args.scopes as string[] | undefined;
      const state = args.state as string | undefined;

      if (!clientId) {
        throw new Error('EBAY_CLIENT_ID environment variable is required to generate OAuth URL');
      }

      if (!redirectUri) {
        throw new Error(
          'Redirect URI is required. Either provide it as a parameter or set EBAY_REDIRECT_URI in your .env file.'
        );
      }

      // Validate scopes if custom scopes are provided
      let scopeWarnings: string[] = [];
      let validatedScopes = scopes;

      if (scopes && scopes.length > 0) {
        const validation = validateScopes(scopes, environment);
        scopeWarnings = validation.warnings;
        validatedScopes = validation.validScopes;
      }

      const authUrl = getOAuthAuthorizationUrl(
        clientId,
        redirectUri,
        environment,
        validatedScopes,
        state
      );

      const result: Record<string, unknown> = {
        authorizationUrl: authUrl,
        redirectUri,
        instructions:
          'Open this URL in a browser to authorize the application. After authorization, you will be redirected to your redirect URI with an authorization code that can be exchanged for an access token.',
        environment,
        scopes: scopes ?? 'default (all Sell API scopes)',
      };

      // Include warnings if any scopes are invalid for the environment
      if (scopeWarnings.length > 0) {
        result.warnings = scopeWarnings;
      }

      return result;
    }

    case 'ebay_set_user_tokens': {
      const accessToken = args.accessToken as string;
      const refreshToken = args.refreshToken as string;

      if (!accessToken || !refreshToken) {
        throw new Error('Both accessToken and refreshToken are required');
      }

      await api.setUserTokens(accessToken, refreshToken);

      return {
        success: true,
        message:
          'User tokens successfully stored. These tokens will be used for all subsequent API requests and will be automatically refreshed when needed.',
        tokenInfo: api.getTokenInfo(),
      };
    }

    case 'ebay_get_token_status': {
      const tokenInfo = api.getTokenInfo();
      const hasUserTokens = api.hasUserTokens();

      return {
        hasUserToken: tokenInfo.hasUserToken,
        hasAppAccessToken: tokenInfo.hasAppAccessToken,
        authenticated: api.isAuthenticated(),
        currentTokenType: tokenInfo.hasUserToken
          ? 'user_token (10,000-50,000 req/day)'
          : tokenInfo.hasAppAccessToken
            ? 'app_access_token (1,000 req/day)'
            : 'none',
        message: hasUserTokens
          ? 'Using user access token with automatic refresh'
          : 'Using app access token from client credentials flow (lower rate limits). Consider setting user tokens for higher rate limits.',
      };
    }

    case 'ebay_clear_tokens': {
      const authClient = api.getAuthClient().getOAuthClient();
      await authClient.clearAllTokens();

      return {
        success: true,
        message:
          'All tokens cleared successfully. You will need to re-authenticate for subsequent API calls.',
      };
    }

    case 'ebay_convert_date_to_timestamp': {
      const dateInput = args.dateInput as string | number;

      try {
        const timestamp = convertToTimestamp(dateInput);

        return {
          success: true,
          timestamp,
          input: dateInput,
          formattedDate: new Date(timestamp).toISOString(),
          message: `Successfully converted to timestamp: ${timestamp}ms (${new Date(timestamp).toISOString()})`,
        };
      } catch (error) {
        throw new Error(
          `Failed to convert date: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    case 'ebay_validate_token_expiry': {
      const accessTokenExpiry = args.accessTokenExpiry as string | number;
      const refreshTokenExpiry = args.refreshTokenExpiry as string | number;

      try {
        // Convert to timestamps
        const accessExpiry = convertToTimestamp(accessTokenExpiry);
        const refreshExpiry = convertToTimestamp(refreshTokenExpiry);

        // Validate
        const validation = validateTokenExpiry(accessExpiry, refreshExpiry);

        return {
          ...validation,
          accessTokenExpiryTimestamp: accessExpiry,
          refreshTokenExpiryTimestamp: refreshExpiry,
          accessTokenExpiryDate: new Date(accessExpiry).toISOString(),
          refreshTokenExpiryDate: new Date(refreshExpiry).toISOString(),
        };
      } catch (error) {
        throw new Error(
          `Failed to validate token expiry: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    case 'ebay_set_user_tokens_with_expiry': {
      const accessToken = args.accessToken as string;
      const refreshToken = args.refreshToken as string;
      const accessTokenExpiry = args.accessTokenExpiry as string | number | undefined;
      const refreshTokenExpiry = args.refreshTokenExpiry as string | number | undefined;
      const autoRefresh = (args.autoRefresh as boolean) ?? true;

      if (!accessToken || !refreshToken) {
        throw new Error('Both accessToken and refreshToken are required');
      }

      try {
        // Convert expiry times to timestamps if provided
        let accessExpiry: number | undefined;
        let refreshExpiry: number | undefined;

        if (accessTokenExpiry !== undefined) {
          accessExpiry = convertToTimestamp(accessTokenExpiry);
        }

        if (refreshTokenExpiry !== undefined) {
          refreshExpiry = convertToTimestamp(refreshTokenExpiry);
        }

        // Set tokens (will use defaults if expiry times not provided)
        await api.setUserTokens(accessToken, refreshToken, accessExpiry, refreshExpiry);

        // If autoRefresh is enabled, attempt to get a fresh access token
        // (The OAuth client will handle refresh internally if needed)
        if (autoRefresh) {
          try {
            const authClient = api.getAuthClient().getOAuthClient();
            await authClient.getAccessToken();

            return {
              success: true,
              message:
                'User tokens stored successfully in memory. Access token validated and refreshed if needed. To persist tokens, update EBAY_USER_REFRESH_TOKEN in .env file.',
              tokenInfo: api.getTokenInfo(),
              refreshed: true,
            };
          } catch (refreshError) {
            return {
              success: true,
              message:
                'User tokens stored, but failed to validate/refresh access token. You may need to re-authorize.',
              tokenInfo: api.getTokenInfo(),
              refreshed: false,
              refreshError: refreshError instanceof Error ? refreshError.message : 'Unknown error',
            };
          }
        }

        return {
          success: true,
          message:
            'User tokens successfully stored in memory. These tokens will be used for all subsequent API requests and will be automatically refreshed when needed. To persist tokens, update EBAY_USER_REFRESH_TOKEN in .env file.',
          tokenInfo: api.getTokenInfo(),
          refreshed: false,
        };
      } catch (error) {
        throw new Error(
          `Failed to set user tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    case 'ebay_display_credentials': {
      // Get configuration from environment
      const clientId = process.env.EBAY_CLIENT_ID ?? '';
      const clientSecret = process.env.EBAY_CLIENT_SECRET ?? '';
      const environment = process.env.EBAY_ENVIRONMENT ?? 'sandbox';
      const redirectUri = process.env.EBAY_REDIRECT_URI ?? '';
      const refreshToken = process.env.EBAY_USER_REFRESH_TOKEN ?? '';

      // Get current token info from API
      const tokenInfo = api.getTokenInfo();
      const authClient = api.getAuthClient().getOAuthClient();

      // Helper function to mask sensitive tokens
      const maskToken = (token: string): string => {
        if (!token || token.length < 12) return '***';
        return `${token.substring(0, 6)}...${token.substring(token.length - 6)}`;
      };

      // Get internal token details from the auth client
      const internalTokens = (authClient as any).userTokens;

      return {
        credentials: {
          clientId: clientId ? maskToken(clientId) : 'Not set',
          clientSecret: clientSecret ? '****** (set)' : 'Not set',
          environment,
          redirectUri: redirectUri || 'Not set',
        },
        tokens: {
          refreshToken: refreshToken ? maskToken(refreshToken) : 'Not set (in .env)',
          accessToken: internalTokens?.userAccessToken
            ? maskToken(internalTokens.userAccessToken)
            : 'Not available',
          accessTokenExpiry: internalTokens?.userAccessTokenExpiry
            ? {
                timestamp: internalTokens.userAccessTokenExpiry,
                date: new Date(internalTokens.userAccessTokenExpiry).toISOString(),
                expired: Date.now() >= internalTokens.userAccessTokenExpiry,
              }
            : 'Not available',
          refreshTokenExpiry: internalTokens?.userRefreshTokenExpiry
            ? {
                timestamp: internalTokens.userRefreshTokenExpiry,
                date: new Date(internalTokens.userRefreshTokenExpiry).toISOString(),
                expired: Date.now() >= internalTokens.userRefreshTokenExpiry,
              }
            : 'Not available',
          appToken: (authClient as any).appAccessToken
            ? maskToken((authClient as any).appAccessToken)
            : 'Not cached',
          appTokenExpiry: (authClient as any).appAccessTokenExpiry
            ? {
                timestamp: (authClient as any).appAccessTokenExpiry,
                date: new Date((authClient as any).appAccessTokenExpiry).toISOString(),
                expired: Date.now() >= (authClient as any).appAccessTokenExpiry,
              }
            : 'Not available',
        },
        status: {
          hasUserToken: tokenInfo.hasUserToken,
          hasAppAccessToken: tokenInfo.hasAppAccessToken,
          authenticated: api.isAuthenticated(),
          currentTokenType: tokenInfo.hasUserToken
            ? 'user_token (10,000-50,000 req/day)'
            : tokenInfo.hasAppAccessToken
              ? 'app_access_token (1,000 req/day)'
              : 'none',
        },
        scopes: internalTokens?.scope ? internalTokens.scope.split(' ') : [],
      };
    }

    case 'ebay_refresh_access_token': {
      const authClient = api.getAuthClient().getOAuthClient();

      // Check if user tokens are available
      if (!api.hasUserTokens()) {
        throw new Error(
          'No user tokens available. Please set user tokens first using ebay_set_user_tokens_with_expiry or add EBAY_USER_REFRESH_TOKEN to your .env file.'
        );
      }

      try {
        // Call the public refreshUserToken method
        await authClient.refreshUserToken();

        // Get updated token info
        const internalTokens = (authClient as any).userTokens;

        return {
          success: true,
          message: 'Access token refreshed successfully',
          accessToken: internalTokens?.userAccessToken
            ? `${internalTokens.userAccessToken.substring(0, 6)}...${internalTokens.userAccessToken.substring(internalTokens.userAccessToken.length - 6)}`
            : 'Not available',
          accessTokenExpiry: internalTokens?.userAccessTokenExpiry
            ? {
                timestamp: internalTokens.userAccessTokenExpiry,
                date: new Date(internalTokens.userAccessTokenExpiry).toISOString(),
                expiresInSeconds: Math.floor(
                  (internalTokens.userAccessTokenExpiry - Date.now()) / 1000
                ),
              }
            : 'Not available',
          tokenInfo: api.getTokenInfo(),
        };
      } catch (error) {
        throw new Error(
          `Failed to refresh access token: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Account Management
    case 'ebay_get_custom_policies':
      return await api.account.getCustomPolicies(args.policyTypes as string);
    case 'ebay_get_fulfillment_policies':
      return await api.account.getFulfillmentPolicies(args.marketplaceId as string);
    case 'ebay_get_payment_policies':
      return await api.account.getPaymentPolicies(args.marketplaceId as string);
    case 'ebay_get_return_policies':
      return await api.account.getReturnPolicies(args.marketplaceId as string);

    // Fulfillment Policy CRUD
    case 'ebay_create_fulfillment_policy':
      return await api.account.createFulfillmentPolicy(args.policy as Record<string, unknown>);
    case 'ebay_get_fulfillment_policy':
      return await api.account.getFulfillmentPolicy(args.fulfillmentPolicyId as string);
    case 'ebay_get_fulfillment_policy_by_name':
      return await api.account.getFulfillmentPolicyByName(
        args.marketplaceId as string,
        args.name as string
      );
    case 'ebay_update_fulfillment_policy':
      return await api.account.updateFulfillmentPolicy(
        args.fulfillmentPolicyId as string,
        args.policy as Record<string, unknown>
      );
    case 'ebay_delete_fulfillment_policy':
      return await api.account.deleteFulfillmentPolicy(args.fulfillmentPolicyId as string);

    // Payment Policy CRUD
    case 'ebay_create_payment_policy':
      return await api.account.createPaymentPolicy(args.policy as Record<string, unknown>);
    case 'ebay_get_payment_policy':
      return await api.account.getPaymentPolicy(args.paymentPolicyId as string);
    case 'ebay_get_payment_policy_by_name':
      return await api.account.getPaymentPolicyByName(
        args.marketplaceId as string,
        args.name as string
      );
    case 'ebay_update_payment_policy':
      return await api.account.updatePaymentPolicy(
        args.paymentPolicyId as string,
        args.policy as Record<string, unknown>
      );
    case 'ebay_delete_payment_policy':
      return await api.account.deletePaymentPolicy(args.paymentPolicyId as string);

    // Return Policy CRUD
    case 'ebay_create_return_policy':
      return await api.account.createReturnPolicy(args.policy as Record<string, unknown>);
    case 'ebay_get_return_policy':
      return await api.account.getReturnPolicy(args.returnPolicyId as string);
    case 'ebay_get_return_policy_by_name':
      return await api.account.getReturnPolicyByName(
        args.marketplaceId as string,
        args.name as string
      );
    case 'ebay_update_return_policy':
      return await api.account.updateReturnPolicy(
        args.returnPolicyId as string,
        args.policy as Record<string, unknown>
      );
    case 'ebay_delete_return_policy':
      return await api.account.deleteReturnPolicy(args.returnPolicyId as string);

    // Custom Policy CRUD
    case 'ebay_create_custom_policy':
      return await api.account.createCustomPolicy(args.policy as Record<string, unknown>);
    case 'ebay_get_custom_policy':
      return await api.account.getCustomPolicy(args.customPolicyId as string);
    case 'ebay_update_custom_policy':
      return await api.account.updateCustomPolicy(
        args.customPolicyId as string,
        args.policy as Record<string, unknown>
      );
    case 'ebay_delete_custom_policy':
      return await api.account.deleteCustomPolicy(args.customPolicyId as string);

    // KYC, Payments, Programs, Sales Tax, Subscription
    case 'ebay_get_kyc':
      return await api.account.getKyc();
    case 'ebay_opt_in_to_payments_program':
      return await api.account.optInToPaymentsProgram(
        args.marketplaceId as string,
        args.paymentsProgramType as string
      );
    case 'ebay_get_payments_program_status':
      return await api.account.getPaymentsProgramStatus(
        args.marketplaceId as string,
        args.paymentsProgramType as string
      );
    case 'ebay_get_rate_tables':
      return await api.account.getRateTables();
    case 'ebay_create_or_replace_sales_tax':
      return await api.account.createOrReplaceSalesTax(
        args.countryCode as string,
        args.jurisdictionId as string,
        args.salesTaxBase as Record<string, unknown>
      );
    case 'ebay_bulk_create_or_replace_sales_tax':
      return await api.account.bulkCreateOrReplaceSalesTax(args.requests as unknown as { countryCode: string; jurisdictionId: string; salesTaxBase: Record<string, unknown> }[]);
    case 'ebay_delete_sales_tax':
      return await api.account.deleteSalesTax(
        args.countryCode as string,
        args.jurisdictionId as string
      );
    case 'ebay_get_sales_tax':
      return await api.account.getSalesTax(
        args.countryCode as string,
        args.jurisdictionId as string
      );
    case 'ebay_get_sales_taxes':
      return await api.account.getSalesTaxes(args.countryCode as string);
    case 'ebay_get_subscription':
      return await api.account.getSubscription(args.limitType as string);
    case 'ebay_opt_in_to_program':
      return await api.account.optInToProgram(args.request as Record<string, unknown>);
    case 'ebay_opt_out_of_program':
      return await api.account.optOutOfProgram(args.request as Record<string, unknown>);
    case 'ebay_get_opted_in_programs':
      return await api.account.getOptedInPrograms();
    case 'ebay_get_privileges':
      return await api.account.getPrivileges();
    case 'ebay_get_advertising_eligibility':
      return await api.account.getAdvertisingEligibility(
        args.marketplaceId as string,
        args.programTypes as string | undefined
      );
    case 'ebay_get_payments_program':
      return await api.account.getPaymentsProgram(
        args.marketplaceId as string,
        args.paymentsProgramType as string
      );
    case 'ebay_get_payments_program_onboarding':
      return await api.account.getPaymentsProgramOnboarding(
        args.marketplaceId as string,
        args.paymentsProgramType as string
      );

    // Inventory Management
    case 'ebay_get_inventory_items':
      return await api.inventory.getInventoryItems(args.limit as number, args.offset as number);
    case 'ebay_get_inventory_item':
      return await api.inventory.getInventoryItem(args.sku as string);
    case 'ebay_create_inventory_item':
      return await api.inventory.createOrReplaceInventoryItem(
        args.sku as string,
        args.inventoryItem as Record<string, unknown>
      );
    case 'ebay_delete_inventory_item':
      return await api.inventory.deleteInventoryItem(args.sku as string);

    // Bulk Operations
    case 'ebay_bulk_create_or_replace_inventory_item':
      return await api.inventory.bulkCreateOrReplaceInventoryItem(args.requests as Record<string, unknown>);
    case 'ebay_bulk_get_inventory_item':
      return await api.inventory.bulkGetInventoryItem(args.requests as Record<string, unknown>);
    case 'ebay_bulk_update_price_quantity':
      return await api.inventory.bulkUpdatePriceQuantity(args.requests as Record<string, unknown>);

    // Product Compatibility
    case 'ebay_get_product_compatibility':
      return await api.inventory.getProductCompatibility(args.sku as string);
    case 'ebay_create_or_replace_product_compatibility':
      return await api.inventory.createOrReplaceProductCompatibility(
        args.sku as string,
        args.compatibility as Record<string, unknown>
      );
    case 'ebay_delete_product_compatibility':
      return await api.inventory.deleteProductCompatibility(args.sku as string);

    // Inventory Item Groups
    case 'ebay_get_inventory_item_group':
      return await api.inventory.getInventoryItemGroup(args.inventoryItemGroupKey as string);
    case 'ebay_create_or_replace_inventory_item_group':
      return await api.inventory.createOrReplaceInventoryItemGroup(
        args.inventoryItemGroupKey as string,
        args.inventoryItemGroup as Record<string, unknown>
      );
    case 'ebay_delete_inventory_item_group':
      return await api.inventory.deleteInventoryItemGroup(args.inventoryItemGroupKey as string);

    // Location Management
    case 'ebay_get_inventory_locations':
      return await api.inventory.getInventoryLocations(args.limit as number, args.offset as number);
    case 'ebay_get_inventory_location':
      return await api.inventory.getInventoryLocation(args.merchantLocationKey as string);
    case 'ebay_create_or_replace_inventory_location':
      return await api.inventory.createOrReplaceInventoryLocation(
        args.merchantLocationKey as string,
        args.location as Record<string, unknown>
      );
    case 'ebay_delete_inventory_location':
      return await api.inventory.deleteInventoryLocation(args.merchantLocationKey as string);
    case 'ebay_disable_inventory_location':
      return await api.inventory.disableInventoryLocation(args.merchantLocationKey as string);
    case 'ebay_enable_inventory_location':
      return await api.inventory.enableInventoryLocation(args.merchantLocationKey as string);
    case 'ebay_update_location_details':
      return await api.inventory.updateLocationDetails(
        args.merchantLocationKey as string,
        args.locationDetails as Record<string, unknown>
      );

    // Offer Management
    case 'ebay_get_offers':
      return await api.inventory.getOffers(
        args.sku as string,
        args.marketplaceId as string,
        args.limit as number
      );
    case 'ebay_get_offer':
      return await api.inventory.getOffer(args.offerId as string);
    case 'ebay_create_offer':
      return await api.inventory.createOffer(args.offer as Record<string, unknown>);
    case 'ebay_update_offer':
      return await api.inventory.updateOffer(args.offerId as string, args.offer as Record<string, unknown>);
    case 'ebay_delete_offer':
      return await api.inventory.deleteOffer(args.offerId as string);
    case 'ebay_publish_offer':
      return await api.inventory.publishOffer(args.offerId as string);
    case 'ebay_withdraw_offer':
      return await api.inventory.withdrawOffer(args.offerId as string);
    case 'ebay_bulk_create_offer':
      return await api.inventory.bulkCreateOffer(args.requests as Record<string, unknown>);
    case 'ebay_bulk_publish_offer':
      return await api.inventory.bulkPublishOffer(args.requests as Record<string, unknown>);
    case 'ebay_get_listing_fees':
      return await api.inventory.getListingFees(args.offers as Record<string, unknown>);

    // Listing Migration
    case 'ebay_bulk_migrate_listing':
      return await api.inventory.bulkMigrateListing(args.requests as Record<string, unknown>);

    // Listing Locations
    case 'ebay_get_listing_locations':
      return await api.inventory.getListingLocations(args.listingId as string, args.sku as string);

    // Inventory Item Group Publishing
    case 'ebay_publish_offer_by_inventory_item_group':
      return await api.inventory.publishOfferByInventoryItemGroup(args.request as Record<string, unknown>);
    case 'ebay_withdraw_offer_by_inventory_item_group':
      return await api.inventory.withdrawOfferByInventoryItemGroup(args.request as Record<string, unknown>);

    // Order Management
    case 'ebay_get_orders':
      return await api.fulfillment.getOrders(
        args.filter as string,
        args.limit as number,
        args.offset as number
      );
    case 'ebay_get_order':
      return await api.fulfillment.getOrder(args.orderId as string);
    case 'ebay_create_shipping_fulfillment':
      return await api.fulfillment.createShippingFulfillment(
        args.orderId as string,
        args.fulfillment as Record<string, unknown>
      );
    case 'ebay_issue_refund':
      return await api.fulfillment.issueRefund(args.orderId as string, args.refundData as Record<string, unknown>);

    // Marketing - Campaign Management
    case 'ebay_get_campaigns':
      return await api.marketing.getCampaigns(
        args.campaignStatus as string,
        args.marketplaceId as string,
        args.limit as number
      );
    case 'ebay_get_campaign':
      return await api.marketing.getCampaign(args.campaignId as string);
    case 'ebay_get_campaign_by_name':
      return await api.marketing.getCampaignByName(args.campaignName as string);
    case 'ebay_create_campaign':
      return await api.marketing.createCampaign(args.campaign as Record<string, unknown>);
    case 'ebay_clone_campaign':
      return await api.marketing.cloneCampaign(args.campaignId as string, args.cloneData as Record<string, unknown>);
    case 'ebay_pause_campaign':
      return await api.marketing.pauseCampaign(args.campaignId as string);
    case 'ebay_resume_campaign':
      return await api.marketing.resumeCampaign(args.campaignId as string);
    case 'ebay_end_campaign':
      return await api.marketing.endCampaign(args.campaignId as string);
    case 'ebay_update_campaign_identification':
      return await api.marketing.updateCampaignIdentification(
        args.campaignId as string,
        args.updateData as Record<string, unknown>
      );

    // Marketing - Ad Operations (Bulk)
    case 'ebay_bulk_create_ads_by_inventory_reference':
      return await api.marketing.bulkCreateAdsByInventoryReference(
        args.campaignId as string,
        args.ads as Record<string, unknown>
      );
    case 'ebay_bulk_create_ads_by_listing_id':
      return await api.marketing.bulkCreateAdsByListingId(
        args.campaignId as string,
        args.ads as Record<string, unknown>
      );
    case 'ebay_bulk_delete_ads_by_inventory_reference':
      return await api.marketing.bulkDeleteAdsByInventoryReference(
        args.campaignId as string,
        args.ads as Record<string, unknown>
      );
    case 'ebay_bulk_delete_ads_by_listing_id':
      return await api.marketing.bulkDeleteAdsByListingId(
        args.campaignId as string,
        args.ads as Record<string, unknown>
      );
    case 'ebay_bulk_update_ads_bid_by_inventory_reference':
      return await api.marketing.bulkUpdateAdsBidByInventoryReference(
        args.campaignId as string,
        args.ads as Record<string, unknown>
      );
    case 'ebay_bulk_update_ads_bid_by_listing_id':
      return await api.marketing.bulkUpdateAdsBidByListingId(
        args.campaignId as string,
        args.ads as Record<string, unknown>
      );
    case 'ebay_bulk_update_ads_status':
      return await api.marketing.bulkUpdateAdsStatus(
        args.campaignId as string,
        args.ads as Record<string, unknown>
      );
    case 'ebay_bulk_update_ads_status_by_listing_id':
      return await api.marketing.bulkUpdateAdsStatusByListingId(
        args.campaignId as string,
        args.ads as Record<string, unknown>
      );

    // Marketing - Ad Operations (Single)
    case 'ebay_create_ad':
      return await api.marketing.createAd(args.campaignId as string, args.ad as Record<string, unknown>);
    case 'ebay_create_ads_by_inventory_reference':
      return await api.marketing.createAdsByInventoryReference(
        args.campaignId as string,
        args.ads as Record<string, unknown>
      );
    case 'ebay_get_ad':
      return await api.marketing.getAd(args.campaignId as string, args.adId as string);
    case 'ebay_get_ads':
      return await api.marketing.getAds(
        args.campaignId as string,
        args.adGroupIds as string,
        args.adStatus as string,
        args.limit as number,
        args.listingIds as string,
        args.offset as number
      );
    case 'ebay_get_ads_by_inventory_reference':
      return await api.marketing.getAdsByInventoryReference(
        args.campaignId as string,
        args.inventoryReferenceId as string,
        args.inventoryReferenceType as string
      );
    case 'ebay_get_ads_by_listing_id':
      return await api.marketing.getAdsByListingId(args.campaignId as string, args.listingId as string);
    case 'ebay_delete_ad':
      return await api.marketing.deleteAd(args.campaignId as string, args.adId as string);
    case 'ebay_clone_ad':
      return await api.marketing.cloneAd(
        args.campaignId as string,
        args.adId as string,
        args.ad as Record<string, unknown>
      );
    case 'ebay_update_ad_bid':
      return await api.marketing.updateBid(
        args.campaignId as string,
        args.adId as string,
        args.bidData as Record<string, unknown>
      );

    // Marketing - Ad Group Management
    case 'ebay_create_ad_group':
      return await api.marketing.createAdGroup(args.campaignId as string, args.adGroup as Record<string, unknown>);
    case 'ebay_get_ad_group':
      return await api.marketing.getAdGroup(args.campaignId as string, args.adGroupId as string);
    case 'ebay_get_ad_groups':
      return await api.marketing.getAdGroups(
        args.campaignId as string,
        args.adGroupStatus as string,
        args.limit as number,
        args.offset as number
      );
    case 'ebay_clone_ad_group':
      return await api.marketing.cloneAdGroup(
        args.campaignId as string,
        args.adGroupId as string,
        args.adGroup as Record<string, unknown>
      );
    case 'ebay_update_ad_group_bids':
      return await api.marketing.updateAdGroupBids(
        args.campaignId as string,
        args.adGroupId as string,
        args.bidsData as Record<string, unknown>
      );
    case 'ebay_update_ad_group_keywords':
      return await api.marketing.updateAdGroupKeywords(
        args.campaignId as string,
        args.adGroupId as string,
        args.keywordsData as Record<string, unknown>
      );

    // Marketing - Keyword Management
    case 'ebay_create_keyword':
      return await api.marketing.createKeyword(
        args.campaignId as string,
        args.adGroupId as string,
        args.keyword as Record<string, unknown>
      );
    case 'ebay_get_keyword':
      return await api.marketing.getKeyword(
        args.campaignId as string,
        args.adGroupId as string,
        args.keywordId as string
      );
    case 'ebay_get_keywords':
      return await api.marketing.getKeywords(
        args.campaignId as string,
        args.adGroupId as string,
        args.keywordStatus as string,
        args.limit as number,
        args.offset as number
      );
    case 'ebay_delete_keyword':
      return await api.marketing.deleteKeyword(
        args.campaignId as string,
        args.adGroupId as string,
        args.keywordId as string
      );
    case 'ebay_update_keyword_bid':
      return await api.marketing.updateKeywordBid(
        args.campaignId as string,
        args.adGroupId as string,
        args.keywordId as string,
        args.bidData as Record<string, unknown>
      );
    case 'ebay_bulk_create_keywords':
      return await api.marketing.bulkCreateKeywords(
        args.campaignId as string,
        args.adGroupId as string,
        args.keywords as Record<string, unknown>
      );
    case 'ebay_bulk_delete_keywords':
      return await api.marketing.bulkDeleteKeywords(
        args.campaignId as string,
        args.adGroupId as string,
        args.keywords as Record<string, unknown>
      );
    case 'ebay_bulk_update_keyword_bids':
      return await api.marketing.bulkUpdateKeywordBids(
        args.campaignId as string,
        args.adGroupId as string,
        args.keywords as Record<string, unknown>
      );

    // Marketing - Negative Keywords (Campaign Level)
    case 'ebay_create_negative_keyword':
      return await api.marketing.createNegativeKeyword(
        args.campaignId as string,
        args.negativeKeyword as Record<string, unknown>
      );
    case 'ebay_get_negative_keyword':
      return await api.marketing.getNegativeKeyword(
        args.campaignId as string,
        args.negativeKeywordId as string
      );
    case 'ebay_get_negative_keywords':
      return await api.marketing.getNegativeKeywords(
        args.campaignId as string,
        args.limit as number,
        args.offset as number
      );
    case 'ebay_delete_negative_keyword':
      return await api.marketing.deleteNegativeKeyword(
        args.campaignId as string,
        args.negativeKeywordId as string
      );
    case 'ebay_update_negative_keyword':
      return await api.marketing.updateNegativeKeyword(
        args.campaignId as string,
        args.negativeKeywordId as string,
        args.negativeKeyword as Record<string, unknown>
      );
    case 'ebay_bulk_create_negative_keywords':
      return await api.marketing.bulkCreateNegativeKeywords(
        args.campaignId as string,
        args.negativeKeywords as Record<string, unknown>
      );
    case 'ebay_bulk_update_negative_keywords':
      return await api.marketing.bulkUpdateNegativeKeywords(
        args.campaignId as string,
        args.negativeKeywords as Record<string, unknown>
      );
    case 'ebay_bulk_delete_negative_keywords':
      return await api.marketing.bulkDeleteNegativeKeywords(
        args.campaignId as string,
        args.negativeKeywords as Record<string, unknown>
      );

    // Marketing - Negative Keywords (Ad Group Level)
    case 'ebay_create_negative_keyword_for_ad_group':
      return await api.marketing.createNegativeKeywordForAdGroup(
        args.adGroupId as string,
        args.negativeKeyword as Record<string, unknown>
      );
    case 'ebay_get_negative_keyword_for_ad_group':
      return await api.marketing.getNegativeKeywordForAdGroup(
        args.adGroupId as string,
        args.negativeKeywordId as string
      );
    case 'ebay_get_negative_keywords_for_ad_group':
      return await api.marketing.getNegativeKeywordsForAdGroup(
        args.adGroupId as string,
        args.limit as number,
        args.offset as number
      );
    case 'ebay_delete_negative_keyword_for_ad_group':
      return await api.marketing.deleteNegativeKeywordForAdGroup(
        args.adGroupId as string,
        args.negativeKeywordId as string
      );
    case 'ebay_update_negative_keyword_for_ad_group':
      return await api.marketing.updateNegativeKeywordForAdGroup(
        args.adGroupId as string,
        args.negativeKeywordId as string,
        args.negativeKeyword as Record<string, unknown>
      );
    case 'ebay_bulk_create_negative_keywords_for_ad_group':
      return await api.marketing.bulkCreateNegativeKeywordsForAdGroup(
        args.adGroupId as string,
        args.negativeKeywords as Record<string, unknown>
      );
    case 'ebay_bulk_update_negative_keywords_for_ad_group':
      return await api.marketing.bulkUpdateNegativeKeywordsForAdGroup(
        args.adGroupId as string,
        args.negativeKeywords as Record<string, unknown>
      );
    case 'ebay_bulk_delete_negative_keywords_for_ad_group':
      return await api.marketing.bulkDeleteNegativeKeywordsForAdGroup(
        args.adGroupId as string,
        args.negativeKeywords as Record<string, unknown>
      );

    // Marketing - Targeting
    case 'ebay_create_targeting':
      return await api.marketing.createTargeting(
        args.campaignId as string,
        args.targeting as Record<string, unknown>
      );
    case 'ebay_get_targeting':
      return await api.marketing.getTargeting(args.campaignId as string);
    case 'ebay_update_targeting':
      return await api.marketing.updateTargeting(
        args.campaignId as string,
        args.targeting as Record<string, unknown>
      );

    // Marketing - Suggestions
    case 'ebay_suggest_bids':
      return await api.marketing.suggestBids(args.campaignId as string, args.adGroupId as string);
    case 'ebay_suggest_keywords':
      return await api.marketing.suggestKeywords(
        args.campaignId as string,
        args.adGroupId as string,
        args.suggestion as Record<string, unknown>
      );

    // Marketing - Reporting
    case 'ebay_create_report_task':
      return await api.marketing.createReportTask(args.reportTask as Record<string, unknown>);
    case 'ebay_get_report_task':
      return await api.marketing.getReportTask(args.reportTaskId as string);
    case 'ebay_get_report_tasks':
      return await api.marketing.getReportTasks(
        args.reportTaskStatuses as string,
        args.limit as number,
        args.offset as number
      );
    case 'ebay_get_ad_report':
      return await api.marketing.getAdReport(
        args.dimension as string,
        args.metric as string,
        args.reportStartDate as string,
        args.reportEndDate as string,
        args.sort as string,
        args.listingIds as string,
        args.marketplaceId as string
      );
    case 'ebay_get_ad_report_metadata':
      return await api.marketing.getAdReportMetadata();
    case 'ebay_get_ad_report_metadata_for_report_type':
      return await api.marketing.getAdReportMetadataForReportType(args.reportType as string);

    // Marketing - Promotions (Item Promotion)
    case 'ebay_get_promotions':
      return await api.marketing.getPromotions(args.marketplaceId as string, args.limit as number);
    case 'ebay_get_item_promotion':
      return await api.marketing.getItemPromotion(args.promotionId as string);
    case 'ebay_create_item_promotion':
      return await api.marketing.createPromotion(args.promotion as Record<string, unknown>);
    case 'ebay_update_item_promotion':
      return await api.marketing.updateItemPromotion(
        args.promotionId as string,
        args.promotion as Record<string, unknown>
      );
    case 'ebay_delete_item_promotion':
      return await api.marketing.deleteItemPromotion(args.promotionId as string);
    case 'ebay_pause_item_promotion':
      return await api.marketing.pauseItemPromotion(args.promotionId as string);
    case 'ebay_resume_item_promotion':
      return await api.marketing.resumeItemPromotion(args.promotionId as string);
    case 'ebay_get_promotion_report':
      return await api.marketing.getPromotionReport(
        args.marketplaceId as string,
        args.promotionStatus as string,
        args.limit as number,
        args.offset as number
      );
    case 'ebay_get_promotion_summary_report':
      return await api.marketing.getPromotionSummaryReport(args.marketplaceId as string);

    // Recommendation
    case 'ebay_find_listing_recommendations':
      return await api.recommendation.findListingRecommendations(
        args.listingIds ? { listingIds: args.listingIds as string[] } : undefined,
        args.filter as string,
        args.limit as number,
        args.offset as number,
        args.marketplaceId as string
      );

    // Analytics
    case 'ebay_get_traffic_report':
      return await api.analytics.getTrafficReport(
        args.dimension as string,
        args.filter as string,
        args.metric as string,
        args.sort as string
      );
    case 'ebay_find_seller_standards_profiles':
      return await api.analytics.findSellerStandardsProfiles();
    case 'ebay_get_seller_standards_profile':
      return await api.analytics.getSellerStandardsProfile(
        args.program as string,
        args.cycle as string
      );
    case 'ebay_get_customer_service_metric':
      return await api.analytics.getCustomerServiceMetric(
        args.customerServiceMetricType as string,
        args.evaluationType as string,
        args.evaluationMarketplaceId as string
      );

    // Metadata
    case 'ebay_get_automotive_parts_compatibility_policies':
      return await api.metadata.getAutomotivePartsCompatibilityPolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_category_policies':
      return await api.metadata.getCategoryPolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_extended_producer_responsibility_policies':
      return await api.metadata.getExtendedProducerResponsibilityPolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_hazardous_materials_labels':
      return await api.metadata.getHazardousMaterialsLabels(args.marketplaceId as string);
    case 'ebay_get_item_condition_policies':
      return await api.metadata.getItemConditionPolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_listing_structure_policies':
      return await api.metadata.getListingStructurePolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_negotiated_price_policies':
      return await api.metadata.getNegotiatedPricePolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_product_safety_labels':
      return await api.metadata.getProductSafetyLabels(args.marketplaceId as string);
    case 'ebay_get_regulatory_policies':
      return await api.metadata.getRegulatoryPolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_return_policy_metadata':
      return await api.metadata.getReturnPolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_shipping_cost_type_policies':
      return await api.metadata.getShippingCostTypePolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_classified_ad_policies':
      return await api.metadata.getClassifiedAdPolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_currencies':
      return await api.metadata.getCurrencies(args.marketplaceId as string);
    case 'ebay_get_listing_type_policies':
      return await api.metadata.getListingTypePolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_motors_listing_policies':
      return await api.metadata.getMotorsListingPolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_shipping_policies':
      return await api.metadata.getShippingPolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_site_visibility_policies':
      return await api.metadata.getSiteVisibilityPolicies(
        args.marketplaceId as string,
        args.filter as string
      );
    case 'ebay_get_compatibilities_by_specification':
      return await api.metadata.getCompatibilitiesBySpecification(args.specification as Record<string, unknown>);
    case 'ebay_get_compatibility_property_names':
      return await api.metadata.getCompatibilityPropertyNames(args.data as Record<string, unknown>);
    case 'ebay_get_compatibility_property_values':
      return await api.metadata.getCompatibilityPropertyValues(args.data as Record<string, unknown>);
    case 'ebay_get_multi_compatibility_property_values':
      return await api.metadata.getMultiCompatibilityPropertyValues(args.data as Record<string, unknown>);
    case 'ebay_get_product_compatibilities':
      return await api.metadata.getProductCompatibilities(args.data as Record<string, unknown>);
    case 'ebay_get_sales_tax_jurisdictions':
      return await api.metadata.getSalesTaxJurisdictions(args.countryCode as string);

    // Taxonomy
    case 'ebay_get_default_category_tree_id':
      return await api.taxonomy.getDefaultCategoryTreeId(args.marketplaceId as string);
    case 'ebay_get_category_tree':
      return await api.taxonomy.getCategoryTree(args.categoryTreeId as string);
    case 'ebay_get_category_suggestions':
      return await api.taxonomy.getCategorySuggestions(
        args.categoryTreeId as string,
        args.query as string
      );
    case 'ebay_get_item_aspects_for_category':
      return await api.taxonomy.getItemAspectsForCategory(
        args.categoryTreeId as string,
        args.categoryId as string
      );

    // Communication - Negotiation
    case 'ebay_get_offers_to_buyers': {
      const validated = getOffersToBuyersSchema.parse(args);
      return await api.negotiation.getOffersToBuyers(
        validated.filter,
        validated.limit ? Number(validated.limit) : undefined,
        validated.offset ? Number(validated.offset) : undefined
      );
    }
    case 'ebay_send_offer_to_interested_buyers': {
      const validated = sendOfferToInterestedBuyersSchema.parse(args);
      return await api.negotiation.sendOfferToInterestedBuyers(validated as Record<string, unknown>);
    }
    case 'ebay_find_eligible_items': {
      const validated = findEligibleItemsSchema.parse(args);
      return await api.negotiation.findEligibleItems(
        validated.marketplace_id,
        validated.limit ? Number(validated.limit) : undefined,
        validated.offset ? Number(validated.offset) : undefined
      );
    }

    // Communication - Message
    case 'ebay_search_messages': {
      const validated = getConversationsSchema.parse(args);
      return await api.message.searchMessages(
        undefined,
        validated.limit ? Number(validated.limit) : undefined,
        validated.offset ? Number(validated.offset) : undefined
      );
    }
    case 'ebay_get_message': {
      const validated = getConversationSchema.parse(args);
      return await api.message.getMessage(validated.conversation_id);
    }
    case 'ebay_send_message': {
      const validated = sendMessageSchema.parse(args);
      return await api.message.sendMessage(validated as Record<string, unknown>);
    }
    case 'ebay_reply_to_message': {
      // This is a deprecated method that maps to sendMessage
      // We'll validate with a simple schema
      if (!args.messageId || !args.messageContent) {
        throw new Error('messageId and messageContent are required');
      }
      return await api.message.replyToMessage(
        args.messageId as string,
        args.messageContent as string
      );
    }
    case 'ebay_get_conversations': {
      const validated = getConversationsSchema.parse(args);
      return await api.message.getConversations(
        undefined,
        validated.limit ? Number(validated.limit) : undefined,
        validated.offset ? Number(validated.offset) : undefined
      );
    }
    case 'ebay_get_conversation': {
      const validated = getConversationSchema.parse(args);
      return await api.message.getConversation(validated.conversation_id);
    }
    case 'ebay_bulk_update_conversation': {
      const validated = bulkUpdateConversationSchema.parse(args);
      return await api.message.bulkUpdateConversation(validated as Record<string, unknown>);
    }
    case 'ebay_update_conversation': {
      const validated = updateConversationSchema.parse(args);
      return await api.message.updateConversation(validated as Record<string, unknown>);
    }

    // Communication - Notification
    case 'ebay_get_notification_config': {
      getConfigSchema.parse(args); // Validate empty args
      return await api.notification.getConfig();
    }
    case 'ebay_update_notification_config': {
      const validated = updateConfigSchema.parse(args);
      return await api.notification.updateConfig(validated as Record<string, unknown>);
    }
    case 'ebay_get_notification_destinations':
      return await api.notification.getDestinations(
        args.limit as number | undefined,
        args.continuationToken as string | undefined
      );
    case 'ebay_create_notification_destination': {
      const validated = createDestinationSchema.parse(args);
      return await api.notification.createDestination(validated as Record<string, unknown>);
    }
    case 'ebay_get_notification_destination': {
      const validated = getDestinationSchema.parse(args);
      return await api.notification.getDestination(validated.destination_id);
    }
    case 'ebay_update_notification_destination': {
      const validated = updateDestinationSchema.parse(args);
      return await api.notification.updateDestination(validated.destination_id, validated as Record<string, unknown>);
    }
    case 'ebay_delete_notification_destination': {
      const validated = deleteDestinationSchema.parse(args);
      return await api.notification.deleteDestination(validated.destination_id);
    }
    case 'ebay_get_notification_subscriptions': {
      const validated = getSubscriptionsSchema.parse(args);
      return await api.notification.getSubscriptions(
        validated.limit ? Number(validated.limit) : undefined,
        validated.continuation_token
      );
    }
    case 'ebay_create_notification_subscription': {
      const validated = createSubscriptionSchema.parse(args);
      return await api.notification.createSubscription(validated as Record<string, unknown>);
    }
    case 'ebay_get_notification_subscription': {
      const validated = getSubscriptionSchema.parse(args);
      return await api.notification.getSubscription(validated.subscription_id);
    }
    case 'ebay_update_notification_subscription': {
      const validated = updateSubscriptionSchema.parse(args);
      return await api.notification.updateSubscription(validated.subscription_id, validated as Record<string, unknown>);
    }
    case 'ebay_delete_notification_subscription': {
      const validated = deleteSubscriptionSchema.parse(args);
      return await api.notification.deleteSubscription(validated.subscription_id);
    }
    case 'ebay_disable_notification_subscription': {
      const validated = disableSubscriptionSchema.parse(args);
      return await api.notification.disableSubscription(validated.subscription_id);
    }
    case 'ebay_enable_notification_subscription': {
      const validated = enableSubscriptionSchema.parse(args);
      return await api.notification.enableSubscription(validated.subscription_id);
    }
    case 'ebay_test_notification_subscription': {
      const validated = testSubscriptionSchema.parse(args);
      return await api.notification.testSubscription(validated.subscription_id);
    }
    case 'ebay_get_notification_topic': {
      const validated = getTopicSchema.parse(args);
      return await api.notification.getTopic(validated.topic_id);
    }
    case 'ebay_get_notification_topics': {
      const validated = getTopicsSchema.parse(args);
      return await api.notification.getTopics(
        validated.limit ? Number(validated.limit) : undefined,
        validated.continuation_token
      );
    }
    case 'ebay_create_notification_subscription_filter': {
      const validated = createSubscriptionFilterSchema.parse(args);
      return await api.notification.createSubscriptionFilter(
        validated.subscription_id,
        validated as Record<string, unknown>
      );
    }
    case 'ebay_get_notification_subscription_filter': {
      const validated = getSubscriptionFilterSchema.parse(args);
      return await api.notification.getSubscriptionFilter(
        validated.subscription_id,
        validated.filter_id
      );
    }
    case 'ebay_delete_notification_subscription_filter': {
      const validated = deleteSubscriptionFilterSchema.parse(args);
      return await api.notification.deleteSubscriptionFilter(
        validated.subscription_id,
        validated.filter_id
      );
    }
    case 'ebay_get_notification_public_key': {
      const validated = getPublicKeySchema.parse(args);
      return await api.notification.getPublicKey(validated.public_key_id);
    }

    // Communication - Feedback
    case 'ebay_get_feedback': {
      const validated = getFeedbackSchema.parse(args);
      return await api.feedback.getFeedback(validated.transaction_id ?? '');
    }
    case 'ebay_leave_feedback_for_buyer': {
      const validated = leaveFeedbackForBuyerSchema.parse(args);
      return await api.feedback.leaveFeedbackForBuyer(validated as Record<string, unknown>);
    }
    case 'ebay_get_feedback_summary': {
      getFeedbackRatingSummarySchema.parse(args); // Validate empty args
      return await api.feedback.getFeedbackSummary();
    }
    case 'ebay_get_awaiting_feedback': {
      const validated = getAwaitingFeedbackSchema.parse(args);
      return await api.feedback.getAwaitingFeedback(
        validated.filter,
        validated.limit ? Number(validated.limit) : undefined,
        validated.offset ? Number(validated.offset) : undefined
      );
    }
    case 'ebay_respond_to_feedback': {
      const validated = respondToFeedbackSchema.parse(args);
      return await api.feedback.respondToFeedback(
        validated.feedback_id ?? '',
        validated.response_text ?? ''
      );
    }

    // Other APIs - Identity
    case 'ebay_get_user':
      return await api.identity.getUser();

    // Other APIs - Compliance
    case 'ebay_get_listing_violations':
      return await api.compliance.getListingViolations(
        args.complianceType as string,
        args.offset as number,
        args.limit as number
      );
    case 'ebay_get_listing_violations_summary':
      return await api.compliance.getListingViolationsSummary(args.complianceType as string);
    case 'ebay_suppress_violation':
      return await api.compliance.suppressViolation(args.listingViolationId as string);

    // Other APIs - VERO
    case 'ebay_create_vero_report':
      return await api.vero.createVeroReport(args.reportData as Record<string, unknown>);
    case 'ebay_get_vero_report':
      return await api.vero.getVeroReport(args.veroReportId as string);
    case 'ebay_get_vero_report_items':
      return await api.vero.getVeroReportItems(
        args.filter as string,
        args.limit as number,
        args.offset as number
      );
    case 'ebay_get_vero_reason_code':
      return await api.vero.getVeroReasonCode(args.veroReasonCodeId as string);
    case 'ebay_get_vero_reason_codes':
      return await api.vero.getVeroReasonCodes();

    // Other APIs - Translation
    case 'ebay_translate':
      return await api.translation.translate(
        args.from as string,
        args.to as string,
        args.translationContext as string,
        args.text as string[]
      );

    // Other APIs - eDelivery
    case 'ebay_create_shipping_quote':
      return await api.edelivery.createShippingQuote(
        args.shippingQuoteRequest as Record<string, unknown>
      );
    case 'ebay_get_shipping_quote':
      return await api.edelivery.getShippingQuote(args.shippingQuoteId as string);

    case 'SearchClaudeCodeDocs':
      // Placeholder implementation for SearchClaudeCodeDocs
      return {
        content: [
          {
            type: 'text',
            text: `Tool 'SearchClaudeCodeDocs' called with query: ${args.query}. This tool is not yet fully implemented.`,
          },
        ],
      };

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
