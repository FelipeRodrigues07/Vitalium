import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { ApiMedicalAttachmentOperations } from '../../../shared/swagger/decorators/medical-attachment.decorators';
import { MedicalAttachmentResponseDTO } from '../../dto/medicalAttachmentDTO/response/medical-attachment-response.dto';
import { CreateMedicalAttachmentDTO } from '../../dto/medicalAttachmentDTO/create-medical-attachment.dto';
import {
  CreateMedicalAttachmentUseCase,
  SearchMedicalAttachmentUseCase,
  DeleteMedicalAttachmentUseCase,
} from '../../../application/use-cases/medical-attachment/medical-attachment.use-cases';

@ApiTags('medical-records')
@Controller('medical-records/:recordId/attachments')
@UseGuards(AuthGuard, RolesGuard)
export class MedicalAttachmentController {
  constructor(
    private readonly createUseCase: CreateMedicalAttachmentUseCase,
    private readonly searchUseCase: SearchMedicalAttachmentUseCase,
    private readonly deleteUseCase: DeleteMedicalAttachmentUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiMedicalAttachmentOperations.create()
  @Roles(Role.ADMIN, Role.DOCTOR)
  async create(
    @Param('recordId') recordId: string,
    @Body() dto: Omit<CreateMedicalAttachmentDTO, 'medicalRecordId'>,
  ): Promise<MedicalAttachmentResponseDTO> {
    const attachment = await this.createUseCase.execute({
      ...dto,
      medicalRecordId: recordId,
    });
    return plainToInstance(MedicalAttachmentResponseDTO, attachment, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiMedicalAttachmentOperations.findByRecord()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findByRecord(
    @Param('recordId') recordId: string,
  ): Promise<MedicalAttachmentResponseDTO[]> {
    const attachments =
      await this.searchUseCase.findByMedicalRecordId(recordId);
    return plainToInstance(MedicalAttachmentResponseDTO, attachments, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiMedicalAttachmentOperations.findById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findOne(
    @Param('id') id: string,
  ): Promise<MedicalAttachmentResponseDTO> {
    const attachment = await this.searchUseCase.findById(id);
    return plainToInstance(MedicalAttachmentResponseDTO, attachment, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiMedicalAttachmentOperations.delete()
  @Roles(Role.ADMIN, Role.DOCTOR)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
}
