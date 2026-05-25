import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class AppointmentNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Consulta não encontrada: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'APPOINTMENT_NOT_FOUND',
      { identifier },
    );
  }
}
