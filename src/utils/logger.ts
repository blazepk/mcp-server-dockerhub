type Level = 'error' | 'warn' | 'info' | 'debug';
import { LOG_LEVEL } from '../config/runtime.js';

const levels: Record<Level, number> = { error: 0, warn: 1, info: 2, debug: 3 };
const minLevel = levels[(LOG_LEVEL as Level) || 'info'] ?? 2;

function now(): string { return new Date().toISOString(); }

function shouldLog(level: Level): boolean { return levels[level] <= minLevel; }

function base(entry: Record<string, unknown>): string {
  return JSON.stringify({ ts: now(), ...entry });
}

export function log(level: Level, msg: string, ctx: Record<string, unknown> = {}): void {
  if (!shouldLog(level)) return;
  if (process.env['DISABLE_LOGGING'] === 'true') return;

  const line = base({ level, msg, ...ctx });
  console.error(line);
}

export const logger = {
  error: (msg: string, ctx: Record<string, unknown> = {}) => log('error', msg, ctx),
  warn: (msg: string, ctx: Record<string, unknown> = {}) => log('warn', msg, ctx),
  info: (msg: string, ctx: Record<string, unknown> = {}) => log('info', msg, ctx),
  debug: (msg: string, ctx: Record<string, unknown> = {}) => log('debug', msg, ctx),
};

