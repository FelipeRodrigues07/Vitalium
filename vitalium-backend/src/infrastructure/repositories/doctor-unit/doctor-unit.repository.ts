import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IDoctorUnitRepository } from '../../../domain/interfaces/repositories/doctor-unit/doctor-unit.repository.interface';
import type { UpdateDoctorUnitDTO } from '../../../presentation/dto/doctor-unitDTO/update-doctor-unit.dto';

import { DoctorUnit } from '../../database/models/doctor-unit.models';
import { PrismaProvider } from '../../database/prisma.provider';

@Injectable()
export class DoctorUnitRepository implements IDoctorUnitRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(data: {
    doctorId: string;
    unitId: string;
    consultationPrice?: number;
    isPrimary?: boolean;
  }): Promise<DoctorUnit> {
    const doctorUnit = await this.prisma.doctorUnit.create({
      data: {
        doctorId: data.doctorId,
        unitId: data.unitId,
        consultationPrice: data.consultationPrice,
        isPrimary: data.isPrimary ?? false,
        isActive: true,
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return plainToInstance(DoctorUnit, {
      ...doctorUnit,
      consultationPrice: doctorUnit.consultationPrice
        ? Number(doctorUnit.consultationPrice)
        : null,
    });
  }

  async findById(id: string): Promise<DoctorUnit | null> {
    const doctorUnit = await this.prisma.doctorUnit.findFirst({
      where: { id, isActive: true },
      include: {
        unit: true,
      },
    });

    if (!doctorUnit) return null;

    return plainToInstance(DoctorUnit, {
      ...doctorUnit,
      consultationPrice: doctorUnit.consultationPrice
        ? Number(doctorUnit.consultationPrice)
        : null,
    });
  }

  async findByDoctorId(doctorId: string): Promise<DoctorUnit[]> {
    const doctorUnits = await this.prisma.doctorUnit.findMany({
      where: {
        doctorId,
        isActive: true,
      },
      include: {
        unit: true,
      },
    });

    return plainToInstance(
      DoctorUnit,
      doctorUnits.map((du) => ({
        ...du,
        consultationPrice: du.consultationPrice
          ? Number(du.consultationPrice)
          : null,
      })),
    );
  }

  async findByDoctorIdAndUnitId(
    doctorId: string,
    unitId: string,
  ): Promise<DoctorUnit | null> {
    const doctorUnit = await this.prisma.doctorUnit.findUnique({
      where: {
        doctorId_unitId: {
          doctorId,
          unitId,
        },
      },
      include: {
        unit: true,
      },
    });

    if (!doctorUnit) return null;

    return plainToInstance(DoctorUnit, {
      ...doctorUnit,
      consultationPrice: doctorUnit.consultationPrice
        ? Number(doctorUnit.consultationPrice)
        : null,
    });
  }

  async update(id: string, dto: UpdateDoctorUnitDTO): Promise<DoctorUnit> {
    const doctorUnit = await this.prisma.doctorUnit.update({
      where: { id },
      data: {
        ...(dto.consultationPrice !== undefined && {
          consultationPrice: dto.consultationPrice,
        }),
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: {
        unit: true,
      },
    });

    return plainToInstance(DoctorUnit, {
      ...doctorUnit,
      consultationPrice: doctorUnit.consultationPrice
        ? Number(doctorUnit.consultationPrice)
        : null,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.doctorUnit.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }
}
