import { Inject, Injectable } from '@nestjs/common';
import type { IAdminRepository } from '../../../domain/interfaces/repositories/admin/admin.repository.interface';
import type { Admin } from '../../../infrastructure/database/models/admin.models';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  type FieldError,
  ValidationException,
} from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';

@Injectable()
export class SearchAdminUseCase {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
  ) {}

  async execute(id: string): Promise<Admin> {
    const errors: FieldError[] = [];

    if (!id) {
      errors.push({
        field: 'id',
        value: id,
        constraints: ['ID é obrigatório'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    try {
      const admin = await this.adminRepository.findById(id);
      if (!admin) {
        throw new UnitNotFoundException(`ID: ${id}`);
      }
      return admin;
    } catch (error) {
      if (error instanceof UnitNotFoundException) throw error;
      throw new DatabaseException('buscar admin', error);
    }
  }
}
