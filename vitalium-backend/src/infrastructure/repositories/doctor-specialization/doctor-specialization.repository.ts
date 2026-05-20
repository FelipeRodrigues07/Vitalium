import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IDoctorSpecializationRepository } from '../../../domain/interfaces/repositories/doctor-specialization/doctor-specialization.repository.interface';
import type { CreateDoctorSpecializationDTO } from '../../../presentation/dto/doctor-specializationDTO/create-doctor-specialization.dto';
import { DoctorSpecialization } from '../../database/models/doctor-specialization.models';
import { PrismaProvider } from '../../database/prisma.provider';

@Injectable()
export class DoctorSpecializationRepository implements IDoctorSpecializationRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(
    createDoctorSpecializationDTO: CreateDoctorSpecializationDTO,
  ): Promise<DoctorSpecialization> {
    const doctorSpecialization = await this.prisma.doctorSpecialization.create({
      data: {
        doctorId: createDoctorSpecializationDTO.doctorId,
        specializationId: createDoctorSpecializationDTO.specializationId,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        specialization: true,
      },
    });

    return plainToInstance(DoctorSpecialization, doctorSpecialization);
  }

  async findById(id: string): Promise<DoctorSpecialization | null> {
    const doctorSpecialization =
      await this.prisma.doctorSpecialization.findFirst({
        where: { id },
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
          specialization: true,
        },
      });

    if (!doctorSpecialization) return null;

    return plainToInstance(DoctorSpecialization, doctorSpecialization);
  }

  async findByDoctorAndSpecialization(
    doctorId: string,
    specializationId: string,
  ): Promise<DoctorSpecialization | null> {
    const doctorSpecialization =
      await this.prisma.doctorSpecialization.findFirst({
        where: {
          doctorId,
          specializationId,
        },
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
          specialization: true,
        },
      });

    if (!doctorSpecialization) return null;

    return plainToInstance(DoctorSpecialization, doctorSpecialization);
  }

  async findByDoctorId(doctorId: string): Promise<DoctorSpecialization[]> {
    const doctorSpecializations =
      await this.prisma.doctorSpecialization.findMany({
        where: { doctorId },
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
          specialization: true,
        },
      });

    return plainToInstance(DoctorSpecialization, doctorSpecializations);
  }

  async findBySpecializationId(
    specializationId: string,
  ): Promise<DoctorSpecialization[]> {
    const doctorSpecializations =
      await this.prisma.doctorSpecialization.findMany({
        where: { specializationId },
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
          specialization: true,
        },
      });

    return plainToInstance(DoctorSpecialization, doctorSpecializations);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.doctorSpecialization.delete({
      where: { id },
    });
  }
}
