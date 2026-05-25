import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationException,
  type FieldError,
} from '../../../shared/execeptions/system/validation.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import type { IAdminRepository } from '../../../domain/interfaces/repositories/admin/admin.repository.interface';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import type { CreateAdminDTO } from '../../../presentation/dto/adminDTO/create-admin.dto';
import type { Admin } from '../../../infrastructure/database/models/admin.models';
import { Role } from '../../../shared/enums/role.enum';
import { AdminAlreadyExistsException } from '../../../shared/execeptions/admin/admin-already-exists.exception';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';
import { AdminRole } from '../../../shared/enums/admin-role.enum';
import { PrismaProvider } from '../../../infrastructure/database/prisma.provider';

@Injectable()
export class CreateAdminUseCase {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaProvider,
  ) {}

  async execute(createAdminDTO: CreateAdminDTO): Promise<Admin> {
    const errors: FieldError[] = [];

    if (!createAdminDTO.userId) {
      errors.push({
        field: 'userId',
        value: createAdminDTO.userId,
        constraints: ['userId é obrigatório'],
      });
    }

    if (!createAdminDTO.role) {
      errors.push({
        field: 'role',
        value: createAdminDTO.role,
        constraints: ['role é obrigatório'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    try {
      const user = await this.userRepository.findById(createAdminDTO.userId);
      if (!user) {
        throw new UserNotFoundException(`userId: ${createAdminDTO.userId}`);
      }

      if (user.role !== Role.ADMIN) {
        throw new ValidationException([
          {
            field: 'user.role',
            value: user.role,
            constraints: ['Usuário deve ter o role ADMIN'],
          },
        ]);
      }

      const existing = await this.adminRepository.findByUserId(
        createAdminDTO.userId,
      );
      if (existing) {
        throw new AdminAlreadyExistsException(
          `userId: ${createAdminDTO.userId}`,
        );
      }

      const unitIds = createAdminDTO.unitIds ?? [];
      const requiresUnits =
        createAdminDTO.role === AdminRole.HOSPITAL_ADMIN ||
        createAdminDTO.role === AdminRole.CLINIC_ADMIN;

      if (createAdminDTO.role === AdminRole.SUPER_ADMIN && unitIds.length > 0) {
        throw new ValidationException([
          {
            field: 'unitIds',
            value: unitIds,
            constraints: ['SUPER_ADMIN não deve ser vinculado a unidades'],
          },
        ]);
      }

      if (requiresUnits && unitIds.length === 0) {
        throw new ValidationException([
          {
            field: 'unitIds',
            value: unitIds,
            constraints: [
              'Admin de hospital/clínica deve ter ao menos uma unidade',
            ],
          },
        ]);
      }

      if (unitIds.length > 0) {
        const unitsCount = await this.prisma.unit.count({
          where: { id: { in: unitIds }, isActive: true },
        });

        if (unitsCount !== unitIds.length) {
          throw new ValidationException([
            {
              field: 'unitIds',
              value: unitIds,
              constraints: ['Uma ou mais unidades são inválidas ou inativas'],
            },
          ]);
        }
      }

      return await this.adminRepository.create(createAdminDTO);
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof AdminAlreadyExistsException ||
        error instanceof UserNotFoundException
      ) {
        throw error;
      }
      throw new DatabaseException('criar admin', error);
    }
  }
}
