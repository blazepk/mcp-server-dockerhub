import type { DockerHubConfig, DockerHubClient } from '../types/dockerhub.js';
import { DOCKER_REGISTRY_URL, REQUEST_TIMEOUT_MS } from '../config/runtime.js';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const id = setTimeout(() => {}, ms);
  return promise.finally(() => clearTimeout(id));
}

export function createClient(config: DockerHubConfig): DockerHubClient {
  return {
    config: { ...config, registryUrl: config.registryUrl || DOCKER_REGISTRY_URL },
    cache: new Map(),
  };
}

export async function authenticate(client: DockerHubClient): Promise<void> {
  if (!client.config.username || !client.config.password) return;

  const response = await withTimeout(
    fetch('https://hub.docker.com/v2/users/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: client.config.username,
        password: client.config.password,
      }),
    }),
    REQUEST_TIMEOUT_MS
  );

  if (response.ok) {
    const data = (await response.json()) as any;
    client.authToken = data.token;
  }
}

async function makeRequest(client: DockerHubClient, url: string): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (client.authToken) headers['Authorization'] = `JWT ${client.authToken}`;

  const response = await withTimeout(fetch(url, { headers }), REQUEST_TIMEOUT_MS);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText} (${url})`);
  return response.json();
}

export async function searchImages(
  client: DockerHubClient,
  query: string,
  limit = 25,
  page = 1,
  isOfficial?: boolean,
  isAutomated?: boolean
): Promise<any> {
  const params = new URLSearchParams({ query, page_size: limit.toString(), page: page.toString() });
  if (isOfficial !== undefined) params.append('is_official', isOfficial.toString());
  if (isAutomated !== undefined) params.append('is_automated', isAutomated.toString());

  const url = `https://hub.docker.com/v2/search/repositories/?${params}`;
  return makeRequest(client, url);
}

export async function getRepositoryInfo(client: DockerHubClient, repository: string): Promise<any> {
  const repoPath = repository.includes('/') ? repository : `library/${repository}`;
  const url = `https://hub.docker.com/v2/repositories/${repoPath}/`;
  return makeRequest(client, url);
}

export async function getRepositoryTags(
  client: DockerHubClient,
  repository: string,
  limit = 25,
  page = 1
): Promise<any> {
  const repoPath = repository.includes('/') ? repository : `library/${repository}`;
  const params = new URLSearchParams({ page_size: limit.toString(), page: page.toString() });
  const url = `https://hub.docker.com/v2/repositories/${repoPath}/tags/?${params}`;
  return makeRequest(client, url);
}

export async function getImageManifest(
  client: DockerHubClient,
  repository: string,
  tag = 'latest'
): Promise<any> {
  const repoPath = repository.includes('/') ? repository : `library/${repository}`;

  const registryUrl = client.config.registryUrl || DOCKER_REGISTRY_URL;
  const registryHost = new URL(registryUrl).host;

  let bearer: string | undefined;
  if (registryHost.endsWith('docker.io')) {
    const authUrl = `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${repoPath}:pull`;
    try {
      const basic = client.config.username && client.config.password
        ? 'Basic ' + Buffer.from(`${client.config.username}:${client.config.password}`).toString('base64')
        : undefined;
      const authRes = await withTimeout(
        fetch(authUrl, { headers: basic ? { Authorization: basic } : undefined }),
        REQUEST_TIMEOUT_MS
      );
      if (authRes.ok) {
        const authJson: any = await authRes.json();
        bearer = authJson.token;
      }
    } catch {
    }
  }

  const url = `${registryUrl.replace(/\/$/, '')}/v2/${repoPath}/manifests/${tag}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.oci.image.index.v1+json',
  };
  if (bearer) headers['Authorization'] = `Bearer ${bearer}`;
  if (!bearer && client.config.username && client.config.password && !registryHost.endsWith('docker.io')) {
    headers['Authorization'] = 'Basic ' + Buffer.from(`${client.config.username}:${client.config.password}`).toString('base64');
  }

  const response = await withTimeout(fetch(url, { headers }), REQUEST_TIMEOUT_MS);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText} (${url})`);
  return response.json();
}
