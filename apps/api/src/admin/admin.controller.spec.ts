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
});
