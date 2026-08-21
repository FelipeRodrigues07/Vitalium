import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class SecretaryNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Secretária(o) não encontrada(o): ${identifier}`,
      HttpStatus.NOT_FOUND,
      'SECRETARY_NOT_FOUND',
      { identifier },
    );
  }
}
