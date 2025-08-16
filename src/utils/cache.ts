import type { DockerHubClient } from '../types/dockerhub.js';

export function getCached(client: DockerHubClient, key: string): any | null {
  const cached = client.cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  client.cache.delete(key);
  return null;
}

export function setCache(client: DockerHubClient, key: string, data: any, ttlSeconds = 300): void {
  client.cache.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  });
}

export function generateCacheKey(...parts: string[]): string {
  return parts.join(':');
}
