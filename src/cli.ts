#!/usr/bin/env node
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createClient } from './api/dockerhub-client.js';
import { DOCKER_REGISTRY_URL } from './config/runtime.js';
import { handleToolCall } from './core/tool-dispatch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  try {
    const raw = await readStdin();
    const input = raw.trim() ? JSON.parse(raw) : {};
    const name = input.name as string;
    const args = input.args ?? {};

    if (!name) {
      console.error(JSON.stringify({ error: 'Missing tool name. Provide {"name":"tool","args":{...}} on stdin.' }));
      process.exit(1);
    }

    const client = createClient({
      username: process.env['DOCKERHUB_USERNAME'],
      password: process.env['DOCKERHUB_PASSWORD'],
      registryUrl: DOCKER_REGISTRY_URL,
    });

    const result = await handleToolCall(client, name, args);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stdout.write(JSON.stringify({ error: message }) + '\n');
    process.exit(1);
  }
}

main();

