"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Pill, Plus } from "lucide-react"
import {
  prescriptionsApi,
  type Prescription,
} from "@/services/api/prescriptions"
import {
  getLinkedPersonDisplayName,
  patientDoctorApi,
  type PatientDoctorLink,
} from "@/services/api/patient-doctors/patientsByDoctor"
import { PrescriptionFormDialog } from "@/components/prescriptions/prescription-form-dialog"
import { useAuth } from "@/providers/auth-provider"
import { useDoctorActiveUnit } from "@/components/doctor/doctor-unit-provider"

export function DoctorPrescriptions() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const patientFromQuery = searchParams.get("patientId")
  const {
    doctorId,
    activeUnitId: unitId,
    activeUnit,
    isLoading: loadingDoctor,
  } = useDoctorActiveUnit()

  const [patients, setPatients] = useState<PatientDoctorLink[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Prescription | null>(null)

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
    if (!user?.id || loadingDoctor || !unitId) return

    try {
      setLoadingPatients(true)
      setError(null)
      const links = await patientDoctorApi.listPatientsByUserDoctor(
        user.id,
        unitId,
      )
      setPatients(links)

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
    } finally {
      setLoadingPatients(false)
    }
  }, [user?.id, patientFromQuery, unitId, loadingDoctor])

  const loadPrescriptions = useCallback(async (patientId: string) => {
    if (!patientId || !unitId) {
      setPrescriptions([])
      return
    }

    try {
      setLoadingPrescriptions(true)
      setError(null)
      const list = await prescriptionsApi.listByPatient(patientId, unitId)
      setPrescriptions(
        [...list].sort(
          (a, b) =>
            new Date(b.prescribedAt).getTime() -
            new Date(a.prescribedAt).getTime(),
        ),
      )
    } catch {
      setError("Não foi possível carregar as prescrições.")
      setPrescriptions([])
    } finally {
      setLoadingPrescriptions(false)
    }
  }, [unitId])

  useEffect(() => {
    void loadPatients()
  }, [loadPatients])

  useEffect(() => {
    if (selectedPatientId) {
      void loadPrescriptions(selectedPatientId)
    } else {
      setPrescriptions([])
    }
  }, [selectedPatientId, loadPrescriptions])

  const upsertPrescription = (prescription: Prescription) => {
    setPrescriptions((prev) =>
      [...prev.filter((item) => item.id !== prescription.id), prescription].sort(
        (a, b) =>
          new Date(b.prescribedAt).getTime() -
          new Date(a.prescribedAt).getTime(),
      ),
    )
  }

  if (loadingPatients || loadingDoctor) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando prescrições...
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

        {doctorId && unitId && selectedPatientId ? (
          <div className="flex flex-col items-stretch gap-1 sm:items-end">
            <PrescriptionFormDialog
              mode="create"
              doctorId={doctorId}
              unitId={unitId}
              patients={patients}
              initialPatientId={selectedPatientId}
              onSaved={upsertPrescription}
            >
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova prescrição
              </Button>
            </PrescriptionFormDialog>
            {activeUnit && (
              <p className="text-xs text-muted-foreground">
                Prescrevendo em {activeUnit.name}
              </p>
            )}
          </div>
        ) : (
          <Button disabled className="gap-2">
            <Plus className="h-4 w-4" />
            Nova prescrição
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
            associar uma unidade antes de criar receitas.
          </CardContent>
        </Card>
      )}

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">
            {selectedPatientId
              ? `Prescrições — ${patientNameById.get(selectedPatientId) ?? "Paciente"}`
              : "Prescrições"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingPrescriptions && (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando receitas...
            </div>
          )}

          {!loadingPrescriptions &&
            prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="space-y-3 rounded-lg border border-emerald-200 bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-emerald-900">
                      {prescription.medication}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(prescription.prescribedAt).toLocaleDateString(
                        "pt-BR",
                      )}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(prescription)}
                  >
                    Editar
                  </Button>
                </div>

                <div className="grid gap-2 text-sm sm:grid-cols-3">
                  <p>
                    <span className="font-medium">Dose:</span>{" "}
                    {prescription.dosage}
                  </p>
                  <p>
                    <span className="font-medium">Frequência:</span>{" "}
                    {prescription.frequency}
                  </p>
                  <p>
                    <span className="font-medium">Duração:</span>{" "}
                    {prescription.duration}
                  </p>
                </div>

                {prescription.instructions && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Instruções:
                    </span>{" "}
                    {prescription.instructions}
                  </p>
                )}
              </div>
            ))}

          {!loadingPrescriptions &&
            prescriptions.length === 0 &&
            selectedPatientId && (
              <div className="py-10 text-center">
                <Pill className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="text-muted-foreground">
                  Nenhuma receita ainda. Crie a primeira prescrição deste
                  paciente.
                </p>
              </div>
            )}
        </CardContent>
      </Card>

      {doctorId && unitId && editing && (
        <PrescriptionFormDialog
          mode="edit"
          doctorId={doctorId}
          unitId={unitId}
          patients={patients}
          prescription={editing}
          open={Boolean(editing)}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          onSaved={(prescription) => {
            upsertPrescription(prescription)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
