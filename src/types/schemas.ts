import { z } from 'zod';

export const SearchImagesArgsSchema = z.object({
  query: z.string(),
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  is_official: z.boolean().optional(),
  is_automated: z.boolean().optional(),
});

export const RepositoryArgsSchema = z.object({
  repository: z.string(),
  tag: z.string().optional(),
});

export const CompareImagesArgsSchema = z.object({
  image1: z.string(),
  image2: z.string(),
  tag1: z.string().optional(),
  tag2: z.string().optional(),
});

export const ListTagsArgsSchema = z.object({
  repository: z.string(),
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
});

export const StatsArgsSchema = z.object({
  repository: z.string(),
});

export type SearchImagesArgs = z.infer<typeof SearchImagesArgsSchema>;
export type RepositoryArgs = z.infer<typeof RepositoryArgsSchema>;
export type CompareImagesArgs = z.infer<typeof CompareImagesArgsSchema>;
export type ListTagsArgs = z.infer<typeof ListTagsArgsSchema>;
export type StatsArgs = z.infer<typeof StatsArgsSchema>;
