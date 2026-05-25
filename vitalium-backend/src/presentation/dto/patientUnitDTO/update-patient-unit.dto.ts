import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePatientUnitDTO {
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
