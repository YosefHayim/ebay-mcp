import { describe, expect, it, vi } from 'vitest';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  createToolGatingController,
  registerMetaTools,
  toolNamesInFamilies,
} from '@/mcp/tool-gating.js';
import { toolCategories } from '@/tools/categories/index.js';

/** Minimal RegisteredTool stand-in exposing just the enabled flag the controller toggles. */
function fakeHandle(enabled = false): RegisteredTool {
  const handle = {
    enabled,
    enable() {
      handle.enabled = true;
    },
    disable() {
      handle.enabled = false;
    },
    update: vi.fn(),
    remove: vi.fn(),
  };
  return handle as unknown as RegisteredTool;
}

/** Builds a handle map for every registered tool, as dynamic mode does (all disabled). */
function buildHandles(): Map<string, RegisteredTool> {
  const handles = new Map<string, RegisteredTool>();
  for (const category of toolCategories) {
    for (const entry of category.entries) {
      handles.set(entry.definition.name, fakeHandle(false));
    }
  }
  return handles;
}

const inventory = toolCategories.find((category) => category.key === 'inventory')!;
const sampleTool = inventory.entries[0].definition.name;

describe('toolNamesInFamilies', () => {
  it('returns exactly the tools of the named families', () => {
    const names = toolNamesInFamilies(['inventory']);
    expect(names.size).toBe(inventory.entries.length);
    expect(names.has(sampleTool)).toBe(true);
  });

  it('ignores unknown families', () => {
    expect(toolNamesInFamilies(['nope']).size).toBe(0);
  });
});

describe('ToolGatingController', () => {
  describe('list', () => {
    it('returns the family overview with no arguments', () => {
      const controller = createToolGatingController(buildHandles());
      const result = controller.list({}) as {
        families: { key: string; count: number }[];
      };
      expect(result.families).toHaveLength(toolCategories.length);
      const inventoryRow = result.families.find((row) => row.key === 'inventory');
      expect(inventoryRow?.count).toBe(inventory.entries.length);
    });

    it('lists the tools of a family', () => {
      const controller = createToolGatingController(buildHandles());
      const result = controller.list({ family: 'inventory' }) as {
        tools: { name: string; family: string }[];
        total: number;
      };
      expect(result.total).toBe(inventory.entries.length);
      expect(result.tools.every((tool) => tool.family === 'inventory')).toBe(true);
    });

    it('rejects an unknown family with the valid list', () => {
      const controller = createToolGatingController(buildHandles());
      const result = controller.list({ family: 'nope' }) as {
        error: string;
        validFamilies: readonly string[];
      };
      expect(result.error).toContain('nope');
      expect(result.validFamilies).toContain('inventory');
    });

    it('keyword-searches across all tools by name', () => {
      const controller = createToolGatingController(buildHandles());
      const result = controller.list({ query: sampleTool.toLowerCase() }) as {
        tools: { name: string }[];
      };
      expect(result.tools.some((tool) => tool.name === sampleTool)).toBe(true);
    });

    it('paginates with an opaque cursor', () => {
      const controller = createToolGatingController(buildHandles());
      const first = controller.list({ family: 'inventory', limit: 2 }) as {
        tools: { name: string }[];
        nextCursor?: string;
      };
      expect(first.tools).toHaveLength(2);
      expect(first.nextCursor).toBeDefined();

      const second = controller.list({
        family: 'inventory',
        limit: 2,
        cursor: first.nextCursor,
      }) as {
        tools: { name: string }[];
      };
      expect(second.tools[0].name).not.toBe(first.tools[0].name);
    });
  });

  describe('enable / disable', () => {
    it('enables a known tool and reports the active count', () => {
      const handles = buildHandles();
      const controller = createToolGatingController(handles);
      const result = controller.enable([sampleTool]);
      expect(result.enabled).toEqual([sampleTool]);
      expect(result.unknown).toEqual([]);
      expect(result.activeCount).toBe(1);
      expect(handles.get(sampleTool)?.enabled).toBe(true);
    });

    it('soft-fails unknown names instead of throwing', () => {
      const controller = createToolGatingController(buildHandles());
      const result = controller.enable([sampleTool, 'made-up-tool']);
      expect(result.enabled).toEqual([sampleTool]);
      expect(result.unknown).toEqual(['made-up-tool']);
    });

    it('disables a previously enabled tool', () => {
      const handles = buildHandles();
      const controller = createToolGatingController(handles);
      controller.enable([sampleTool]);
      const result = controller.disable([sampleTool]);
      expect(result.disabled).toEqual([sampleTool]);
      expect(result.activeCount).toBe(0);
      expect(handles.get(sampleTool)?.enabled).toBe(false);
    });
  });
});

describe('registerMetaTools', () => {
  it('registers exactly the three discovery tools', () => {
    const registerTool = vi.fn<(name: string, config: unknown, handler: unknown) => void>();
    const server = { registerTool } as never;
    registerMetaTools(server, createToolGatingController(buildHandles()));

    const names = registerTool.mock.calls.map((call) => call[0]);
    expect(names).toEqual(['list_ebay_tools', 'enable_ebay_tools', 'disable_ebay_tools']);
  });

  it('wires each meta-tool handler to the controller', () => {
    const registerTool = vi.fn<(name: string, config: unknown, handler: unknown) => void>();
    const server = { registerTool } as never;
    const handles = buildHandles();
    registerMetaTools(server, createToolGatingController(handles));

    const enableCall = registerTool.mock.calls.find((call) => call[0] === 'enable_ebay_tools')!;
    const handler = enableCall[2] as (args: { names: string[] }) => { content: { text: string }[] };
    const result = handler({ names: [sampleTool] });
    expect(handles.get(sampleTool)?.enabled).toBe(true);
    expect(result.content[0].text).toContain(sampleTool);
  });
});
