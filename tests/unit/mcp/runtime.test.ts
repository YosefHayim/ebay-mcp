import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  beforeEach(() => {
    mcpMock.constructor.mockClear();
    mcpMock.registerTool.mockClear();
    mcpMock.close.mockClear();
    mcpMock.connect.mockClear();
    mcpMock.registerResource.mockClear();
    mcpMock.getClientCapabilities.mockClear();
  });

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

  it('formats empty-body success as non-empty MCP text (issue #151)', async () => {
    // JSON.stringify(undefined) is not a string; MCP clients reject that content block.
    expect(JSON.stringify(undefined, null, 2)).toBeUndefined();

    const { createEbayMcpRuntime } = await import('@/mcp/runtime.js');
    const createInventoryLocation = vi.fn(() => Effect.succeed(undefined));
    const api = {
      initialize: vi.fn(() => Effect.succeed(undefined)),
      inventory: { createInventoryLocation },
    };

    createEbayMcpRuntime({
      api: api as never,
      serverConfig: { name: 'test-mcp', version: '0.0.0' },
    });

    const createLocationCall = [...mcpMock.registerTool.mock.calls]
      .reverse()
      .find(([name]) => name === 'ebay_create_inventory_location');
    expect(createLocationCall).toBeDefined();
    const handler = createLocationCall?.[2] as (args: Record<string, unknown>) => Promise<{
      content: Array<{ type: string; text: string }>;
    }>;

    const createLocationResult = await handler({
      merchantLocationKey: 'WH1',
      body: {
        location: {
          address: {
            addressLine1: '1 Main',
            city: 'San Jose',
            stateOrProvince: 'CA',
            postalCode: '95125',
            country: 'US',
          },
        },
      },
    });

    expect(createLocationResult.content).toHaveLength(1);
    expect(createLocationResult.content[0]?.type).toBe('text');
    expect(typeof createLocationResult.content[0]?.text).toBe('string');
    expect(createLocationResult).not.toMatchObject({ isError: true });
    expect(JSON.parse(createLocationResult.content[0]!.text)).toEqual({ status: 'success' });
  });

  it('preserves structured eBay details for a failed registered tool call', async () => {
    const { createEbayMcpRuntime } = await import('@/mcp/runtime.js');
    const { EbayApiError } = await import('@/api/shared/request.js');
    const eBayErrors = [
      {
        errorId: 25_709,
        message: 'Invalid header',
        longMessage: 'Invalid value for header Accept-Language',
        parameters: [{ name: 'Accept-Language', value: '*' }],
      },
    ];
    const createInventoryLocation = vi.fn(() =>
      Effect.fail(
        new EbayApiError({
          method: 'POST',
          path: '/sell/inventory/v1/location/WH1',
          cause: { status: 400, data: { errors: eBayErrors } },
        }),
      ),
    );
    const api = {
      initialize: vi.fn(() => Effect.succeed(undefined)),
      inventory: { createInventoryLocation },
    };

    createEbayMcpRuntime({
      api: api as never,
      serverConfig: { name: 'test-mcp', version: '0.0.0' },
    });

    const createLocationCall = [...mcpMock.registerTool.mock.calls]
      .reverse()
      .find(([name]) => name === 'ebay_create_inventory_location');
    const handler = createLocationCall?.[2] as (args: Record<string, unknown>) => Promise<{
      content: Array<{ type: string; text: string }>;
      isError?: boolean;
    }>;
    const failedCallResult = await handler({ merchantLocationKey: 'WH1', body: {} });
    const parsedError = JSON.parse(failedCallResult.content[0]?.text ?? '{}');

    expect(failedCallResult.isError).toBe(true);
    expect(parsedError).toEqual({
      error: 'Invalid value for header Accept-Language',
      status: 400,
      details: eBayErrors,
    });
  });
});
