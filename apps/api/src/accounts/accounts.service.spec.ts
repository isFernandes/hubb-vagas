import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { AccountsRepository } from '../repositories/accounts.repository';
import { AuthService } from 'src/auth/auth.service';

describe('AccountsService', () => {
  let service: AccountsService;

  const mockAccountsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
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

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
