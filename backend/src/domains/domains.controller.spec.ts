import { Test, TestingModule } from '@nestjs/testing';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';

describe('DomainsController', () => {
  let controller: DomainsController;
  let service: DomainsService;

  const mockDomainsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockDomain = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Domain',
    slug: 'test-domain',
    description: 'Test description',
    is_public: true,
    is_active: true,
    creator_id: 'user-1',
  };

  const mockRequest = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DomainsController],
      providers: [
        {
          provide: DomainsService,
          useValue: mockDomainsService,
        },
      ],
    }).compile();

    controller = module.get<DomainsController>(DomainsController);
    service = module.get<DomainsService>(DomainsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllDomains', () => {
    it('should return formatted response with all domains', async () => {
      const mockDomains = [mockDomain, { ...mockDomain, id: 'domain-2' }];
      mockDomainsService.findAll.mockResolvedValue(mockDomains);

      const result = await controller.getAllDomains();

      expect(result).toEqual({
        success: true,
        count: 2,
        data: mockDomains,
      });
      expect(mockDomainsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty data array when no domains exist', async () => {
      mockDomainsService.findAll.mockResolvedValue([]);

      const result = await controller.getAllDomains();

      expect(result).toEqual({
        success: true,
        count: 0,
        data: [],
      });
    });
  });

  describe('getDomain', () => {
    it('should return formatted response with single domain', async () => {
      mockDomainsService.findOne.mockResolvedValue(mockDomain);

      const result = await controller.getDomain(mockDomain.id);

      expect(result).toEqual({
        success: true,
        data: mockDomain,
      });
      expect(mockDomainsService.findOne).toHaveBeenCalledWith(mockDomain.id);
    });

    it('should propagate NotFoundException from service', async () => {
      mockDomainsService.findOne.mockRejectedValue(
        new Error('Domain not found'),
      );

      await expect(controller.getDomain('non-existent-id')).rejects.toThrow(
        'Domain not found',
      );
    });
  });

  describe('createDomain', () => {
    it('should create domain and return formatted response', async () => {
      const createDto = {
        name: 'New Domain',
        slug: 'new-domain',
        description: 'New description',
      };
      mockDomainsService.create.mockResolvedValue(mockDomain);

      const result = await controller.createDomain(createDto, mockRequest);

      expect(result).toEqual({
        success: true,
        message: 'Domain created successfully',
        data: mockDomain,
      });
      expect(mockDomainsService.create).toHaveBeenCalledWith(
        createDto,
        'user-1',
      );
    });

    it('should extract user ID from request object', async () => {
      const createDto = { name: 'Test', slug: 'test' };
      mockDomainsService.create.mockResolvedValue(mockDomain);

      await controller.createDomain(createDto, mockRequest);

      expect(mockDomainsService.create).toHaveBeenCalledWith(
        createDto,
        mockRequest.user.id,
      );
    });
  });

  describe('updateDomain', () => {
    it('should update domain and return formatted response', async () => {
      const updateDto = { name: 'Updated Domain' };
      const updatedDomain = { ...mockDomain, ...updateDto };
      mockDomainsService.update.mockResolvedValue(updatedDomain);

      const result = await controller.updateDomain(
        mockDomain.id,
        updateDto,
        mockRequest,
      );

      expect(result).toEqual({
        success: true,
        message: 'Domain updated successfully',
        data: updatedDomain,
      });
      expect(mockDomainsService.update).toHaveBeenCalledWith(
        mockDomain.id,
        updateDto,
        'user-1',
      );
    });

    it('should extract user ID from request object', async () => {
      const updateDto = { name: 'Updated' };
      mockDomainsService.update.mockResolvedValue(mockDomain);

      await controller.updateDomain(mockDomain.id, updateDto, mockRequest);

      expect(mockDomainsService.update).toHaveBeenCalledWith(
        mockDomain.id,
        updateDto,
        mockRequest.user.id,
      );
    });

    it('should propagate ForbiddenException from service', async () => {
      const updateDto = { name: 'Updated' };
      mockDomainsService.update.mockRejectedValue(
        new Error('You can only update your own domains'),
      );

      await expect(
        controller.updateDomain(mockDomain.id, updateDto, mockRequest),
      ).rejects.toThrow('You can only update your own domains');
    });
  });

  describe('deleteDomain', () => {
    it('should delete domain and return success message', async () => {
      mockDomainsService.remove.mockResolvedValue(undefined);

      const result = await controller.deleteDomain(mockDomain.id, mockRequest);

      expect(result).toEqual({
        success: true,
        message: 'Domain deleted successfully',
      });
      expect(mockDomainsService.remove).toHaveBeenCalledWith(
        mockDomain.id,
        'user-1',
      );
    });

    it('should extract user ID from request object', async () => {
      mockDomainsService.remove.mockResolvedValue(undefined);

      await controller.deleteDomain(mockDomain.id, mockRequest);

      expect(mockDomainsService.remove).toHaveBeenCalledWith(
        mockDomain.id,
        mockRequest.user.id,
      );
    });

    it('should propagate ForbiddenException from service', async () => {
      mockDomainsService.remove.mockRejectedValue(
        new Error('You can only delete your own domains'),
      );

      await expect(
        controller.deleteDomain(mockDomain.id, mockRequest),
      ).rejects.toThrow('You can only delete your own domains');
    });
  });
});
