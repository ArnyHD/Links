import { Test, TestingModule } from '@nestjs/testing';
import { NodesController } from './nodes.controller';
import { NodesService } from './nodes.service';
import { NodeStatus } from '../entities';

describe('NodesController', () => {
  let controller: NodesController;

  const mockNodesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    publish: jest.fn(),
    archive: jest.fn(),
    search: jest.fn(),
    findByDomain: jest.fn(),
    findByType: jest.fn(),
    findByTags: jest.fn(),
  };

  const mockNode = {
    id: 'node-1',
    title: 'Test Article',
    slug: 'test-article',
    domain_id: 'domain-1',
    status: NodeStatus.DRAFT,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodesController],
      providers: [
        {
          provide: NodesService,
          useValue: mockNodesService,
        },
      ],
    }).compile();

    controller = module.get<NodesController>(NodesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllNodes', () => {
    it('should return all nodes', async () => {
      mockNodesService.findAll.mockResolvedValue([mockNode]);

      const result = await controller.getAllNodes();

      expect(result).toEqual({
        success: true,
        count: 1,
        data: [mockNode],
      });
    });

    it('should filter by domain_id', async () => {
      mockNodesService.findAll.mockResolvedValue([mockNode]);

      await controller.getAllNodes('domain-1');

      expect(mockNodesService.findAll).toHaveBeenCalledWith('domain-1', undefined, undefined, undefined);
    });

    it('should filter by status', async () => {
      mockNodesService.findAll.mockResolvedValue([mockNode]);

      await controller.getAllNodes(undefined, undefined, NodeStatus.PUBLISHED);

      expect(mockNodesService.findAll).toHaveBeenCalledWith(undefined, undefined, NodeStatus.PUBLISHED, undefined);
    });
  });

  describe('searchNodes', () => {
    it('should search nodes', async () => {
      mockNodesService.search.mockResolvedValue([mockNode]);

      const result = await controller.searchNodes('test');

      expect(result).toEqual({
        success: true,
        count: 1,
        data: [mockNode],
      });
      expect(mockNodesService.search).toHaveBeenCalledWith('test');
    });
  });

  describe('getNode', () => {
    it('should return single node', async () => {
      mockNodesService.findOne.mockResolvedValue(mockNode);

      const result = await controller.getNode(mockNode.id);

      expect(result).toEqual({
        success: true,
        data: mockNode,
      });
    });
  });

  describe('getNodeBySlug', () => {
    it('should return node by slug', async () => {
      mockNodesService.findBySlug.mockResolvedValue(mockNode);

      const result = await controller.getNodeBySlug(mockNode.slug);

      expect(result).toEqual({
        success: true,
        data: mockNode,
      });
    });
  });

  describe('createNode', () => {
    it('should create node', async () => {
      const createDto = {
        title: 'New Article',
        slug: 'new-article',
        domain_id: 'domain-1',
        type_id: 'type-1',
      };
      mockNodesService.create.mockResolvedValue(mockNode);

      const result = await controller.createNode(createDto, { user: { id: 'user-1' } });

      expect(result).toEqual({
        success: true,
        message: 'Node created successfully',
        data: mockNode,
      });
      expect(mockNodesService.create).toHaveBeenCalledWith(createDto, 'user-1');
    });
  });

  describe('updateNode', () => {
    it('should update node', async () => {
      const updateDto = { title: 'Updated' };
      mockNodesService.update.mockResolvedValue({ ...mockNode, ...updateDto });

      const result = await controller.updateNode(mockNode.id, updateDto, { user: { id: 'user-1' } });

      expect(result).toEqual({
        success: true,
        message: 'Node updated successfully',
        data: expect.objectContaining(updateDto),
      });
    });
  });

  describe('publishNode', () => {
    it('should publish node', async () => {
      const publishedNode = { ...mockNode, status: NodeStatus.PUBLISHED };
      mockNodesService.publish.mockResolvedValue(publishedNode);

      const result = await controller.publishNode(mockNode.id, { user: { id: 'user-1' } });

      expect(result).toEqual({
        success: true,
        message: 'Node published successfully',
        data: publishedNode,
      });
    });
  });

  describe('archiveNode', () => {
    it('should archive node', async () => {
      const archivedNode = { ...mockNode, status: NodeStatus.ARCHIVED };
      mockNodesService.archive.mockResolvedValue(archivedNode);

      const result = await controller.archiveNode(mockNode.id, { user: { id: 'user-1' } });

      expect(result).toEqual({
        success: true,
        message: 'Node archived successfully',
        data: archivedNode,
      });
    });
  });

  describe('deleteNode', () => {
    it('should delete node', async () => {
      mockNodesService.remove.mockResolvedValue(undefined);

      const result = await controller.deleteNode(mockNode.id, { user: { id: 'user-1' } });

      expect(result).toEqual({
        success: true,
        message: 'Node deleted successfully',
      });
    });
  });
});
