import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../base/application.exception';

export class AppointmentConflictException extends ApplicationException {
  constructor(scheduledAt: Date | string) {
    const when = new Date(scheduledAt).toLocaleString('pt-BR');
    super(
      `Já existe uma consulta neste horário para o médico (${when}). Escolha outro horário.`,
      HttpStatus.CONFLICT,
      'APPOINTMENT_CONFLICT',
      { scheduledAt },
    );
  }
}
