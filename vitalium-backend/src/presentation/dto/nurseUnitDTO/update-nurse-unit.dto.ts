import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNurseUnitDTO {
  @IsOptional()
  @IsString()
  wardId?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
