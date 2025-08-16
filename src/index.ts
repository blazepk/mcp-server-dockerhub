#!/usr/bin/env node
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createDockerHubMCPServer } from './server.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const main = async () => {
  try {
    const server = createDockerHubMCPServer();
    await server.initialize();
    await server.run();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const handleSignal = (signal: string) => () => {
  console.error(`Received ${signal}, shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGINT', handleSignal('SIGINT'));
process.on('SIGTERM', handleSignal('SIGTERM'));

main().catch((error) => {
  console.error('Unhandled server error:', error);
  process.exit(1);
});
