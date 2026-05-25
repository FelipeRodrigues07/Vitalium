import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class NurseAlreadyExistsException extends ApplicationException {
  constructor(coren: string) {
    super(
      `Enfermeiro(a) com COREN ${coren} já está cadastrado(a) no sistema`,
      HttpStatus.CONFLICT,
      'NURSE_ALREADY_EXISTS',
      { coren },
    );
  }
}
