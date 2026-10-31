import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task, TaskPriority, TaskStatus } from './entities/task.entity';

describe('TasksService', () => {
  let service: TasksService;
  let repo: jest.Mocked<
    Pick<Repository<Task>, 'create' | 'save' | 'find' | 'findOne' | 'remove'>
  >;

  const ownerId = 'user-1';
  const task: Task = {
    id: 'task-1',
    title: 'Ship CloudPulse',
    description: 'Public MVP',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    dueDate: null as unknown as Date,
    createdBy: null as any,
    createdById: ownerId,
    assignedTo: null as any,
    assignedToId: null as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    service = new TasksService(repo as unknown as Repository<Task>);
  });

  it('creates a task owned by the caller', async () => {
    repo.create.mockReturnValue(task);
    repo.save.mockResolvedValue(task);

    const result = await service.create({ title: task.title }, ownerId);

    expect(repo.create).toHaveBeenCalledWith({
      title: task.title,
      createdById: ownerId,
    });
    expect(result).toEqual(task);
  });

  it('lists only the caller tasks', async () => {
    repo.find.mockResolvedValue([task]);
    await expect(service.findAll(ownerId)).resolves.toEqual([task]);
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { createdById: ownerId } }),
    );
  });

  it('forbids access to another users task', async () => {
    repo.findOne.mockResolvedValue(task);
    await expect(service.findOne(task.id, 'other-user')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('throws when task is missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing', ownerId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates an owned task', async () => {
    repo.findOne.mockResolvedValue({ ...task });
    repo.save.mockImplementation(async (entity) => entity as Task);

    const result = await service.update(
      task.id,
      { status: TaskStatus.DONE },
      ownerId,
    );

    expect(result.status).toBe(TaskStatus.DONE);
  });

  it('removes an owned task', async () => {
    repo.findOne.mockResolvedValue(task);
    repo.remove.mockResolvedValue(task);

    await service.remove(task.id, ownerId);
    expect(repo.remove).toHaveBeenCalledWith(task);
  });
});
