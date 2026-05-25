import { Inject, Injectable } from '@nestjs/common';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { PrescriptionNotFoundException } from '../../../shared/execeptions/prescription/prescription-not-found.exception';
import type { IPrescriptionRepository } from '../../../domain/interfaces/repositories/prescription/prescription.repository.interface';
import type { UpdatePrescriptionDTO } from '../../../presentation/dto/prescriptionDTO/update-prescription.dto';
import type { Prescription } from '../../../infrastructure/database/models/prescription.models';

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
