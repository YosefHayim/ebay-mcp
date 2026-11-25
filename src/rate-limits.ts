import type { McpServer } from '@modelcontextprotocol/server';
import { object } from 'zod';
import type { EbayClient } from './ebay-client.js';
import type { RateLimitsResponse } from './ebay-openapi-types/developer-analytics.js';
import { jsonText } from './tool-text.js';

export function registerRateLimits(server: McpServer, client: EbayClient): void {
  async function getRateLimits() {
    const limits = await client.getJson<RateLimitsResponse>(
      '/developer/analytics/v1_beta/rate_limit/',
      'application',
    );
    return jsonText(limits);
  }

  async function getUserRateLimits() {
    const limits = await client.getJson<RateLimitsResponse>(
      '/developer/analytics/v1_beta/user_rate_limit/',
      'user',
    );
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

  server.registerTool(
    'ebay_get_user_rate_limits',
    {
      description: 'List the rate limits for the signed-in user.',
      inputSchema: object({}),
    },
    getUserRateLimits,
  );
}
