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
  unitId: string
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
  unitId: string
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

  listByPatient: (patientId: string, unitId?: string | null): Promise<MedicalRecord[]> =>
    api
      .get<MedicalRecord[]>(`/medical-records/patient/${patientId}`, {
        params: unitId ? { unitId } : undefined,
      })
      .then((r) => r.data),

  listByDoctor: (doctorId: string, unitId?: string | null): Promise<MedicalRecord[]> =>
    api
      .get<MedicalRecord[]>(`/medical-records/doctor/${doctorId}`, {
        params: unitId ? { unitId } : undefined,
      })
      .then((r) => r.data),

  getById: (id: string, unitId?: string | null): Promise<MedicalRecord> =>
    api
      .get<MedicalRecord>(`/medical-records/${id}`, {
        params: unitId ? { unitId } : undefined,
      })
      .then((r) => r.data),

  update: (
    id: string,
    payload: UpdateMedicalRecordPayload,
    unitId?: string | null,
  ): Promise<MedicalRecord> =>
    api
      .patch<MedicalRecord>(`/medical-records/${id}`, payload, {
        params: unitId ? { unitId } : undefined,
      })
      .then((r) => r.data),
}
