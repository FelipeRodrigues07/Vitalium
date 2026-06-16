import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';

type PersonWithUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

export type PatientDoctorLinkSource = {
  id: string;
  patientId: string;
  doctorId: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  createdAt: Date | string;
  patient?: PersonWithUser;
  doctor?: PersonWithUser;
};

function toPersonDto(value: PersonWithUser | undefined) {
  if (!value) return undefined;

  if (value.user) {
    return {
      id: value.id,
      firstName: value.user.firstName,
      lastName: value.user.lastName,
      email: value.user.email,
    };
  }

  if (value.firstName || value.lastName || value.email) {
    return {
      id: value.id,
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
    };
  }

  return undefined;
}

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

export function toPatientDoctorResponse(
  link: PatientDoctorLinkSource,
): PatientDoctorResponseDTO {
  return plainToInstance(
    PatientDoctorResponseDTO,
    {
      id: link.id,
      patientId: link.patientId,
      doctorId: link.doctorId,
      startDate: link.startDate,
      endDate: link.endDate ?? undefined,
      createdAt: link.createdAt,
      patient: toPersonDto(link.patient),
      doctor: toPersonDto(link.doctor),
    },
    { excludeExtraneousValues: true },
  );
}

export function toPatientDoctorResponseList(
  links: PatientDoctorLinkSource[],
): PatientDoctorResponseDTO[] {
  return links.map(toPatientDoctorResponse);
}
