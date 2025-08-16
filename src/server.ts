import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { createClient, authenticate } from './api/dockerhub-client.js';
import * as handlers from './handlers/index.js';
import { ALL_TOOLS } from './config/tools.js';
import type { DockerHubClient } from './types/dockerhub.js';

export class DockerHubMCPServer {
  private readonly server: Server;
  private readonly client: DockerHubClient;

  constructor() {
    this.server = new Server(
      {
        name: 'dockerhub-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.client = createClient({
      username: process.env['DOCKERHUB_USERNAME'],
      password: process.env['DOCKERHUB_PASSWORD'],
      registryUrl: 'https://registry-1.docker.io',
    });

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: ALL_TOOLS,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: any;

        switch (name) {
          case 'docker_search_images':
            result = await handlers.handleSearchImages(this.client, args);
            break;
          case 'docker_get_image_details':
            result = await handlers.handleGetImageDetails(this.client, args);
            break;
          case 'docker_list_tags':
            result = await handlers.handleListTags(this.client, args);
            break;
          case 'docker_get_manifest':
            result = await handlers.handleGetManifest(this.client, args);
            break;
          case 'docker_analyze_layers':
            result = await handlers.handleAnalyzeLayers(this.client, args);
            break;
          case 'docker_compare_images':
            result = await handlers.handleCompareImages(this.client, args);
            break;
          case 'docker_get_dockerfile':
            result = await handlers.handleGetDockerfile(this.client, args);
            break;
          case 'docker_get_stats':
            result = await handlers.handleGetStats(this.client, args);
            break;
          case 'docker_get_vulnerabilities':
            result = await handlers.handleGetVulnerabilities(this.client, args);
            break;
          case 'docker_get_image_history':
            result = await handlers.handleGetImageHistory(this.client, args);
            break;
          case 'docker_track_base_updates':
            result = await handlers.handleTrackBaseUpdates(this.client, args);
            break;
          case 'docker_estimate_pull_size':
            result = await handlers.handleEstimatePullSize(this.client, args);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async initialize(): Promise<void> {
    await authenticate(this.client);
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}