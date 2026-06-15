import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { ISymptomLogRepository } from '../../../domain/interfaces/repositories/symptom-log/symptom-log.repository.interface';
import type { SymptomLog } from '../../../infrastructure/database/models/symptom-log.models';
import { Role } from '../../../shared/enums';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';

@Injectable()
export class ListSymptomLogsUseCase {
  constructor(
    @Inject('ISymptomLogRepository')
    private readonly symptomLogRepository: ISymptomLogRepository,
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
  ) {}

  async executeForAuthUser(authUser: AuthJwtPayload): Promise<SymptomLog[]> {
    if (authUser.role !== Role.PATIENT) {
      throw new ForbiddenException(
        'Apenas pacientes podem listar seus sintomas pelo aplicativo',
      );
    }

    const patient = await this.patientRepository.findByUserId(authUser.sub);

    if (!patient) {
      throw new ForbiddenException('Perfil de paciente não encontrado');
    }

    try {
      return await this.symptomLogRepository.findByPatientId(patient.id);
    } catch (error) {
      throw new DatabaseException('listar sintomas', error);
    }
  }
}
