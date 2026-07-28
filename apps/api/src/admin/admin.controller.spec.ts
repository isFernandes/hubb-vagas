import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            getDashboardMetrics: jest.fn().mockResolvedValue({
              totalUsers: 10,
              totalJobs: 5,
              totalApplications: 20,
              totalCompanies: 2,
              usersOverTime: [],
              jobsOverTime: [],
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return metrics from service', async () => {
      const result = await controller.getDashboardMetrics();
      expect(service.getDashboardMetrics).toHaveBeenCalled();
      expect(result).toEqual({
        totalUsers: 10,
        totalJobs: 5,
        totalApplications: 20,
        totalCompanies: 2,
        usersOverTime: [],
        jobsOverTime: [],
      });
    });
  });
  describe('getUsers', () => {
    it('should return paginated users from service', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 10 };
      service.getUsers = jest.fn().mockResolvedValue(mockResult);
      const result = await controller.getUsers(1, 10, '');
      expect(service.getUsers).toHaveBeenCalledWith(1, 10, '');
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateUserStatus', () => {
    it('should call service to update user status and create audit log', async () => {
      const mockResult = { id: 'user-id', status: 'BANNED' };
      service.updateUserStatus = jest.fn().mockResolvedValue(mockResult);
      const req = { user: { id: 'admin-id' } };

      const result = await controller.updateUserStatus(
        'user-id',
        { status: 'BANNED', reason: 'Spam' },
        req,
      );

      expect(service.updateUserStatus).toHaveBeenCalledWith(
        'user-id',
        'BANNED',
        'Spam',
        'admin-id',
      );
      expect(result).toEqual(mockResult);
    });
  });
});
