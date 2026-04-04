import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountsRepository } from '../repositories/accounts.repository';

@Injectable()
export class AccountsService {

  constructor(private readonly accountsRepository: AccountsRepository) {}

  async create(createAccountDto: CreateAccountDto) {
    return this.accountsRepository.create(createAccountDto);
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
