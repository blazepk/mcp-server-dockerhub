import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { createClient, authenticate, searchImages, getRepositoryInfo, getRepositoryTags, getImageManifest } from '../api/dockerhub-client.js';

const originalFetch = global.fetch;

describe('dockerhub-client', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    (global.fetch as any).mockReset?.();
  });

  test('authenticate stores token when credentials provided', async () => {
    const client = createClient({ username: 'u', password: 'p', registryUrl: 'https://registry-1.docker.io' });
    (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK', json: async () => ({ token: 'abc' }) });
    await authenticate(client);
    expect(client.authToken).toBe('abc');
  });

  test('searchImages calls Docker Hub search API', async () => {
    const client = createClient({ registryUrl: 'https://registry-1.docker.io' });
    (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK', json: async () => ({ count: 0, results: [] as any[] }) });
    const res = await searchImages(client, 'nginx', 10, 1, true, false);
    expect(res.results).toEqual([]);
    expect((global.fetch as any).mock.calls[0][0]).toContain('hub.docker.com/v2/search/repositories/');
  });

  test('getRepositoryInfo makes request to repo endpoint', async () => {
    const client = createClient({ registryUrl: 'https://registry-1.docker.io' });
    (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK', json: async () => ({ name: 'nginx' }) });
    const res = await getRepositoryInfo(client, 'nginx');
    expect(res.name).toBe('nginx');
  });

  test('getRepositoryTags paginates', async () => {
    const client = createClient({ registryUrl: 'https://registry-1.docker.io' });
    (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK', json: async () => ({ count: 0, results: [] as any[] }) });
    const res = await getRepositoryTags(client, 'library/nginx', 5, 2);
    expect(res.results).toEqual([]);
  });

  test('getImageManifest builds correct registry URL, accepts manifest list', async () => {
    const client = createClient({ registryUrl: 'https://registry-1.docker.io' });
    (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK', json: async () => ({ token: 't' }) });
    (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK', json: async () => ({ schemaVersion: 2, mediaType: 'application/vnd.docker.distribution.manifest.v2+json', layers: [] as any[] }) });
    const res = await getImageManifest(client, 'library/nginx', 'latest');
    expect(res.schemaVersion).toBe(2);
    const manifestUrl = (global.fetch as any).mock.calls[1][0] as string;
    expect(manifestUrl).toContain('registry-1.docker.io');
    expect((global.fetch as any).mock.calls[1][1].headers.Accept).toContain('manifest');
  });

  test('makeRequest errors are thrown for non-OK responses', async () => {
    const client = createClient({ registryUrl: 'https://registry-1.docker.io' });
    (global.fetch as any).mockResolvedValueOnce({ ok: false, status: 500, statusText: 'ERR', json: async () => ({}) });
    await expect(searchImages(client, 'x')).rejects.toThrow(/HTTP 500/);
  });

  test('getImageManifest uses basic auth for non-DockerHub registries', async () => {
    const client = createClient({ registryUrl: 'https://example.com', username: 'u', password: 'p' });
    (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK', json: async () => ({ schemaVersion: 2, layers: [] as any[] }) });
    const res = await getImageManifest(client, 'nginx', 'latest');
    expect(res.schemaVersion).toBe(2);
    const call = (global.fetch as any).mock.calls[0];
    expect(call[0]).toBe('https://example.com/v2/library/nginx/manifests/latest');
    expect(call[1].headers.Authorization).toMatch(/^Basic /);
  });
});

afterAll(() => {
  (global as any).fetch = originalFetch;
});

