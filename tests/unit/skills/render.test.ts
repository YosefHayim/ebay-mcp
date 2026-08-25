import { describe, expect, it } from 'vitest';
import {
  buildSkillDoc,
  renderClaudeSkill,
  renderCodexSection,
  renderCursorRule,
  renderSkill,
} from '@/skills/index.js';

const usingDoc = buildSkillDoc('using');

describe('skill rendering', () => {
  it('renders a Claude skill with name/description frontmatter and is deterministic', () => {
    const first = renderClaudeSkill(usingDoc, 'using');
    const second = renderClaudeSkill(usingDoc, 'using');

    expect(first).toBe(second);
    expect(first.startsWith('---\n')).toBe(true);
    expect(first).toContain('name: ebay-mcp-using');
    expect(first).toMatch(/description: ".+"/);
    expect(first).toContain('ebay-mcp:skill:using');
    expect(first).toContain('# Using the eBay MCP tools');
  });

  it('renders a Cursor rule that is agent-requested (alwaysApply false)', () => {
    const rule = renderCursorRule(usingDoc, 'using');

    expect(rule).toContain('alwaysApply: false');
    expect(rule).toMatch(/description: ".+"/);
    expect(rule).toContain('ebay-mcp:skill:using');
  });

  it('renders a Codex section with no frontmatter and a nestable heading', () => {
    const section = renderCodexSection(usingDoc);

    expect(section.startsWith('---')).toBe(false);
    expect(section).toContain('## Using the eBay MCP tools');
  });

  it('injects the live tool count into the body', () => {
    expect(renderCodexSection(usingDoc)).toMatch(/\d+ tools/);
  });

  it('puts category aspect discovery before inventory and offer creation', () => {
    const rendered = renderCodexSection(usingDoc);
    const aspectLookup = rendered.indexOf('`ebay_get_item_aspects_for_category`');
    const inventoryCreation = rendered.indexOf('`ebay_create_or_replace_inventory_item`');
    const offerCreation = rendered.indexOf('`ebay_create_offer`');

    expect(aspectLookup).toBeGreaterThan(-1);
    expect(aspectLookup).toBeLessThan(inventoryCreation);
    expect(aspectLookup).toBeLessThan(offerCreation);
    expect(rendered).toContain('before `ebay_get_listing_fees`');
    expect(rendered).toContain('Requirements vary by category and marketplace');
  });

  it('documents the auction offer flow beside the fixed-price one', () => {
    const rendered = renderCodexSection(usingDoc);
    const fixedPriceFlow = rendered.indexOf('Publish a fixed-price listing');
    const auctionFlow = rendered.indexOf('Run an auction');

    expect(fixedPriceFlow).toBeGreaterThan(-1);
    expect(auctionFlow).toBeGreaterThan(fixedPriceFlow);
    expect(rendered).toContain('`ebay_get_listing_type_policies`');
    expect(rendered).toContain('`pricingSummary.auctionStartPrice`');
  });

  it('dispatches renderSkill by provider', () => {
    expect(renderSkill('claude', usingDoc, 'using')).toBe(renderClaudeSkill(usingDoc, 'using'));
    expect(renderSkill('cursor', usingDoc, 'using')).toBe(renderCursorRule(usingDoc, 'using'));
    expect(renderSkill('codex', usingDoc, 'using')).toBe(renderCodexSection(usingDoc));
  });
});
