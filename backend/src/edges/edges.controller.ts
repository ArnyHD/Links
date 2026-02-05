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
import { EdgesService } from './edges.service';
import { CreateEdgeDto } from './dto/create-edge.dto';
import { UpdateEdgeDto } from './dto/update-edge.dto';

@Controller('edges')
@UseGuards(AuthGuard('jwt'))
export class EdgesController {
  constructor(private readonly edgesService: EdgesService) {}

  /**
   * GET /edges
   * Получить все связи (опционально фильтр по node_id или domain_id)
   */
  @Get()
  async getAllEdges(
    @Query('node_id') nodeId?: string,
    @Query('domain_id') domainId?: string,
  ) {
    const edges = await this.edgesService.findAll(nodeId, domainId);
    return {
      success: true,
      count: edges.length,
      data: edges,
    };
  }

  /**
   * GET /edges/:id
   * Получить одну связь по ID
   */
  @Get(':id')
  async getEdge(@Param('id') id: string) {
    const edge = await this.edgesService.findOne(id);
    return {
      success: true,
      data: edge,
    };
  }

  /**
   * GET /edges/node/:nodeId
   * Получить все связи узла (входящие и исходящие)
   */
  @Get('node/:nodeId')
  async getNodeEdges(@Param('nodeId') nodeId: string) {
    const edges = await this.edgesService.findNodeEdges(nodeId);
    return {
      success: true,
      data: edges,
      count: {
        outgoing: edges.outgoing.length,
        incoming: edges.incoming.length,
        total: edges.outgoing.length + edges.incoming.length,
      },
    };
  }

  /**
   * GET /edges/node/:nodeId/outgoing
   * Получить исходящие связи узла
   */
  @Get('node/:nodeId/outgoing')
  async getOutgoingEdges(@Param('nodeId') nodeId: string) {
    const edges = await this.edgesService.findOutgoingEdges(nodeId);
    return {
      success: true,
      count: edges.length,
      data: edges,
    };
  }

  /**
   * GET /edges/node/:nodeId/incoming
   * Получить входящие связи узла
   */
  @Get('node/:nodeId/incoming')
  async getIncomingEdges(@Param('nodeId') nodeId: string) {
    const edges = await this.edgesService.findIncomingEdges(nodeId);
    return {
      success: true,
      count: edges.length,
      data: edges,
    };
  }

  /**
   * POST /edges
   * Создать новую связь
   */
  @Post()
  async createEdge(@Body() createEdgeDto: CreateEdgeDto, @Req() req: any) {
    const edge = await this.edgesService.create(createEdgeDto);
    return {
      success: true,
      message: 'Edge created successfully',
      data: edge,
    };
  }

  /**
   * PUT /edges/:id
   * Обновить связь
   */
  @Put(':id')
  async updateEdge(
    @Param('id') id: string,
    @Body() updateEdgeDto: UpdateEdgeDto,
    @Req() req: any,
  ) {
    const edge = await this.edgesService.update(id, updateEdgeDto);
    return {
      success: true,
      message: 'Edge updated successfully',
      data: edge,
    };
  }

  /**
   * DELETE /edges/:id
   * Удалить связь
   */
  @Delete(':id')
  async deleteEdge(@Param('id') id: string, @Req() req: any) {
    await this.edgesService.remove(id);
    return {
      success: true,
      message: 'Edge deleted successfully',
    };
  }
}
