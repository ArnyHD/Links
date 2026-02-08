import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { NodeTypesService } from './node-types.service';
import { NodeType } from '../entities';
import { createMockRepository } from '../../test/test-utils';

describe('NodeTypesService', () => {
  let service: NodeTypesService;
  let mockRepository: ReturnType<typeof createMockRepository>;

  const mockNodeType = {
    id: 'nodetype-1',
    name: 'Axiom',
    slug: 'axiom',
    domain_id: 'domain-1',
    description: 'Fundamental principle',
    icon: 'book',
    color: '#FF5733',
    order: 1,
  };

  beforeEach(async () => {
    mockRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodeTypesService,
        {
          provide: getRepositoryToken(NodeType),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NodeTypesService>(NodeTypesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all node types without filter', async () => {
      const mockNodeTypes = [mockNodeType, { ...mockNodeType, id: 'nodetype-2' }];
      mockRepository.find.mockResolvedValue(mockNodeTypes);

      const result = await service.findAll();

      expect(result).toEqual(mockNodeTypes);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { order: 'ASC', created_at: 'DESC' },
        relations: ['domain'],
      });
    });

    it('should filter by domain_id when provided', async () => {
      const mockNodeTypes = [mockNodeType];
      mockRepository.find.mockResolvedValue(mockNodeTypes);

      const result = await service.findAll('domain-1');

      expect(result).toEqual(mockNodeTypes);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { domain_id: 'domain-1' },
        order: { order: 'ASC', created_at: 'DESC' },
        relations: ['domain'],
      });
    });

    it('should return empty array when no node types exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return node type when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockNodeType);

      const result = await service.findOne(mockNodeType.id);

      expect(result).toEqual(mockNodeType);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockNodeType.id },
        relations: ['domain'],
      });
    });

    it('should throw NotFoundException when node type not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'NodeType with ID non-existent-id not found',
      );
    });
  });

  describe('create', () => {
    it('should create and save a new node type', async () => {
      const createDto = {
        name: 'Theory',
        slug: 'theory',
        domain_id: 'domain-1',
        description: 'Scientific theory',
        icon: 'lightbulb',
        color: '#00FF00',
      };
      const createdNodeType = { ...mockNodeType, ...createDto };

      mockRepository.create.mockReturnValue(createdNodeType);
      mockRepository.save.mockResolvedValue(createdNodeType);

      const result = await service.create(createDto);

      expect(result).toEqual(createdNodeType);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createdNodeType);
    });

    it('should create node type with optional fields', async () => {
      const createDto = {
        name: 'Concept',
        slug: 'concept',
        domain_id: 'domain-1',
        translations: { en: 'Concept', ru: 'Концепция' },
        schema: { properties: {} },
        order: 5,
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue(createDto);

      const result = await service.create(createDto);

      expect(result).toEqual(createDto);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update node type', async () => {
      const updateDto = { name: 'Updated Axiom' };
      const updatedNodeType = { ...mockNodeType, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockNodeType);
      mockRepository.save.mockResolvedValue(updatedNodeType);

      const result = await service.update(mockNodeType.id, updateDto);

      expect(result).toEqual(updatedNodeType);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
    });

    it('should throw NotFoundException when node type not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove node type', async () => {
      mockRepository.findOne.mockResolvedValue(mockNodeType);
      mockRepository.remove.mockResolvedValue(mockNodeType);

      await service.remove(mockNodeType.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockNodeType.id },
        relations: ['domain'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockNodeType);
    });

    it('should throw NotFoundException when node type not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findByDomain', () => {
    it('should return node types for specific domain', async () => {
      const mockNodeTypes = [mockNodeType, { ...mockNodeType, id: 'nodetype-2' }];
      mockRepository.find.mockResolvedValue(mockNodeTypes);

      const result = await service.findByDomain('domain-1');

      expect(result).toEqual(mockNodeTypes);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { domain_id: 'domain-1' },
        order: { order: 'ASC', name: 'ASC' },
      });
    });

    it('should return empty array when domain has no node types', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByDomain('empty-domain');

      expect(result).toEqual([]);
    });
  });
});
