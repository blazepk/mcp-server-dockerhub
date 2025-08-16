import { describe, test, expect } from '@jest/globals';
import * as handlers from '../handlers/index.js';
import * as service from '../core/dockerhub-service.js';
import * as api from '../api/dockerhub-client.js';
import { z } from 'zod';
import type { DockerHubClient } from '../types/dockerhub.js';

const client: DockerHubClient = { config: { registryUrl: 'https://registry-1.docker.io' }, cache: new Map() };

describe('handlers validation and behavior', () => {
  test('search handler validates input and calls service', async () => {
    const spy = jest.spyOn(service, 'searchImagesWithCache').mockResolvedValueOnce({ count: 0, results: [] });
    const res = await handlers.handleSearchImages(client, { query: 'nginx', limit: 10 });
    expect(res.results).toEqual([]);
    expect(spy).toHaveBeenCalled();
  });

  test('search handler invalid input throws', async () => {
    await expect(handlers.handleSearchImages(client, { limit: -1 } as any)).rejects.toBeInstanceOf(z.ZodError);
  });

  test('get image details invalid repository throws', async () => {
    await expect(handlers.handleGetImageDetails(client, { tag: 'latest' } as any)).rejects.toBeInstanceOf(z.ZodError);
  });

  test('get manifest calls api and returns formatted', async () => {
    jest.spyOn(service, 'getImageManifestWithCache').mockResolvedValueOnce({ repository: 'nginx', tag: 'latest', manifest: { layers: [] } });
    const res = await handlers.handleGetManifest(client, { repository: 'nginx' });
    expect(res.repository).toBe('nginx');
  });

  test('compare images handles network failure', async () => {
    jest.spyOn(service, 'getRepositoryInfoWithCache').mockResolvedValueOnce({ name: 'a' });
    jest.spyOn(api, 'getImageManifest').mockRejectedValueOnce(new Error('network'));
    await expect(handlers.handleCompareImages(client, { image1: 'a', image2: 'b' })).rejects.toThrow('network');
  });
});

