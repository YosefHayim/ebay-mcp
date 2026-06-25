import { describe, expect, it } from 'vitest';
import {
  getToolGatingConfigError,
  resolveToolGatingMode,
  TOOL_FAMILY_KEYS,
} from '@/config/tool-families.js';
import { toolCategories } from '@/tools/categories/index.js';

describe('tool-families', () => {
  describe('TOOL_FAMILY_KEYS', () => {
    it('stays in lock-step with the registry categories (DRY guard)', () => {
      expect([...TOOL_FAMILY_KEYS]).toEqual(toolCategories.map((category) => category.key));
    });
  });

  describe('resolveToolGatingMode', () => {
    it('defaults to "all" when unset', () => {
      expect(resolveToolGatingMode({})).toEqual({ kind: 'all' });
    });

    it('treats "all" (any case) as all', () => {
      expect(resolveToolGatingMode({ EBAY_MCP_TOOLS: 'ALL' })).toEqual({ kind: 'all' });
    });

    it('parses "dynamic"', () => {
      expect(resolveToolGatingMode({ EBAY_MCP_TOOLS: 'dynamic' })).toEqual({ kind: 'dynamic' });
    });

    it('parses a comma list into trimmed, lowercased families', () => {
      expect(resolveToolGatingMode({ EBAY_MCP_TOOLS: ' Inventory , fulfillment ' })).toEqual({
        kind: 'static',
        families: ['inventory', 'fulfillment'],
      });
    });
  });

  describe('getToolGatingConfigError', () => {
    it('accepts unset, all, and dynamic', () => {
      expect(getToolGatingConfigError({})).toBeUndefined();
      expect(getToolGatingConfigError({ EBAY_MCP_TOOLS: 'all' })).toBeUndefined();
      expect(getToolGatingConfigError({ EBAY_MCP_TOOLS: 'dynamic' })).toBeUndefined();
    });

    it('accepts a valid family list', () => {
      expect(getToolGatingConfigError({ EBAY_MCP_TOOLS: 'inventory,fulfillment' })).toBeUndefined();
    });

    it('rejects an unknown family and lists the valid ones', () => {
      const error = getToolGatingConfigError({ EBAY_MCP_TOOLS: 'inventroy,fulfillment' });
      expect(error).toContain('inventroy');
      expect(error).toContain('Valid families');
      expect(error).toContain('inventory');
    });

    it('rejects a value that resolves to no families', () => {
      expect(getToolGatingConfigError({ EBAY_MCP_TOOLS: ' , , ' })).toContain('no tool families');
    });
  });
});
