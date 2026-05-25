import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';
import { User } from '../../../infrastructure/database/models/user.models';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';
import { getScopedUnitIds, isUnitScopedAdmin } from '../../../shared/auth/auth-scope.helper';

@Injectable()
export class SearchUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  //Buscar usuário por ID
  async findById(id: string): Promise<User> {
    if (!id) {
      throw new ValidationException([
        {
          field: 'id',
          value: id,
          constraints: ['ID é obrigatório'],
        },
      ]);
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    if (!email) {
      throw new ValidationException([
        {
          field: 'email',
          value: email,
          constraints: ['Email é obrigatório'],
        },
      ]);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationException([
        {
          field: 'email',
          value: email,
          constraints: ['Formato de email inválido'],
        },
      ]);
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async findAll(authUser?: AuthJwtPayload): Promise<User[]> {
    const unitIds = getScopedUnitIds(authUser);

    if (isUnitScopedAdmin(authUser) && unitIds.length > 0) {
      return this.userRepository.findAllByUnitIds(unitIds);
    }

    return this.userRepository.findAll();
  }
}
