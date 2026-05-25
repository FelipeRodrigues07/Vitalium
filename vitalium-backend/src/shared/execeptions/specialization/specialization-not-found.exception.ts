import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class SpecializationNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Especialização não encontrada: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'SPECIALIZATION_NOT_FOUND',
      { identifier },
    );
  }
}
