import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class CaregiverNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Cuidador não encontrado: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'CAREGIVER_NOT_FOUND',
      { identifier },
    );
  }
}
