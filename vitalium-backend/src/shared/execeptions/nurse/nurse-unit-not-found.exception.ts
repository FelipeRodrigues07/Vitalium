import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class NurseUnitNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Vínculo enfermeiro(a)-unidade não encontrado: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'NURSE_UNIT_NOT_FOUND',
      { identifier },
    );
  }
}
