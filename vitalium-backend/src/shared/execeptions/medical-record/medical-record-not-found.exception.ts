import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class MedicalRecordNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Prontuário não encontrado: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'MEDICAL_RECORD_NOT_FOUND',
      { identifier },
    );
  }
}
