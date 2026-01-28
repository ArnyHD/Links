import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from './entities/domain.entity';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';

@Injectable()
export class DomainsService {
  constructor(
    @InjectRepository(Domain)
    private readonly domainRepository: Repository<Domain>,
  ) {}

  async create(createDomainDto: CreateDomainDto, userId: string): Promise<Domain> {
    const slug = this.generateSlug(createDomainDto.name);

    const domain = this.domainRepository.create({
      ...createDomainDto,
      slug,
      creatorId: userId,
    });

    return this.domainRepository.save(domain);
  }

  async findAll(isPublic?: boolean): Promise<Domain[]> {
    const query = this.domainRepository
      .createQueryBuilder('domain')
      .leftJoinAndSelect('domain.creator', 'creator')
      .where('domain.isActive = :isActive', { isActive: true });

    if (isPublic !== undefined) {
      query.andWhere('domain.isPublic = :isPublic', { isPublic });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Domain> {
    const domain = await this.domainRepository.findOne({
      where: { id },
      relations: ['creator', 'nodeTypes', 'edgeTypes'],
    });

    if (!domain) {
      throw new NotFoundException(`Domain with ID ${id} not found`);
    }

    return domain;
  }

  async findBySlug(slug: string): Promise<Domain> {
    const domain = await this.domainRepository.findOne({
      where: { slug },
      relations: ['creator', 'nodeTypes', 'edgeTypes'],
    });

    if (!domain) {
      throw new NotFoundException(`Domain with slug ${slug} not found`);
    }

    return domain;
  }

  async update(id: string, updateDomainDto: UpdateDomainDto): Promise<Domain> {
    const domain = await this.findOne(id);

    if (updateDomainDto.name) {
      domain.slug = this.generateSlug(updateDomainDto.name);
    }

    Object.assign(domain, updateDomainDto);
    return this.domainRepository.save(domain);
  }

  async remove(id: string): Promise<void> {
    const domain = await this.findOne(id);
    await this.domainRepository.remove(domain);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
