import { describe, expect, it, vi } from 'vitest';
import { Effect } from 'effect';
import { getToolDefinitions } from '@/tools/index.js';

const mcpMock = vi.hoisted(() => ({
  close: vi.fn(),
  connect: vi.fn(),
  constructor: vi.fn(),
  registerTool: vi.fn(() => ({ update: vi.fn() })),
  registerResource: vi.fn(),
  getClientCapabilities: vi.fn(() => ({})),
}));

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: vi.fn(function (this: unknown, config) {
    mcpMock.constructor(config);
    // Mirror the McpServer surface the UI bridge touches: `registerResource` for
    // `ui://` views and the underlying `.server` for the capability gate.
    return {
      close: mcpMock.close,
      connect: mcpMock.connect,
      registerTool: mcpMock.registerTool,
      registerResource: mcpMock.registerResource,
      server: {
        oninitialized: undefined,
        getClientCapabilities: mcpMock.getClientCapabilities,
      },
    };
  }),
}));

describe('MCP runtime', () => {
  it('registers the shared tool registry on server construction', async () => {
    const { createEbayMcpRuntime } = await import('@/mcp/runtime.js');
    const api = {
      initialize: vi.fn(() => Effect.succeed(undefined)),
    };

    const runtime = createEbayMcpRuntime({
      api: api as never,
      serverConfig: { name: 'test-mcp', version: '0.0.0' },
    });

    expect(runtime.api).toBe(api);
    expect(mcpMock.constructor).toHaveBeenCalledWith({ name: 'test-mcp', version: '0.0.0' });
    expect(mcpMock.registerTool).toHaveBeenCalledTimes(getToolDefinitions().length);

    await runtime.initializeApi();
    expect(api.initialize).toHaveBeenCalledOnce();
  });
});

describe('formatToolSuccess', () => {
  it('serializes a normal result to a JSON text block', async () => {
    const { formatToolSuccess } = await import('@/mcp/runtime.js');

    const result = formatToolSuccess({ itemId: '12345' });

    expect(result.content[0]?.text).toBe(JSON.stringify({ itemId: '12345' }, null, 2));
  });

  it('maps a 204/undefined body to an explicit success marker', async () => {
    const { formatToolSuccess } = await import('@/mcp/runtime.js');

    // JSON.stringify(undefined) is `undefined` (not a string); the MCP result
    // schema requires text to be a string, so this must become { success: true }.
    const result = formatToolSuccess(undefined);

    expect(result.content[0]?.text).toBe(JSON.stringify({ success: true }, null, 2));
  });
});

describe('formatToolFailure', () => {
  it('surfaces the eBay message, status, and structured details, and flags isError', async () => {
    const { formatToolFailure } = await import('@/mcp/runtime.js');
    const { EbayApiError } = await import('@/api/shared/request.js');

    const error = new EbayApiError({
      method: 'GET',
      path: '/buy/browse/v1/x',
      cause: {
        status: 400,
        data: { errors: [{ errorId: 2004, longMessage: 'Invalid request payload' }] },
      },
    });

    const result = formatToolFailure(error);

    expect(result.isError).toBe(true);
    const payload = JSON.parse(result.content[0]?.text ?? '{}');
    expect(payload.error).toBe('Invalid request payload');
    expect(payload.status).toBe(400);
    expect(payload.details).toEqual([{ errorId: 2004, longMessage: 'Invalid request payload' }]);
  });

  it('omits status and details when the failure carries neither', async () => {
    const { formatToolFailure } = await import('@/mcp/runtime.js');

    const result = formatToolFailure(new Error('boom'));

    const payload = JSON.parse(result.content[0]?.text ?? '{}');
    expect(payload).toEqual({ error: 'boom' });
  });
});
