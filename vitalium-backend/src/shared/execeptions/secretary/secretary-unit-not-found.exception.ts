import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class SecretaryUnitNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Vínculo secretária(o)-unidade não encontrado: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'SECRETARY_UNIT_NOT_FOUND',
      { identifier },
    );
  }
}
