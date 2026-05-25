import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { PrismaProvider } from '../../database/prisma.provider'; // ← faltando
import { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';

import { CreateDoctorDTO } from '../../../presentation/dto/doctorDTO/create-doctor.dto';
import { UpdateDoctorDTO } from '../../../presentation/dto/doctorDTO/update-doctor.dto';

import { Doctor } from '../../database/models/doctor.models';

@Injectable()
export class DoctorRepository implements IDoctorRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateDoctorDTO): Promise<Doctor> {
    const doctor = await this.prisma.doctor.create({
      data: {
        userId: dto.userId,
        crm: dto.crm,
        crmState: dto.crmState,
        isActive: dto.isActive,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return plainToInstance(Doctor, doctor);
  }

  async findById(id: string): Promise<Doctor | null> {
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: {
            unit: true,
          },
        },
      },
    });

    if (!doctor) return null;

    return plainToInstance(Doctor, {
      ...doctor,
      units: doctor.units.map((doctorUnit) => doctorUnit.unit),
    });
  }

  async findByCrm(crm: string): Promise<Doctor | null> {
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        crm,
      },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: {
            unit: true,
          },
        },
      },
    });

    if (!doctor) return null;

    return plainToInstance(Doctor, {
      ...doctor,
      units: doctor.units.map((doctorUnit) => doctorUnit.unit),
    });
  }

  async findByUserId(userId: string): Promise<Doctor | null> {
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        userId,
      },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: {
            unit: true,
          },
        },
      },
    });

    if (!doctor) return null;

    return plainToInstance(Doctor, {
      ...doctor,
      units: doctor.units.map((doctorUnit) => doctorUnit.unit),
    });
  }

  async findAll(): Promise<Doctor[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
      },
      orderBy: {
        user: { firstName: 'asc' },
      },
    });

    return doctors.map((doctor) =>
      plainToInstance(Doctor, {
        ...doctor,
        units: doctor.units.map((doctorUnit) => doctorUnit.unit),
      }),
    );
  }

  async update(id: string, dto: UpdateDoctorDTO): Promise<Doctor> {
    const existing = await this.prisma.doctor.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      throw new Error(`Doctor with id ${id} not found`);
    }

    const doctor = await this.prisma.doctor.update({
      where: { id },
      data: {
        crm: dto.crm,
        crmState: dto.crmState,
        isActive: dto.isActive,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
      },
    });

    return plainToInstance(Doctor, {
      ...doctor,
      units: doctor.units.map((doctorUnit) => doctorUnit.unit),
    });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.prisma.doctor.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      throw new Error(`Doctor with id ${id} not found`);
    }

    await this.prisma.doctor.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  async findAllByUnitId(unitId: string): Promise<Doctor[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: {
        isActive: true,
        units: {
          some: {
            unitId,
            isActive: true,
          },
        },
      },
      include: {
        user: true,
        units: {
          where: { isActive: true, unitId },
          include: { unit: true },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    return doctors.map((doctor) =>
      plainToInstance(Doctor, {
        ...doctor,
        units: doctor.units.map((doctorUnit) => doctorUnit.unit),
      }),
    );
  }

  async hasActiveUnitLink(doctorId: string, unitId: string): Promise<boolean> {
    const link = await this.prisma.doctorUnit.findFirst({
      where: {
        doctorId,
        unitId,
        isActive: true,
      },
    });

    return !!link;
  }
}
