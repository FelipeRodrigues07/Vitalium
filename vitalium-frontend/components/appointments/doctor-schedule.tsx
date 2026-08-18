"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Plus, Loader2 } from "lucide-react"
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  appointmentsApi,
  type Appointment,
  type AppointmentStatus,
} from "@/services/api/appointments"
import {
  getLinkedPersonDisplayName,
  patientDoctorApi,
  type PatientDoctorLink,
} from "@/services/api/patient-doctors/patientsByDoctor"
import { AppointmentFormDialog } from "@/components/appointments/appointment-form-dialog"
import { useAuth } from "@/providers/auth-provider"
import { useDoctorActiveUnit } from "@/components/doctor/doctor-unit-provider"
import { isOnOrAfterToday } from "@/lib/appointment-date"

function isSameDay(date: Date, other: Date) {
  return (
    date.getFullYear() === other.getFullYear() &&
    date.getMonth() === other.getMonth() &&
    date.getDate() === other.getDate()
  )
}

function startOfWeek(date: Date) {
  const result = new Date(date)
  const day = result.getDay()
  result.setDate(result.getDate() - day)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfWeek(date: Date) {
  const result = startOfWeek(date)
  result.setDate(result.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

function statusBadgeClass(status: AppointmentStatus) {
  switch (status) {
    case "CONFIRMED":
    case "SCHEDULED":
    case "RESCHEDULED":
      return "bg-emerald-100 text-emerald-800"
    case "COMPLETED":
      return "bg-slate-100 text-slate-700"
    case "CANCELLED":
    case "NO_SHOW":
      return "bg-red-100 text-red-800"
    default:
      return "bg-amber-100 text-amber-800"
  }
}

function canManageAppointment(status: AppointmentStatus) {
  return (
    status === "SCHEDULED" ||
    status === "CONFIRMED" ||
    status === "RESCHEDULED" ||
    status === "IN_PROGRESS"
  )
}

export function DoctorSchedule() {
  const { user } = useAuth()
  const {
    doctorId,
    activeUnitId: unitId,
    activeUnit,
    isLoading: loadingDoctor,
  } = useDoctorActiveUnit()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<PatientDoctorLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null)

  const patientNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const link of patients) {
      map.set(
        link.patientId,
        getLinkedPersonDisplayName(link.patient, "Paciente"),
      )
    }
    return map
  }, [patients])

  const sortAppointments = (list: Appointment[]) =>
    [...list].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )

  const upsertAppointment = (appointment: Appointment) => {
    setAppointments((prev) =>
      sortAppointments([
        ...prev.filter((item) => item.id !== appointment.id),
        appointment,
      ]),
    )
  }

  const load = useCallback(async () => {
    if (!user?.id || loadingDoctor || !unitId) return

    try {
      setLoading(true)
      setError(null)

      const links = await patientDoctorApi.listPatientsByUserDoctor(
        user.id,
        unitId,
      )
      setPatients(links)

      if (!doctorId) {
        setAppointments([])
        return
      }

      const list = await appointmentsApi.listByDoctor(doctorId, unitId)
      setAppointments(sortAppointments(list))
    } catch {
      setError("Não foi possível carregar a agenda.")
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, doctorId, unitId, loadingDoctor])

  useEffect(() => {
    void load()
  }, [load])

  const today = useMemo(() => new Date(), [])
  const todayAppointments = appointments.filter(
    (item) =>
      isSameDay(new Date(item.scheduledAt), today) &&
      item.status !== "CANCELLED",
  )
  const weekStart = startOfWeek(today)
  const weekEnd = endOfWeek(today)
  const weekAppointments = appointments.filter((item) => {
    const scheduled = new Date(item.scheduledAt)
    return (
      item.status !== "CANCELLED" &&
      scheduled >= weekStart &&
      scheduled <= weekEnd
    )
  })
  const upcomingAppointments = appointments.filter(
    (item) =>
      isOnOrAfterToday(item.scheduledAt) &&
      item.status !== "CANCELLED" &&
      item.status !== "COMPLETED" &&
      item.status !== "NO_SHOW",
  )
  const historyAppointments = appointments
    .filter(
      (item) =>
        item.status === "COMPLETED" ||
        item.status === "CANCELLED" ||
        item.status === "NO_SHOW" ||
        !isOnOrAfterToday(item.scheduledAt),
    )
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    )

  const handleStatusUpdate = async (
    appointmentId: string,
    status: AppointmentStatus,
    errorMessage: string,
  ) => {
    try {
      setUpdatingId(appointmentId)
      setError(null)
      const updated = await appointmentsApi.update(appointmentId, { status }, unitId)
      upsertAppointment(updated)
    } catch {
      setError(errorMessage)
    } finally {
      setUpdatingId(null)
    }
  }

  const renderActions = (appointment: Appointment) => {
    if (!canManageAppointment(appointment.status)) return null

    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={updatingId === appointment.id}
          onClick={() => setEditingAppointment(appointment)}
        >
          Remarcar
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={updatingId === appointment.id}
          onClick={() =>
            void handleStatusUpdate(
              appointment.id,
              "COMPLETED",
              "Não foi possível concluir a consulta.",
            )
          }
        >
          Concluir
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={updatingId === appointment.id}
          onClick={() =>
            void handleStatusUpdate(
              appointment.id,
              "CANCELLED",
              "Não foi possível cancelar a consulta.",
            )
          }
        >
          Cancelar
        </Button>
      </div>
    )
  }

  if (loading || loadingDoctor) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando agenda...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card className="border-emerald-200">
            <CardContent className="p-4">
              <p className="text-sm text-emerald-700">Hoje</p>
              <p className="text-2xl font-bold text-emerald-900">
                {todayAppointments.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200">
            <CardContent className="p-4">
              <p className="text-sm text-emerald-700">Esta semana</p>
              <p className="text-2xl font-bold text-emerald-900">
                {weekAppointments.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <p className="text-sm text-emerald-700">Total</p>
              <p className="text-2xl font-bold text-emerald-900">
                {appointments.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {doctorId && unitId ? (
          <div className="flex flex-col items-stretch gap-1 sm:items-end">
            <AppointmentFormDialog
              mode="create"
              doctorId={doctorId}
              unitId={unitId}
              patients={patients}
              existingAppointments={appointments}
              onSaved={upsertAppointment}
            >
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova consulta
              </Button>
            </AppointmentFormDialog>
            {activeUnit && (
              <p className="text-xs text-muted-foreground">
                Agendando em {activeUnit.name}
              </p>
            )}
          </div>
        ) : (
          <Button disabled className="gap-2">
            <Plus className="h-4 w-4" />
            Nova consulta
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!doctorId && (
        <Card className="border-emerald-200">
          <CardContent className="py-10 text-center text-muted-foreground">
            Não encontramos seu perfil de médico. Peça ao admin para concluir o cadastro.
          </CardContent>
        </Card>
      )}

      {doctorId && !unitId && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-6 text-sm text-amber-900">
            Seu perfil de médico não tem unidade vinculada. Peça ao admin para
            associar uma unidade antes de agendar.
          </CardContent>
        </Card>
      )}

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">
            Consultas de hoje — {today.toLocaleDateString("pt-BR")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayAppointments.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma consulta para hoje.
            </p>
          ) : (
            todayAppointments.map((appointment) => {
              const scheduled = new Date(appointment.scheduledAt)
              const time = scheduled.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <div
                  key={appointment.id}
                  className="rounded-lg border border-emerald-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-900">
                          <Clock className="h-4 w-4" />
                          {time} ({appointment.duration} min)
                        </span>
                        <Badge className={statusBadgeClass(appointment.status)}>
                          {APPOINTMENT_STATUS_LABELS[appointment.status]}
                        </Badge>
                        <Badge variant="outline">
                          {APPOINTMENT_TYPE_LABELS[appointment.type]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-900">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {patientNameById.get(appointment.patientId) ??
                            "Paciente"}
                        </span>
                      </div>
                      <p className="text-sm text-emerald-700">
                        {appointment.title}
                        {appointment.notes ? ` — ${appointment.notes}` : ""}
                      </p>
                    </div>

                    {renderActions(appointment)}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">Próximas consultas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingAppointments.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Nenhuma consulta a partir de hoje.
            </p>
          ) : (
            upcomingAppointments.slice(0, 10).map((appointment) => {
              const scheduled = new Date(appointment.scheduledAt)
              return (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-3 rounded-lg border p-3 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {patientNameById.get(appointment.patientId) ?? "Paciente"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.title} ·{" "}
                      {APPOINTMENT_TYPE_LABELS[appointment.type]}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {scheduled.toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <Badge className={statusBadgeClass(appointment.status)}>
                      {APPOINTMENT_STATUS_LABELS[appointment.status]}
                    </Badge>
                    {renderActions(appointment)}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {historyAppointments.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Nenhum histórico de consultas ainda.
            </p>
          ) : (
            historyAppointments.slice(0, 15).map((appointment) => {
              const scheduled = new Date(appointment.scheduledAt)
              return (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {patientNameById.get(appointment.patientId) ?? "Paciente"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.title} ·{" "}
                      {APPOINTMENT_TYPE_LABELS[appointment.type]}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <Badge className={statusBadgeClass(appointment.status)}>
                      {APPOINTMENT_STATUS_LABELS[appointment.status]}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {scheduled.toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {doctorId && unitId && editingAppointment && (
        <AppointmentFormDialog
          mode="edit"
          doctorId={doctorId}
          unitId={unitId}
          patients={patients}
          existingAppointments={appointments}
          appointment={editingAppointment}
          open={Boolean(editingAppointment)}
          onOpenChange={(open) => {
            if (!open) setEditingAppointment(null)
          }}
          onSaved={(appointment) => {
            upsertAppointment(appointment)
            setEditingAppointment(null)
          }}
        />
      )}
    </div>
  )
}
