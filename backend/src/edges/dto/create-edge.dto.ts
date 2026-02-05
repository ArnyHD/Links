export class CreateEdgeDto {
  source_id: string;
  target_id: string;
  type_id: string;
  description?: string;
  metadata?: Record<string, any>;
}
