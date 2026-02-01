import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from '../entities';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';

@Injectable()
export class DomainsService {
  constructor(
    @InjectRepository(Domain)
    private domainRepository: Repository<Domain>,
  ) {}

  /**
   * Получить все домены
   */
  async findAll(): Promise<Domain[]> {
    return await this.domainRepository.find({
      order: {
        created_at: 'DESC',
      },
      relations: ['creator'],
    });
  }

  /**
   * Получить один домен по ID
   */
  async findOne(id: string): Promise<Domain> {
    const domain = await this.domainRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!domain) {
      throw new NotFoundException(`Domain with ID ${id} not found`);
    }

    return domain;
  }

  /**
   * Создать новый домен
   */
  async create(createDomainDto: CreateDomainDto, userId: string): Promise<Domain> {
    const domain = this.domainRepository.create({
      ...createDomainDto,
      creator_id: userId,
    });

    return await this.domainRepository.save(domain);
  }

  /**
   * Обновить домен
   */
  async update(
    id: string,
    updateDomainDto: UpdateDomainDto,
    userId: string,
  ): Promise<Domain> {
    const domain = await this.findOne(id);

    // Проверяем, что пользователь - создатель домена
    if (domain.creator_id !== userId) {
      throw new ForbiddenException('You can only update your own domains');
    }

    Object.assign(domain, updateDomainDto);
    return await this.domainRepository.save(domain);
  }

  /**
   * Удалить домен
   */
  async remove(id: string, userId: string): Promise<void> {
    const domain = await this.findOne(id);

    // Проверяем, что пользователь - создатель домена
    if (domain.creator_id !== userId) {
      throw new ForbiddenException('You can only delete your own domains');
    }

    await this.domainRepository.remove(domain);
  }
}
