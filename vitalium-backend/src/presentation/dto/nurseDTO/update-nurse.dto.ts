import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNurseDTO {
  @IsOptional()
  @IsString()
  coren?: string;

  @IsOptional()
  @IsBoolean()
  corenState?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
