import { Test, TestingModule } from '@nestjs/testing';
import { NodeTypesController } from './node-types.controller';
import { NodeTypesService } from './node-types.service';

describe('NodeTypesController', () => {
  let controller: NodeTypesController;
  let service: NodeTypesService;

  const mockNodeTypesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByDomain: jest.fn(),
  };

  const mockNodeType = {
    id: 'nodetype-1',
    name: 'Axiom',
    slug: 'axiom',
    domain_id: 'domain-1',
    description: 'Fundamental principle',
  };

  const mockRequest = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodeTypesController],
      providers: [
        {
          provide: NodeTypesService,
          useValue: mockNodeTypesService,
        },
      ],
    }).compile();

    controller = module.get<NodeTypesController>(NodeTypesController);
    service = module.get<NodeTypesService>(NodeTypesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllNodeTypes', () => {
    it('should return all node types without filter', async () => {
      const mockNodeTypes = [mockNodeType, { ...mockNodeType, id: 'nodetype-2' }];
      mockNodeTypesService.findAll.mockResolvedValue(mockNodeTypes);

      const result = await controller.getAllNodeTypes();

      expect(result).toEqual({
        success: true,
        count: 2,
        data: mockNodeTypes,
      });
      expect(mockNodeTypesService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should filter by domain_id when provided', async () => {
      const mockNodeTypes = [mockNodeType];
      mockNodeTypesService.findAll.mockResolvedValue(mockNodeTypes);

      const result = await controller.getAllNodeTypes('domain-1');

      expect(result).toEqual({
        success: true,
        count: 1,
        data: mockNodeTypes,
      });
      expect(mockNodeTypesService.findAll).toHaveBeenCalledWith('domain-1');
    });
  });

  describe('getNodeType', () => {
    it('should return single node type', async () => {
      mockNodeTypesService.findOne.mockResolvedValue(mockNodeType);

      const result = await controller.getNodeType(mockNodeType.id);

      expect(result).toEqual({
        success: true,
        data: mockNodeType,
      });
      expect(mockNodeTypesService.findOne).toHaveBeenCalledWith(mockNodeType.id);
    });

    it('should propagate NotFoundException from service', async () => {
      mockNodeTypesService.findOne.mockRejectedValue(
        new Error('NodeType not found'),
      );

      await expect(controller.getNodeType('non-existent-id')).rejects.toThrow(
        'NodeType not found',
      );
    });
  });

  describe('getNodeTypesByDomain', () => {
    it('should return node types for specific domain', async () => {
      const mockNodeTypes = [mockNodeType];
      mockNodeTypesService.findByDomain.mockResolvedValue(mockNodeTypes);

      const result = await controller.getNodeTypesByDomain('domain-1');

      expect(result).toEqual({
        success: true,
        count: 1,
        data: mockNodeTypes,
      });
      expect(mockNodeTypesService.findByDomain).toHaveBeenCalledWith('domain-1');
    });
  });

  describe('createNodeType', () => {
    it('should create node type and return formatted response', async () => {
      const createDto = {
        name: 'Theory',
        slug: 'theory',
        domain_id: 'domain-1',
      };
      mockNodeTypesService.create.mockResolvedValue(mockNodeType);

      const result = await controller.createNodeType(createDto, mockRequest);

      expect(result).toEqual({
        success: true,
        message: 'NodeType created successfully',
        data: mockNodeType,
      });
      expect(mockNodeTypesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateNodeType', () => {
    it('should update node type and return formatted response', async () => {
      const updateDto = { name: 'Updated Axiom' };
      const updatedNodeType = { ...mockNodeType, ...updateDto };
      mockNodeTypesService.update.mockResolvedValue(updatedNodeType);

      const result = await controller.updateNodeType(
        mockNodeType.id,
        updateDto,
        mockRequest,
      );

      expect(result).toEqual({
        success: true,
        message: 'NodeType updated successfully',
        data: updatedNodeType,
      });
      expect(mockNodeTypesService.update).toHaveBeenCalledWith(
        mockNodeType.id,
        updateDto,
      );
    });
  });

  describe('deleteNodeType', () => {
    it('should delete node type and return success message', async () => {
      mockNodeTypesService.remove.mockResolvedValue(undefined);

      const result = await controller.deleteNodeType(mockNodeType.id, mockRequest);

      expect(result).toEqual({
        success: true,
        message: 'NodeType deleted successfully',
      });
      expect(mockNodeTypesService.remove).toHaveBeenCalledWith(mockNodeType.id);
    });
  });
});
