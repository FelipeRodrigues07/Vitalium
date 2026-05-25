import { Inject, Injectable } from '@nestjs/common';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { PrescriptionNotFoundException } from '../../../shared/execeptions/prescription/prescription-not-found.exception';
import type { IPrescriptionRepository } from '../../../domain/interfaces/repositories/prescription/prescription.repository.interface';

@Injectable()
export class DeletePrescriptionUseCase {
  constructor(
    @Inject('IPrescriptionRepository')
    private readonly prescriptionRepository: IPrescriptionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      const existing = await this.prescriptionRepository.findById(id);
      if (!existing) throw new PrescriptionNotFoundException(id);
      await this.prescriptionRepository.delete(id);
    } catch (error) {
      if (error instanceof PrescriptionNotFoundException) throw error;
      throw new DatabaseException('remover prescrição', error);
    }
  }
}
