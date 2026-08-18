import { api } from "@/services/api/api"

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED"

export type AppointmentType =
  | "CONSULTATION"
  | "FOLLOW_UP"
  | "ROUTINE_CHECKUP"
  | "EMERGENCY"
  | "SURGERY"
  | "EXAMINATION"
  | "VACCINATION"
  | "OTHER"

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  unitId: string
  title: string
  description?: string
  scheduledAt: string
  duration: number
  status: AppointmentStatus
  type: AppointmentType
  price?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentPayload {
  patientId: string
  doctorId: string
  unitId: string
  title: string
  description?: string
  scheduledAt: string
  duration?: number
  status?: AppointmentStatus
  type: AppointmentType
  price?: number
  notes?: string
}

export interface UpdateAppointmentPayload {
  title?: string
  description?: string
  scheduledAt?: string
  duration?: number
  status?: AppointmentStatus
  type?: AppointmentType
  price?: number
  notes?: string
}

export const appointmentsApi = {
  create: (payload: CreateAppointmentPayload): Promise<Appointment> =>
    api.post<Appointment>("/appointments", payload).then((r) => r.data),

  listByDoctor: (doctorId: string, unitId?: string | null): Promise<Appointment[]> =>
    api
      .get<Appointment[]>(`/appointments/doctor/${doctorId}`, {
        params: unitId ? { unitId } : undefined,
      })
      .then((r) => r.data),

  listByPatient: (patientId: string): Promise<Appointment[]> =>
    api
      .get<Appointment[]>(`/appointments/patient/${patientId}`)
      .then((r) => r.data),

  getById: (id: string, unitId?: string | null): Promise<Appointment> =>
    api
      .get<Appointment>(`/appointments/${id}`, {
        params: unitId ? { unitId } : undefined,
      })
      .then((r) => r.data),

  update: (
    id: string,
    payload: UpdateAppointmentPayload,
    unitId?: string | null,
  ): Promise<Appointment> =>
    api
      .patch<Appointment>(`/appointments/${id}`, payload, {
        params: unitId ? { unitId } : undefined,
      })
      .then((r) => r.data),
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  CONSULTATION: "Consulta",
  FOLLOW_UP: "Retorno",
  ROUTINE_CHECKUP: "Check-up",
  EMERGENCY: "Emergência",
  SURGERY: "Cirurgia",
  EXAMINATION: "Exame",
  VACCINATION: "Vacinação",
  OTHER: "Outro",
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendada",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  NO_SHOW: "Não compareceu",
  RESCHEDULED: "Reagendada",
}
