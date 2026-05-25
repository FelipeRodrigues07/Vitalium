import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class CaregiverAlreadyExistsException extends ApplicationException {
  constructor(cpf: string) {
    super(
      `Cuidador com CPF ${cpf} já está cadastrado no sistema`,
      HttpStatus.CONFLICT,
      'CAREGIVER_ALREADY_EXISTS',
      { cpf },
    );
  }
}
