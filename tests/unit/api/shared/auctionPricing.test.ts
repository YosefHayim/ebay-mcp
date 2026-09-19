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

  it('rounds the required margin up to the next representable cent', () => {
    // 30% above $0.01 is $0.013, which cannot be listed; $0.02 is the first
    // price that clears the rule, so the equal-price case must stay rejected.
    expect(meetsBuyItNowMargin(0.01, 0.01)).toBe(false);
    expect(meetsBuyItNowMargin(0.01, 0.02)).toBe(true);
    expect(meetsBuyItNowMargin(0.05, 0.06)).toBe(false);
    expect(meetsBuyItNowMargin(0.05, 0.07)).toBe(true);
  });
});
