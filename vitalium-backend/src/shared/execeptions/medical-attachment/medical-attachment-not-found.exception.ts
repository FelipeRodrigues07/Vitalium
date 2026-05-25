import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class MedicalAttachmentNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(
      `Anexo médico não encontrado: ${identifier}`,
      HttpStatus.NOT_FOUND,
      'MEDICAL_ATTACHMENT_NOT_FOUND',
      { identifier },
    );
  }
}
