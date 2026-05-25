import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class NurseNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Enfermeiro(a) não encontrado(a): ${identifier}`,
      HttpStatus.NOT_FOUND,
      'NURSE_NOT_FOUND',
      { identifier },
    );
  }
}
