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
import { NodeTypesService } from './node-types.service';
import { CreateNodeTypeDto } from './dto/create-node-type.dto';
import { UpdateNodeTypeDto } from './dto/update-node-type.dto';

@Controller('node-types')
@UseGuards(AuthGuard('jwt'))
export class NodeTypesController {
  constructor(private readonly nodeTypesService: NodeTypesService) {}

  /**
   * GET /node-types
   * Получить все типы узлов (опционально фильтр по domain_id)
   */
  @Get()
  async getAllNodeTypes(@Query('domain_id') domainId?: string) {
    const nodeTypes = await this.nodeTypesService.findAll(domainId);
    return {
      success: true,
      count: nodeTypes.length,
      data: nodeTypes,
    };
  }

  /**
   * GET /node-types/:id
   * Получить один тип узла по ID
   */
  @Get(':id')
  async getNodeType(@Param('id') id: string) {
    const nodeType = await this.nodeTypesService.findOne(id);
    return {
      success: true,
      data: nodeType,
    };
  }

  /**
   * GET /node-types/by-domain/:domainId
   * Получить все типы узлов для конкретного домена
   */
  @Get('by-domain/:domainId')
  async getNodeTypesByDomain(@Param('domainId') domainId: string) {
    const nodeTypes = await this.nodeTypesService.findByDomain(domainId);
    return {
      success: true,
      count: nodeTypes.length,
      data: nodeTypes,
    };
  }

  /**
   * POST /node-types
   * Создать новый тип узла
   */
  @Post()
  async createNodeType(
    @Body() createNodeTypeDto: CreateNodeTypeDto,
    @Req() req: any,
  ) {
    const nodeType = await this.nodeTypesService.create(createNodeTypeDto);
    return {
      success: true,
      message: 'NodeType created successfully',
      data: nodeType,
    };
  }

  /**
   * PUT /node-types/:id
   * Обновить тип узла
   */
  @Put(':id')
  async updateNodeType(
    @Param('id') id: string,
    @Body() updateNodeTypeDto: UpdateNodeTypeDto,
    @Req() req: any,
  ) {
    const nodeType = await this.nodeTypesService.update(id, updateNodeTypeDto);
    return {
      success: true,
      message: 'NodeType updated successfully',
      data: nodeType,
    };
  }

  /**
   * DELETE /node-types/:id
   * Удалить тип узла
   */
  @Delete(':id')
  async deleteNodeType(@Param('id') id: string, @Req() req: any) {
    await this.nodeTypesService.remove(id);
    return {
      success: true,
      message: 'NodeType deleted successfully',
    };
  }
}
