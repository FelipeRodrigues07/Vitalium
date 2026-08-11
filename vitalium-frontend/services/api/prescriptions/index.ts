import { api } from "@/services/api/api"

export interface Prescription {
  id: string
  patientId: string
  doctorId: string
  unitId: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  prescribedAt: string
  createdAt: string
}

export interface CreatePrescriptionPayload {
  patientId: string
  doctorId: string
  unitId: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  prescribedAt?: string
}

export interface UpdatePrescriptionPayload {
  medication?: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
  prescribedAt?: string
}

export const prescriptionsApi = {
  create: (payload: CreatePrescriptionPayload): Promise<Prescription> =>
    api.post<Prescription>("/prescriptions", payload).then((r) => r.data),

  listByPatient: (patientId: string): Promise<Prescription[]> =>
    api
      .get<Prescription[]>(`/prescriptions/patient/${patientId}`)
      .then((r) => r.data),

  listByDoctor: (doctorId: string): Promise<Prescription[]> =>
    api
      .get<Prescription[]>(`/prescriptions/doctor/${doctorId}`)
      .then((r) => r.data),

  getById: (id: string): Promise<Prescription> =>
    api.get<Prescription>(`/prescriptions/${id}`).then((r) => r.data),

  update: (
    id: string,
    payload: UpdatePrescriptionPayload,
  ): Promise<Prescription> =>
    api
      .patch<Prescription>(`/prescriptions/${id}`, payload)
      .then((r) => r.data),
}
