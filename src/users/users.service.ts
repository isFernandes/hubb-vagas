import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(data: any) {
    return this.usersRepository.create(data);
  }

  async findAll() {
    return this.usersRepository.findAll();
  }

  async findOne(id: string) {
    return this.usersRepository.findById(id);
  }

  async update(id: string, data: any) {
    return this.usersRepository.update(id, data);
  }

  async remove(id: string) {
    return this.usersRepository.remove(id);
  }
}