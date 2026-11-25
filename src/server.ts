import { McpServer } from '@modelcontextprotocol/server';
import { object } from 'zod';
import type { EbayClient } from './ebay-client.js';
import { registerInventory } from './inventory.js';
import { registerRateLimits } from './rate-limits.js';
import { textContent } from './tool-text.js';

export function createServer(version: string, client: EbayClient): McpServer {
  const server = new McpServer({ name: 'ebay', version });

  function ping() {
    return textContent('ebay-mcp');
  }

  server.registerTool(
    'ebay_ping',
    {
      description: 'Check that the server is connected.',
      inputSchema: object({}),
    },
    ping,
  );

  registerRateLimits(server, client);
  registerInventory(server, client);

  return server;
}
