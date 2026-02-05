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
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NodesService } from './nodes.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { NodeStatus } from '../entities';

@Controller('nodes')
@UseGuards(AuthGuard('jwt'))
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  /**
   * GET /nodes
   * Получить все узлы (с опциональными фильтрами)
   */
  @Get()
  async getAllNodes(
    @Query('domain_id') domainId?: string,
    @Query('type_id') typeId?: string,
    @Query('status') status?: NodeStatus,
    @Query('tags') tags?: string,
  ) {
    const tagsArray = tags ? tags.split(',') : undefined;
    const nodes = await this.nodesService.findAll(
      domainId,
      typeId,
      status,
      tagsArray,
    );
    return {
      success: true,
      count: nodes.length,
      data: nodes,
    };
  }

  /**
   * GET /nodes/search
   * Полнотекстовый поиск узлов
   */
  @Get('search')
  async searchNodes(@Query('q') query: string) {
    const nodes = await this.nodesService.search(query);
    return {
      success: true,
      count: nodes.length,
      data: nodes,
    };
  }

  /**
   * GET /nodes/by-domain/:domainId
   * Получить узлы по домену
   */
  @Get('by-domain/:domainId')
  async getNodesByDomain(
    @Param('domainId') domainId: string,
    @Query('status') status?: NodeStatus,
  ) {
    const nodes = await this.nodesService.findByDomain(domainId, status);
    return {
      success: true,
      count: nodes.length,
      data: nodes,
    };
  }

  /**
   * GET /nodes/by-type/:typeId
   * Получить узлы по типу
   */
  @Get('by-type/:typeId')
  async getNodesByType(
    @Param('typeId') typeId: string,
    @Query('status') status?: NodeStatus,
  ) {
    const nodes = await this.nodesService.findByType(typeId, status);
    return {
      success: true,
      count: nodes.length,
      data: nodes,
    };
  }

  /**
   * GET /nodes/by-tags
   * Получить узлы по тегам
   */
  @Get('by-tags')
  async getNodesByTags(@Query('tags') tags: string) {
    const tagsArray = tags.split(',');
    const nodes = await this.nodesService.findByTags(tagsArray);
    return {
      success: true,
      count: nodes.length,
      data: nodes,
    };
  }

  /**
   * GET /nodes/slug/:slug
   * Получить узел по slug
   */
  @Get('slug/:slug')
  async getNodeBySlug(@Param('slug') slug: string) {
    const node = await this.nodesService.findBySlug(slug);
    return {
      success: true,
      data: node,
    };
  }

  /**
   * GET /nodes/:id
   * Получить один узел по ID
   */
  @Get(':id')
  async getNode(@Param('id') id: string) {
    const node = await this.nodesService.findOne(id);
    return {
      success: true,
      data: node,
    };
  }

  /**
   * POST /nodes
   * Создать новый узел
   */
  @Post()
  async createNode(@Body() createNodeDto: CreateNodeDto, @Req() req: any) {
    const node = await this.nodesService.create(createNodeDto, req.user.id);
    return {
      success: true,
      message: 'Node created successfully',
      data: node,
    };
  }

  /**
   * PUT /nodes/:id
   * Обновить узел
   */
  @Put(':id')
  async updateNode(
    @Param('id') id: string,
    @Body() updateNodeDto: UpdateNodeDto,
    @Req() req: any,
  ) {
    const node = await this.nodesService.update(id, updateNodeDto, req.user.id);
    return {
      success: true,
      message: 'Node updated successfully',
      data: node,
    };
  }

  /**
   * PATCH /nodes/:id/publish
   * Опубликовать узел
   */
  @Patch(':id/publish')
  async publishNode(@Param('id') id: string, @Req() req: any) {
    const node = await this.nodesService.publish(id, req.user.id);
    return {
      success: true,
      message: 'Node published successfully',
      data: node,
    };
  }

  /**
   * PATCH /nodes/:id/archive
   * Архивировать узел
   */
  @Patch(':id/archive')
  async archiveNode(@Param('id') id: string, @Req() req: any) {
    const node = await this.nodesService.archive(id, req.user.id);
    return {
      success: true,
      message: 'Node archived successfully',
      data: node,
    };
  }

  /**
   * DELETE /nodes/:id
   * Удалить узел
   */
  @Delete(':id')
  async deleteNode(@Param('id') id: string, @Req() req: any) {
    await this.nodesService.remove(id, req.user.id);
    return {
      success: true,
      message: 'Node deleted successfully',
    };
  }
}
