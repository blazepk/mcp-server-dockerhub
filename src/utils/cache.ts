import type { DockerHubClient } from '../types/dockerhub.js';
import { CACHE_MAX_SIZE } from '../config/runtime.js';

export function getCached<T = unknown>(client: DockerHubClient, key: string): T | null {
  const cached = client.cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.data;
  if (cached) client.cache.delete(key);
  return null;
}

export function setCache(client: DockerHubClient, key: string, data: any, ttlSeconds = 300): void {
  for (const [k, v] of client.cache) {
    if (v.expires <= Date.now()) client.cache.delete(k);
  }
  while (client.cache.size >= CACHE_MAX_SIZE && client.cache.size > 0) {
    const firstKey = client.cache.keys().next().value as string | undefined;
    if (!firstKey) break;
    client.cache.delete(firstKey);
  }
  client.cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

export function generateCacheKey(...parts: string[]): string {
  return parts.join(':');
}
