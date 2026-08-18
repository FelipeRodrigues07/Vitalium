import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IPrescriptionRepository } from '../../../domain/interfaces/repositories/prescription/prescription.repository.interface';
import type { CreatePrescriptionDTO } from '../../../presentation/dto/prescriptionDTO/create-prescription.dto';
import type { UpdatePrescriptionDTO } from '../../../presentation/dto/prescriptionDTO/update-prescription.dto';
import { Prescription } from '../../database/models/prescription.models';
import { PrismaProvider } from '../../database/prisma.provider';

const includeRelations = {
  patient: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
  doctor: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
  unit: { select: { id: true, name: true, type: true } },
};

@Injectable()
export class PrescriptionRepository implements IPrescriptionRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreatePrescriptionDTO): Promise<Prescription> {
    const prescription = await this.prisma.prescription.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        unitId: dto.unitId,
        medication: dto.medication,
        dosage: dto.dosage,
        frequency: dto.frequency,
        duration: dto.duration,
        instructions: dto.instructions ?? null,
        prescribedAt: dto.prescribedAt
          ? new Date(dto.prescribedAt)
          : new Date(),
      },
      include: includeRelations,
    });
    return plainToInstance(Prescription, prescription);
  }

  async findById(id: string): Promise<Prescription | null> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: includeRelations,
    });
    return prescription ? plainToInstance(Prescription, prescription) : null;
  }

  async findByPatientId(
    patientId: string,
    unitId?: string,
  ): Promise<Prescription[]> {
    const prescriptions = await this.prisma.prescription.findMany({
      where: { patientId, ...(unitId ? { unitId } : {}) },
      include: includeRelations,
      orderBy: { prescribedAt: 'desc' },
    });
    return plainToInstance(Prescription, prescriptions);
  }

  async findByDoctorId(
    doctorId: string,
    unitId?: string,
  ): Promise<Prescription[]> {
    const prescriptions = await this.prisma.prescription.findMany({
      where: { doctorId, ...(unitId ? { unitId } : {}) },
      include: includeRelations,
      orderBy: { prescribedAt: 'desc' },
    });
    return plainToInstance(Prescription, prescriptions);
  }

  async update(id: string, dto: UpdatePrescriptionDTO): Promise<Prescription> {
    const prescription = await this.prisma.prescription.update({
      where: { id },
      data: {
        ...(dto.medication !== undefined && { medication: dto.medication }),
        ...(dto.dosage !== undefined && { dosage: dto.dosage }),
        ...(dto.frequency !== undefined && { frequency: dto.frequency }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.instructions !== undefined && {
          instructions: dto.instructions,
        }),
        ...(dto.prescribedAt !== undefined && {
          prescribedAt: new Date(dto.prescribedAt),
        }),
      },
      include: includeRelations,
    });
    return plainToInstance(Prescription, prescription);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.prescription.delete({ where: { id } });
  }
}
