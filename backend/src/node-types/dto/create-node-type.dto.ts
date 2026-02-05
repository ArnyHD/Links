export class CreateNodeTypeDto {
  name: string;
  slug: string;
  description?: string;
  translations?: Record<string, any>;
  icon?: string;
  color?: string;
  schema?: Record<string, any>;
  order?: number;
  domain_id: string;
}
