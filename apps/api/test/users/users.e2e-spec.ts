import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';

import { PrismaService } from '../../src/infra/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'account-123', profileId: 'user-123', role: 'User' };
          return true;
        },
      })
      .overrideProvider(PrismaService)
      .useValue({
        user: { update: jest.fn().mockResolvedValue({}) },
        onModuleInit: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users/me (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/users/me')
      .send({ name: 'Test User', bio: 'New bio' })
      .expect(200);
  });
});
