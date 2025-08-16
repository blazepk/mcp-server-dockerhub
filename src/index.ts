#!/usr/bin/env node

import { DockerHubMCPServer } from './server.js';

async function main() {
  const server = new DockerHubMCPServer();
  await server.initialize();
  await server.run();
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
