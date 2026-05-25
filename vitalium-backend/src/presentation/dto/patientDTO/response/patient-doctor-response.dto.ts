import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { DoctorResponseDTO } from '../../doctorDTO/response/doctor-response.dto';

export class PatientDoctorResponseDTO {
  @ApiProperty({
    description: 'ID do vínculo paciente-médico',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID do paciente',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  patientId: string;

  @ApiProperty({
    description: 'ID do médico',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  doctorId: string;

  @ApiProperty({
    description: 'Data de início do vínculo',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Expose()
  startDate: Date;

  @ApiPropertyOptional({
    description: 'Data de encerramento do vínculo',
    example: '2025-12-31T00:00:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  endDate?: Date;

  @ApiProperty({
    description: 'Data de criação do vínculo',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Dados do médico vinculado',
    type: () => DoctorResponseDTO,
  })
  @Expose()
  @Type(() => DoctorResponseDTO)
  doctor?: DoctorResponseDTO;
}
