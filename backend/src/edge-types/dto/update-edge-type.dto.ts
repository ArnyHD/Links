import { SemanticType } from '../../entities';

export class UpdateEdgeTypeDto {
  name?: string;
  slug?: string;
  description?: string;
  translations?: Record<string, any>;
  semantic_type?: SemanticType;
  icon?: string;
  color?: string;
  weight?: number;
  is_directed?: boolean;
}
