
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
  const urlRegex = /(https:\/\/developer\.ebay\.com[^\s)]+)/g;
  const matches = content.match(urlRegex);
  const urls = matches ? Array.from(new Set(matches)) : [];
  console.log('Found URLs:', urls);
  return urls;
};

const getSpecUrlFromHtml = (html: string): string | null => {
  const linkRegex = /<a[^>]*?class="spec-parent"[^>]*?href="([^"]+)"[^>]*?>/g;
  const match = linkRegex.exec(html);
  return match ? match[1] : null;
};

const getFolderName = (specUrl: string): string => {
  const parts = specUrl.split('/');
  const fileName = parts[parts.length - 1];
  // mapping from file name to folder name
  const folderMap: { [key: string]: string } = {
    'sell_account_v1_oas3.json': 'sell-apps/account-management',
    'sell_analytics_v1_oas3.json': 'sell-apps/analytics-and-report',
    'commerce_feedback_v1_beta_oas3.json': 'sell-apps/communication',
    'commerce_message_v1_oas3.json': 'sell-apps/communication',
    'commerce_notification_v1_oas3.json': 'sell-apps/communication',
    'sell_negotiation_v1_oas3.json': 'sell-apps/communication',
    'sell_inventory_v1_oas3.json': 'sell-apps/listing-management',
    'sell_metadata_v1_oas3.json': 'sell-apps/listing-metadata',
    'sell_marketing_v1_oas3.json': 'sell-apps/markeitng-and-promotions',
    'sell_recommendation_v1_oas3.json': 'sell-apps/markeitng-and-promotions',
    'sell_fulfillment_v1_oas3.json': 'sell-apps/order-management',
    'commerce_identity_v1_oas3.json': 'sell-apps/other-apis',
    'commerce_translation_v1_beta_oas3.json': 'sell-apps/other-apis',
    'commerce_vero_v1_oas3.json': 'sell-apps/other-apis',
    'sell_compliance_v1_oas3.json': 'sell-apps/other-apis',
    'sell_edelivery_international_shipping_oas3.json': 'sell-apps/other-apis',
  };
  return folderMap[fileName] || 'sell-apps/other-apis';
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
      try {
        const response = await axios.get(url);
        const html = response.data;
        fs.writeFileSync('debug.html', html);
        console.log('HTML content saved to debug.html');
        const specUrl = getSpecUrlFromHtml(html);

        if (specUrl) {
          console.log(`Found spec URL: ${specUrl}`);
          const fullSpecUrl = new URL(specUrl, url).href;
          const fileName = path.basename(specUrl);
          const folderName = getFolderName(specUrl);
          const folderPath = path.join(DOCS_DIR, folderName);
          await downloadFile(fullSpecUrl, folderPath, fileName);
        } else {
          console.log(`No spec URL found for: ${url}`);
        }
      } catch (error) {
        console.error(`Failed to process ${url}:`, error);
      }
      return; // Exit after first URL for debugging
    }
  } catch (error) {
    console.error('Failed to read README.md:', error);
  }
};

main();
