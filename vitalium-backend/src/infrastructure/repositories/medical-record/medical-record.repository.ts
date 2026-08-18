import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IMedicalRecordRepository } from '../../../domain/interfaces/repositories/medical-record/medical-record.repository.interface';
import type { CreateMedicalRecordDTO } from '../../../presentation/dto/medicalRecordDTO/create-medical-record.dto';
import type { UpdateMedicalRecordDTO } from '../../../presentation/dto/medicalRecordDTO/update-medical-record.dto';
import { MedicalRecord } from '../../database/models/medical-record.models';
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
  attachments: true,
};

@Injectable()
export class MedicalRecordRepository implements IMedicalRecordRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateMedicalRecordDTO): Promise<MedicalRecord> {
    const record = await this.prisma.medicalRecord.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        unitId: dto.unitId,
        title: dto.title,
        description: dto.description,
        diagnosis: dto.diagnosis ?? null,
        symptoms: dto.symptoms ?? [],
        treatment: dto.treatment ?? null,
        observations: dto.observations ?? null,
        recordDate: dto.recordDate ? new Date(dto.recordDate) : new Date(),
        recordType: dto.recordType,
      },
      include: includeRelations,
    });
    return plainToInstance(MedicalRecord, record);
  }

  async findById(id: string): Promise<MedicalRecord | null> {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: includeRelations,
    });
    return record ? plainToInstance(MedicalRecord, record) : null;
  }

  async findByPatientId(
    patientId: string,
    unitId?: string,
  ): Promise<MedicalRecord[]> {
    const records = await this.prisma.medicalRecord.findMany({
      where: { patientId, ...(unitId ? { unitId } : {}) },
      include: includeRelations,
      orderBy: { recordDate: 'desc' },
    });
    return plainToInstance(MedicalRecord, records);
  }

  async findByDoctorId(
    doctorId: string,
    unitId?: string,
  ): Promise<MedicalRecord[]> {
    const records = await this.prisma.medicalRecord.findMany({
      where: { doctorId, ...(unitId ? { unitId } : {}) },
      include: includeRelations,
      orderBy: { recordDate: 'desc' },
    });
    return plainToInstance(MedicalRecord, records);
  }

  async update(
    id: string,
    dto: UpdateMedicalRecordDTO,
  ): Promise<MedicalRecord> {
    const record = await this.prisma.medicalRecord.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.diagnosis !== undefined && { diagnosis: dto.diagnosis }),
        ...(dto.symptoms !== undefined && { symptoms: dto.symptoms }),
        ...(dto.treatment !== undefined && { treatment: dto.treatment }),
        ...(dto.observations !== undefined && {
          observations: dto.observations,
        }),
        ...(dto.recordDate !== undefined && {
          recordDate: new Date(dto.recordDate),
        }),
        ...(dto.recordType !== undefined && { recordType: dto.recordType }),
      },
      include: includeRelations,
    });
    return plainToInstance(MedicalRecord, record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.medicalRecord.delete({ where: { id } });
  }
}
