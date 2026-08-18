import { Module } from '@nestjs/common';
import { CreatePrescriptionUseCase } from '../application/use-cases/prescription/create-prescription.use-case';
import { DeletePrescriptionUseCase } from '../application/use-cases/prescription/delete-prescription.use-case';
import { SearchPrescriptionUseCase } from '../application/use-cases/prescription/search-prescription.use-case';
import { UpdatePrescriptionUseCase } from '../application/use-cases/prescription/update-prescription.use-case';
import { ClinicMembershipModule } from '../shared/clinic/clinic-membership.module';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { PrescriptionRepository } from '../infrastructure/repositories/prescription/prescription.repository';
import { PrescriptionController } from '../presentation/controllers/prescription/prescription.controller';

@Module({
  imports: [PrismaModule, ClinicMembershipModule],
  controllers: [PrescriptionController],
  providers: [
    CreatePrescriptionUseCase,
    SearchPrescriptionUseCase,
    UpdatePrescriptionUseCase,
    DeletePrescriptionUseCase,
    {
      provide: 'IPrescriptionRepository',
      useClass: PrescriptionRepository,
    },
  ],
  exports: ['IPrescriptionRepository'],
})
export class PrescriptionModule {}
