import { RepositoryArgsSchema, StatsArgsSchema } from '../types/schemas.js';
import { getRepositoryInfoWithCache } from '../core/dockerhub-service.js';
import type { DockerHubClient } from '../types/dockerhub.js';

export async function handleGetDockerfile(_client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = RepositoryArgsSchema.parse(args);
  const tag = parsed.tag || 'latest';

  return {
    repository: parsed.repository,
    tag,
    dockerfile_info: {
      available: false,
      message: 'Dockerfile not directly accessible via Docker Hub API',
      suggestions: [
        'Check the repository\'s source code repository (GitHub, GitLab, etc.)',
        'Look for a Dockerfile in the repository root',
        'Check the image description for build instructions',
      ],
    },
    summary: `Dockerfile for ${parsed.repository}:${tag} is not directly available via API`,
  };
}

export async function handleGetStats(client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = StatsArgsSchema.parse(args);
  const repoInfo = await getRepositoryInfoWithCache(client, parsed.repository);

  const pullCount = repoInfo.pull_count || 0;
  const starCount = repoInfo.star_count || 0;

  let popularity = 'low';
  if (starCount > 1000 || pullCount > 1000000) {
    popularity = 'very_high';
  } else if (starCount > 100 || pullCount > 100000) {
    popularity = 'high';
  } else if (starCount > 10 || pullCount > 10000) {
    popularity = 'medium';
  }

  return {
    repository: {
      name: repoInfo.name || 'unknown',
      is_official: repoInfo.is_official || false,
    },
    statistics: {
      star_count: starCount,
      pull_count: pullCount,
      popularity_level: popularity,
      last_updated: repoInfo.last_updated || null,
    },
    summary: `${repoInfo.name || 'Repository'} has ${starCount} stars and ${pullCount.toLocaleString()} pulls`,
  };
}

export async function handleGetImageHistory(_client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = RepositoryArgsSchema.parse(args);
  const tag = parsed.tag || 'latest';

  return {
    repository: parsed.repository,
    tag,
    history_info: {
      available: false,
      message: 'Detailed build history not available via Docker Hub API',
    },
    alternatives: {
      docker_history: `docker history ${parsed.repository}:${tag}`,
      manifest_analysis: 'Use docker_get_manifest for layer details',
    },
    summary: `Build history for ${parsed.repository}:${tag} requires local Docker inspection`,
  };
}
