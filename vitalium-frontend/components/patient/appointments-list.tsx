"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Loader2, User } from "lucide-react"
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  appointmentsApi,
  type Appointment,
} from "@/services/api/appointments"
import { GetPatientByUserService } from "@/services/api/patients/GetPatientByUser"
import {
  getLinkedPersonDisplayName,
  patientDoctorApi,
} from "@/services/api/patient-doctors/patientsByDoctor"
import { useAuth } from "@/providers/auth-provider"
import { isOnOrAfterToday } from "@/lib/appointment-date"

function statusVariant(status: Appointment["status"]) {
  switch (status) {
    case "CONFIRMED":
    case "SCHEDULED":
      return "default" as const
    case "CANCELLED":
    case "NO_SHOW":
      return "destructive" as const
    default:
      return "secondary" as const
  }
}

function AppointmentCard({
  appointment,
  doctorName,
}: {
  appointment: Appointment
  doctorName: string
}) {
  const scheduled = new Date(appointment.scheduledAt)

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{doctorName}</h3>
            <p className="text-sm text-muted-foreground">{appointment.title}</p>
          </div>
        </div>
        <Badge variant={statusVariant(appointment.status)}>
          {APPOINTMENT_STATUS_LABELS[appointment.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {scheduled.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {scheduled.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            ({appointment.duration} min)
          </span>
        </div>
        <div className="text-muted-foreground">
          {APPOINTMENT_TYPE_LABELS[appointment.type]}
        </div>
      </div>
    </div>
  )
}

export function AppointmentsList() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctorNames, setDoctorNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const [patient, doctorLinks] = await Promise.all([
        GetPatientByUserService.getByUserId(user.id),
        patientDoctorApi.listDoctorsByUserPatient(user.id),
      ])

      const names: Record<string, string> = {}
      for (const link of doctorLinks) {
        names[link.doctorId] = getLinkedPersonDisplayName(
          link.doctor,
          "Médico",
        )
      }
      setDoctorNames(names)

      const list = await appointmentsApi.listByPatient(patient.id)
      setAppointments(
        [...list].sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
        ),
      )
    } catch {
      setError("Não foi possível carregar suas consultas.")
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void load()
  }, [load])

  const { upcoming, history } = useMemo(() => {
    const upcomingItems = appointments
      .filter(
        (item) =>
          isOnOrAfterToday(item.scheduledAt) &&
          item.status !== "CANCELLED" &&
          item.status !== "COMPLETED" &&
          item.status !== "NO_SHOW",
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )

    const historyItems = appointments
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

    return { upcoming: upcomingItems, history: historyItems }
  }, [appointments])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Próximas Consultas</span>
              </CardTitle>
              <CardDescription>
                Consultas a partir de hoje (agendadas/confirmadas)
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/work/patient/appointments">Ver calendário</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando consultas...
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading &&
            upcoming.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                doctorName={doctorNames[appointment.doctorId] ?? "Médico"}
              />
            ))}

          {!loading && upcoming.length === 0 && !error && (
            <div className="py-8 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma consulta futura. Quando o médico marcar, ela aparece
                aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Histórico</span>
          </CardTitle>
          <CardDescription>
            Consultas concluídas, canceladas e anteriores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando histórico...
            </div>
          )}

          {!loading &&
            history.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                doctorName={doctorNames[appointment.doctorId] ?? "Médico"}
              />
            ))}

          {!loading && history.length === 0 && !error && (
            <p className="py-6 text-center text-muted-foreground">
              Nenhum histórico de consultas ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
