import { RepositoryArgsSchema, ListTagsArgsSchema } from '../types/schemas.js';
import { getImageDetailsWithCache, getRepositoryTagsWithCache, getImageManifestWithCache } from '../core/dockerhub-service.js';
import type { DockerHubClient } from '../types/dockerhub.js';

export async function handleGetImageDetails(client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = RepositoryArgsSchema.parse(args);
  const tag = parsed.tag || 'latest';
  return getImageDetailsWithCache(client, parsed.repository, tag);
}

export async function handleListTags(client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = ListTagsArgsSchema.parse(args);
  return getRepositoryTagsWithCache(client, parsed.repository, parsed.limit, parsed.page);
}

export async function handleGetManifest(client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = RepositoryArgsSchema.parse(args);
  const tag = parsed.tag || 'latest';
  return getImageManifestWithCache(client, parsed.repository, tag);
}
