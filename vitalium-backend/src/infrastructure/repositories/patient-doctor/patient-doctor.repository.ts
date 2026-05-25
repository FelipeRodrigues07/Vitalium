import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaProvider } from '../../database/prisma.provider';
import type {
  IPatientDoctorRepository,
  CreatePatientDoctorData,
} from '../../../domain/interfaces/repositories/patient-doctor/patient-doctor.repository.interface';
import type { UpdatePatientDoctorDTO } from '../../../presentation/dto/patientDoctorDTO/update-patient-doctor.dto';
import { PatientDoctor } from '../../database/models/patient-doctor.models';

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
};

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
      include: includeRelations,
    });
    return plainToInstance(PatientDoctor, link);
  }

  async findById(id: string): Promise<PatientDoctor | null> {
    const link = await this.prisma.patientDoctor.findUnique({
      where: { id },
      include: includeRelations,
    });
    return link ? plainToInstance(PatientDoctor, link) : null;
  }

  async findByPatientId(patientId: string): Promise<PatientDoctor[]> {
    const links = await this.prisma.patientDoctor.findMany({
      where: { patientId },
      include: includeRelations,
      orderBy: { startDate: 'desc' },
    });
    return plainToInstance(PatientDoctor, links);
  }

  async findActiveByPatientId(patientId: string): Promise<PatientDoctor[]> {
    const links = await this.prisma.patientDoctor.findMany({
      where: { patientId, endDate: null },
      include: includeRelations,
      orderBy: { startDate: 'desc' },
    });
    return plainToInstance(PatientDoctor, links);
  }

  async findByDoctorId(doctorId: string): Promise<PatientDoctor[]> {
    const links = await this.prisma.patientDoctor.findMany({
      where: { doctorId },
      include: includeRelations,
      orderBy: { startDate: 'desc' },
    });
    return plainToInstance(PatientDoctor, links);
  }

  async findByPatientAndDoctor(
    patientId: string,
    doctorId: string,
  ): Promise<PatientDoctor | null> {
    const link = await this.prisma.patientDoctor.findFirst({
      where: { patientId, doctorId },
      include: includeRelations,
    });
    return link ? plainToInstance(PatientDoctor, link) : null;
  }

  async endActiveLinksForPatient(
    patientId: string,
    endDate: Date,
  ): Promise<void> {
    await this.prisma.patientDoctor.updateMany({
      where: { patientId, endDate: null },
      data: { endDate },
    });
  }

  async reactivateLink(id: string, startDate: Date): Promise<PatientDoctor> {
    const link = await this.prisma.patientDoctor.update({
      where: { id },
      data: { endDate: null, startDate },
      include: includeRelations,
    });
    return plainToInstance(PatientDoctor, link);
  }

  async update(
    id: string,
    dto: UpdatePatientDoctorDTO,
  ): Promise<PatientDoctor> {
    const link = await this.prisma.patientDoctor.update({
      where: { id },
      data: {
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      },
      include: includeRelations,
    });
    return plainToInstance(PatientDoctor, link);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.patientDoctor.delete({ where: { id } });
  }
}
