import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User, OAuthAccount } from '../entities';
import { createMockRepository } from '../../test/test-utils';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userRepository: ReturnType<typeof createMockRepository>;
  let oauthAccountRepository: ReturnType<typeof createMockRepository>;

  const mockUser: Partial<User> = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'test',
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    is_email_verified: true,
    is_active: true,
    roles: ['user'],
    last_login_at: new Date(),
    password: null,
    first_name: null,
    last_name: null,
    language: 'en',
    metadata: {},
    created_at: new Date(),
    updated_at: new Date(),
  } as User;

  const mockGoogleProfile = {
    id: 'google-123',
    emails: [{ value: 'test@example.com' }],
    displayName: 'Test User',
    photos: [{ value: 'https://example.com/avatar.jpg' }],
    _json: {
      sub: 'google-123',
      email: 'test@example.com',
      name: 'Test User',
    },
  };

  beforeEach(async () => {
    userRepository = createMockRepository();
    oauthAccountRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(OAuthAccount),
          useValue: oauthAccountRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateGoogleUser', () => {
    it('should update and return existing user with OAuth account', async () => {
      const mockOAuthAccount = {
        id: 'oauth-1',
        provider: 'google',
        provider_user_id: 'google-123',
        provider_email: 'test@example.com',
        user: mockUser,
        last_used_at: new Date('2023-01-01'),
      };

      oauthAccountRepository.findOne.mockResolvedValue(mockOAuthAccount);
      oauthAccountRepository.save.mockResolvedValue(mockOAuthAccount);
      userRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.validateGoogleUser(mockGoogleProfile);

      expect(result).toEqual(mockUser);
      expect(oauthAccountRepository.findOne).toHaveBeenCalledWith({
        where: {
          provider: 'google',
          provider_user_id: 'google-123',
        },
        relations: ['user'],
      });
      expect(oauthAccountRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          provider_email: 'test@example.com',
          display_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
        }),
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          last_login_at: expect.any(Date),
        }),
      );
    });

    it('should create OAuth account for existing user by email', async () => {
      const newOAuthAccount = {
        id: 'oauth-2',
        provider: 'google',
        provider_user_id: 'google-123',
        user_id: mockUser.id,
      };

      oauthAccountRepository.findOne.mockResolvedValue(null); // No existing OAuth account
      userRepository.findOne.mockResolvedValue(mockUser); // User exists by email
      oauthAccountRepository.create.mockReturnValue(newOAuthAccount);
      oauthAccountRepository.save.mockResolvedValue(newOAuthAccount);

      const result = await service.validateGoogleUser(mockGoogleProfile);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(oauthAccountRepository.create).toHaveBeenCalledWith({
        user_id: mockUser.id,
        provider: 'google',
        provider_user_id: 'google-123',
        provider_email: 'test@example.com',
        display_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        raw_data: mockGoogleProfile._json,
        last_used_at: expect.any(Date),
      });
      expect(oauthAccountRepository.save).toHaveBeenCalled();
    });

    it('should create new user and OAuth account for new Google user', async () => {
      const newUser = { ...mockUser, id: 'new-user-1' };
      const newOAuthAccount = {
        id: 'oauth-3',
        provider: 'google',
        provider_user_id: 'google-123',
      };

      oauthAccountRepository.findOne.mockResolvedValue(null); // No existing OAuth account
      userRepository.findOne.mockResolvedValue(null); // No existing user
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);
      oauthAccountRepository.create.mockReturnValue(newOAuthAccount);
      oauthAccountRepository.save.mockResolvedValue(newOAuthAccount);

      const result = await service.validateGoogleUser(mockGoogleProfile);

      expect(result).toEqual(newUser);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'test', // Generated from email
        display_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        is_email_verified: true,
        is_active: true,
        roles: ['user'],
        last_login_at: expect.any(Date),
      });
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(oauthAccountRepository.create).toHaveBeenCalled();
      expect(oauthAccountRepository.save).toHaveBeenCalled();
    });

    it('should generate username from email when creating new user', async () => {
      const profileWithLongEmail = {
        ...mockGoogleProfile,
        emails: [{ value: 'john.doe@example.com' }],
      };
      const newUser = { ...mockUser, username: 'john.doe' };

      oauthAccountRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);
      oauthAccountRepository.create.mockReturnValue({});
      oauthAccountRepository.save.mockResolvedValue({});

      await service.validateGoogleUser(profileWithLongEmail);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'john.doe',
          email: 'john.doe@example.com',
        }),
      );
    });

    it('should handle profile without photos', async () => {
      const profileWithoutPhotos = {
        ...mockGoogleProfile,
        photos: undefined,
      };
      const newUser = { ...mockUser, avatar_url: undefined };

      oauthAccountRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);
      oauthAccountRepository.create.mockReturnValue({});
      oauthAccountRepository.save.mockResolvedValue({});

      await service.validateGoogleUser(profileWithoutPhotos);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar_url: undefined,
        }),
      );
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with correct payload', async () => {
      const mockToken = 'mock-jwt-token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateToken(mockUser as User);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.display_name,
          avatar: mockUser.avatar_url,
          roles: mockUser.roles,
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.display_name,
      });
    });

    it('should use username as name when display_name is null', async () => {
      const userWithoutDisplayName = {
        ...mockUser,
        display_name: null,
      };
      const mockToken = 'mock-jwt-token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateToken(userWithoutDisplayName as User);

      expect(result.user.name).toBe(userWithoutDisplayName.username);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: userWithoutDisplayName.id,
        email: userWithoutDisplayName.email,
        name: userWithoutDisplayName.username,
      });
    });

    it('should include all user roles in response', async () => {
      const adminUser = {
        ...mockUser,
        roles: ['user', 'admin', 'moderator'],
      };
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.generateToken(adminUser as User);

      expect(result.user.roles).toEqual(['user', 'admin', 'moderator']);
    });

    it('should handle user without avatar', async () => {
      const userWithoutAvatar = {
        ...mockUser,
        avatar_url: null,
      };
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.generateToken(userWithoutAvatar as User);

      expect(result.user.avatar).toBeNull();
    });
  });
});
