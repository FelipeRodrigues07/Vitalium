import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePatientCaregiverDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  patientId: string;

  @ApiProperty({ example: 'clxyz987654321' })
  @IsString()
  caregiverId: string;
}
