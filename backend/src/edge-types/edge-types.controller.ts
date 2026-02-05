import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EdgeTypesService } from './edge-types.service';
import { CreateEdgeTypeDto } from './dto/create-edge-type.dto';
import { UpdateEdgeTypeDto } from './dto/update-edge-type.dto';

@Controller('edge-types')
@UseGuards(AuthGuard('jwt'))
export class EdgeTypesController {
  constructor(private readonly edgeTypesService: EdgeTypesService) {}

  /**
   * GET /edge-types
   * Получить все типы связей (опционально фильтр по domain_id)
   */
  @Get()
  async getAllEdgeTypes(@Query('domain_id') domainId?: string) {
    const edgeTypes = await this.edgeTypesService.findAll(domainId);
    return {
      success: true,
      count: edgeTypes.length,
      data: edgeTypes,
    };
  }

  /**
   * GET /edge-types/:id
   * Получить один тип связи по ID
   */
  @Get(':id')
  async getEdgeType(@Param('id') id: string) {
    const edgeType = await this.edgeTypesService.findOne(id);
    return {
      success: true,
      data: edgeType,
    };
  }

  /**
   * GET /edge-types/by-domain/:domainId
   * Получить все типы связей для конкретного домена
   */
  @Get('by-domain/:domainId')
  async getEdgeTypesByDomain(@Param('domainId') domainId: string) {
    const edgeTypes = await this.edgeTypesService.findByDomain(domainId);
    return {
      success: true,
      count: edgeTypes.length,
      data: edgeTypes,
    };
  }

  /**
   * POST /edge-types
   * Создать новый тип связи
   */
  @Post()
  async createEdgeType(
    @Body() createEdgeTypeDto: CreateEdgeTypeDto,
    @Req() req: any,
  ) {
    const edgeType = await this.edgeTypesService.create(createEdgeTypeDto);
    return {
      success: true,
      message: 'EdgeType created successfully',
      data: edgeType,
    };
  }

  /**
   * PUT /edge-types/:id
   * Обновить тип связи
   */
  @Put(':id')
  async updateEdgeType(
    @Param('id') id: string,
    @Body() updateEdgeTypeDto: UpdateEdgeTypeDto,
    @Req() req: any,
  ) {
    const edgeType = await this.edgeTypesService.update(id, updateEdgeTypeDto);
    return {
      success: true,
      message: 'EdgeType updated successfully',
      data: edgeType,
    };
  }

  /**
   * DELETE /edge-types/:id
   * Удалить тип связи
   */
  @Delete(':id')
  async deleteEdgeType(@Param('id') id: string, @Req() req: any) {
    await this.edgeTypesService.remove(id);
    return {
      success: true,
      message: 'EdgeType deleted successfully',
    };
  }
}
