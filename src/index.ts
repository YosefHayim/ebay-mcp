#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { EbayClient } from './ebay-client.js';
import { readCredentials } from './environment.js';
import { createServer } from './server.js';

function readPackageVersion(): string {
  const packageUrl = new URL('../package.json', import.meta.url);
  const packageText = readFileSync(packageUrl, 'utf8');
  const packageDocument: unknown = JSON.parse(packageText);

  const isNull = packageDocument == null;
  if (isNull) {
    throw new Error('package.json is not readable');
  }

  const isRecord = typeof packageDocument == 'object';
  if (isRecord == false) {
    throw new Error('package.json is not readable');
  }

  const record = packageDocument as Record<string, unknown>;
  const { version } = record;
  const isVersion = typeof version == 'string';
  if (isVersion == false) {
    throw new Error('package.json has no version');
  }

  return version;
}

function main(): void {
  const version = readPackageVersion();
  const credentials = readCredentials();
  const client = new EbayClient(credentials);

  function createEbayServer() {
    return createServer(version, client);
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
