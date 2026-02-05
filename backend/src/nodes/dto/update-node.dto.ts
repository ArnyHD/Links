import { NodeStatus } from '../../entities';

export class UpdateNodeDto {
  title?: string;
  slug?: string;
  excerpt?: string;
  cover_image?: string;
  content?: Record<string, any>;
  content_html?: string;
  reading_time?: number;
  translations?: Record<string, any>;
  data?: Record<string, any>;
  tags?: string[];
  status?: NodeStatus;
  type_id?: string;
  published_at?: Date;
}
