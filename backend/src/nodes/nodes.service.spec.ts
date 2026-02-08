import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { Node, NodeStatus } from '../entities';
import { createMockRepository } from '../../test/test-utils';

describe('NodesService', () => {
  let service: NodesService;
  let mockRepository: ReturnType<typeof createMockRepository>;

  const mockNode = {
    id: 'node-1',
    title: 'Test Article',
    slug: 'test-article',
    domain_id: 'domain-1',
    type_id: 'type-1',
    creator_id: 'user-1',
    status: NodeStatus.DRAFT,
    content: {
      time: 1635603431943,
      blocks: [
        { type: 'paragraph', data: { text: 'Test content' } },
      ],
      version: '2.28.0',
    },
    tags: ['physics', 'theory'],
  };

  beforeEach(async () => {
    mockRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodesService,
        {
          provide: getRepositoryToken(Node),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NodesService>(NodesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // findAll uses complex query builder - tested through e2e tests

  describe('findOne', () => {
    it('should return node when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockNode);

      const result = await service.findOne(mockNode.id);

      expect(result).toEqual(mockNode);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockNode.id },
        relations: ['domain', 'type', 'creator'],
      });
    });

    it('should throw NotFoundException when node not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return node when found by slug', async () => {
      mockRepository.findOne.mockResolvedValue(mockNode);

      const result = await service.findBySlug(mockNode.slug);

      expect(result).toEqual(mockNode);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: mockNode.slug },
        relations: ['domain', 'type', 'creator'],
      });
    });

    it('should throw NotFoundException when slug not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create node with creator_id', async () => {
      const createDto = {
        title: 'New Article',
        slug: 'new-article',
        domain_id: 'domain-1',
        type_id: 'type-1',
        content: { blocks: [] },
      };

      mockRepository.create.mockReturnValue({ ...mockNode, ...createDto });
      mockRepository.save.mockResolvedValue({ ...mockNode, ...createDto });

      const result = await service.create(createDto, 'user-1');

      expect(result).toEqual(expect.objectContaining(createDto));
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        creator_id: 'user-1',
      });
    });

    it('should create node with EditorJS content', async () => {
      const createDto = {
        title: 'Article with Content',
        slug: 'article-content',
        domain_id: 'domain-1',
        type_id: 'type-1',
        content: {
          time: Date.now(),
          blocks: [
            { type: 'header', data: { text: 'Title', level: 2 } },
            { type: 'paragraph', data: { text: 'Paragraph text' } },
          ],
          version: '2.28.0',
        },
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue(createDto);

      const result = await service.create(createDto, 'user-1');

      expect(result.content).toEqual(createDto.content);
    });
  });

  describe('update', () => {
    it('should update node when user is creator', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedNode = { ...mockNode, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockNode);
      mockRepository.save.mockResolvedValue(updatedNode);

      const result = await service.update(mockNode.id, updateDto, 'user-1');

      expect(result).toEqual(updatedNode);
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      mockRepository.findOne.mockResolvedValue(mockNode);

      await expect(
        service.update(mockNode.id, { title: 'Updated' }, 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove node when user is creator', async () => {
      mockRepository.findOne.mockResolvedValue(mockNode);
      mockRepository.remove.mockResolvedValue(mockNode);

      await service.remove(mockNode.id, 'user-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockNode);
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      mockRepository.findOne.mockResolvedValue(mockNode);

      await expect(service.remove(mockNode.id, 'user-2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('publish', () => {
    it('should change status to published', async () => {
      const publishedNode = {
        ...mockNode,
        status: NodeStatus.PUBLISHED,
        published_at: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockNode);
      mockRepository.save.mockResolvedValue(publishedNode);

      const result = await service.publish(mockNode.id, 'user-1');

      expect(result.status).toBe(NodeStatus.PUBLISHED);
      expect(result.published_at).toBeDefined();
    });
  });

  describe('archive', () => {
    it('should change status to archived', async () => {
      const archivedNode = { ...mockNode, status: NodeStatus.ARCHIVED };

      mockRepository.findOne.mockResolvedValue(mockNode);
      mockRepository.save.mockResolvedValue(archivedNode);

      const result = await service.archive(mockNode.id, 'user-1');

      expect(result.status).toBe(NodeStatus.ARCHIVED);
    });
  });
});
