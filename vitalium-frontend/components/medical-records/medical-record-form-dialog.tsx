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
  RECORD_TYPE_LABELS,
  medicalRecordsApi,
  type MedicalRecord,
  type RecordType,
} from "@/services/api/medical-records"
import {
  getLinkedPersonDisplayName,
  type PatientDoctorLink,
} from "@/services/api/patient-doctors/patientsByDoctor"

const FORM_TYPES: RecordType[] = [
  "CONSULTATION",
  "FOLLOW_UP",
  "ROUTINE_CHECKUP",
  "EXAMINATION",
  "DIAGNOSTIC",
  "OTHER",
]

function toLocalDateInput(value?: string) {
  const date = value ? new Date(value) : new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

interface MedicalRecordFormDialogProps {
  mode: "create" | "edit"
  doctorId: string
  unitId?: string
  patients: PatientDoctorLink[]
  initialPatientId?: string
  record?: MedicalRecord
  onSaved: (record: MedicalRecord) => void
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MedicalRecordFormDialog({
  mode,
  doctorId,
  unitId,
  patients,
  initialPatientId,
  record,
  onSaved,
  children,
  open: controlledOpen,
  onOpenChange,
}: MedicalRecordFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  const [patientId, setPatientId] = useState("")
  const [title, setTitle] = useState("Consulta de rotina")
  const [description, setDescription] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [symptomsText, setSymptomsText] = useState("")
  const [treatment, setTreatment] = useState("")
  const [observations, setObservations] = useState("")
  const [recordType, setRecordType] = useState<RecordType>("CONSULTATION")
  const [recordDate, setRecordDate] = useState(toLocalDateInput())
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    if (mode === "edit" && record) {
      setPatientId(record.patientId)
      setTitle(record.title)
      setDescription(record.description)
      setDiagnosis(record.diagnosis ?? "")
      setSymptomsText((record.symptoms ?? []).join(", "))
      setTreatment(record.treatment ?? "")
      setObservations(record.observations ?? "")
      setRecordType(record.recordType)
      setRecordDate(toLocalDateInput(record.recordDate))
    } else {
      setPatientId(initialPatientId || patients[0]?.patientId || "")
      setTitle("Consulta de rotina")
      setDescription("")
      setDiagnosis("")
      setSymptomsText("")
      setTreatment("")
      setObservations("")
      setRecordType("CONSULTATION")
      setRecordDate(toLocalDateInput())
    }
    setError(null)
  }, [open, mode, record, patients, initialPatientId])

  const parseSymptoms = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!patientId || !title.trim() || !description.trim()) {
      setError("Preencha paciente, título e descrição.")
      return
    }

    if (mode === "create" && !unitId) {
      setError("Selecione uma unidade no header para criar o registro.")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const symptoms = parseSymptoms(symptomsText)

      if (mode === "edit" && record) {
        const updated = await medicalRecordsApi.update(record.id, {
          title: title.trim(),
          description: description.trim(),
          diagnosis: diagnosis.trim() || undefined,
          symptoms,
          treatment: treatment.trim() || undefined,
          observations: observations.trim() || undefined,
          recordType,
          recordDate,
        }, unitId)
        onSaved(updated)
      } else {
        const created = await medicalRecordsApi.create({
          patientId,
          doctorId,
          unitId: unitId as string,
          title: title.trim(),
          description: description.trim(),
          diagnosis: diagnosis.trim() || undefined,
          symptoms,
          treatment: treatment.trim() || undefined,
          observations: observations.trim() || undefined,
          recordType,
          recordDate,
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
            : (message ?? "Não foi possível salvar o prontuário."),
        )
      } else {
        setError("Não foi possível salvar o prontuário. Tente novamente.")
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
            {mode === "edit" ? "Editar registro" : "Novo registro de prontuário"}
          </DialogTitle>
          <DialogDescription>
            Registre a evolução clínica do paciente.
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
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordType">Tipo</Label>
            <Select
              value={recordType}
              onValueChange={(value) => setRecordType(value as RecordType)}
            >
              <SelectTrigger id="recordType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORM_TYPES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {RECORD_TYPE_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordDate">Data do registro</Label>
            <Input
              id="recordDate"
              type="date"
              value={recordDate}
              onChange={(event) => setRecordDate(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              placeholder="O que foi observado no atendimento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnóstico</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Sintomas</Label>
            <Input
              id="symptoms"
              value={symptomsText}
              onChange={(event) => setSymptomsText(event.target.value)}
              placeholder="Separe por vírgula, ex.: febre, tosse"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Tratamento</Label>
            <Textarea
              id="treatment"
              value={treatment}
              onChange={(event) => setTreatment(event.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(event) => setObservations(event.target.value)}
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
            <Button type="submit" disabled={submitting || patients.length === 0}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
