export class UpdateDomainDto {
  name?: string;
  slug?: string;
  description?: string;
  translations?: Record<string, any>;
  is_public?: boolean;
  is_active?: boolean;
  settings?: Record<string, any>;
}
