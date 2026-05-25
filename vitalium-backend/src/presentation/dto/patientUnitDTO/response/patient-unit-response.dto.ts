import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PUPatientDTO {
  @Expose() id: string;
  @Expose() cpf: string;
  @Expose() user?: { firstName: string; lastName: string; email: string };
}

export class PUUnitDTO {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() type: string;
  @Expose() city?: string;
}

export class PatientUnitResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() patientId: string;
  @ApiProperty() @Expose() unitId: string;
  @ApiProperty() @Expose() isPrimary: boolean;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: string;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => PUPatientDTO)
  patient?: PUPatientDTO;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => PUUnitDTO)
  unit?: PUUnitDTO;
}
