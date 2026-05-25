import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class PrescriptionNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Prescrição não encontrada: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'PRESCRIPTION_NOT_FOUND',
      { identifier },
    );
  }
}
