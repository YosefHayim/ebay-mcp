import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../../docs');
const README_PATH = path.resolve(__dirname, '../../docs/sell-apps/README.md');

const getUrlsFromReadme = (content: string): string[] => {
  // Regex to find URLs that end with .json, specifically for OpenAPI specs
  // This assumes the README will directly link to the JSON spec files, but is less strict to allow for variations.
  const urlRegex = /(https:\/\/[^\s)]+\.json)/g;
  const urls = Array.from(content.matchAll(urlRegex)).map((match) => match[1]);
  console.log('Found URLs:', urls);
  return urls;
};

const getSpecUrlsFromHtml = (html: string): string[] => {
  const linkRegex = /<a[^>]*?class="[^"]*\bspec-parent\b[^"]*"[^>]*?href="([^"]+)"/g;
  const matches = [...html.matchAll(linkRegex)];
  const urls = matches.map((match) => match[1]);
  // Filter out duplicates
  return [...new Set(urls)];
};

const getFolderName = (specUrl: string): string => {
  const fileName = path.basename(specUrl);
  // mapping from file name to folder name
  // This mapping is based on the README.md structure and common API groupings
  const folderMap: Record<string, string> = {
    // Application Settings
    'developer_analytics_v1_beta_oas3.json': 'application-settings',
    'developer_key_management_v1_oas3.json': 'application-settings',
    'developer_client_registration_v1_oas3.json': 'application-settings',

    // Selling Apps - Listing Management
    'sell_inventory_v1_oas3.json': 'sell-apps/listing-management',
    'sell_feed_v1_oas3.json': 'sell-apps/listing-management',
    'commerce_media_v1_beta_oas3.json': 'sell-apps/listing-management',
    'sell_stores_v1_oas3.json': 'sell-apps/listing-management',

    // Selling Apps - Listing Metadata & Taxonomy
    'sell_metadata_v1_oas3.json': 'sell-apps/listing-metadata',
    'commerce_taxonomy_v1_oas3.json': 'sell-apps/listing-metadata',
    'commerce_charity_v1_oas3.json': 'sell-apps/listing-metadata',

    // Selling Apps - Account Management
    'sell_account_v1_oas3.json': 'sell-apps/account-management',
    'sell_account_v2_oas3.json': 'sell-apps/account-management',
    'sell_finances_v1_oas3.json': 'sell-apps/account-management',

    // Selling Apps - Communication & Negotiation
    'commerce_message_v1_oas3.json': 'sell-apps/communication',
    'commerce_notification_v1_oas3.json': 'sell-apps/communication',
    'sell_negotiation_v1_oas3.json': 'sell-apps/communication',
    'commerce_feedback_v1_beta_oas3.json': 'sell-apps/communication',

    // Selling Apps - Order Management
    'sell_fulfillment_v1_oas3.json': 'sell-apps/order-management',
    'sell_logistics_v1_oas3.json': 'sell-apps/order-management',

    // Selling Apps - Marketing & Promotions
    'sell_marketing_v1_oas3.json': 'sell-apps/marketing-and-promotions',
    'sell_recommendation_v1_oas3.json': 'sell-apps/marketing-and-promotions',
    'sell_analytics_v1_oas3.json': 'sell-apps/analytics-and-report',

    // Selling Apps - Other Selling APIs
    'commerce_translation_v1_beta_oas3.json': 'sell-apps/other-apis',
    'sell_compliance_v1_oas3.json': 'sell-apps/other-apis',
    'commerce_identity_v1_oas3.json': 'sell-apps/other-apis',
    'sell_edelivery_international_shipping_oas3.json': 'sell-apps/other-apis',
    'commerce_vero_v1_oas3.json': 'sell-apps/other-apis',

    // Buying Apps - Inventory Discovery & Refresh
    'buy_browse_v1_oas3.json': 'buy-apps/inventory-discovery',
    'buy_feed_v1_beta_oas3.json': 'buy-apps/inventory-discovery',
    'buy_feed_v1_oas3.json': 'buy-apps/inventory-discovery',
    // commerce_notification_v1_oas3.json is already mapped under sell-apps,
    // but it's also relevant here. We'll prioritize the first mapping or create a symlink if needed.

    // Buying Apps - Marketing & Discounts
    'buy_deal_v1_oas3.json': 'buy-apps/marketing-and-discounts',
    'buy_marketing_v1_beta_oas3.json': 'buy-apps/marketing-and-discounts',

    // Buying Apps - Marketplace Metadata
    // commerce_taxonomy_v1_oas3.json is already mapped under sell-apps
    'commerce_catalog_v1_beta_oas3.json': 'buy-apps/marketplace-metadata',
    // commerce_charity_v1_oas3.json is already mapped under sell-apps

    // Buying Apps - Checkout & Bidding
    'buy_order_v2_oas3.json': 'buy-apps/checkout-and-bidding',
    'buy_offer_v1_beta_oas3.json': 'buy-apps/checkout-and-bidding',

    // Buying Apps - Other Buying APIs
    // commerce_translation_v1_beta_oas3.json is already mapped under sell-apps
    // commerce_identity_v1_oas3.json is already mapped under sell-apps
  };
  // Default to 'other-apis' if not found in map, or use the mapped folder
  return folderMap[fileName] || 'other-apis';
};

const downloadFile = async (url: string, folderPath: string, fileName: string) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const filePath = path.join(folderPath, fileName);
    fs.mkdirSync(folderPath, { recursive: true });
    fs.writeFileSync(filePath, response.data);
    console.log(`Downloaded ${fileName} to ${folderPath}`);
  } catch (error) {
    console.error(`Failed to download ${url}:`, error);
  }
};

const main = async () => {
  try {
    const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
    const urls = getUrlsFromReadme(readmeContent);

    for (const url of urls) {
      console.log(`Processing URL: ${url}`);
      const fileName = path.basename(url);
      const folderName = getFolderName(url);
      const folderPath = path.join(DOCS_DIR, folderName);
      await downloadFile(url, folderPath, fileName);
    }
  } catch (error) {
    console.error('Failed to read README.md:', error);
  }
};

main();
