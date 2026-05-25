import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaProvider } from '../../database/prisma.provider';
import type {
  CreatePatientDoctorData,
  IPatientDoctorRepository,
} from '../../../domain/interfaces/repositories/patient-doctor/patient-doctor.repository.interface';
import { PatientDoctor } from '../../database/models/patient-doctor.models';

@Injectable()
export class PatientDoctorRepository implements IPatientDoctorRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(data: CreatePatientDoctorData): Promise<PatientDoctor> {
    const link = await this.prisma.patientDoctor.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        startDate: data.startDate ?? new Date(),
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    return plainToInstance(PatientDoctor, link);
  }

  async findActiveByPatientId(patientId: string): Promise<PatientDoctor[]> {
    const links = await this.prisma.patientDoctor.findMany({
      where: { patientId, endDate: null },
      include: {
        doctor: { include: { user: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    return plainToInstance(PatientDoctor, links);
  }

  async findByPatientIdAndDoctorId(
    patientId: string,
    doctorId: string,
  ): Promise<PatientDoctor | null> {
    const link = await this.prisma.patientDoctor.findFirst({
      where: { patientId, doctorId },
      include: {
        doctor: { include: { user: true } },
      },
    });

    if (!link) {
      return null;
    }

    return plainToInstance(PatientDoctor, link);
  }

  async endActiveLinksForPatient(patientId: string, endDate: Date): Promise<void> {
    await this.prisma.patientDoctor.updateMany({
      where: { patientId, endDate: null },
      data: { endDate },
    });
  }

  async reactivateLink(id: string, startDate: Date): Promise<PatientDoctor> {
    const link = await this.prisma.patientDoctor.update({
      where: { id },
      data: { endDate: null, startDate },
      include: {
        doctor: { include: { user: true } },
      },
    });

    return plainToInstance(PatientDoctor, link);
  }
}
