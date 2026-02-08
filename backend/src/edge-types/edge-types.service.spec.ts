import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { EdgeTypesService } from './edge-types.service';
import { EdgeType } from '../entities';
import { createMockRepository } from '../../test/test-utils';

describe('EdgeTypesService', () => {
  let service: EdgeTypesService;
  let mockRepository: ReturnType<typeof createMockRepository>;

  const mockEdgeType = {
    id: 'edgetype-1',
    name: 'Derives From',
    slug: 'derives-from',
    domain_id: 'domain-1',
    semantic_type: 'causal',
    is_directed: true,
  };

  beforeEach(async () => {
    mockRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdgeTypesService,
        {
          provide: getRepositoryToken(EdgeType),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EdgeTypesService>(EdgeTypesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all edge types without filter', async () => {
      const mockEdgeTypes = [mockEdgeType, { ...mockEdgeType, id: 'edgetype-2' }];
      mockRepository.find.mockResolvedValue(mockEdgeTypes);

      const result = await service.findAll();

      expect(result).toEqual(mockEdgeTypes);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { name: 'ASC', created_at: 'DESC' },
        relations: ['domain'],
      });
    });

    it('should filter by domain_id when provided', async () => {
      const mockEdgeTypes = [mockEdgeType];
      mockRepository.find.mockResolvedValue(mockEdgeTypes);

      const result = await service.findAll('domain-1');

      expect(result).toEqual(mockEdgeTypes);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { domain_id: 'domain-1' },
        order: { name: 'ASC', created_at: 'DESC' },
        relations: ['domain'],
      });
    });
  });

  describe('findOne', () => {
    it('should return edge type when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockEdgeType);

      const result = await service.findOne(mockEdgeType.id);

      expect(result).toEqual(mockEdgeType);
    });

    it('should throw NotFoundException when edge type not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and save a new edge type', async () => {
      const createDto: any = {
        name: 'Supports',
        slug: 'supports',
        domain_id: 'domain-1',
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue(createDto);

      const result = await service.create(createDto);

      expect(result).toEqual(createDto);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update edge type', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedEdgeType = { ...mockEdgeType, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockEdgeType);
      mockRepository.save.mockResolvedValue(updatedEdgeType);

      const result = await service.update(mockEdgeType.id, updateDto);

      expect(result).toEqual(updatedEdgeType);
    });

    it('should throw NotFoundException when edge type not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove edge type', async () => {
      mockRepository.findOne.mockResolvedValue(mockEdgeType);
      mockRepository.remove.mockResolvedValue(mockEdgeType);

      await service.remove(mockEdgeType.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockEdgeType);
    });
  });

  describe('findByDomain', () => {
    it('should return edge types for specific domain', async () => {
      const mockEdgeTypes = [mockEdgeType];
      mockRepository.find.mockResolvedValue(mockEdgeTypes);

      const result = await service.findByDomain('domain-1');

      expect(result).toEqual(mockEdgeTypes);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { domain_id: 'domain-1' },
        order: { name: 'ASC' },
      });
    });
  });
});
