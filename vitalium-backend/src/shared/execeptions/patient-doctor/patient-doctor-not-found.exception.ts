import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class PatientDoctorNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Vínculo paciente-médico não encontrado: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'PATIENT_DOCTOR_NOT_FOUND',
      { identifier },
    );
  }
}
