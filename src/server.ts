import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createClient, authenticate } from './api/dockerhub-client.js';

import { ALL_TOOLS } from './config/tools.js';
import type { DockerHubClient } from './types/dockerhub.js';
import { DOCKER_REGISTRY_URL } from './config/runtime.js';
import { createRateLimiter } from './utils/rate-limiter.js';
import { logger } from './utils/logger.js';

const createMCPServer = () => new Server(
  {
    name: process.env['MCP_SERVER_NAME'] || 'dockerhub-mcp-server',
    version: process.env['MCP_SERVER_VERSION'] || '1.0.0'
  },
  { capabilities: { tools: {} } }
);

const createDockerClient = (): DockerHubClient => {
  const usePrivate = Boolean(process.env['PRIVATE_REGISTRY_URL']);
  const username = usePrivate ? (process.env['PRIVATE_REGISTRY_USERNAME'] || process.env['DOCKERHUB_USERNAME']) : process.env['DOCKERHUB_USERNAME'];
  const password = usePrivate ? (process.env['PRIVATE_REGISTRY_PASSWORD'] || process.env['DOCKERHUB_PASSWORD']) : process.env['DOCKERHUB_PASSWORD'];
  return createClient({ username, password, registryUrl: DOCKER_REGISTRY_URL });
};

import { handleToolCall as dispatchTool } from './core/tool-dispatch.js';

const handleToolCall = async (client: DockerHubClient, name: string, args: any) => dispatchTool(client, name, args);

const setupToolsHandler = (server: Server) => {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: ALL_TOOLS }));
};

const rateLimiter = createRateLimiter();

const setupCallHandler = (server: Server, client: DockerHubClient) => {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const reqId = Math.random().toString(36).slice(2);
    const tool = request.params.name;
    const args = request.params.arguments || {};

    if (!rateLimiter.allow('global')) {
      logger.warn('rate_limit_exceeded', { reqId, tool });
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: 'Rate limit exceeded' }) }],
        isError: true,
      };
    }

    try {
      logger.info('claude_tool_request', { reqId, tool, args });
      const result = await handleToolCall(client, tool, args);
      logger.info('claude_tool_response', { reqId, tool, success: true });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('claude_tool_error', { reqId, tool, message });
      return {
        content: [{ type: 'text', text: `Error: ${message}` }],
        isError: true,
      };
    }
  });
};

const initializeAuth = async (client: DockerHubClient) => {
  try {
    logger.info('auth_start', {});
    await authenticate(client);
    logger.info('auth_success', {});
  } catch (error) {
    logger.warn('auth_failed', { message: error instanceof Error ? error.message : error });
  }
};

const createTransport = () => new StdioServerTransport();

const connectServer = async (server: Server) => {
  const transport = createTransport();
  await server.connect(transport);
  logger.info('server_connected');
};

export const createDockerHubMCPServer = () => {
  const server = createMCPServer();
  const client = createDockerClient();

  setupToolsHandler(server);
  setupCallHandler(server, client);

  return {
    initialize: () => initializeAuth(client),
    run: () => connectServer(server),
  };
};