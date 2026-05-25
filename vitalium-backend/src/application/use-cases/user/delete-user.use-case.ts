import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';

@Injectable()
export class DeleteUserUseCase {
  @Inject('IUserRepository') private readonly userRepository: IUserRepository;

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(`ID: ${id}`);
    }

    try {
      await this.userRepository.delete(id);
    } catch (error) {
      throw new DatabaseException('Erro ao deletar o usuário', error);
    }
  }
}
