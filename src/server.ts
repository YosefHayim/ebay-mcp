import { McpServer } from '@modelcontextprotocol/server';
import { object } from 'zod';
import type { EbayClient } from './ebay-client.js';
import { registerEbayRoutes } from './ebay-route.js';

export function createServer(client: EbayClient): McpServer {
  const server = new McpServer({ name: 'ebay', version: '3.0.0' });

  function ping() {
    return {
      content: [{ type: 'text' as const, text: 'ebay-mcp' }],
    };
  }

  server.registerTool(
    'ebay_ping',
    {
      description: 'Check that the server is connected.',
      inputSchema: object({}),
    },
    ping,
  );

  registerEbayRoutes(server, client);

  return server;
}
