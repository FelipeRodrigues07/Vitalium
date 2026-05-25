import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDoctorSpecializationDTO {
  @ApiProperty({
    description: 'ID do médico',
    example: 'clxyz123456789abcdef',
  })
  @IsString()
  doctorId: string;

  @ApiProperty({
    description: 'ID da especialização',
    example: 'clxyz987654321zyxlc',
  })
  @IsString()
  specializationId: string;
}
