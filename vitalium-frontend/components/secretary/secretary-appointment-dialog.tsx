"use client"

import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  APPOINTMENT_TYPE_LABELS,
  appointmentsApi,
  type Appointment,
  type AppointmentType,
} from "@/services/api/appointments"
import type { DoctorListItemModel } from "@/services/api/doctors/GetDoctors"
import type { PatientListItemModel } from "@/services/api/patients/GetPatients"
import { findDoctorScheduleConflict } from "@/lib/appointment-conflict"

const FORM_TYPES: AppointmentType[] = [
  "CONSULTATION",
  "FOLLOW_UP",
  "ROUTINE_CHECKUP",
  "EXAMINATION",
  "OTHER",
]

function toLocalDateInput(value: string) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toLocalTimeInput(value: string) {
  const date = new Date(value)
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

function personName(
  firstName?: string,
  lastName?: string,
  fallback = "Usuário",
) {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim()
  return name || fallback
}

interface SecretaryAppointmentDialogProps {
  mode: "create" | "edit"
  unitId: string
  doctors: DoctorListItemModel[]
  patients: PatientListItemModel[]
  existingAppointments: Appointment[]
  appointment?: Appointment
  onSaved: (appointment: Appointment) => void
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SecretaryAppointmentDialog({
  mode,
  unitId,
  doctors,
  patients,
  existingAppointments,
  appointment,
  onSaved,
  children,
  open: controlledOpen,
  onOpenChange,
}: SecretaryAppointmentDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  const [doctorId, setDoctorId] = useState("")
  const [patientId, setPatientId] = useState("")
  const [title, setTitle] = useState("Consulta")
  const [type, setType] = useState<AppointmentType>("CONSULTATION")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("09:00")
  const [duration, setDuration] = useState("30")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    if (mode === "edit" && appointment) {
      setDoctorId(appointment.doctorId)
      setPatientId(appointment.patientId)
      setTitle(appointment.title)
      setType(appointment.type)
      setDate(toLocalDateInput(appointment.scheduledAt))
      setTime(toLocalTimeInput(appointment.scheduledAt))
      setDuration(String(appointment.duration || 30))
      setNotes(appointment.notes ?? "")
    } else {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setDate(toLocalDateInput(tomorrow.toISOString()))
      setTime("09:00")
      setTitle("Consulta")
      setType("CONSULTATION")
      setDuration("30")
      setNotes("")
      setDoctorId(doctors[0]?.id ?? "")
      setPatientId(patients[0]?.id ?? "")
    }
    setError(null)
  }, [open, mode, appointment, doctors, patients])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!doctorId || !patientId || !date || !time || !unitId) {
      setError("Preencha médico, paciente, data, horário e unidade.")
      return
    }

    const durationMinutes = Number(duration) || 30
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString()

    const conflict = findDoctorScheduleConflict({
      doctorId,
      scheduledAt,
      durationMinutes,
      appointments: existingAppointments,
      ignoreAppointmentId: mode === "edit" ? appointment?.id : undefined,
    })

    if (conflict) {
      const when = new Date(conflict.scheduledAt).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
      setError(`Conflito de horário com outra consulta (${when}).`)
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      if (mode === "edit" && appointment) {
        const updated = await appointmentsApi.update(
          appointment.id,
          {
            title: title.trim() || "Consulta",
            type,
            scheduledAt,
            duration: durationMinutes,
            notes: notes.trim() || undefined,
            status: "CONFIRMED",
          },
          unitId,
        )
        onSaved(updated)
      } else {
        const created = await appointmentsApi.create({
          patientId,
          doctorId,
          unitId,
          title: title.trim() || "Consulta",
          type,
          scheduledAt,
          duration: durationMinutes,
          status: "CONFIRMED",
          notes: notes.trim() || undefined,
        })
        onSaved(created)
      }

      setOpen(false)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message
        setError(
          Array.isArray(message)
            ? message.join(", ")
            : (message ?? "Não foi possível salvar a consulta."),
        )
      } else {
        setError("Não foi possível salvar a consulta. Tente novamente.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Remarcar consulta" : "Nova consulta"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Altere data, horário ou detalhes da consulta."
              : "Agende uma consulta para um médico da unidade."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="doctor">Médico</Label>
            <Select
              value={doctorId}
              onValueChange={setDoctorId}
              disabled={mode === "edit"}
            >
              <SelectTrigger id="doctor">
                <SelectValue placeholder="Selecione o médico" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {personName(
                      doctor.user?.firstName,
                      doctor.user?.lastName,
                      "Médico",
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient">Paciente</Label>
            <Select
              value={patientId}
              onValueChange={setPatientId}
              disabled={mode === "edit"}
            >
              <SelectTrigger id="patient">
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {personName(
                      patient.user?.firstName,
                      patient.user?.lastName,
                      "Paciente",
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as AppointmentType)}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORM_TYPES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {APPOINTMENT_TYPE_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Input
              id="duration"
              type="number"
              min={5}
              step={5}
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Opcional"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting || doctors.length === 0 || patients.length === 0}
            >
              {submitting
                ? "Salvando..."
                : mode === "edit"
                  ? "Salvar remarcação"
                  : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
