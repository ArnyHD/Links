import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EdgeType } from '../entities';
import { CreateEdgeTypeDto } from './dto/create-edge-type.dto';
import { UpdateEdgeTypeDto } from './dto/update-edge-type.dto';

@Injectable()
export class EdgeTypesService {
  constructor(
    @InjectRepository(EdgeType)
    private edgeTypeRepository: Repository<EdgeType>,
  ) {}

  /**
   * Получить все типы связей
   */
  async findAll(domainId?: string): Promise<EdgeType[]> {
    const where = domainId ? { domain_id: domainId } : {};
    return await this.edgeTypeRepository.find({
      where,
      order: {
        name: 'ASC',
        created_at: 'DESC',
      },
      relations: ['domain'],
    });
  }

  /**
   * Получить один тип связи по ID
   */
  async findOne(id: string): Promise<EdgeType> {
    const edgeType = await this.edgeTypeRepository.findOne({
      where: { id },
      relations: ['domain'],
    });

    if (!edgeType) {
      throw new NotFoundException(`EdgeType with ID ${id} not found`);
    }

    return edgeType;
  }

  /**
   * Создать новый тип связи
   */
  async create(createEdgeTypeDto: CreateEdgeTypeDto): Promise<EdgeType> {
    const edgeType = this.edgeTypeRepository.create(createEdgeTypeDto);
    return await this.edgeTypeRepository.save(edgeType);
  }

  /**
   * Обновить тип связи
   */
  async update(
    id: string,
    updateEdgeTypeDto: UpdateEdgeTypeDto,
  ): Promise<EdgeType> {
    const edgeType = await this.findOne(id);

    Object.assign(edgeType, updateEdgeTypeDto);
    return await this.edgeTypeRepository.save(edgeType);
  }

  /**
   * Удалить тип связи
   */
  async remove(id: string): Promise<void> {
    const edgeType = await this.findOne(id);
    await this.edgeTypeRepository.remove(edgeType);
  }

  /**
   * Получить типы связей по домену
   */
  async findByDomain(domainId: string): Promise<EdgeType[]> {
    return await this.edgeTypeRepository.find({
      where: { domain_id: domainId },
      order: {
        name: 'ASC',
      },
    });
  }
}
