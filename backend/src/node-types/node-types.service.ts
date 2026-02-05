import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NodeType } from '../entities';
import { CreateNodeTypeDto } from './dto/create-node-type.dto';
import { UpdateNodeTypeDto } from './dto/update-node-type.dto';

@Injectable()
export class NodeTypesService {
  constructor(
    @InjectRepository(NodeType)
    private nodeTypeRepository: Repository<NodeType>,
  ) {}

  /**
   * Получить все типы узлов
   */
  async findAll(domainId?: string): Promise<NodeType[]> {
    const where = domainId ? { domain_id: domainId } : {};
    return await this.nodeTypeRepository.find({
      where,
      order: {
        order: 'ASC',
        created_at: 'DESC',
      },
      relations: ['domain'],
    });
  }

  /**
   * Получить один тип узла по ID
   */
  async findOne(id: string): Promise<NodeType> {
    const nodeType = await this.nodeTypeRepository.findOne({
      where: { id },
      relations: ['domain'],
    });

    if (!nodeType) {
      throw new NotFoundException(`NodeType with ID ${id} not found`);
    }

    return nodeType;
  }

  /**
   * Создать новый тип узла
   */
  async create(createNodeTypeDto: CreateNodeTypeDto): Promise<NodeType> {
    const nodeType = this.nodeTypeRepository.create(createNodeTypeDto);
    return await this.nodeTypeRepository.save(nodeType);
  }

  /**
   * Обновить тип узла
   */
  async update(
    id: string,
    updateNodeTypeDto: UpdateNodeTypeDto,
  ): Promise<NodeType> {
    const nodeType = await this.findOne(id);

    Object.assign(nodeType, updateNodeTypeDto);
    return await this.nodeTypeRepository.save(nodeType);
  }

  /**
   * Удалить тип узла
   */
  async remove(id: string): Promise<void> {
    const nodeType = await this.findOne(id);
    await this.nodeTypeRepository.remove(nodeType);
  }

  /**
   * Получить типы узлов по домену
   */
  async findByDomain(domainId: string): Promise<NodeType[]> {
    return await this.nodeTypeRepository.find({
      where: { domain_id: domainId },
      order: {
        order: 'ASC',
        name: 'ASC',
      },
    });
  }
}
