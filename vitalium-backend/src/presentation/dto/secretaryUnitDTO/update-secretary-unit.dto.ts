import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSecretaryUnitDTO {
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
