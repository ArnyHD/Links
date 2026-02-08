import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDomainDto {
  @ApiPropertyOptional({ description: 'Domain name', example: 'Physics Theories' })
  name?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug', example: 'physics-theories' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Domain description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Translations' })
  translations?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Is publicly accessible' })
  is_public?: boolean;

  @ApiPropertyOptional({ description: 'Is active' })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional settings' })
  settings?: Record<string, any>;
}
