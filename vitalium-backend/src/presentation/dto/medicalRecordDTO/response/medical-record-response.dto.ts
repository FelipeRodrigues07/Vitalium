import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class MedicalRecordDoctorDTO {
  @Expose() id: string;
  @Expose() userId: string;
}

export class MedicalRecordPatientDTO {
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() cpf: string;
}

export class MedicalAttachmentResponseDTO {
  @Expose() id: string;
  @Expose() medicalRecordId: string;
  @Expose() fileName: string;
  @Expose() fileUrl: string;
  @Expose() fileType: string;
  @Expose() fileSize: number;
  @Expose() uploadedAt: string;
}

export class MedicalRecordResponseDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'clxyz123456789' })
  @Expose()
  patientId: string;

  @ApiProperty({ example: 'clxyz123456789' })
  @Expose()
  doctorId: string;

  @ApiProperty({ example: 'clxyz123456789' })
  @Expose()
  unitId: string;

  @ApiProperty({ example: 'Consulta de rotina' })
  @Expose()
  title: string;

  @ApiProperty({ example: 'Paciente apresentou sintomas' })
  @Expose()
  description: string;

  @ApiPropertyOptional({ example: 'Gripe influenza' })
  @Expose()
  diagnosis?: string;

  @ApiProperty({ example: ['febre', 'tosse'] })
  @Expose()
  symptoms: string[];

  @ApiPropertyOptional({ example: 'Repouso e hidratação' })
  @Expose()
  treatment?: string;

  @ApiPropertyOptional({ example: 'Retorno em 7 dias' })
  @Expose()
  observations?: string;

  @ApiProperty({ example: '2026-05-25T00:00:00.000Z' })
  @Expose()
  recordDate: string;

  @ApiProperty({ example: 'CONSULTATION' })
  @Expose()
  recordType: string;

  @ApiProperty({ example: '2026-05-25T00:00:00.000Z' })
  @Expose()
  createdAt: string;

  @ApiProperty({ example: '2026-05-25T00:00:00.000Z' })
  @Expose()
  updatedAt: string;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => MedicalAttachmentResponseDTO)
  attachments?: MedicalAttachmentResponseDTO[];
}
