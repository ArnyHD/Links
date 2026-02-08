import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

/**
 * Generate JWT token for testing authenticated endpoints
 */
export function generateTestJWT(user: { id: string; email: string; username?: string }): string {
  const jwtService = new JwtService({
    secret: process.env.JWT_SECRET || 'test-jwt-secret-key-12345',
  });

  return jwtService.sign({
    sub: user.id,
    email: user.email,
    name: user.username || user.email.split('@')[0],
  });
}

/**
 * Clean test database tables
 */
export async function cleanDatabase(repositories: { [key: string]: Repository<any> }) {
  // Delete in correct order to respect foreign key constraints
  await repositories.edges?.delete({});
  await repositories.nodes?.delete({});
  await repositories.edgeTypes?.delete({});
  await repositories.nodeTypes?.delete({});
  await repositories.domains?.delete({});
  await repositories.sessions?.delete({});
  await repositories.oauthAccounts?.delete({});
  await repositories.users?.delete({});
}

/**
 * Create mock repository for unit tests
 */
export function createMockRepository() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getCount: jest.fn(),
    })),
  };
}

/**
 * Create test user fixture
 */
export const TEST_USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  roles: ['user'],
};

/**
 * Create test domain fixture
 */
export const TEST_DOMAIN = {
  id: '660e8400-e29b-41d4-a716-446655440000',
  name: 'Test Domain',
  slug: 'test-domain',
  description: 'Test description',
  is_public: true,
  is_active: true,
};
