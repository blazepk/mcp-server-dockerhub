import { describe, test, expect } from '@jest/globals';
import { generateCacheKey } from '../utils/cache.js';
import { formatSearchResults, formatTagsResponse } from '../utils/formatters.js';

describe('Cache Utils', () => {
  test('should generate cache key', () => {
    const key = generateCacheKey('search', 'nginx', 'latest');
    expect(key).toBe('search:nginx:latest');
  });
});

describe('Formatters', () => {
  test('should format search results', () => {
    const searchResult = {
      count: 1,
      results: [
        {
          name: 'nginx',
          description: 'Official build of Nginx',
          star_count: 1000,
          pull_count: 1000000,
          is_official: true,
          is_automated: false,
          last_updated: '2023-01-01T00:00:00Z',
        },
      ],
    };

    const formatted = formatSearchResults(searchResult);
    expect(formatted.count).toBe(1);
    expect(formatted.results).toHaveLength(1);
    expect(formatted.results[0].name).toBe('nginx');
    expect(formatted.results[0].is_official).toBe(true);
  });

  test('should format empty search results', () => {
    const formatted = formatSearchResults(null);
    expect(formatted.count).toBe(0);
    expect(formatted.results).toHaveLength(0);
    expect(formatted.summary).toContain('No images found');
  });

  test('should format tags response', () => {
    const tagsResponse = {
      count: 2,
      results: [
        {
          name: 'latest',
          full_size: 1000000,
          last_updated: '2023-01-01T00:00:00Z',
          images: [
            {
              architecture: 'amd64',
              os: 'linux',
              size: 1000000,
            },
          ],
        },
        {
          name: 'alpine',
          full_size: 500000,
          last_updated: '2023-01-01T00:00:00Z',
          images: [],
        },
      ],
    };

    const formatted = formatTagsResponse(tagsResponse);
    expect(formatted.count).toBe(2);
    expect(formatted.tags).toHaveLength(2);
    expect(formatted.tags[0].name).toBe('latest');
    expect(formatted.tags[0].size_mb).toBe(1);
  });
});
