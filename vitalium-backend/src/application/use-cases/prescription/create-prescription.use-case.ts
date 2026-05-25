import { Inject, Injectable } from '@nestjs/common';
import type { IPrescriptionRepository } from '../../../domain/interfaces/repositories/prescription/prescription.repository.interface';
import type { Prescription } from '../../../infrastructure/database/models/prescription.models';
import type { CreatePrescriptionDTO } from '../../../presentation/dto/prescriptionDTO/create-prescription.dto';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class CreatePrescriptionUseCase {
  constructor(
    @Inject('IPrescriptionRepository')
    private readonly prescriptionRepository: IPrescriptionRepository,
  ) {}

  async execute(dto: CreatePrescriptionDTO): Promise<Prescription> {
    try {
      return await this.prescriptionRepository.create(dto);
    } catch (error) {
      throw new DatabaseException('criar prescrição', error);
    }
  }
}
