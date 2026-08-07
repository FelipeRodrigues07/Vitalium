"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

export function AppointmentList() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctorNames, setDoctorNames] = useState<Record<string, string>>({})
  const [query, setQuery] = useState("")
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
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
        ),
      )
    } catch {
      setError("Não foi possível carregar as consultas.")
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return appointments
    return appointments.filter((item) => {
      const doctor = doctorNames[item.doctorId]?.toLowerCase() ?? ""
      return (
        item.title.toLowerCase().includes(normalized) ||
        doctor.includes(normalized) ||
        APPOINTMENT_TYPE_LABELS[item.type].toLowerCase().includes(normalized)
      )
    })
  }, [appointments, doctorNames, query])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando lista de consultas...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por médico, título ou tipo..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {filtered.map((appointment) => {
          const scheduled = new Date(appointment.scheduledAt)
          return (
            <Card key={appointment.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {doctorNames[appointment.doctorId] ?? "Médico"}
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
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {scheduled.toLocaleDateString("pt-BR")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {scheduled.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ({appointment.duration} min)
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
            <h3 className="mb-2 text-lg font-semibold">
              Nenhuma consulta encontrada
            </h3>
            <p className="text-muted-foreground">
              Quando o médico agendar uma consulta, ela aparecerá aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
