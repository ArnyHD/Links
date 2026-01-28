export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Translation {
  [locale: string]: {
    name?: string;
    title?: string;
    description?: string;
    content?: string;
  };
}

export type NodeStatus = 'draft' | 'published' | 'archived';

export type EdgeSemanticType = 'supports' | 'contradicts' | 'derives_from' | 'part_of' | 'custom';

export type RatingMetricType = 'consistency' | 'coherence' | 'connectivity' | 'overall';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  color?: string;
  data?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  color?: string;
}
