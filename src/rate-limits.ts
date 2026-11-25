import type { McpServer } from '@modelcontextprotocol/server';
import { object } from 'zod';
import type { EbayClient } from './ebay-client.js';
import { jsonText } from './tool-text.js';

export function registerRateLimits(server: McpServer, client: EbayClient): void {
  async function getRateLimits() {
    const limits = await client.getJson('/developer/analytics/v1_beta/rate_limit/');
    return jsonText(limits);
  }

  server.registerTool(
    'ebay_get_rate_limits',
    {
      description: 'List the application rate limits for these keys.',
      inputSchema: object({}),
    },
    getRateLimits,
  );
}
