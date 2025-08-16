import { RepositoryArgsSchema, CompareImagesArgsSchema } from '../types/schemas.js';
import { getRepositoryInfoWithCache } from '../core/dockerhub-service.js';
import * as api from '../api/dockerhub-client.js';
import type { DockerHubClient } from '../types/dockerhub.js';

export async function handleAnalyzeLayers(client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = RepositoryArgsSchema.parse(args);
  const tag = parsed.tag || 'latest';
  const manifest = await api.getImageManifest(client, parsed.repository, tag);

  const layers = manifest.layers || [];
  const totalSize = layers.reduce((sum: number, layer: any) => sum + (layer.size || 0), 0);

  return {
    repository: parsed.repository,
    tag,
    analysis: {
      total_layers: layers.length,
      total_size_bytes: totalSize,
      total_size_mb: Math.round(totalSize / (1024 * 1024)),
      largest_layer_mb: layers.length > 0 ? Math.round(Math.max(...layers.map((l: any) => l.size || 0)) / (1024 * 1024)) : 0,
    },
    layers: layers.map((layer: any, index: number) => ({
      index: index + 1,
      size_mb: Math.round((layer.size || 0) / (1024 * 1024)),
      digest: layer.digest?.substring(0, 16) + '...' || 'unknown',
    })),
    summary: `${parsed.repository}:${tag} has ${layers.length} layers totaling ${Math.round(totalSize / (1024 * 1024))}MB`,
  };
}

export async function handleCompareImages(client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = CompareImagesArgsSchema.parse(args);
  const tag1 = parsed.tag1 || 'latest';
  const tag2 = parsed.tag2 || 'latest';

  const [info1, manifest1, info2, manifest2] = await Promise.all([
    getRepositoryInfoWithCache(client, parsed.image1),
    api.getImageManifest(client, parsed.image1, tag1),
    getRepositoryInfoWithCache(client, parsed.image2),
    api.getImageManifest(client, parsed.image2, tag2),
  ]);

  const size1 = manifest1.layers?.reduce((sum: number, layer: any) => sum + (layer.size || 0), 0) || 0;
  const size2 = manifest2.layers?.reduce((sum: number, layer: any) => sum + (layer.size || 0), 0) || 0;

  return {
    comparison: {
      image1: {
        name: info1.name,
        tag: tag1,
        size_mb: Math.round(size1 / (1024 * 1024)),
        layers: manifest1.layers?.length || 0,
        stars: info1.star_count || 0,
      },
      image2: {
        name: info2.name,
        tag: tag2,
        size_mb: Math.round(size2 / (1024 * 1024)),
        layers: manifest2.layers?.length || 0,
        stars: info2.star_count || 0,
      },
    },
    differences: {
      size_difference_mb: Math.round((size2 - size1) / (1024 * 1024)),
      layer_difference: (manifest2.layers?.length || 0) - (manifest1.layers?.length || 0),
    },
    summary: `Compared ${info1.name}:${tag1} vs ${info2.name}:${tag2}`,
  };
}

export async function handleEstimatePullSize(client: DockerHubClient, args: unknown): Promise<any> {
  const parsed = RepositoryArgsSchema.parse(args);
  const tag = parsed.tag || 'latest';
  const manifest = await api.getImageManifest(client, parsed.repository, tag);

  const totalSize = manifest.layers?.reduce((sum: number, layer: any) => sum + (layer.size || 0), 0) || 0;

  return {
    repository: parsed.repository,
    tag,
    size_estimate: {
      total_bytes: totalSize,
      total_mb: Math.round(totalSize / (1024 * 1024)),
      total_gb: Math.round(totalSize / (1024 * 1024 * 1024) * 100) / 100,
    },
    download_time_estimates: {
      fast_connection_10mbps: `${Math.round(totalSize / (10 * 1024 * 1024 / 8))} seconds`,
      medium_connection_5mbps: `${Math.round(totalSize / (5 * 1024 * 1024 / 8))} seconds`,
      slow_connection_1mbps: `${Math.round(totalSize / (1 * 1024 * 1024 / 8))} seconds`,
    },
    summary: `${parsed.repository}:${tag} estimated download size: ${Math.round(totalSize / (1024 * 1024))}MB`,
  };
}
