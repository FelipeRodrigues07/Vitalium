import type { Appointment } from '../../../infrastructure/database/models/appointment.models';

const BLOCKING_STATUSES = new Set([
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'RESCHEDULED',
]);

function toRange(scheduledAt: Date | string, durationMinutes: number) {
  const start = new Date(scheduledAt).getTime();
  const end = start + durationMinutes * 60_000;
  return { start, end };
}

export function hasDoctorScheduleConflict(params: {
  doctorId: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  appointments: Appointment[];
  ignoreAppointmentId?: string;
}): boolean {
  const { start, end } = toRange(params.scheduledAt, params.durationMinutes);

  for (const item of params.appointments) {
    if (item.doctorId !== params.doctorId) continue;
    if (
      params.ignoreAppointmentId &&
      item.id === params.ignoreAppointmentId
    ) {
      continue;
    }
    if (!BLOCKING_STATUSES.has(String(item.status))) continue;

    const other = toRange(item.scheduledAt, item.duration || 30);
    if (start < other.end && other.start < end) {
      return true;
    }
  }

  return false;
}
