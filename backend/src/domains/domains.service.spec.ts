import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { Domain } from '../entities';
import { createMockRepository } from '../../test/test-utils';

describe('DomainsService', () => {
  let service: DomainsService;
  let mockRepository: ReturnType<typeof createMockRepository>;

  const mockDomain = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Domain',
    slug: 'test-domain',
    description: 'Test description',
    is_public: true,
    is_active: true,
    creator_id: 'user-1',
    creator: {
      id: 'user-1',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    mockRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainsService,
        {
          provide: getRepositoryToken(Domain),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DomainsService>(DomainsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of domains sorted by created_at DESC', async () => {
      const mockDomains = [mockDomain, { ...mockDomain, id: 'domain-2' }];
      mockRepository.find.mockResolvedValue(mockDomains);

      const result = await service.findAll();

      expect(result).toEqual(mockDomains);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { created_at: 'DESC' },
        relations: ['creator'],
      });
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no domains exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return domain when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockDomain);

      const result = await service.findOne(mockDomain.id);

      expect(result).toEqual(mockDomain);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockDomain.id },
        relations: ['creator'],
      });
    });

    it('should throw NotFoundException when domain not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Domain with ID non-existent-id not found',
      );
    });
  });

  describe('create', () => {
    it('should create and save a new domain', async () => {
      const createDto = {
        name: 'New Domain',
        slug: 'new-domain',
        description: 'New description',
      };
      const userId = 'user-1';
      const createdDomain = { ...mockDomain, ...createDto };

      mockRepository.create.mockReturnValue(createdDomain);
      mockRepository.save.mockResolvedValue(createdDomain);

      const result = await service.create(createDto, userId);

      expect(result).toEqual(createdDomain);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        creator_id: userId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdDomain);
    });

    it('should create domain with all optional fields', async () => {
      const createDto = {
        name: 'Complete Domain',
        slug: 'complete-domain',
        description: 'Complete description',
        translations: { en: 'Complete Domain' },
        is_public: false,
        is_active: true,
        settings: { theme: 'dark' },
      };
      const userId = 'user-1';
      const createdDomain = { ...mockDomain, ...createDto };

      mockRepository.create.mockReturnValue(createdDomain);
      mockRepository.save.mockResolvedValue(createdDomain);

      const result = await service.create(createDto, userId);

      expect(result).toEqual(createdDomain);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        creator_id: userId,
      });
    });
  });

  describe('update', () => {
    it('should update domain when user is creator', async () => {
      const updateDto = { name: 'Updated Domain' };
      const updatedDomain = { ...mockDomain, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockDomain);
      mockRepository.save.mockResolvedValue(updatedDomain);

      const result = await service.update(mockDomain.id, updateDto, 'user-1');

      expect(result).toEqual(updatedDomain);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockDomain.id },
        relations: ['creator'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      mockRepository.findOne.mockResolvedValue(mockDomain);

      await expect(
        service.update(mockDomain.id, { name: 'Updated' }, 'user-2'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update(mockDomain.id, { name: 'Updated' }, 'user-2'),
      ).rejects.toThrow('You can only update your own domains');

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when domain not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'Updated' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove domain when user is creator', async () => {
      mockRepository.findOne.mockResolvedValue(mockDomain);
      mockRepository.remove.mockResolvedValue(mockDomain);

      await service.remove(mockDomain.id, 'user-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockDomain.id },
        relations: ['creator'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockDomain);
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      mockRepository.findOne.mockResolvedValue(mockDomain);

      await expect(service.remove(mockDomain.id, 'user-2')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.remove(mockDomain.id, 'user-2')).rejects.toThrow(
        'You can only delete your own domains',
      );

      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when domain not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id', 'user-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
