import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DoctorSpecSimpleDTO {
  @Expose() id: string;
  @Expose() name: string;
}

export class DoctorSpecDoctorDTO {
  @Expose() id: string;
  @Expose() crm: string;
}

export class DoctorSpecializationResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() doctorId: string;
  @ApiProperty() @Expose() specializationId: string;
  @ApiProperty() @Expose() createdAt: string;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => DoctorSpecDoctorDTO)
  doctor?: DoctorSpecDoctorDTO;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => DoctorSpecSimpleDTO)
  specialization?: DoctorSpecSimpleDTO;
}
