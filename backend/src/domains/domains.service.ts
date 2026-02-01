import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from '../entities';

@Injectable()
export class DomainsService {
  constructor(
    @InjectRepository(Domain)
    private domainRepository: Repository<Domain>,
  ) {}

  /**
   * Получить все домены
   * Возвращает все домены независимо от прав пользователя
   */
  async findAll(): Promise<Domain[]> {
    return await this.domainRepository.find({
      order: {
        created_at: 'DESC',
      },
      relations: ['creator'],
    });
  }
}
