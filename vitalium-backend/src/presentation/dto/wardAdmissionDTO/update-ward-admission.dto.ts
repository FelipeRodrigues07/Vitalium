import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AdmissionStatus } from '../../../shared/enums/admission-status.enum';

export class UpdateWardAdmissionDTO {
  @IsOptional()
  @IsDateString()
  dischargeDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(AdmissionStatus)
  status?: AdmissionStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
