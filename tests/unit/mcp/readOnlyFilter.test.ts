import { describe, expect, it } from 'vitest';
import {
  isReadOnlyModeEnabled,
  isReadOnlyTool,
  type ReadOnlyToolDefinition,
} from '@/mcp/readOnlyFilter.js';
import { getToolDefinitions } from '@/tools/index.js';

describe('isReadOnlyModeEnabled', () => {
  it.each([
    ['true', true],
    ['TRUE', true],
    [' True ', true],
    ['1', true],
    ['yes', true],
    ['YES', true],
    ['false', false],
    ['0', false],
    ['no', false],
    ['', false],
    [undefined, false],
  ] as const)('EBAY_READ_ONLY=%j → %s', (raw, expected) => {
    const env: NodeJS.ProcessEnv = raw === undefined ? {} : { EBAY_READ_ONLY: raw as string };
    expect(isReadOnlyModeEnabled(env)).toBe(expected);
  });
});

describe('isReadOnlyTool', () => {
  const def = (
    name: string,
    annotations?: ReadOnlyToolDefinition['annotations'],
  ): ReadOnlyToolDefinition => ({ name, annotations });

  it('honors readOnlyHint=true over name heuristics', () => {
    expect(isReadOnlyTool(def('ebay_create_campaign', { readOnlyHint: true }))).toBe(true);
  });

  it('honors readOnlyHint=false over name heuristics', () => {
    expect(isReadOnlyTool(def('ebay_get_campaigns', { readOnlyHint: false }))).toBe(false);
  });

  it('treats destructiveHint=true as non-read-only when readOnlyHint is unset', () => {
    expect(isReadOnlyTool(def('ebay_mystery_action', { destructiveHint: true }))).toBe(false);
  });

  it.each([
    'ebay_get_orders',
    'ebay_get_inventory_item',
    'ebay_list_something',
    'ebay_find_campaign_by_ad_reference',
    'ebay_fetch_payment_dispute_evidence_content',
    'ebay_get_api_status',
    'ebay_bulk_get_inventory_item',
    'ebay_get_offer',
    'ebay_get_offers',
    'search',
    'fetch',
  ])('classifies read-oriented name %s as read-only', (name) => {
    expect(isReadOnlyTool(def(name))).toBe(true);
  });

  it.each([
    'ebay_create_offer',
    'ebay_update_offer',
    'ebay_delete_offer',
    'ebay_publish_offer',
    'ebay_withdraw_offer',
    'ebay_issue_refund',
    'ebay_accept_payment_dispute',
    'ebay_contest_payment_dispute',
    'ebay_send_message',
    'ebay_set_user_tokens',
    'ebay_enable_inventory_location',
    'ebay_disable_inventory_location',
    'ebay_create_or_replace_inventory_item',
    'ebay_bulk_create_offer',
    'ebay_bulk_update_price_quantity',
    'ebay_pause_campaign',
    'ebay_resume_campaign',
    'ebay_launch_campaign',
    'ebay_clone_campaign',
    'ebay_end_listing',
    'ebay_relist_item',
    'ebay_revise_listing',
    'ebay_cancel_package',
    'ebay_confirm_package',
    'ebay_upload_payment_dispute_evidence_file',
  ])('classifies write-oriented name %s as not read-only', (name) => {
    expect(isReadOnlyTool(def(name))).toBe(false);
  });

  it('defaults unknown names to not read-only (safer)', () => {
    expect(isReadOnlyTool(def('ebay_suggest_bids'))).toBe(false);
    expect(isReadOnlyTool(def('ebay_translate'))).toBe(false);
    expect(isReadOnlyTool(def('ebay_clear_tokens'))).toBe(false);
    expect(isReadOnlyTool(def('ebay_refresh_access_token'))).toBe(false);
    expect(isReadOnlyTool(def('ebay_setup_quick_campaign'))).toBe(false);
  });

  it('does not false-positive on markdown / setup substrings', () => {
    expect(isReadOnlyTool(def('ebay_get_item_price_markdown_promotion'))).toBe(true);
  });
});

describe('isReadOnlyTool against full registry', () => {
  it('keeps every annotated readOnlyHint=true tool', () => {
    const annotatedReadOnly = getToolDefinitions().filter(
      (definition) => definition.annotations?.readOnlyHint === true,
    );
    expect(annotatedReadOnly.length).toBeGreaterThan(0);
    for (const definition of annotatedReadOnly) {
      expect(isReadOnlyTool(definition)).toBe(true);
    }
  });

  it('excludes every annotated readOnlyHint=false tool', () => {
    const annotatedWrite = getToolDefinitions().filter(
      (definition) => definition.annotations?.readOnlyHint === false,
    );
    expect(annotatedWrite.length).toBeGreaterThan(0);
    for (const definition of annotatedWrite) {
      expect(isReadOnlyTool(definition)).toBe(false);
    }
  });

  it('never classifies create_/delete_/update_ tools as read-only without a true hint', () => {
    const suspects = getToolDefinitions().filter((definition) =>
      /_(create|delete|update)_/.test(definition.name),
    );
    for (const definition of suspects) {
      if (definition.annotations?.readOnlyHint === true) continue;
      expect(isReadOnlyTool(definition), definition.name).toBe(false);
    }
  });
});
