import { Inject, Injectable } from '@nestjs/common';
import type { IAdminRepository } from '../../../domain/interfaces/repositories/admin/admin.repository.interface';
import type { Admin } from '../../../infrastructure/database/models/admin.models';
import type { UpdateAdminDTO } from '../../../presentation/dto/adminDTO/update-admin.dto';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  type FieldError,
  ValidationException,
} from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';

@Injectable()
export class UpdateAdminUseCase {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
  ) {}

  async execute(id: string, dto: UpdateAdminDTO): Promise<Admin> {
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

    const existing = await this.adminRepository.findById(id);
    if (!existing) {
      throw new UnitNotFoundException(`ID: ${id}`);
    }

    try {
      return await this.adminRepository.update(id, dto);
    } catch (error) {
      throw new DatabaseException('atualizar admin', error);
    }
  }
}
