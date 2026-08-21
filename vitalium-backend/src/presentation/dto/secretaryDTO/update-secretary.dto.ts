import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSecretaryDTO {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
