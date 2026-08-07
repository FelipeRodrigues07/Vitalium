"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, Loader2, User } from "lucide-react"
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

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

interface AppointmentCalendarProps {
  viewer?: "patient" | "doctor"
}

export function AppointmentCalendar({
  viewer = "patient",
}: AppointmentCalendarProps) {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [contactNames, setContactNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      if (viewer === "doctor") {
        const links = await patientDoctorApi.listPatientsByUserDoctor(user.id)
        const doctorId = links[0]?.doctorId
        if (!doctorId) {
          setAppointments([])
          setContactNames({})
          return
        }

        const names: Record<string, string> = {}
        for (const link of links) {
          names[link.patientId] = getLinkedPersonDisplayName(
            link.patient,
            "Paciente",
          )
        }
        setContactNames(names)

        const list = await appointmentsApi.listByDoctor(doctorId)
        setAppointments(list)
        return
      }

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
      setContactNames(names)

      const list = await appointmentsApi.listByPatient(patient.id)
      setAppointments(list)
    } catch {
      setError("Não foi possível carregar o calendário.")
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, viewer])

  useEffect(() => {
    void load()
  }, [load])

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const item of appointments) {
      if (item.status === "CANCELLED") continue
      const key = toDateKey(new Date(item.scheduledAt))
      const bucket = map.get(key) ?? []
      bucket.push(item)
      map.set(key, bucket)
    }
    return map
  }, [appointments])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  const selectedAppointments = selectedDate
    ? (appointmentsByDay.get(selectedDate) ?? []).sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )
    : []

  const contactFallback = viewer === "doctor" ? "Paciente" : "Médico"

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando calendário...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card className={viewer === "doctor" ? "border-emerald-200" : undefined}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={viewer === "doctor" ? "text-emerald-900" : undefined}>
            {months[month]} {year}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-20" />
              }

              const key = toDateKey(new Date(year, month, day))
              const dayAppointments = appointmentsByDay.get(key) ?? []
              const isSelected = selectedDate === key

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={`h-20 rounded-lg border p-2 text-left transition ${
                    isSelected
                      ? viewer === "doctor"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="text-sm font-medium">{day}</div>
                  {dayAppointments.length > 0 && (
                    <Badge className="mt-2" variant="secondary">
                      {dayAppointments.length}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className={viewer === "doctor" ? "border-emerald-200" : undefined}>
        <CardHeader>
          <CardTitle className={viewer === "doctor" ? "text-emerald-900" : undefined}>
            {selectedDate
              ? `Consultas em ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR")}`
              : "Selecione um dia"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!selectedDate && (
            <p className="text-sm text-muted-foreground">
              Clique em um dia do calendário para ver as consultas.
            </p>
          )}

          {selectedDate && selectedAppointments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma consulta neste dia.
            </p>
          )}

          {selectedAppointments.map((appointment) => {
            const scheduled = new Date(appointment.scheduledAt)
            const contactId =
              viewer === "doctor"
                ? appointment.patientId
                : appointment.doctorId

            return (
              <div
                key={appointment.id}
                className="space-y-2 rounded-lg border p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {contactNames[contactId] ?? contactFallback}
                  </span>
                  <Badge variant="outline">
                    {APPOINTMENT_TYPE_LABELS[appointment.type]}
                  </Badge>
                  <Badge variant="secondary">
                    {APPOINTMENT_STATUS_LABELS[appointment.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {appointment.title}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {scheduled.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  ({appointment.duration} min)
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
