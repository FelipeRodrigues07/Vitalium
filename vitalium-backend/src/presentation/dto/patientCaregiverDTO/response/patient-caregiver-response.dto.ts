import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PCPersonDTO {
  @Expose() id: string;
  @Expose() firstName: string;
  @Expose() lastName: string;
  @Expose() email: string;
}

export class PatientCaregiverResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() patientId: string;
  @ApiProperty() @Expose() caregiverId: string;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: string;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => PCPersonDTO)
  patient?: PCPersonDTO;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => PCPersonDTO)
  caregiver?: PCPersonDTO;
}
