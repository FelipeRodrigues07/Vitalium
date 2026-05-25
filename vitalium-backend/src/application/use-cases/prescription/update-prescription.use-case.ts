import { Inject, Injectable } from '@nestjs/common';
import type { IPrescriptionRepository } from '../../../domain/interfaces/repositories/prescription/prescription.repository.interface';
import type { Prescription } from '../../../infrastructure/database/models/prescription.models';
import type { UpdatePrescriptionDTO } from '../../../presentation/dto/prescriptionDTO/update-prescription.dto';
import { PrescriptionNotFoundException } from '../../../shared/execeptions/prescription/prescription-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class UpdatePrescriptionUseCase {
  constructor(
    @Inject('IPrescriptionRepository')
    private readonly prescriptionRepository: IPrescriptionRepository,
  ) {}

  async execute(id: string, dto: UpdatePrescriptionDTO): Promise<Prescription> {
    try {
      const existing = await this.prescriptionRepository.findById(id);
      if (!existing) throw new PrescriptionNotFoundException(id);
      return await this.prescriptionRepository.update(id, dto);
    } catch (error) {
      if (error instanceof PrescriptionNotFoundException) throw error;
      throw new DatabaseException('atualizar prescrição', error);
    }
  }
}
