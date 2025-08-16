import { describe, test, expect } from '@jest/globals';
import { ALL_TOOLS } from '../config/tools.js';

describe('DockerHub MCP Server Configuration', () => {
  test('should have all required tools defined', () => {
    expect(ALL_TOOLS).toHaveLength(12);
    expect(ALL_TOOLS[0]).toHaveProperty('name');
    expect(ALL_TOOLS[0]).toHaveProperty('description');
    expect(ALL_TOOLS[0]).toHaveProperty('inputSchema');
  });

  test('should have correct tool names', () => {
    const toolNames = ALL_TOOLS.map(tool => tool.name);
    expect(toolNames).toContain('docker_search_images');
    expect(toolNames).toContain('docker_get_image_details');
    expect(toolNames).toContain('docker_list_tags');
    expect(toolNames).toContain('docker_get_manifest');
    expect(toolNames).toContain('docker_analyze_layers');
    expect(toolNames).toContain('docker_compare_images');
    expect(toolNames).toContain('docker_get_dockerfile');
    expect(toolNames).toContain('docker_get_stats');
    expect(toolNames).toContain('docker_get_vulnerabilities');
    expect(toolNames).toContain('docker_get_image_history');
    expect(toolNames).toContain('docker_track_base_updates');
    expect(toolNames).toContain('docker_estimate_pull_size');
  });
});
