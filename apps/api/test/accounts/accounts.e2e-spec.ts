import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { PrismaService } from '../../src/infra/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AccountsController (e2e)', () => {
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
        account: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ id: 'account-123', password: 'old-password' }),
          update: jest.fn().mockResolvedValue({}),
        },
        onModuleInit: jest.fn(),
      })
      .compile();

    // mock bcrypt globally
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed-new');

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/accounts/me/password (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/accounts/me/password')
      .send({ currentPassword: 'old-password', newPassword: 'new-password' })
      .expect(200);
  });
});
