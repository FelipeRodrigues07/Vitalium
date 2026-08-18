import { api } from "@/services/api/api";

export interface LinkedPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  user?: LinkedPerson;
}

export interface PatientDoctorLink {
  id: string;
  patientId: string;
  doctorId: string;
  patient?: LinkedPerson;
  doctor?: LinkedPerson;
}

export function getLinkedPerson(
  person?: LinkedPerson,
): LinkedPerson | undefined {
  if (!person) return undefined;

  if (person.firstName && person.lastName) {
    return person;
  }

  if (person.user) {
    return {
      id: person.id,
      firstName: person.user.firstName,
      lastName: person.user.lastName,
      email: person.user.email,
    };
  }

  return undefined;
}

export function getLinkedPersonDisplayName(
  person?: LinkedPerson,
  fallback = "Usuário",
): string {
  const resolved = getLinkedPerson(person);
  if (resolved) {
    const name = `${resolved.firstName} ${resolved.lastName}`.trim();
    if (name) return name;
  }

  return fallback;
}

export function getPersonInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

/** @deprecated use PatientDoctorLink */
export type PatientSummary = PatientDoctorLink;

/** @deprecated use getLinkedPerson */
export const getPatientPerson = getLinkedPerson;

/** @deprecated use getLinkedPersonDisplayName */
export const getPatientDisplayName = (
  patient?: LinkedPerson,
) => getLinkedPersonDisplayName(patient, "Paciente");

export const patientDoctorApi = {
  listPatientsByUserDoctor: (
    userId: string,
    unitId?: string | null,
  ): Promise<PatientDoctorLink[]> =>
    api
      .get<PatientDoctorLink[]>(`/patient-doctors/doctor/by-user/${userId}`, {
        params: unitId ? { unitId } : undefined,
      })
      .then((r) => r.data),

  listDoctorsByUserPatient: (userId: string): Promise<PatientDoctorLink[]> =>
    api
      .get<PatientDoctorLink[]>(`/patient-doctors/patient/by-user/${userId}`)
      .then((r) => r.data),
};
