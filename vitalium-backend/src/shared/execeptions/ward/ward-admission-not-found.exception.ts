import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class WardAdmissionNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Internação não encontrada: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'WARD_ADMISSION_NOT_FOUND',
      { identifier },
    );
  }
}
