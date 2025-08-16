import fetch from 'node-fetch';
import type { DockerHubConfig, DockerHubClient } from '../types/dockerhub.js';

export function createClient(config: DockerHubConfig): DockerHubClient {
  return {
    config,
    cache: new Map(),
  };
}

export async function authenticate(client: DockerHubClient): Promise<void> {
  if (!client.config.username || !client.config.password) {
    return;
  }

  const response = await fetch('https://hub.docker.com/v2/users/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: client.config.username,
      password: client.config.password,
    }),
  });

  if (response.ok) {
    const data = await response.json() as any;
    client.authToken = data.token;
  }
}

async function makeRequest(client: DockerHubClient, url: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (client.authToken) {
    headers['Authorization'] = `JWT ${client.authToken}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

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
  const params = new URLSearchParams({
    q: query,
    page_size: limit.toString(),
    page: page.toString(),
  });

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
  const params = new URLSearchParams({
    page_size: limit.toString(),
    page: page.toString(),
  });

  const url = `https://hub.docker.com/v2/repositories/${repoPath}/tags/?${params}`;
  return makeRequest(client, url);
}

export async function getImageManifest(
  _client: DockerHubClient,
  repository: string,
  tag = 'latest'
): Promise<any> {
  const repoPath = repository.includes('/') ? repository : `library/${repository}`;
  const url = `https://registry-1.docker.io/v2/${repoPath}/manifests/${tag}`;

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.docker.distribution.manifest.v2+json',
  };

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
