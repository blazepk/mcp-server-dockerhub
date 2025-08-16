import { RepositoryArgsSchema } from '../types/schemas.js';
import { getRepositoryInfoWithCache } from '../core/dockerhub-service.js';
import type { DockerHubClient } from '../types/dockerhub.js';

export async function handleGetVulnerabilities(client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = RepositoryArgsSchema.parse(args);
  const tag = parsed.tag || 'latest';
  const repoInfo = await getRepositoryInfoWithCache(client, parsed.repository);

  const lastUpdated = repoInfo.last_updated ? new Date(repoInfo.last_updated) : null;
  const daysSinceUpdate = lastUpdated ? 
    Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)) : null;

  let securityLevel = 'medium';
  const recommendations: string[] = [];

  if (repoInfo.is_official) {
    securityLevel = 'high';
    recommendations.push('Official image - generally well-maintained');
  } else {
    recommendations.push('Third-party image - verify maintainer reputation');
  }

  if (daysSinceUpdate !== null) {
    if (daysSinceUpdate > 365) {
      securityLevel = 'low';
      recommendations.push('Not updated in over a year - may have vulnerabilities');
    } else if (daysSinceUpdate > 90) {
      recommendations.push('Consider checking for newer versions');
    } else {
      recommendations.push('Recently updated');
    }
  }

  return {
    repository: parsed.repository,
    tag,
    security_assessment: {
      level: securityLevel,
      is_official: repoInfo.is_official || false,
      days_since_update: daysSinceUpdate,
    },
    recommendations,
    summary: `Security level: ${securityLevel}`,
  };
}

export async function handleTrackBaseUpdates(client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = RepositoryArgsSchema.parse(args);
  const tag = parsed.tag || 'latest';
  const repoInfo = await getRepositoryInfoWithCache(client, parsed.repository);

  return {
    repository: parsed.repository,
    tag,
    base_image_tracking: {
      available: false,
      message: 'Base image tracking requires additional tooling',
    },
    recommendations: [
      'Use tools like Renovate or Dependabot for automated updates',
      'Monitor base image repositories for security updates',
      'Set up CI/CD pipelines to rebuild on base image updates',
    ],
    last_updated: repoInfo.last_updated,
    summary: `Base update tracking for ${parsed.repository}:${tag} requires external tools`,
  };
}
