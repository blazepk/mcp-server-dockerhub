export function formatSearchResults(searchResult: any): any {
  if (!searchResult?.results) {
    return {
      count: 0,
      results: [],
      summary: 'No images found matching the search criteria.',
    };
  }

  const results = searchResult.results.map((image: any) => ({
    name: image.name || 'Unknown',
    description: image.description || 'No description available',
    star_count: image.star_count || 0,
    pull_count: image.pull_count || 0,
    is_official: image.is_official || false,
    is_automated: image.is_automated || false,
    last_updated: image.last_updated || null,
  }));

  return {
    count: searchResult.count || results.length,
    results,
    summary: `Found ${results.length} images matching "${searchResult.query || 'search criteria'}"`,
  };
}

export function formatImageDetails(repoInfo: any, tagsInfo: any, tag: string): any {
  const tagInfo = tagsInfo?.results?.find((t: any) => t.name === tag) || null;

  return {
    repository: {
      name: repoInfo.name || 'Unknown',
      namespace: repoInfo.namespace || 'Unknown',
      description: repoInfo.description || 'No description available',
      is_official: repoInfo.is_official || false,
      star_count: repoInfo.star_count || 0,
      pull_count: repoInfo.pull_count || 0,
      last_updated: repoInfo.last_updated || null,
    },
    tag: {
      name: tag,
      full_size: tagInfo?.full_size || null,
      last_updated: tagInfo?.last_updated || null,
      images: tagInfo?.images || [],
    },
    summary: `${repoInfo.name || 'Repository'} (${tag}) - ${repoInfo.description || 'No description'}`,
  };
}

export function formatTagsResponse(tagsResponse: any): any {
  if (!tagsResponse?.results) {
    return {
      count: 0,
      tags: [],
      summary: 'No tags found for this repository.',
    };
  }

  const tags = tagsResponse.results.map((tag: any) => ({
    name: tag.name || 'unknown',
    full_size: tag.full_size || null,
    size_mb: tag.full_size ? Math.round(tag.full_size / (1024 * 1024)) : null,
    last_updated: tag.last_updated || null,
    images: tag.images?.map((img: any) => ({
      architecture: img.architecture || 'unknown',
      os: img.os || 'unknown',
      size: img.size || null,
    })) || [],
  }));

  return {
    count: tagsResponse.count || tags.length,
    tags,
    summary: `Found ${tags.length} tags for repository`,
  };
}

export function formatManifest(manifest: any, repository: string, tag: string): any {
  return {
    repository,
    tag,
    manifest: {
      schema_version: manifest.schemaVersion || 'unknown',
      media_type: manifest.mediaType || 'unknown',
      layers: manifest.layers?.map((layer: any) => ({
        media_type: layer.mediaType,
        size: layer.size,
        digest: layer.digest,
      })) || [],
      total_size: manifest.layers?.reduce((sum: number, layer: any) => sum + (layer.size || 0), 0) || 0,
    },
    summary: `Manifest for ${repository}:${tag} with ${manifest.layers?.length || 0} layers`,
  };
}
