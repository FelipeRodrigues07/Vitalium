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
  prescriptionsApi,
  type Prescription,
} from "@/services/api/prescriptions"
import {
  getLinkedPersonDisplayName,
  type PatientDoctorLink,
} from "@/services/api/patient-doctors/patientsByDoctor"

function toLocalDateInput(value?: string) {
  const date = value ? new Date(value) : new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

interface PrescriptionFormDialogProps {
  mode: "create" | "edit"
  doctorId: string
  unitId: string
  patients: PatientDoctorLink[]
  initialPatientId?: string
  prescription?: Prescription
  onSaved: (prescription: Prescription) => void
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PrescriptionFormDialog({
  mode,
  doctorId,
  unitId,
  patients,
  initialPatientId,
  prescription,
  onSaved,
  children,
  open: controlledOpen,
  onOpenChange,
}: PrescriptionFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  const [patientId, setPatientId] = useState("")
  const [medication, setMedication] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState("")
  const [duration, setDuration] = useState("")
  const [instructions, setInstructions] = useState("")
  const [prescribedAt, setPrescribedAt] = useState(toLocalDateInput())
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    if (mode === "edit" && prescription) {
      setPatientId(prescription.patientId)
      setMedication(prescription.medication)
      setDosage(prescription.dosage)
      setFrequency(prescription.frequency)
      setDuration(prescription.duration)
      setInstructions(prescription.instructions ?? "")
      setPrescribedAt(toLocalDateInput(prescription.prescribedAt))
    } else {
      setPatientId(initialPatientId || patients[0]?.patientId || "")
      setMedication("")
      setDosage("")
      setFrequency("")
      setDuration("")
      setInstructions("")
      setPrescribedAt(toLocalDateInput())
    }
    setError(null)
  }, [open, mode, prescription, patients, initialPatientId])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (
      !patientId ||
      !unitId ||
      !medication.trim() ||
      !dosage.trim() ||
      !frequency.trim() ||
      !duration.trim()
    ) {
      setError("Preencha paciente, medicamento, dose, frequência e duração.")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      if (mode === "edit" && prescription) {
        const updated = await prescriptionsApi.update(prescription.id, {
          medication: medication.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          duration: duration.trim(),
          instructions: instructions.trim() || undefined,
          prescribedAt,
        })
        onSaved(updated)
      } else {
        const created = await prescriptionsApi.create({
          patientId,
          doctorId,
          unitId,
          medication: medication.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          duration: duration.trim(),
          instructions: instructions.trim() || undefined,
          prescribedAt,
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
            : (message ?? "Não foi possível salvar a prescrição."),
        )
      } else {
        setError("Não foi possível salvar a prescrição. Tente novamente.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar prescrição" : "Nova prescrição"}
          </DialogTitle>
          <DialogDescription>
            Informe o medicamento e as orientações de uso.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
                {patients.map((link) => (
                  <SelectItem key={link.id} value={link.patientId}>
                    {getLinkedPersonDisplayName(link.patient, "Paciente")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medication">Medicamento</Label>
            <Input
              id="medication"
              value={medication}
              onChange={(event) => setMedication(event.target.value)}
              placeholder="Ex.: Amoxicilina"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dose</Label>
              <Input
                id="dosage"
                value={dosage}
                onChange={(event) => setDosage(event.target.value)}
                placeholder="Ex.: 500mg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Input
                id="frequency"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
                placeholder="Ex.: A cada 8 horas"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="Ex.: 7 dias"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescribedAt">Data</Label>
              <Input
                id="prescribedAt"
                type="date"
                value={prescribedAt}
                onChange={(event) => setPrescribedAt(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instruções</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Ex.: Tomar com água, após as refeições"
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
              disabled={submitting || patients.length === 0 || !unitId}
            >
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
