import { api } from "@/services/api/api"

export type RecordType =
  | "CONSULTATION"
  | "EXAMINATION"
  | "SURGERY"
  | "EMERGENCY"
  | "ROUTINE_CHECKUP"
  | "FOLLOW_UP"
  | "DIAGNOSTIC"
  | "OTHER"

export interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  title: string
  description: string
  diagnosis?: string
  symptoms: string[]
  treatment?: string
  observations?: string
  recordDate: string
  recordType: RecordType
  createdAt: string
  updatedAt: string
}

export interface CreateMedicalRecordPayload {
  patientId: string
  doctorId: string
  title: string
  description: string
  diagnosis?: string
  symptoms?: string[]
  treatment?: string
  observations?: string
  recordDate?: string
  recordType: RecordType
}

export interface UpdateMedicalRecordPayload {
  title?: string
  description?: string
  diagnosis?: string
  symptoms?: string[]
  treatment?: string
  observations?: string
  recordDate?: string
  recordType?: RecordType
}

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  CONSULTATION: "Consulta",
  EXAMINATION: "Exame",
  SURGERY: "Cirurgia",
  EMERGENCY: "Emergência",
  ROUTINE_CHECKUP: "Check-up",
  FOLLOW_UP: "Retorno",
  DIAGNOSTIC: "Diagnóstico",
  OTHER: "Outro",
}

export const medicalRecordsApi = {
  create: (payload: CreateMedicalRecordPayload): Promise<MedicalRecord> =>
    api.post<MedicalRecord>("/medical-records", payload).then((r) => r.data),

  listByPatient: (patientId: string): Promise<MedicalRecord[]> =>
    api
      .get<MedicalRecord[]>(`/medical-records/patient/${patientId}`)
      .then((r) => r.data),

  listByDoctor: (doctorId: string): Promise<MedicalRecord[]> =>
    api
      .get<MedicalRecord[]>(`/medical-records/doctor/${doctorId}`)
      .then((r) => r.data),

  getById: (id: string): Promise<MedicalRecord> =>
    api.get<MedicalRecord>(`/medical-records/${id}`).then((r) => r.data),

  update: (
    id: string,
    payload: UpdateMedicalRecordPayload,
  ): Promise<MedicalRecord> =>
    api
      .patch<MedicalRecord>(`/medical-records/${id}`, payload)
      .then((r) => r.data),
}
