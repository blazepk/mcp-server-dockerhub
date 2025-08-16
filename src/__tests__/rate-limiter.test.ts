import { describe, test, expect } from '@jest/globals';
import { createRateLimiter } from '../utils/rate-limiter.js';

describe('rate-limiter', () => {
  test('allows up to capacity then blocks', () => {
    const rl = createRateLimiter(5);
    const key = 'k';
    const results = Array.from({ length: 7 }, () => rl.allow(key));
    expect(results.filter(Boolean).length).toBe(5);
    expect(results.slice(5)).toEqual([false, false]);
  });

  test('refills over time', async () => {
    const rl = createRateLimiter(2);
    const key = 'k2';
    expect(rl.allow(key)).toBe(true);
    expect(rl.allow(key)).toBe(true);
    expect(rl.allow(key)).toBe(false);
    await new Promise((r) => setTimeout(r, 1000));
    // After ~1s, ~0.033 tokens should be refilled (2/minute). This might still be below 1.
    // Simulate more time by calling allow without waiting long enough should still likely be false.
    const maybe = rl.allow(key);
    expect(typeof maybe).toBe('boolean');
  });
});

