import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaProvider } from '../../database/prisma.provider';
<<<<<<< HEAD
import type { IPatientDoctorRepository } from '../../../domain/interfaces/repositories/patient-doctor/patient-doctor.repository.interface';
import type { CreatePatientDoctorDTO } from '../../../presentation/dto/patientDoctorDTO/create-patient-doctor.dto';
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

=======
import type {
  CreatePatientDoctorData,
  IPatientDoctorRepository,
} from '../../../domain/interfaces/repositories/patient-doctor/patient-doctor.repository.interface';
import { PatientDoctor } from '../../database/models/patient-doctor.models';

>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
@Injectable()
export class PatientDoctorRepository implements IPatientDoctorRepository {
  constructor(private readonly prisma: PrismaProvider) {}

<<<<<<< HEAD
  async create(dto: CreatePatientDoctorDTO): Promise<PatientDoctor> {
    const link = await this.prisma.patientDoctor.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
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
    const link = await this.prisma.patientDoctor.findUnique({
      where: { patientId_doctorId: { patientId, doctorId } },
      include: includeRelations,
    });
    return link ? plainToInstance(PatientDoctor, link) : null;
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
=======
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
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  }
}
