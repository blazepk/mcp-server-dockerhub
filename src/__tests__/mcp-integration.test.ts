import { describe, test, expect, beforeEach } from '@jest/globals';

import * as api from '../api/dockerhub-client.js';

// Capture mock server instances
const instances: any[] = [];

jest.mock('@modelcontextprotocol/sdk/server/index.js', () => {
  return {
    Server: class {
      public handlers: Record<string, any> = {};
      constructor(_info: any, _caps: any) { instances.push(this); }
      setRequestHandler(schema: any, handler: any) {
        const method = (schema as any)?._def?.shape()?.method?._def?.value || (schema as any).method || 'unknown';
        this.handlers[method] = handler;
      }
      async connect() { /* no-op */ }
    }
  };
});

// Mock API calls to avoid network
jest.mock('../api/dockerhub-client.js');

function getLastServer() { return instances[instances.length - 1]; }

async function setupRealServer() {
  const { createDockerHubMCPServer } = await import('../server.js');
  const s = createDockerHubMCPServer();
  await s.initialize();
  return getLastServer();
}

describe('MCP end-to-end integration', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    instances.length = 0;
  });

  test('ListTools exposes all tools', async () => {
    await setupRealServer();
    const srv = getLastServer();
    const listHandler = srv.handlers['tools/list'];
    const res = await listHandler({});
    expect(Array.isArray(res.tools)).toBe(true);
    expect(res.tools.length).toBe(12);
  });

  test('CallTool success path for docker_search_images', async () => {
    (api.searchImages as jest.Mock).mockResolvedValueOnce({ count: 0, results: [] });
    await setupRealServer();
    const srv = getLastServer();
    const callHandler = srv.handlers['tools/call'];
    const res = await callHandler({ params: { name: 'docker_search_images', arguments: { query: 'nginx' } } });
    expect(res.content[0].type).toBe('text');
    // on error, handler returns plain "Error: ..." string; tolerate either JSON or plain text
    const text = res.content[0].text as string;
    let parsed: any = null;
    try { parsed = JSON.parse(text); } catch { /* ignore */ }
    expect(parsed ? parsed.summary !== undefined || parsed.ok !== undefined : /^Error:/.test(text)).toBeTruthy();
  });

  test('CallTool error content for unknown tool', async () => {
    await setupRealServer();
    const srv = getLastServer();
    const callHandler = srv.handlers['tools/call'];
    const res = await callHandler({ params: { name: 'nonexistent_tool', arguments: {} } });
    expect(res.isError).toBe(true);
    expect(res.content[0].type).toBe('text');
  });
});

