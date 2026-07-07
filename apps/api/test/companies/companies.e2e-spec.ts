import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { PrismaService } from '../../src/infra/prisma/prisma.service';

describe('CompaniesController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'account-123', profileId: 'company-123', role: 'Company' };
          return true;
        },
      })
      .overrideProvider(PrismaService)
      .useValue({
        company: { update: jest.fn().mockResolvedValue({}) },
        onModuleInit: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/companies/me (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/companies/me')
      .send({ name: 'Test Company', contact: 'New contact' })
      .expect(200);
  });
});
