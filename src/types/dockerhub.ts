export interface DockerHubConfig {
  username?: string;
  password?: string;
  registryUrl: string;
}

export interface DockerHubClient {
  config: DockerHubConfig;
  authToken?: string;
  cache: Map<string, { data: any; expires: number }>;
}
