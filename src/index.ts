#!/usr/bin/env node
import process from 'node:process';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { EbayClient } from './ebay-client.js';
import { readCredentials } from './environment.js';
import { createServer } from './server.js';

function main(): void {
  const credentials = readCredentials();
  const client = new EbayClient(credentials);

  function createEbayServer() {
    return createServer(client);
  }

  serveStdio(createEbayServer);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : 'ebay-mcp failed to start';
  console.error(message);
  process.exit(1);
}
