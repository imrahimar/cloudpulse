import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/roles.enum';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'findByEmail' | 'create' | 'findOne'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  const user = {
    id: 'user-1',
    email: 'abdul@cloudpulse.com',
    firstName: 'Abdul',
    lastName: 'Rahim',
    password: 'hashed',
    role: UserRole.MEMBER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    };
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('creates a user and returns a token', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(user as any);

      const result = await service.register({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: 'StrongPass@123',
      });

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user).toEqual({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    });

    it('rejects duplicate emails', async () => {
      usersService.findByEmail.mockResolvedValue(user as any);

      await expect(
        service.register({
          email: user.email,
          firstName: 'A',
          lastName: 'B',
          password: 'StrongPass@123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: user.email,
        password: 'StrongPass@123',
      });

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.email).toBe(user.email);
    });

    it('rejects unknown users', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: user.email, password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects invalid passwords', async () => {
      usersService.findByEmail.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: user.email, password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('loads the current user', async () => {
      usersService.findOne.mockResolvedValue(user as any);
      await expect(service.getProfile(user.id)).resolves.toEqual(user);
    });
  });
});
