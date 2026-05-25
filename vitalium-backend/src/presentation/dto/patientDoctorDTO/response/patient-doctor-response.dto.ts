import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PatientDoctorPersonDTO {
  @Expose() id: string;
  @Expose() firstName: string;
  @Expose() lastName: string;
  @Expose() email: string;
}

export class PatientDoctorResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() patientId: string;
  @ApiProperty() @Expose() doctorId: string;
  @ApiProperty() @Expose() startDate: string;
  @ApiPropertyOptional() @Expose() endDate?: string;
  @ApiProperty() @Expose() createdAt: string;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => PatientDoctorPersonDTO)
  patient?: PatientDoctorPersonDTO;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => PatientDoctorPersonDTO)
  doctor?: PatientDoctorPersonDTO;
}
