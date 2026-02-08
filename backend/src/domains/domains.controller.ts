import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';

@ApiTags('domains')
@Controller('domains')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  /**
   * GET /domains
   * Получить все домены
   */
  @Get()
  @ApiOperation({
    summary: 'Get all domains',
    description: 'Returns list of all knowledge domains with creator information',
  })
  @ApiResponse({
    status: 200,
    description: 'Domains retrieved successfully',
    schema: {
      example: {
        success: true,
        count: 2,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Physics Theories',
            slug: 'physics-theories',
            description: 'Classical and modern physics theories',
            is_public: true,
            is_active: true,
            creator: {
              id: 'user-id',
              email: 'admin@example.com',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  async getAllDomains() {
    const domains = await this.domainsService.findAll();
    return {
      success: true,
      count: domains.length,
      data: domains,
    };
  }

  /**
   * GET /domains/:id
   * Получить один домен по ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get domain by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Domain UUID' })
  @ApiResponse({ status: 200, description: 'Domain found' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDomain(@Param('id') id: string) {
    const domain = await this.domainsService.findOne(id);
    return {
      success: true,
      data: domain,
    };
  }

  /**
   * POST /domains
   * Создать новый домен
   */
  @Post()
  @ApiOperation({ summary: 'Create new domain' })
  @ApiBody({ type: CreateDomainDto })
  @ApiResponse({ status: 201, description: 'Domain created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createDomain(@Body() createDomainDto: CreateDomainDto, @Req() req: any) {
    const domain = await this.domainsService.create(
      createDomainDto,
      req.user.id,
    );
    return {
      success: true,
      message: 'Domain created successfully',
      data: domain,
    };
  }

  /**
   * PUT /domains/:id
   * Обновить домен
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update domain' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateDomainDto })
  @ApiResponse({ status: 200, description: 'Domain updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not domain creator' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateDomain(
    @Param('id') id: string,
    @Body() updateDomainDto: UpdateDomainDto,
    @Req() req: any,
  ) {
    const domain = await this.domainsService.update(
      id,
      updateDomainDto,
      req.user.id,
    );
    return {
      success: true,
      message: 'Domain updated successfully',
      data: domain,
    };
  }

  /**
   * DELETE /domains/:id
   * Удалить домен
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete domain' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Domain deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not domain creator' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteDomain(@Param('id') id: string, @Req() req: any) {
    await this.domainsService.remove(id, req.user.id);
    return {
      success: true,
      message: 'Domain deleted successfully',
    };
  }
}
