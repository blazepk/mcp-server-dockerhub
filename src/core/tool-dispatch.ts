import * as handlers from '../handlers/index.js';
import type { DockerHubClient } from '../types/dockerhub.js';

export const toolHandlers = {
  docker_search_images: handlers.handleSearchImages,
  docker_get_image_details: handlers.handleGetImageDetails,
  docker_list_tags: handlers.handleListTags,
  docker_get_manifest: handlers.handleGetManifest,
  docker_analyze_layers: handlers.handleAnalyzeLayers,
  docker_compare_images: handlers.handleCompareImages,
  docker_get_dockerfile: handlers.handleGetDockerfile,
  docker_get_stats: handlers.handleGetStats,
  docker_get_vulnerabilities: handlers.handleGetVulnerabilities,
  docker_get_image_history: handlers.handleGetImageHistory,
  docker_track_base_updates: handlers.handleTrackBaseUpdates,
  docker_estimate_pull_size: handlers.handleEstimatePullSize,
};

export async function handleToolCall(client: DockerHubClient, name: string, args: unknown): Promise<any> {
  const handler = (toolHandlers as any)[name];
  if (!handler) throw new Error(`Unknown tool: ${name}`);
  return handler(client, args);
}

