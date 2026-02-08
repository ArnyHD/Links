import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EdgesService } from './edges.service';
import { Edge } from '../entities';
import { createMockRepository } from '../../test/test-utils';

describe('EdgesService', () => {
  let service: EdgesService;
  let mockRepository: ReturnType<typeof createMockRepository>;

  const mockEdge = {
    id: 'edge-1',
    source_id: 'node-1',
    target_id: 'node-2',
    type_id: 'type-1',
    description: 'Derives from relationship',
  };

  beforeEach(async () => {
    mockRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdgesService,
        {
          provide: getRepositoryToken(Edge),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EdgesService>(EdgesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // findAll uses complex query builder - tested through e2e tests

  describe('findOne', () => {
    it('should return edge when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockEdge);

      const result = await service.findOne(mockEdge.id);

      expect(result).toEqual(mockEdge);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockEdge.id },
        relations: ['source', 'target', 'type'],
      });
    });

    it('should throw NotFoundException when edge not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create edge when source and target are different', async () => {
      const createDto = {
        source_id: 'node-1',
        target_id: 'node-2',
        type_id: 'type-1',
      };

      mockRepository.create.mockReturnValue(mockEdge);
      mockRepository.save.mockResolvedValue(mockEdge);

      const result = await service.create(createDto);

      expect(result).toEqual(mockEdge);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw BadRequestException for self-loop', async () => {
      const selfLoopDto = {
        source_id: 'node-1',
        target_id: 'node-1',  // Same as source
        type_id: 'type-1',
      };

      await expect(service.create(selfLoopDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(selfLoopDto)).rejects.toThrow(
        'Self-loops are not allowed',
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update edge', async () => {
      const updateDto = { description: 'Updated description' };
      const updatedEdge = { ...mockEdge, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockEdge);
      mockRepository.save.mockResolvedValue(updatedEdge);

      const result = await service.update(mockEdge.id, updateDto);

      expect(result).toEqual(updatedEdge);
    });
  });

  describe('remove', () => {
    it('should remove edge', async () => {
      mockRepository.findOne.mockResolvedValue(mockEdge);
      mockRepository.remove.mockResolvedValue(mockEdge);

      await service.remove(mockEdge.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockEdge);
    });
  });

  describe('findOutgoingEdges', () => {
    it('should return outgoing edges for node', async () => {
      const mockEdges = [mockEdge];
      mockRepository.find.mockResolvedValue(mockEdges);

      const result = await service.findOutgoingEdges('node-1');

      expect(result).toEqual(mockEdges);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { source_id: 'node-1' },
        relations: ['target', 'type'],
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('findIncomingEdges', () => {
    it('should return incoming edges for node', async () => {
      const mockEdges = [mockEdge];
      mockRepository.find.mockResolvedValue(mockEdges);

      const result = await service.findIncomingEdges('node-2');

      expect(result).toEqual(mockEdges);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { target_id: 'node-2' },
        relations: ['source', 'type'],
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('findNodeEdges', () => {
    it('should return both outgoing and incoming edges', async () => {
      const outgoingEdges = [mockEdge];
      const incomingEdges = [{ ...mockEdge, id: 'edge-2' }];

      mockRepository.find
        .mockResolvedValueOnce(outgoingEdges)
        .mockResolvedValueOnce(incomingEdges);

      const result = await service.findNodeEdges('node-1');

      expect(result).toEqual({
        outgoing: outgoingEdges,
        incoming: incomingEdges,
      });
    });
  });
});
