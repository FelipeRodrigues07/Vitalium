import { Injectable } from '@nestjs/common';
import type {
  CreatePatientDoctorData,
  IPatientDoctorRepository,
} from '../../../domain/interfaces/repositories/patient-doctor/patient-doctor.repository.interface';
import type { UpdatePatientDoctorDTO } from '../../../presentation/dto/patientDoctorDTO/update-patient-doctor.dto';
import { PatientDoctor } from '../../database/models/patient-doctor.models';
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
    return link as unknown as PatientDoctor;
  }

  async findById(id: string): Promise<PatientDoctor | null> {
    const link = await this.prisma.patientDoctor.findUnique({
      where: { id },
      include: includeRelations,
    });
    return link ? (link as unknown as PatientDoctor) : null;
  }

  async findByPatientId(patientId: string): Promise<PatientDoctor[]> {
    const links = await this.prisma.patientDoctor.findMany({
      where: { patientId },
      include: includeRelations,
      orderBy: { startDate: 'desc' },
    });
    return links as unknown as PatientDoctor[];
  }

  async findActiveByPatientId(patientId: string): Promise<PatientDoctor[]> {
    const links = await this.prisma.patientDoctor.findMany({
      where: { patientId, endDate: null },
      include: includeRelations,
      orderBy: { startDate: 'desc' },
    });
    return links as unknown as PatientDoctor[];
  }

  async findByDoctorId(doctorId: string): Promise<PatientDoctor[]> {
    const links = await this.prisma.patientDoctor.findMany({
      where: { doctorId, endDate: null },
      include: includeRelations,
      orderBy: { startDate: 'desc' },
    });
    return links as unknown as PatientDoctor[];
  }

  async findByPatientAndDoctor(
    patientId: string,
    doctorId: string,
  ): Promise<PatientDoctor | null> {
    const link = await this.prisma.patientDoctor.findFirst({
      where: { patientId, doctorId },
      include: includeRelations,
    });
    return link ? (link as unknown as PatientDoctor) : null;
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
    return link as unknown as PatientDoctor;
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
    return link as unknown as PatientDoctor;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.patientDoctor.delete({ where: { id } });
  }
}
