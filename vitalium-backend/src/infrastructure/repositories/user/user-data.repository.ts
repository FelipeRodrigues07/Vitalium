import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import type { CreateUserDTO } from '../../../presentation/dto/userDTO/create-user.dto';
import type { UpdateUserDTO } from '../../../presentation/dto/userDTO/update-user.dtp';
import { User } from '../../database/models/user.models';
import { PrismaProvider } from '../../database/prisma.provider'; // ← faltando

@Injectable()
export class UserDataRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(createUserDto: CreateUserDTO): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        avatar: createUserDto.avatar,
        isActive: true,
        role: createUserDto.role,
      },
    });

    return plainToInstance(User, createdUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
        isActive: true,
      },
    });

    if (!user) {
      return null;
    }

    return plainToInstance(User, user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        isActive: true,
      },
    });

    if (!user) {
      return null;
    }

    return plainToInstance(User, user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
      },
      include: this.patientDoctorInclude(),
      orderBy: { createdAt: 'desc' },
    });

    return users as unknown as User[];
  }

  async findAllByUnitIds(unitIds: string[]): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          {
            admin: {
              units: {
                some: { unitId: { in: unitIds }, isActive: true },
              },
            },
          },
          {
            doctor: {
              units: {
                some: { unitId: { in: unitIds }, isActive: true },
              },
            },
          },
          {
            patient: {
              units: {
                some: { unitId: { in: unitIds }, isActive: true },
              },
            },
          },
          {
            nurse: {
              units: {
                some: { unitId: { in: unitIds }, isActive: true },
              },
            },
          },
          {
            secretary: {
              units: {
                some: { unitId: { in: unitIds }, isActive: true },
              },
            },
          },
        ],
      },
      include: this.patientDoctorInclude(unitIds),
      orderBy: { createdAt: 'desc' },
    });

    return users as unknown as User[];
  }

  private patientDoctorInclude(unitIds?: string[]) {
    return {
      patient: {
        include: {
          patientDoctors: {
            where: { endDate: null },
            include: {
              doctor: {
                include: {
                  user: true,
                  units: unitIds?.length
                    ? {
                        where: {
                          unitId: { in: unitIds },
                          isActive: true,
                        },
                      }
                    : { where: { isActive: true } },
                },
              },
            },
            orderBy: { startDate: 'desc' as const },
          },
        },
      },
    };
  }

  async update(id: string, updateUserDTO: UpdateUserDTO): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        email: updateUserDTO.email,
        firstName: updateUserDTO.firstName,
        lastName: updateUserDTO.lastName,
        phone: updateUserDTO.phone,
        avatar: updateUserDTO.avatar,
        isActive: updateUserDTO.isActive,
        role: updateUserDTO.role,
        updatedAt: new Date(),
      },
    });

    return plainToInstance(User, updatedUser);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }
}
