import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdatePrescriptionDTO {
  @IsOptional()
  @IsString()
  medication?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsDateString()
  prescribedAt?: string;
}
