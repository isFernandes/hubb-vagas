import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountsRepository } from '../repositories/accounts.repository';
import { AuthService } from 'src/auth/auth.service';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

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

    const existingAccount = await this.accountsRepository.findByEmail(email);
    if (existingAccount) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

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

  async updatePassword(id: string, updatePasswordDto: any) {
    const { currentPassword, newPassword } = updatePasswordDto;
    const account = await this.accountsRepository.findById(id);
    if (!account) {
      throw new ConflictException('Conta não encontrada');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      account.password,
    );
    if (!isPasswordValid) {
      throw new ConflictException('Senha atual incorreta');
    }

    const hashedNewPassword = this.authService.passwordEncripty(newPassword);
    return this.accountsRepository.update(id, { password: hashedNewPassword });
  }

  async remove(id: string) {
    return this.accountsRepository.remove(id);
  }
}
