import { IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDomainDto {
  @ApiProperty({ example: 'Physics Theories' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'A domain for organizing physics theories and experiments',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: { en: { name: 'Physics Theories', description: 'English description' } },
    required: false
  })
  @IsObject()
  @IsOptional()
  translations?: Record<string, { name: string; description: string }>;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({
    example: { allowComments: true, requireModeration: false },
    required: false
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
