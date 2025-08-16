export const DOCKER_REGISTRY_URL = process.env['PRIVATE_REGISTRY_URL'] || 'https://registry-1.docker.io';

export const CACHE_MAX_SIZE = Number.parseInt(process.env['CACHE_MAX_SIZE'] || '1000', 10);

export const REQUEST_TIMEOUT_MS = Number.parseInt(process.env['REQUEST_TIMEOUT_MS'] || '10000', 10);
export const RATE_LIMIT_REQUESTS_PER_MINUTE = Number.parseInt(process.env['RATE_LIMIT_REQUESTS_PER_MINUTE'] || '100', 10);
export const LOG_LEVEL = (process.env['LOG_LEVEL'] || 'info').toLowerCase();

