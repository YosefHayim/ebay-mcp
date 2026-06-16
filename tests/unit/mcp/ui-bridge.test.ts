import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXTENSION_ID, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { describe, expect, it } from 'vitest';
import {
  buildUiToolResult,
  findRepoRoot,
  resolveBuiltUiDir,
  resolveUiEnabled,
  summarizeView,
} from '@/mcp/ui-bridge.js';
import type { ResolvedToolUi } from '@/tools/registry.js';
import type {
  CardViewModel,
  ChartViewModel,
  TableViewModel,
} from '@/tools/ui/view-models.js';

/** Client capabilities advertising MCP Apps support for the given MIME types. */
function uiCapabilities(mimeTypes: string[]): Record<string, unknown> {
  return { extensions: { [EXTENSION_ID]: { mimeTypes } } };
}

describe('resolveUiEnabled', () => {
  it('enables UI when the client advertises the MCP Apps MIME type', () => {
    expect(resolveUiEnabled(uiCapabilities([RESOURCE_MIME_TYPE]), {})).toBe(true);
  });

  it('stays disabled when the client lacks the MCP Apps capability', () => {
    expect(resolveUiEnabled({}, {})).toBe(false);
    expect(resolveUiEnabled(uiCapabilities(['text/plain']), {})).toBe(false);
  });

  it('is force-disabled by the EBAY_MCP_UI=off kill-switch even when supported', () => {
    expect(resolveUiEnabled(uiCapabilities([RESOURCE_MIME_TYPE]), { EBAY_MCP_UI: 'off' })).toBe(
      false
    );
  });
});

describe('summarizeView', () => {
  it('summarizes a table by row count and footnote', () => {
    const view: TableViewModel = {
      archetype: 'table',
      title: 'Orders',
      columns: [{ key: 'orderId', label: 'Order' }],
      rows: [
        { id: 'a', cells: { orderId: 'a' } },
        { id: 'b', cells: { orderId: 'b' } },
      ],
      footnote: 'Showing 2 of 240',
    };
    expect(summarizeView(view)).toBe(
      'Orders: 2 rows — Showing 2 of 240. Rendered as an interactive table.'
    );
  });

  it('summarizes a card by field count', () => {
    const view: CardViewModel = {
      archetype: 'card',
      title: 'Order 1',
      subtitle: 'Buyer: buyer1',
      sections: [{ heading: 'Summary', fields: [{ label: 'Total', value: '1.00 USD' }] }],
    };
    expect(summarizeView(view)).toBe(
      'Order 1 — Buyer: buyer1: 1 field. Rendered as an interactive detail card.'
    );
  });

  it('summarizes a chart by series and point counts', () => {
    const view: ChartViewModel = {
      archetype: 'chart',
      title: 'Traffic report',
      kind: 'line',
      series: [{ name: 'Views', points: [{ x: 'd1', y: 1 }, { x: 'd2', y: 2 }] }],
    };
    expect(summarizeView(view)).toBe(
      'Traffic report (line): 1 series, 2 points. Rendered as an interactive chart.'
    );
  });
});

describe('buildUiToolResult', () => {
  it('projects a result into a summary line, structuredContent, and resource meta', () => {
    const ui: ResolvedToolUi = {
      archetype: 'card',
      resourceUri: 'ui://ebay/card.html',
      map: () => ({
        archetype: 'card',
        title: 'Order 1',
        sections: [{ fields: [{ label: 'Total', value: '1.00 USD' }] }],
      }),
    };

    const result = buildUiToolResult(ui, { orderId: '1' });

    expect(result.content).toEqual([
      { type: 'text', text: 'Order 1: 1 field. Rendered as an interactive detail card.' },
    ]);
    expect(result.structuredContent).toMatchObject({ archetype: 'card', title: 'Order 1' });
    expect(result._meta).toEqual({ ui: { resourceUri: 'ui://ebay/card.html' } });
  });
});

describe('repo-root resolution', () => {
  it('walks up to the directory containing package.json', () => {
    const here = fileURLToPath(import.meta.url);
    const root = findRepoRoot(here);
    expect(root).toBeDefined();
    expect(root && resolveBuiltUiDir(import.meta.url)).toBe(join(root!, 'build', 'ui'));
  });

  it('returns undefined when no package.json is found above the start dir', () => {
    expect(findRepoRoot('/')).toBeUndefined();
  });
});
