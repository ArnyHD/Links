import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Node, NodeStatus } from '../entities';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';

@Injectable()
export class NodesService {
  constructor(
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
  ) {}

  /**
   * Получить все узлы
   */
  async findAll(
    domainId?: string,
    typeId?: string,
    status?: NodeStatus,
    tags?: string[],
  ): Promise<Node[]> {
    const queryBuilder = this.nodeRepository
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.domain', 'domain')
      .leftJoinAndSelect('node.type', 'type')
      .leftJoinAndSelect('node.creator', 'creator')
      .orderBy('node.created_at', 'DESC');

    if (domainId) {
      queryBuilder.andWhere('node.domain_id = :domainId', { domainId });
    }

    if (typeId) {
      queryBuilder.andWhere('node.type_id = :typeId', { typeId });
    }

    if (status) {
      queryBuilder.andWhere('node.status = :status', { status });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('node.tags && :tags', { tags });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Получить один узел по ID
   */
  async findOne(id: string): Promise<Node> {
    const node = await this.nodeRepository.findOne({
      where: { id },
      relations: ['domain', 'type', 'creator'],
    });

    if (!node) {
      throw new NotFoundException(`Node with ID ${id} not found`);
    }

    return node;
  }

  /**
   * Получить один узел по slug
   */
  async findBySlug(slug: string): Promise<Node> {
    const node = await this.nodeRepository.findOne({
      where: { slug },
      relations: ['domain', 'type', 'creator'],
    });

    if (!node) {
      throw new NotFoundException(`Node with slug "${slug}" not found`);
    }

    return node;
  }

  /**
   * Создать новый узел
   */
  async create(createNodeDto: CreateNodeDto, userId: string): Promise<Node> {
    const node = this.nodeRepository.create({
      ...createNodeDto,
      creator_id: userId,
    });

    return await this.nodeRepository.save(node);
  }

  /**
   * Обновить узел
   */
  async update(
    id: string,
    updateNodeDto: UpdateNodeDto,
    userId: string,
  ): Promise<Node> {
    const node = await this.findOne(id);

    // Проверяем, что пользователь - создатель узла
    if (node.creator_id !== userId) {
      throw new ForbiddenException('You can only update your own nodes');
    }

    Object.assign(node, updateNodeDto);
    return await this.nodeRepository.save(node);
  }

  /**
   * Удалить узел
   */
  async remove(id: string, userId: string): Promise<void> {
    const node = await this.findOne(id);

    // Проверяем, что пользователь - создатель узла
    if (node.creator_id !== userId) {
      throw new ForbiddenException('You can only delete your own nodes');
    }

    await this.nodeRepository.remove(node);
  }

  /**
   * Получить узлы по домену
   */
  async findByDomain(domainId: string, status?: NodeStatus): Promise<Node[]> {
    const where: any = { domain_id: domainId };
    if (status) {
      where.status = status;
    }

    return await this.nodeRepository.find({
      where,
      relations: ['type', 'creator'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Получить узлы по типу
   */
  async findByType(typeId: string, status?: NodeStatus): Promise<Node[]> {
    const where: any = { type_id: typeId };
    if (status) {
      where.status = status;
    }

    return await this.nodeRepository.find({
      where,
      relations: ['domain', 'creator'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Поиск узлов по тегам
   */
  async findByTags(tags: string[]): Promise<Node[]> {
    return await this.nodeRepository
      .createQueryBuilder('node')
      .where('node.tags && :tags', { tags })
      .leftJoinAndSelect('node.domain', 'domain')
      .leftJoinAndSelect('node.type', 'type')
      .orderBy('node.created_at', 'DESC')
      .getMany();
  }

  /**
   * Полнотекстовый поиск
   */
  async search(query: string): Promise<Node[]> {
    return await this.nodeRepository
      .createQueryBuilder('node')
      .where('node.title ILIKE :query', { query: `%${query}%` })
      .orWhere('node.excerpt ILIKE :query', { query: `%${query}%` })
      .leftJoinAndSelect('node.domain', 'domain')
      .leftJoinAndSelect('node.type', 'type')
      .orderBy('node.created_at', 'DESC')
      .getMany();
  }

  /**
   * Публикация узла
   */
  async publish(id: string, userId: string): Promise<Node> {
    const node = await this.findOne(id);

    if (node.creator_id !== userId) {
      throw new ForbiddenException('You can only publish your own nodes');
    }

    node.status = NodeStatus.PUBLISHED;
    node.published_at = new Date();

    return await this.nodeRepository.save(node);
  }

  /**
   * Архивирование узла
   */
  async archive(id: string, userId: string): Promise<Node> {
    const node = await this.findOne(id);

    if (node.creator_id !== userId) {
      throw new ForbiddenException('You can only archive your own nodes');
    }

    node.status = NodeStatus.ARCHIVED;

    return await this.nodeRepository.save(node);
  }
}
