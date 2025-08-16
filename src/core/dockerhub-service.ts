import * as api from '../api/dockerhub-client.js';
import * as cache from '../utils/cache.js';
import * as formatters from '../utils/formatters.js';
import type { DockerHubClient } from '../types/dockerhub.js';

export async function searchImagesWithCache(
  client: DockerHubClient,
  query: string,
  limit = 25,
  page = 1,
  isOfficial?: boolean,
  isAutomated?: boolean
): Promise<any> {
  const cacheKey = cache.generateCacheKey('search', query, limit.toString(), page.toString(), String(isOfficial), String(isAutomated));
  
  const cached = cache.getCached(client, cacheKey);
  if (cached) return cached;

  const result = await api.searchImages(client, query, limit, page, isOfficial, isAutomated);
  const formatted = formatters.formatSearchResults(result);
  
  cache.setCache(client, cacheKey, formatted, 300);
  return formatted;
}

export async function getRepositoryInfoWithCache(client: DockerHubClient, repository: string): Promise<any> {
  const cacheKey = cache.generateCacheKey('repo', repository);
  
  const cached = cache.getCached(client, cacheKey);
  if (cached) return cached;

  const result = await api.getRepositoryInfo(client, repository);
  cache.setCache(client, cacheKey, result, 900);
  return result;
}

export async function getRepositoryTagsWithCache(
  client: DockerHubClient,
  repository: string,
  limit = 25,
  page = 1
): Promise<any> {
  const cacheKey = cache.generateCacheKey('tags', repository, limit.toString(), page.toString());
  
  const cached = cache.getCached(client, cacheKey);
  if (cached) return cached;

  const result = await api.getRepositoryTags(client, repository, limit, page);
  const formatted = formatters.formatTagsResponse(result);
  
  cache.setCache(client, cacheKey, formatted, 600);
  return formatted;
}

export async function getImageManifestWithCache(
  client: DockerHubClient,
  repository: string,
  tag = 'latest'
): Promise<any> {
  const cacheKey = cache.generateCacheKey('manifest', repository, tag);
  
  const cached = cache.getCached(client, cacheKey);
  if (cached) return cached;

  const result = await api.getImageManifest(client, repository, tag);
  const formatted = formatters.formatManifest(result, repository, tag);
  
  cache.setCache(client, cacheKey, formatted, 1800);
  return formatted;
}

export async function getImageDetailsWithCache(
  client: DockerHubClient,
  repository: string,
  tag = 'latest'
): Promise<any> {
  const cacheKey = cache.generateCacheKey('details', repository, tag);
  
  const cached = cache.getCached(client, cacheKey);
  if (cached) return cached;

  const [repoInfo, tagsInfo] = await Promise.all([
    getRepositoryInfoWithCache(client, repository),
    api.getRepositoryTags(client, repository, 10, 1),
  ]);

  const formatted = formatters.formatImageDetails(repoInfo, tagsInfo, tag);
  cache.setCache(client, cacheKey, formatted, 900);
  return formatted;
}
