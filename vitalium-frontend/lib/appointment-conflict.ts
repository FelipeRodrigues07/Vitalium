import type { Appointment } from "@/services/api/appointments"

const BLOCKING_STATUSES = new Set([
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "RESCHEDULED",
])

function toRange(scheduledAt: string | Date, durationMinutes: number) {
  const start = new Date(scheduledAt).getTime()
  const end = start + durationMinutes * 60_000
  return { start, end }
}

/** True se os intervalos [start, end) se sobrepõem. */
export function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA
}

/**
 * Verifica conflito de horário do médico com consultas ativas.
 * Ignora canceladas, concluídas, no-show e o próprio id (ao editar).
 */
export function findDoctorScheduleConflict(params: {
  doctorId: string
  scheduledAt: string
  durationMinutes: number
  appointments: Appointment[]
  ignoreAppointmentId?: string
}): Appointment | null {
  const { start, end } = toRange(params.scheduledAt, params.durationMinutes)

  for (const item of params.appointments) {
    if (item.doctorId !== params.doctorId) continue
    if (params.ignoreAppointmentId && item.id === params.ignoreAppointmentId) {
      continue
    }
    if (!BLOCKING_STATUSES.has(item.status)) continue

    const other = toRange(item.scheduledAt, item.duration || 30)
    if (rangesOverlap(start, end, other.start, other.end)) {
      return item
    }
  }

  return null
}
