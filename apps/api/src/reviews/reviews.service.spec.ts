import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';

import { PrismaService } from '../infra/prisma/prisma.service';

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: {
            application: { findUnique: vi.fn(), findMany: vi.fn() },
            review: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
            user: { update: vi.fn() },
            company: { update: vi.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
