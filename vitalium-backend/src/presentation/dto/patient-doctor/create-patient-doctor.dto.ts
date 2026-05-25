import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePatientDoctorDTO {
  @ApiProperty({ description: 'ID do paciente' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'ID do médico' })
  @IsString()
  doctorId: string;

  @ApiPropertyOptional({
    description:
      'ID da unidade para validar que paciente e médico pertencem à mesma unidade',
  })
  @IsOptional()
  @IsString()
  unitId?: string;
}
