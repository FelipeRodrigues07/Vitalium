import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class SecretaryAlreadyExistsException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Secretária(o) já cadastrada(o) no sistema: ${identifier}`,
      HttpStatus.CONFLICT,
      'SECRETARY_ALREADY_EXISTS',
      { identifier },
    );
  }
}
