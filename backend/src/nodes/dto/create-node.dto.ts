import { NodeStatus } from '../../entities';

export class CreateNodeDto {
  title: string;
  slug: string;
  excerpt?: string;
  cover_image?: string;
  content?: Record<string, any>;
  content_html?: string;
  reading_time?: number;
  translations?: Record<string, any>;
  data?: Record<string, any>;
  tags?: string[];
  status?: NodeStatus;
  domain_id: string;
  type_id: string;
  published_at?: Date;
}
