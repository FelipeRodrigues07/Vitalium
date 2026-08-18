import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type {
  CreateSymptomLogData,
  ISymptomLogRepository,
} from '../../../domain/interfaces/repositories/symptom-log/symptom-log.repository.interface';
import { SymptomLog } from '../../database/models/symptom-log.models';
import { PrismaProvider } from '../../database/prisma.provider';

@Injectable()
export class SymptomLogRepository implements ISymptomLogRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(data: CreateSymptomLogData): Promise<SymptomLog> {
    const log = await this.prisma.symptomLog.create({
      data: {
        patientId: data.patientId,
        unitId: data.unitId,
        description: data.description,
        imageUrl: data.imageUrl,
        imageFileName: data.imageFileName,
        imageMimeType: data.imageMimeType,
      },
    });

    return plainToInstance(SymptomLog, log);
  }

  async findByPatientId(
    patientId: string,
    unitId?: string,
  ): Promise<SymptomLog[]> {
    const logs = await this.prisma.symptomLog.findMany({
      where: { patientId, ...(unitId ? { unitId } : {}) },
      orderBy: { createdAt: 'desc' },
    });

    return plainToInstance(SymptomLog, logs);
  }
}
