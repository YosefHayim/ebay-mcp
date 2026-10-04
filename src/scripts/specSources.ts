/**
 * Official eBay OpenAPI specs that `pnpm sync` downloads into the local spec cache.
 *
 * Each spec lands in `.cache/ebay-specs/<folder>/`, and its generated types land in
 * `src/types/<folder>/`, so `folder` must match the existing generated-type layout.
 */

/** One eBay OpenAPI spec that `pnpm sync` downloads and generates types from. */
export interface SpecSource {
  /** eBay API name shown in sync output. */
  readonly api: string;
  /** Folder under the spec cache, mirrored under `src/types/`. */
  readonly folder: string;
  /** Official OpenAPI 3 JSON download URL. */
  readonly url: string;
}

/** Every spec `pnpm sync` downloads, grouped the same way as `src/types/`. */
export const specSources: readonly SpecSource[] = [
  {
    api: 'Developer Analytics API',
    folder: 'application-settings',
    url: 'https://developer.ebay.com/api-docs/master/developer/analytics/openapi/3/developer_analytics_v1_beta_oas3.json',
  },
  {
    api: 'Key Management API',
    folder: 'application-settings',
    url: 'https://developer.ebay.com/api-docs/master/developer/key-management/openapi/3/developer_key_management_v1_oas3.json',
  },
  {
    api: 'Client Registration API',
    folder: 'application-settings',
    url: 'https://developer.ebay.com/api-docs/master/developer/client-registration/openapi/3/developer_client_registration_v1_oas3.json',
  },
  {
    api: 'Inventory API',
    folder: 'sell-apps/listing-management',
    url: 'https://developer.ebay.com/api-docs/master/sell/inventory/openapi/3/sell_inventory_v1_oas3.json',
  },
  {
    api: 'Feed API',
    folder: 'sell-apps/listing-management',
    url: 'https://developer.ebay.com/api-docs/master/sell/feed/openapi/3/sell_feed_v1_oas3.json',
  },
  {
    api: 'Media API',
    folder: 'sell-apps/listing-management',
    url: 'https://developer.ebay.com/api-docs/master/commerce/media/openapi/3/commerce_media_v1_beta_oas3.json',
  },
  {
    api: 'Stores API',
    folder: 'sell-apps/listing-management',
    url: 'https://developer.ebay.com/api-docs/master/sell/stores/openapi/3/sell_stores_v1_oas3.json',
  },
  {
    api: 'Metadata API',
    folder: 'sell-apps/listing-metadata',
    url: 'https://developer.ebay.com/api-docs/master/sell/metadata/openapi/3/sell_metadata_v1_oas3.json',
  },
  {
    api: 'Taxonomy API',
    folder: 'sell-apps/listing-metadata',
    url: 'https://developer.ebay.com/api-docs/master/commerce/taxonomy/openapi/3/commerce_taxonomy_v1_oas3.json',
  },
  {
    api: 'Charity API',
    folder: 'sell-apps/listing-metadata',
    url: 'https://developer.ebay.com/api-docs/master/commerce/charity/openapi/3/commerce_charity_v1_oas3.json',
  },
  {
    api: 'Account API (v1)',
    folder: 'sell-apps/account-management',
    url: 'https://developer.ebay.com/api-docs/master/sell/account/openapi/3/sell_account_v1_oas3.json',
  },
  {
    api: 'Account API (v2)',
    folder: 'sell-apps/account-management',
    url: 'https://developer.ebay.com/api-docs/master/sell/account/v2/openapi/3/sell_account_v2_oas3.json',
  },
  {
    api: 'Finances API',
    folder: 'sell-apps/account-management',
    url: 'https://developer.ebay.com/api-docs/master/sell/finances/openapi/3/sell_finances_v1_oas3.json',
  },
  {
    api: 'Message API',
    folder: 'sell-apps/communication',
    url: 'https://developer.ebay.com/api-docs/master/commerce/message/openapi/3/commerce_message_v1_oas3.json',
  },
  {
    api: 'Notification API',
    folder: 'sell-apps/communication',
    url: 'https://developer.ebay.com/api-docs/master/commerce/notification/openapi/3/commerce_notification_v1_oas3.json',
  },
  {
    api: 'Negotiation API',
    folder: 'sell-apps/communication',
    url: 'https://developer.ebay.com/api-docs/master/sell/negotiation/openapi/3/sell_negotiation_v1_oas3.json',
  },
  {
    api: 'Feedback API',
    folder: 'sell-apps/communication',
    url: 'https://developer.ebay.com/api-docs/master/commerce/feedback/openapi/3/commerce_feedback_v1_beta_oas3.json',
  },
  {
    api: 'Fulfillment API',
    folder: 'sell-apps/order-management',
    url: 'https://developer.ebay.com/api-docs/master/sell/fulfillment/openapi/3/sell_fulfillment_v1_oas3.json',
  },
  {
    api: 'Logistics API',
    folder: 'sell-apps/order-management',
    url: 'https://developer.ebay.com/api-docs/master/sell/logistics/openapi/3/sell_logistics_v1_oas3.json',
  },
  {
    api: 'Marketing API',
    folder: 'sell-apps/marketing-and-promotions',
    url: 'https://developer.ebay.com/api-docs/master/sell/marketing/openapi/3/sell_marketing_v1_oas3.json',
  },
  {
    api: 'Recommendation API',
    folder: 'sell-apps/marketing-and-promotions',
    url: 'https://developer.ebay.com/api-docs/master/sell/recommendation/openapi/3/sell_recommendation_v1_oas3.json',
  },
  {
    api: 'Analytics API',
    folder: 'sell-apps/analytics-and-report',
    url: 'https://developer.ebay.com/api-docs/master/sell/analytics/openapi/3/sell_analytics_v1_oas3.json',
  },
  {
    api: 'Translation API',
    folder: 'sell-apps/other-apis',
    url: 'https://developer.ebay.com/api-docs/master/commerce/translation/openapi/3/commerce_translation_v1_beta_oas3.json',
  },
  {
    api: 'Compliance API',
    folder: 'sell-apps/other-apis',
    url: 'https://developer.ebay.com/api-docs/master/sell/compliance/openapi/3/sell_compliance_v1_oas3.json',
  },
  {
    api: 'Identity API',
    folder: 'sell-apps/other-apis',
    url: 'https://developer.ebay.com/api-docs/master/commerce/identity/openapi/3/commerce_identity_v1_oas3.json',
  },
  {
    api: 'eDelivery International Shipping API',
    folder: 'sell-apps/other-apis',
    url: 'https://developer.ebay.com/api-docs/master/sell/edelivery_international_shipping/openapi/3/sell_edelivery_international_shipping_oas3.json',
  },
  {
    api: 'Vero API',
    folder: 'sell-apps/other-apis',
    url: 'https://developer.ebay.com/api-docs/master/commerce/vero/openapi/3/commerce_vero_v1_oas3.json',
  },
];
