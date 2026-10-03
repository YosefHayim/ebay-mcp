import { inventoryItemSchema } from '@/schemas/inventory-management/inventory.js';
import { describe, expect, it } from 'vitest';

const acceptsInventoryItem = (inventoryItem: unknown): boolean =>
  inventoryItemSchema.safeParse(inventoryItem).success;

describe('inventory item product title', () => {
  it('accepts the 80-character eBay boundary', () => {
    expect(acceptsInventoryItem({ product: { title: 'x'.repeat(80) } })).toBe(true);
  });

  it('rejects a title longer than 80 characters', () => {
    expect(acceptsInventoryItem({ product: { title: 'x'.repeat(81) } })).toBe(false);
  });

  it('keeps the title optional before publish', () => {
    expect(acceptsInventoryItem({ product: { description: 'Draft inventory item' } })).toBe(true);
    expect(acceptsInventoryItem({ condition: 'NEW' })).toBe(true);
  });
});
