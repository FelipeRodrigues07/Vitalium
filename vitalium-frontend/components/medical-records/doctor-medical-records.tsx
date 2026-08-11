"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Loader2, Plus } from "lucide-react"
import {
  RECORD_TYPE_LABELS,
  medicalRecordsApi,
  type MedicalRecord,
} from "@/services/api/medical-records"
import {
  getLinkedPersonDisplayName,
  patientDoctorApi,
  type PatientDoctorLink,
} from "@/services/api/patient-doctors/patientsByDoctor"
import { MedicalRecordFormDialog } from "@/components/medical-records/medical-record-form-dialog"
import { useAuth } from "@/providers/auth-provider"

export function DoctorMedicalRecords() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const patientFromQuery = searchParams.get("patientId")

  const [patients, setPatients] = useState<PatientDoctorLink[]>([])
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)

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

  const loadPatients = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoadingPatients(true)
      setError(null)
      const links = await patientDoctorApi.listPatientsByUserDoctor(user.id)
      setPatients(links)
      setDoctorId(links[0]?.doctorId ?? null)

      const preferred =
        (patientFromQuery &&
          links.some((link) => link.patientId === patientFromQuery) &&
          patientFromQuery) ||
        links[0]?.patientId ||
        ""
      setSelectedPatientId(preferred)
    } catch {
      setError("Não foi possível carregar seus pacientes.")
      setPatients([])
      setDoctorId(null)
    } finally {
      setLoadingPatients(false)
    }
  }, [user?.id, patientFromQuery])

  const loadRecords = useCallback(async (patientId: string) => {
    if (!patientId) {
      setRecords([])
      return
    }

    try {
      setLoadingRecords(true)
      setError(null)
      const list = await medicalRecordsApi.listByPatient(patientId)
      setRecords(
        [...list].sort(
          (a, b) =>
            new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime(),
        ),
      )
    } catch {
      setError("Não foi possível carregar o prontuário.")
      setRecords([])
    } finally {
      setLoadingRecords(false)
    }
  }, [])

  useEffect(() => {
    void loadPatients()
  }, [loadPatients])

  useEffect(() => {
    if (selectedPatientId) {
      void loadRecords(selectedPatientId)
    }
  }, [selectedPatientId, loadRecords])

  const upsertRecord = (record: MedicalRecord) => {
    setRecords((prev) =>
      [...prev.filter((item) => item.id !== record.id), record].sort(
        (a, b) =>
          new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime(),
      ),
    )
  }

  if (loadingPatients) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando prontuário...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 sm:w-80">
          <p className="text-sm font-medium text-emerald-800">Paciente</p>
          <Select
            value={selectedPatientId}
            onValueChange={setSelectedPatientId}
            disabled={patients.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um paciente" />
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

        {doctorId && selectedPatientId ? (
          <MedicalRecordFormDialog
            mode="create"
            doctorId={doctorId}
            patients={patients}
            initialPatientId={selectedPatientId}
            onSaved={upsertRecord}
          >
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo registro
            </Button>
          </MedicalRecordFormDialog>
        ) : (
          <Button disabled className="gap-2">
            <Plus className="h-4 w-4" />
            Novo registro
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!doctorId && (
        <Card className="border-emerald-200">
          <CardContent className="py-10 text-center text-muted-foreground">
            Vincule pacientes a você para começar a usar o prontuário.
          </CardContent>
        </Card>
      )}

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">
            {selectedPatientId
              ? `Prontuário — ${patientNameById.get(selectedPatientId) ?? "Paciente"}`
              : "Prontuário"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingRecords && (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando registros...
            </div>
          )}

          {!loadingRecords &&
            records.map((record) => (
              <div
                key={record.id}
                className="space-y-3 rounded-lg border border-emerald-200 bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-emerald-900">
                        {record.title}
                      </h3>
                      <Badge variant="outline">
                        {RECORD_TYPE_LABELS[record.recordType] ??
                          record.recordType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.recordDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingRecord(record)}
                  >
                    Editar
                  </Button>
                </div>

                <p className="text-sm text-emerald-900">{record.description}</p>

                {record.diagnosis && (
                  <p className="text-sm">
                    <span className="font-medium">Diagnóstico:</span>{" "}
                    {record.diagnosis}
                  </p>
                )}

                {record.symptoms?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {record.symptoms.map((symptom) => (
                      <Badge key={symptom} variant="secondary">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                )}

                {record.treatment && (
                  <p className="text-sm">
                    <span className="font-medium">Tratamento:</span>{" "}
                    {record.treatment}
                  </p>
                )}

                {record.observations && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Observações:
                    </span>{" "}
                    {record.observations}
                  </p>
                )}
              </div>
            ))}

          {!loadingRecords && records.length === 0 && selectedPatientId && (
            <div className="py-10 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">
                Nenhum registro ainda. Crie o primeiro prontuário deste paciente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {doctorId && editingRecord && (
        <MedicalRecordFormDialog
          mode="edit"
          doctorId={doctorId}
          patients={patients}
          record={editingRecord}
          open={Boolean(editingRecord)}
          onOpenChange={(open) => {
            if (!open) setEditingRecord(null)
          }}
          onSaved={(record) => {
            upsertRecord(record)
            setEditingRecord(null)
          }}
        />
      )}
    </div>
  )
}
