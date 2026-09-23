import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Users } from './entity/users.entity';

@Injectable()
export class UsersService {
  constructor(
    // Инжектим репозиторий TypeORM для таблицы users
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  // Поиск пользователя по email для логина / проверки существования
  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Поиск пользователя по id (используем для /auth/me)
  findById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  // Создание пользователя с уже подсчитанным passwordHash
  async createUser(data: DeepPartial<Users>) {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }
}
