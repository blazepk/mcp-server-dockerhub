import { SearchImagesArgsSchema } from '../types/schemas.js';
import { searchImagesWithCache } from '../core/dockerhub-service.js';
import type { DockerHubClient } from '../types/dockerhub.js';

export async function handleSearchImages(client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = SearchImagesArgsSchema.parse(args);
  return searchImagesWithCache(
    client,
    parsed.query,
    parsed.limit,
    parsed.page,
    parsed.is_official,
    parsed.is_automated
  );
}
