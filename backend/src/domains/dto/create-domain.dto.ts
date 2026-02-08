import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDomainDto {
  @ApiProperty({
    description: 'Domain name',
    example: 'Physics Theories',
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'physics-theories',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Domain description',
    example: 'Classical and modern physics theories',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Translations for name and description',
    example: { en: 'Physics Theories', ru: 'Физические теории' },
  })
  translations?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Is domain publicly accessible',
    example: true,
    default: true,
  })
  is_public?: boolean;

  @ApiPropertyOptional({
    description: 'Is domain active',
    example: true,
    default: true,
  })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Additional domain settings',
    example: { theme: 'dark' },
  })
  settings?: Record<string, any>;
}
