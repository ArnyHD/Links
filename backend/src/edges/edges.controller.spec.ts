import { Test, TestingModule } from '@nestjs/testing';
import { EdgesController } from './edges.controller';
import { EdgesService } from './edges.service';

describe('EdgesController', () => {
  let controller: EdgesController;

  const mockEdgesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findNodeEdges: jest.fn(),
    findOutgoingEdges: jest.fn(),
    findIncomingEdges: jest.fn(),
  };

  const mockEdge = {
    id: 'edge-1',
    source_id: 'node-1',
    target_id: 'node-2',
    type_id: 'type-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdgesController],
      providers: [
        {
          provide: EdgesService,
          useValue: mockEdgesService,
        },
      ],
    }).compile();

    controller = module.get<EdgesController>(EdgesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEdges', () => {
    it('should return all edges', async () => {
      mockEdgesService.findAll.mockResolvedValue([mockEdge]);

      const result = await controller.getAllEdges();

      expect(result).toEqual({
        success: true,
        count: 1,
        data: [mockEdge],
      });
    });

    it('should filter by node_id', async () => {
      mockEdgesService.findAll.mockResolvedValue([mockEdge]);

      await controller.getAllEdges('node-1');

      expect(mockEdgesService.findAll).toHaveBeenCalledWith('node-1', undefined);
    });
  });

  describe('getEdge', () => {
    it('should return single edge', async () => {
      mockEdgesService.findOne.mockResolvedValue(mockEdge);

      const result = await controller.getEdge(mockEdge.id);

      expect(result).toEqual({
        success: true,
        data: mockEdge,
      });
    });
  });

  describe('getNodeEdges', () => {
    it('should return node edges (outgoing + incoming)', async () => {
      const mockNodeEdges = {
        outgoing: [mockEdge],
        incoming: [],
      };
      mockEdgesService.findNodeEdges.mockResolvedValue(mockNodeEdges);

      const result = await controller.getNodeEdges('node-1');

      expect(result).toEqual({
        success: true,
        data: mockNodeEdges,
        count: {
          outgoing: 1,
          incoming: 0,
          total: 1,
        },
      });
    });
  });

  describe('getOutgoingEdges', () => {
    it('should return outgoing edges', async () => {
      mockEdgesService.findOutgoingEdges.mockResolvedValue([mockEdge]);

      const result = await controller.getOutgoingEdges('node-1');

      expect(result).toEqual({
        success: true,
        count: 1,
        data: [mockEdge],
      });
    });
  });

  describe('getIncomingEdges', () => {
    it('should return incoming edges', async () => {
      mockEdgesService.findIncomingEdges.mockResolvedValue([mockEdge]);

      const result = await controller.getIncomingEdges('node-1');

      expect(result).toEqual({
        success: true,
        count: 1,
        data: [mockEdge],
      });
    });
  });

  describe('createEdge', () => {
    it('should create edge', async () => {
      const createDto = {
        source_id: 'node-1',
        target_id: 'node-2',
        type_id: 'type-1',
      };
      mockEdgesService.create.mockResolvedValue(mockEdge);

      const result = await controller.createEdge(createDto, { user: { id: 'user-1' } });

      expect(result).toEqual({
        success: true,
        message: 'Edge created successfully',
        data: mockEdge,
      });
    });
  });

  describe('updateEdge', () => {
    it('should update edge', async () => {
      const updateDto = { description: 'Updated' };
      mockEdgesService.update.mockResolvedValue({ ...mockEdge, ...updateDto });

      const result = await controller.updateEdge(mockEdge.id, updateDto, { user: { id: 'user-1' } });

      expect(result).toEqual({
        success: true,
        message: 'Edge updated successfully',
        data: expect.objectContaining(updateDto),
      });
    });
  });

  describe('deleteEdge', () => {
    it('should delete edge', async () => {
      mockEdgesService.remove.mockResolvedValue(undefined);

      const result = await controller.deleteEdge(mockEdge.id, { user: { id: 'user-1' } });

      expect(result).toEqual({
        success: true,
        message: 'Edge deleted successfully',
      });
    });
  });
});
