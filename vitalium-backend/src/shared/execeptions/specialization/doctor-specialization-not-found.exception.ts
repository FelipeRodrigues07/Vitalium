import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class DoctorSpecializationNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Vínculo médico-especialização não encontrado: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'DOCTOR_SPECIALIZATION_NOT_FOUND',
      { identifier },
    );
  }
}
