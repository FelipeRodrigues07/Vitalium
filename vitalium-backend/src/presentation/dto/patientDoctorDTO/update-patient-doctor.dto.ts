import { IsDateString, IsOptional } from 'class-validator';

export class UpdatePatientDoctorDTO {
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
