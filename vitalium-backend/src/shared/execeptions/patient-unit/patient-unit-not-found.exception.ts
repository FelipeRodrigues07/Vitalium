import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class PatientUnitNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Vínculo paciente-unidade não encontrado: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'PATIENT_UNIT_NOT_FOUND',
      { identifier },
    );
  }
}
