import { BUY_IT_NOW_MIN_RATIO, meetsBuyItNowMargin } from '@/api/shared/auctionPricing.js';
import { describe, expect, it } from 'vitest';

describe('meetsBuyItNowMargin', () => {
  it('accepts exactly 30% above the opening bid', () => {
    expect(BUY_IT_NOW_MIN_RATIO).toBe(1.3);
    expect(meetsBuyItNowMargin(10, 13)).toBe(true);
    expect(meetsBuyItNowMargin(9.99, 12.99)).toBe(true);
    expect(meetsBuyItNowMargin(0.99, 1.29)).toBe(true);
  });

  it('rejects anything below the margin, including equal prices', () => {
    expect(meetsBuyItNowMargin(10, 12.99)).toBe(false);
    expect(meetsBuyItNowMargin(9.99, 12.98)).toBe(false);
    expect(meetsBuyItNowMargin(10, 10)).toBe(false);
    expect(meetsBuyItNowMargin(10, 8)).toBe(false);
  });
});
