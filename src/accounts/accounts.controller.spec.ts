import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountsRepository } from '../repositories/accounts.repository';
import { AuthService } from 'src/auth/auth.service';

describe('AccountsController', () => {
  let controller: AccountsController;

  const mockAccountsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const mockAuthService = {
    passwordEncripty: jest.fn(),
  };
  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        AccountsService,
        {
          provide: AccountsRepository,
          useValue: mockAccountsRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: 'ACCOUNTS_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
