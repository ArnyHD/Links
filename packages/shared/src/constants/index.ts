export const SUPPORTED_LANGUAGES = ['en', 'ru'] as const;

export const DEFAULT_LANGUAGE = 'en';

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const NODE_STATUSES = ['draft', 'published', 'archived'] as const;

export const EDGE_SEMANTIC_TYPES = [
  'supports',
  'contradicts',
  'derives_from',
  'part_of',
  'custom',
] as const;

export const RATING_METRICS = [
  'consistency',
  'coherence',
  'connectivity',
  'overall',
] as const;
