import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { ISymptomLogRepository } from '../../../domain/interfaces/repositories/symptom-log/symptom-log.repository.interface';
import type { SymptomLog } from '../../../infrastructure/database/models/symptom-log.models';
import { SymptomImageStorageService } from '../../../infrastructure/storage/symptom-image.storage';
import type { CreateSymptomLogDTO } from '../../../presentation/dto/symptomLogDTO/create-symptom-log.dto';
import { Role } from '../../../shared/enums';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';
import type { UploadedImageFile } from '../../../shared/types/uploaded-file.interface';

@Injectable()
export class CreateSymptomLogUseCase {
  constructor(
    @Inject('ISymptomLogRepository')
    private readonly symptomLogRepository: ISymptomLogRepository,
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
    private readonly symptomImageStorage: SymptomImageStorageService,
  ) {}

  async execute(
    dto: CreateSymptomLogDTO,
    authUser: AuthJwtPayload,
    imageFile?: UploadedImageFile,
  ): Promise<SymptomLog> {
    if (authUser.role !== Role.PATIENT) {
      throw new ForbiddenException(
        'Apenas pacientes podem registrar sintomas',
      );
    }

    const patient = await this.patientRepository.findByUserId(authUser.sub);

    if (!patient) {
      throw new ForbiddenException('Perfil de paciente não encontrado');
    }

    const description = dto.description.trim();
    const unitId = await this.patientRepository.findPrimaryActiveUnitId(
      patient.id,
    );

    if (!unitId) {
      throw new ValidationException([
        {
          field: 'unitId',
          value: unitId,
          constraints: [
            'Paciente não tem unidade vinculada para registrar o sintoma',
          ],
        },
      ]);
    }

    const savedImage = imageFile
      ? await this.symptomImageStorage.save(imageFile, patient.id)
      : undefined;

    try {
      return await this.symptomLogRepository.create({
        patientId: patient.id,
        unitId,
        description,
        imageUrl: savedImage?.imageUrl,
        imageFileName: savedImage?.imageFileName,
        imageMimeType: savedImage?.imageMimeType,
      });
    } catch (error) {
      if (error instanceof ValidationException) throw error;
      throw new DatabaseException('registrar sintoma', error);
    }
  }
}
