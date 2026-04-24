import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountsRepository } from '../repositories/accounts.repository';
import { AuthService } from 'src/auth/auth.service';
import { Role } from '../decorators/role.enum';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly authService: AuthService,
    @Inject('ACCOUNTS_SERVICE') private readonly client: ClientProxy,
  ) {}

  async create(createAccountDto: CreateAccountDto) {
    const { email, password, role, name, bio, cnpj, contact } =
      createAccountDto;

    const accountToCreate = {
      email,
      role,
      password: this.authService.passwordEncripty(password),
    };

    const account = await this.accountsRepository.create(accountToCreate);


    this.client.emit('account_created', {
      role,
      account_id: account.id,
      profileData: { name, bio, cnpj, contact },
    });
    

    return account;
  }

  async findAll() {
    return this.accountsRepository.findAll();
  }

  async findOne(id: string) {
    return this.accountsRepository.findById(id);
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    return this.accountsRepository.update(id, updateAccountDto);
  }

  async remove(id: string) {
    return this.accountsRepository.remove(id);
  }
}
