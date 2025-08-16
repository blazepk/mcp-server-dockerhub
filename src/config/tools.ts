export const DOCKER_SEARCH_IMAGES = {
  name: 'docker_search_images',
  description: 'Search Docker Hub for images with optional filters',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query for images' },
      limit: { type: 'number', description: 'Number of results to return (default: 25)', minimum: 1, maximum: 100 },
      page: { type: 'number', description: 'Page number for pagination (default: 1)', minimum: 1 },
      is_official: { type: 'boolean', description: 'Filter for official images only' },
      is_automated: { type: 'boolean', description: 'Filter for automated builds only' },
    },
    required: ['query'],
  },
};

export const DOCKER_GET_IMAGE_DETAILS = {
  name: 'docker_get_image_details',
  description: 'Get detailed information about a specific Docker image',
  inputSchema: {
    type: 'object',
    properties: {
      repository: { type: 'string', description: 'Repository name (e.g., "nginx" or "library/nginx")' },
      tag: { type: 'string', description: 'Image tag (default: "latest")' },
    },
    required: ['repository'],
  },
};

export const DOCKER_LIST_TAGS = {
  name: 'docker_list_tags',
  description: 'List all tags for a Docker repository',
  inputSchema: {
    type: 'object',
    properties: {
      repository: { type: 'string', description: 'Repository name (e.g., "nginx" or "library/nginx")' },
      limit: { type: 'number', description: 'Number of tags to return (default: 25)', minimum: 1, maximum: 100 },
      page: { type: 'number', description: 'Page number for pagination (default: 1)', minimum: 1 },
    },
    required: ['repository'],
  },
};

export const DOCKER_GET_MANIFEST = {
  name: 'docker_get_manifest',
  description: 'Retrieve the manifest for a specific image tag',
  inputSchema: {
    type: 'object',
    properties: {
      repository: { type: 'string', description: 'Repository name (e.g., "nginx" or "library/nginx")' },
      tag: { type: 'string', description: 'Image tag (default: "latest")' },
    },
    required: ['repository'],
  },
};

export const DOCKER_ANALYZE_LAYERS = {
  name: 'docker_analyze_layers',
  description: 'Analyze the layers of a Docker image',
  inputSchema: {
    type: 'object',
    properties: {
      repository: { type: 'string', description: 'Repository name (e.g., "nginx" or "library/nginx")' },
      tag: { type: 'string', description: 'Image tag (default: "latest")' },
    },
    required: ['repository'],
  },
};

export const DOCKER_COMPARE_IMAGES = {
  name: 'docker_compare_images',
  description: 'Compare two Docker images (layers, sizes, base images)',
  inputSchema: {
    type: 'object',
    properties: {
      image1: { type: 'string', description: 'First image repository name' },
      image2: { type: 'string', description: 'Second image repository name' },
      tag1: { type: 'string', description: 'Tag for first image (default: "latest")' },
      tag2: { type: 'string', description: 'Tag for second image (default: "latest")' },
    },
    required: ['image1', 'image2'],
  },
};

export const DOCKER_GET_DOCKERFILE = {
  name: 'docker_get_dockerfile',
  description: 'Attempt to retrieve Dockerfile for an image (when available)',
  inputSchema: {
    type: 'object',
    properties: {
      repository: { type: 'string', description: 'Repository name (e.g., "nginx" or "library/nginx")' },
      tag: { type: 'string', description: 'Image tag (default: "latest")' },
    },
    required: ['repository'],
  },
};

export const DOCKER_GET_STATS = {
  name: 'docker_get_stats',
  description: 'Get download statistics and star count for an image',
  inputSchema: {
    type: 'object',
    properties: {
      repository: { type: 'string', description: 'Repository name (e.g., "nginx" or "library/nginx")' },
    },
    required: ['repository'],
  },
};

export const DOCKER_GET_VULNERABILITIES = {
  name: 'docker_get_vulnerabilities',
  description: 'Check for known security vulnerabilities in an image',
  inputSchema: {
    type: 'object',
    properties: {
      repository: { type: 'string', description: 'Repository name (e.g., "nginx" or "library/nginx")' },
      tag: { type: 'string', description: 'Image tag (default: "latest")' },
    },
    required: ['repository'],
  },
};

export const DOCKER_GET_IMAGE_HISTORY = {
  name: 'docker_get_image_history',
  description: 'Get image build history and layer commands',
  inputSchema: {
    type: 'object',
    properties: {
      repository: { type: 'string', description: 'Repository name (e.g., "nginx" or "library/nginx")' },
      tag: { type: 'string', description: 'Image tag (default: "latest")' },
    },
    required: ['repository'],
  },
};

export const DOCKER_TRACK_BASE_UPDATES = {
  name: 'docker_track_base_updates',
  description: 'Track updates to base images and dependencies',
  inputSchema: {
    type: 'object',
    properties: {
      repository: { type: 'string', description: 'Repository name (e.g., "nginx" or "library/nginx")' },
      tag: { type: 'string', description: 'Image tag (default: "latest")' },
    },
    required: ['repository'],
  },
};

export const DOCKER_ESTIMATE_PULL_SIZE = {
  name: 'docker_estimate_pull_size',
  description: 'Calculate estimated download size for pulling an image',
  inputSchema: {
    type: 'object',
    properties: {
      repository: { type: 'string', description: 'Repository name (e.g., "nginx" or "library/nginx")' },
      tag: { type: 'string', description: 'Image tag (default: "latest")' },
    },
    required: ['repository'],
  },
};

export const ALL_TOOLS = [
  DOCKER_SEARCH_IMAGES,
  DOCKER_GET_IMAGE_DETAILS,
  DOCKER_LIST_TAGS,
  DOCKER_GET_MANIFEST,
  DOCKER_ANALYZE_LAYERS,
  DOCKER_COMPARE_IMAGES,
  DOCKER_GET_DOCKERFILE,
  DOCKER_GET_STATS,
  DOCKER_GET_VULNERABILITIES,
  DOCKER_GET_IMAGE_HISTORY,
  DOCKER_TRACK_BASE_UPDATES,
  DOCKER_ESTIMATE_PULL_SIZE,
];
