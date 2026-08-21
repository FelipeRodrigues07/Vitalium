"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Stethoscope, User, Plus, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  appointmentsApi,
  type Appointment,
  type AppointmentStatus,
} from "@/services/api/appointments"
import { GetDoctorsService, type DoctorListItemModel } from "@/services/api/doctors/GetDoctors"
import { GetPatientsService, type PatientListItemModel } from "@/services/api/patients/GetPatients"
import { SecretaryAppointmentDialog } from "@/components/secretary/secretary-appointment-dialog"
import { useSecretaryActiveUnit } from "@/components/secretary/secretary-unit-provider"
import { isOnOrAfterToday } from "@/lib/appointment-date"

function isSameDay(date: Date, other: Date) {
  return (
    date.getFullYear() === other.getFullYear() &&
    date.getMonth() === other.getMonth() &&
    date.getDate() === other.getDate()
  )
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

function personName(firstName?: string, lastName?: string, fallback = "Usuário") {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim()
  return name || fallback
}

export function SecretarySchedule() {
  const {
    activeUnitId: unitId,
    activeUnit,
    isLoading: loadingSecretary,
  } = useSecretaryActiveUnit()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<PatientListItemModel[]>([])
  const [doctors, setDoctors] = useState<DoctorListItemModel[]>([])
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null)

  const patientNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const patient of patients) {
      map.set(patient.id, personName(patient.user?.firstName, patient.user?.lastName, "Paciente"))
    }
    return map
  }, [patients])

  const doctorNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const doctor of doctors) {
      map.set(doctor.id, personName(doctor.user?.firstName, doctor.user?.lastName, "Médico"))
    }
    return map
  }, [doctors])

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
    if (loadingSecretary || !unitId) return

    try {
      setLoading(true)
      setError(null)
      const [unitAppointments, unitPatients, unitDoctors] = await Promise.all([
        appointmentsApi.listByUnit(unitId),
        GetPatientsService.getMyPatients(unitId),
        GetDoctorsService.getDoctors(unitId),
      ])
      setAppointments(sortAppointments(unitAppointments))
      setPatients(unitPatients)
      setDoctors(unitDoctors)
    } catch (err) {
      console.error(err)
      setError("Não foi possível carregar a agenda da unidade.")
      setAppointments([])
      setPatients([])
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }, [loadingSecretary, unitId])

  useEffect(() => {
    void load()
  }, [load])

  const handleStatusUpdate = async (
    id: string,
    status: AppointmentStatus,
    failMessage: string,
  ) => {
    if (!unitId) return
    try {
      setUpdatingId(id)
      const updated = await appointmentsApi.update(id, { status }, unitId)
      upsertAppointment(updated)
    } catch (err) {
      console.error(err)
      setError(failMessage)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredAppointments =
    doctorFilter === "all"
      ? appointments
      : appointments.filter((item) => item.doctorId === doctorFilter)

  const today = new Date()
  const todayAppointments = filteredAppointments.filter((item) =>
    isSameDay(new Date(item.scheduledAt), today),
  )
  const upcomingAppointments = filteredAppointments.filter(
    (item) =>
      isOnOrAfterToday(item.scheduledAt) &&
      item.status !== "CANCELLED" &&
      item.status !== "COMPLETED" &&
      item.status !== "NO_SHOW",
  )

  const renderActions = (appointment: Appointment) => {
    if (!canManageAppointment(appointment.status)) return null

    return (
      <div className="flex flex-wrap gap-2">
        {appointment.status === "SCHEDULED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={updatingId === appointment.id}
            onClick={() =>
              void handleStatusUpdate(
                appointment.id,
                "CONFIRMED",
                "Não foi possível confirmar a consulta.",
              )
            }
          >
            Confirmar
          </Button>
        )}
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
              "NO_SHOW",
              "Não foi possível marcar falta.",
            )
          }
        >
          Faltou
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

  if (loading || loadingSecretary) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando agenda...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Hoje</p>
              <p className="text-2xl font-bold">{todayAppointments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Próximas</p>
              <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Filtrar médico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os médicos</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {personName(doctor.user?.firstName, doctor.user?.lastName, "Médico")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {unitId ? (
            <SecretaryAppointmentDialog
              mode="create"
              unitId={unitId}
              doctors={doctors}
              patients={patients}
              existingAppointments={appointments}
              onSaved={upsertAppointment}
            >
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova consulta
              </Button>
            </SecretaryAppointmentDialog>
          ) : (
            <Button disabled className="gap-2">
              <Plus className="h-4 w-4" />
              Nova consulta
            </Button>
          )}
        </div>
      </div>

      {activeUnit && (
        <p className="text-sm text-muted-foreground">
          Agenda de {activeUnit.name}
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!unitId && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-6 text-sm text-amber-900">
            Seu perfil não tem unidade vinculada. Peça ao admin para associar
            uma unidade.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
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
                  className="rounded-lg border bg-white p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-semibold">
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
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {patientNameById.get(appointment.patientId) ?? "Paciente"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Stethoscope className="h-4 w-4" />
                        {doctorNameById.get(appointment.doctorId) ?? "Médico"}
                      </div>
                      <p className="text-sm text-muted-foreground">
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

      <Card>
        <CardHeader>
          <CardTitle>Próximas consultas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingAppointments.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Nenhuma consulta a partir de hoje.
            </p>
          ) : (
            upcomingAppointments.slice(0, 15).map((appointment) => {
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
                      {doctorNameById.get(appointment.doctorId) ?? "Médico"} ·{" "}
                      {appointment.title}
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

      {unitId && editingAppointment && (
        <SecretaryAppointmentDialog
          mode="edit"
          unitId={unitId}
          doctors={doctors}
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
