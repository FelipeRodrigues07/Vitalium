import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NurseUnitNurseDTO {
  @Expose() id: string;
  @Expose() coren: string;
  @Expose() corenState: boolean;
  @Expose() isActive: boolean;
}

export class NurseUnitUnitDTO {
  @Expose() id: string;
  @Expose() name: string;
}

export class NurseUnitResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() nurseId: string;
  @ApiProperty() @Expose() unitId: string;
  @ApiPropertyOptional() @Expose() wardId?: string;
  @ApiProperty() @Expose() isPrimary: boolean;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => NurseUnitNurseDTO)
  nurse?: NurseUnitNurseDTO;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => NurseUnitUnitDTO)
  unit?: NurseUnitUnitDTO;
}
