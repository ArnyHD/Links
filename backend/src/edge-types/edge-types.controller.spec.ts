import { Test, TestingModule } from '@nestjs/testing';
import { EdgeTypesController } from './edge-types.controller';
import { EdgeTypesService } from './edge-types.service';

describe('EdgeTypesController', () => {
  let controller: EdgeTypesController;

  const mockEdgeTypesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByDomain: jest.fn(),
  };

  const mockEdgeType = {
    id: 'edgetype-1',
    name: 'Derives From',
    slug: 'derives-from',
    domain_id: 'domain-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdgeTypesController],
      providers: [
        {
          provide: EdgeTypesService,
          useValue: mockEdgeTypesService,
        },
      ],
    }).compile();

    controller = module.get<EdgeTypesController>(EdgeTypesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEdgeTypes', () => {
    it('should return all edge types', async () => {
      const mockEdgeTypes = [mockEdgeType];
      mockEdgeTypesService.findAll.mockResolvedValue(mockEdgeTypes);

      const result = await controller.getAllEdgeTypes();

      expect(result).toEqual({
        success: true,
        count: 1,
        data: mockEdgeTypes,
      });
    });

    it('should filter by domain_id when provided', async () => {
      mockEdgeTypesService.findAll.mockResolvedValue([mockEdgeType]);

      await controller.getAllEdgeTypes('domain-1');

      expect(mockEdgeTypesService.findAll).toHaveBeenCalledWith('domain-1');
    });
  });

  describe('getEdgeType', () => {
    it('should return single edge type', async () => {
      mockEdgeTypesService.findOne.mockResolvedValue(mockEdgeType);

      const result = await controller.getEdgeType(mockEdgeType.id);

      expect(result).toEqual({
        success: true,
        data: mockEdgeType,
      });
    });
  });

  describe('createEdgeType', () => {
    it('should create edge type', async () => {
      const createDto = { name: 'Supports', slug: 'supports', domain_id: 'domain-1' };
      mockEdgeTypesService.create.mockResolvedValue(mockEdgeType);

      const result = await controller.createEdgeType(createDto, { user: { id: 'user-1' } });

      expect(result).toEqual({
        success: true,
        message: 'EdgeType created successfully',
        data: mockEdgeType,
      });
    });
  });

  describe('updateEdgeType', () => {
    it('should update edge type', async () => {
      const updateDto = { name: 'Updated' };
      mockEdgeTypesService.update.mockResolvedValue({ ...mockEdgeType, ...updateDto });

      const result = await controller.updateEdgeType(mockEdgeType.id, updateDto, { user: { id: 'user-1' } });

      expect(result).toEqual({
        success: true,
        message: 'EdgeType updated successfully',
        data: expect.objectContaining(updateDto),
      });
    });
  });

  describe('deleteEdgeType', () => {
    it('should delete edge type', async () => {
      mockEdgeTypesService.remove.mockResolvedValue(undefined);

      const result = await controller.deleteEdgeType(mockEdgeType.id, { user: { id: 'user-1' } });

      expect(result).toEqual({
        success: true,
        message: 'EdgeType deleted successfully',
      });
    });
  });
});
