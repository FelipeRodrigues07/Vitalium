import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class WardNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Ala/Quarto não encontrado: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'WARD_NOT_FOUND',
      { identifier },
    );
  }
}
