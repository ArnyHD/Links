import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Edge } from '../entities';
import { CreateEdgeDto } from './dto/create-edge.dto';
import { UpdateEdgeDto } from './dto/update-edge.dto';

@Injectable()
export class EdgesService {
  constructor(
    @InjectRepository(Edge)
    private edgeRepository: Repository<Edge>,
  ) {}

  /**
   * Получить все связи
   */
  async findAll(nodeId?: string, domainId?: string): Promise<Edge[]> {
    const queryBuilder = this.edgeRepository
      .createQueryBuilder('edge')
      .leftJoinAndSelect('edge.source', 'source')
      .leftJoinAndSelect('edge.target', 'target')
      .leftJoinAndSelect('edge.type', 'type')
      .orderBy('edge.created_at', 'DESC');

    if (nodeId) {
      queryBuilder.where('edge.source_id = :nodeId OR edge.target_id = :nodeId', {
        nodeId,
      });
    }

    if (domainId) {
      queryBuilder.andWhere('source.domain_id = :domainId', { domainId });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Получить одну связь по ID
   */
  async findOne(id: string): Promise<Edge> {
    const edge = await this.edgeRepository.findOne({
      where: { id },
      relations: ['source', 'target', 'type'],
    });

    if (!edge) {
      throw new NotFoundException(`Edge with ID ${id} not found`);
    }

    return edge;
  }

  /**
   * Создать новую связь
   */
  async create(createEdgeDto: CreateEdgeDto): Promise<Edge> {
    // Проверка на self-loop
    if (createEdgeDto.source_id === createEdgeDto.target_id) {
      throw new BadRequestException(
        'Self-loops are not allowed. Source and target must be different nodes.',
      );
    }

    const edge = this.edgeRepository.create(createEdgeDto);
    return await this.edgeRepository.save(edge);
  }

  /**
   * Обновить связь
   */
  async update(id: string, updateEdgeDto: UpdateEdgeDto): Promise<Edge> {
    const edge = await this.findOne(id);

    Object.assign(edge, updateEdgeDto);
    return await this.edgeRepository.save(edge);
  }

  /**
   * Удалить связь
   */
  async remove(id: string): Promise<void> {
    const edge = await this.findOne(id);
    await this.edgeRepository.remove(edge);
  }

  /**
   * Получить исходящие связи узла
   */
  async findOutgoingEdges(nodeId: string): Promise<Edge[]> {
    return await this.edgeRepository.find({
      where: { source_id: nodeId },
      relations: ['target', 'type'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Получить входящие связи узла
   */
  async findIncomingEdges(nodeId: string): Promise<Edge[]> {
    return await this.edgeRepository.find({
      where: { target_id: nodeId },
      relations: ['source', 'type'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Получить все связи узла (входящие + исходящие)
   */
  async findNodeEdges(nodeId: string): Promise<{
    outgoing: Edge[];
    incoming: Edge[];
  }> {
    const [outgoing, incoming] = await Promise.all([
      this.findOutgoingEdges(nodeId),
      this.findIncomingEdges(nodeId),
    ]);

    return { outgoing, incoming };
  }
}
