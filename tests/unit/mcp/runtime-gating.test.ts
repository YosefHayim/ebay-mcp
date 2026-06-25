import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getToolDefinitions } from '@/tools/index.js';
import { toolCategories } from '@/tools/categories/index.js';

/**
 * Exercises the EBAY_MCP_TOOLS gating in createEbayMcpRuntime by mocking McpServer
 * and capturing every registered tool handle, so we can assert which tools are
 * registered and whether dynamic mode disables them at boot.
 */
const mcpMock = vi.hoisted(() => {
  interface Handle {
    name: string;
    enabled: boolean;
    enable(): void;
    disable(): void;
    update: ReturnType<typeof vi.fn>;
  }
  const state: { handles: Handle[]; constructorArgs: unknown[][] } = {
    handles: [],
    constructorArgs: [],
  };
  return {
    state,
    registerTool: vi.fn((name: string) => {
      const handle: Handle = {
        name,
        enabled: true,
        enable() {
          handle.enabled = true;
        },
        disable() {
          handle.enabled = false;
        },
        update: vi.fn(),
      };
      state.handles.push(handle);
      return handle;
    }),
    registerResource: vi.fn(),
    connect: vi.fn(),
    close: vi.fn(),
    getClientCapabilities: vi.fn(() => ({})),
  };
});

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: vi.fn(function (serverInfo: unknown, options: unknown) {
    mcpMock.state.constructorArgs.push([serverInfo, options]);
    return {
      registerTool: mcpMock.registerTool,
      registerResource: mcpMock.registerResource,
      connect: mcpMock.connect,
      close: mcpMock.close,
      server: {
        oninitialized: undefined,
        getClientCapabilities: mcpMock.getClientCapabilities,
      },
    };
  }),
}));

const fakeApi = { initialize: vi.fn() } as never;
const serverConfig = { name: 'test-mcp', version: '0.0.0' };
const inventoryCount = toolCategories.find((category) => category.key === 'inventory')!.entries
  .length;
const META_TOOL_NAMES = ['list_ebay_tools', 'enable_ebay_tools', 'disable_ebay_tools'];

describe('createEbayMcpRuntime — tool gating', () => {
  beforeEach(() => {
    // Stub only the gating key (not the whole process.env object) so dotenv-injected
    // config from other modules survives across tests in the same worker.
    vi.stubEnv('EBAY_MCP_TOOLS', undefined);
    vi.clearAllMocks();
    mcpMock.state.handles = [];
    mcpMock.state.constructorArgs = [];
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('registers the full catalogue and no meta-tools by default', async () => {
    const { createEbayMcpRuntime } = await import('@/mcp/runtime.js');
    createEbayMcpRuntime({ api: fakeApi, serverConfig });

    expect(mcpMock.registerTool).toHaveBeenCalledTimes(getToolDefinitions().length);
    expect(mcpMock.state.handles.every((handle) => handle.enabled)).toBe(true);
    expect(mcpMock.state.constructorArgs[0]).toEqual([serverConfig, undefined]);
  });

  it('dynamic mode advertises only the 3 discovery tools and disables the rest', async () => {
    vi.stubEnv('EBAY_MCP_TOOLS', 'dynamic');
    const { createEbayMcpRuntime } = await import('@/mcp/runtime.js');
    createEbayMcpRuntime({ api: fakeApi, serverConfig });

    const total = getToolDefinitions().length;
    expect(mcpMock.registerTool).toHaveBeenCalledTimes(total + META_TOOL_NAMES.length);

    // Classify by name, not registration order, so a registration-order refactor
    // that preserves behavior does not break this test.
    const metaNames = new Set(META_TOOL_NAMES);
    const ebayHandles = mcpMock.state.handles.filter((handle) => !metaNames.has(handle.name));
    const metaHandles = mcpMock.state.handles.filter((handle) => metaNames.has(handle.name));
    expect(ebayHandles).toHaveLength(total);
    expect(ebayHandles.every((handle) => !handle.enabled)).toBe(true);
    expect(metaHandles.map((handle) => handle.name).sort()).toEqual([...META_TOOL_NAMES].sort());
    expect(metaHandles.every((handle) => handle.enabled)).toBe(true);

    const [, options] = mcpMock.state.constructorArgs[0] as [unknown, { instructions?: string }];
    expect(options.instructions).toContain('list_ebay_tools');
  });

  it('static mode registers only the named families, frozen', async () => {
    vi.stubEnv('EBAY_MCP_TOOLS', 'inventory');
    const { createEbayMcpRuntime } = await import('@/mcp/runtime.js');
    createEbayMcpRuntime({ api: fakeApi, serverConfig });

    expect(mcpMock.registerTool).toHaveBeenCalledTimes(inventoryCount);
    expect(mcpMock.state.handles.every((handle) => handle.enabled)).toBe(true);
    expect(mcpMock.state.constructorArgs[0]).toEqual([serverConfig, undefined]);
  });
});
