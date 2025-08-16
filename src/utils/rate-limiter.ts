import { RATE_LIMIT_REQUESTS_PER_MINUTE } from '../config/runtime.js';

export interface RateLimiter {
  allow(key?: string): boolean;
}

interface Bucket { tokens: number; lastRefill: number; }

const buckets: Map<string, Bucket> = new Map();

function refill(bucket: Bucket, ratePerMinute: number, now: number): void {
  const capacity = ratePerMinute;
  const perMs = ratePerMinute / 60000;
  const delta = now - bucket.lastRefill;
  const add = delta * perMs;
  bucket.tokens = Math.min(capacity, bucket.tokens + add);
  bucket.lastRefill = now;
}

export function createRateLimiter(ratePerMinute = RATE_LIMIT_REQUESTS_PER_MINUTE): RateLimiter {
  const capacity = Math.max(1, ratePerMinute);
  return {
    allow(key = 'global') {
      const now = Date.now();
      const b = buckets.get(key) || { tokens: capacity, lastRefill: now };
      refill(b, capacity, now);
      if (b.tokens >= 1) {
        b.tokens -= 1;
        buckets.set(key, b);
        return true;
      }
      buckets.set(key, b);
      return false;
    }
  };
}

