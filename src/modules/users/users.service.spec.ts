import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRole } from '../../common/enums/roles.enum';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<
    Pick<Repository<User>, 'findOne' | 'create' | 'save' | 'find' | 'remove'>
  >;

  const user: User = {
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
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };
    service = new UsersService(repo as unknown as Repository<User>);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
  });

  it('creates a user with a hashed password and omits password in the returned object', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockImplementation((data) => data as User);
    repo.save.mockResolvedValue(user);

    const result = await service.create({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: 'StrongPass@123',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('StrongPass@123', 10);
    expect(result).not.toHaveProperty('password');
    expect(result.email).toBe(user.email);
  });

  it('rejects duplicate emails on create', async () => {
    repo.findOne.mockResolvedValue(user);

    await expect(
      service.create({
        email: user.email,
        firstName: 'A',
        lastName: 'B',
        password: 'StrongPass@123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lists users with a password-safe select', async () => {
    const safe = { ...user };
    delete (safe as Partial<User>).password;
    repo.find.mockResolvedValue([safe as User]);

    await expect(service.findAll()).resolves.toEqual([safe]);
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          id: true,
          email: true,
        }),
      }),
    );
    const findArgs = repo.find.mock.calls[0][0] as { select: Record<string, boolean> };
    expect(findArgs.select.password).toBeUndefined();
  });

  it('throws when user is missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('hashes password on update and omits it from the response', async () => {
    repo.findOne.mockResolvedValue({ ...user });
    repo.save.mockImplementation(async (entity) => entity as User);

    const result = await service.update(user.id, {
      password: 'NewPass@123',
    } as any);

    expect(bcrypt.hash).toHaveBeenCalledWith('NewPass@123', 10);
    expect(result).not.toHaveProperty('password');
  });

  it('removes an existing user', async () => {
    repo.findOne.mockResolvedValue(user);
    repo.remove.mockResolvedValue(user);

    await service.remove(user.id);
    expect(repo.remove).toHaveBeenCalledWith(user);
  });
});
