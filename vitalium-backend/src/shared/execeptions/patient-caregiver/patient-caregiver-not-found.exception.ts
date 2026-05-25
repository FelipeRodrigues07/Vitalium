import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class PatientCaregiverNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Vínculo paciente-cuidador não encontrado: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'PATIENT_CAREGIVER_NOT_FOUND',
      { identifier },
    );
  }
}
