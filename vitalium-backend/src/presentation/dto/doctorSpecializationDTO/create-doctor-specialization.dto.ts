import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDoctorSpecializationDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  doctorId: string;

  @ApiProperty({ example: 'clxyz987654321' })
  @IsString()
  specializationId: string;
}
