"use client"

import { useCallback, useEffect, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SecretaryPatientForm } from "@/components/secretary/secretary-patient-form"
import { useSecretaryActiveUnit } from "@/components/secretary/secretary-unit-provider"
import { GetDoctorsService, type DoctorListItemModel } from "@/services/api/doctors/GetDoctors"
import { GetPatientsService, type PatientListItemModel } from "@/services/api/patients/GetPatients"

export default function SecretaryPatientsPage() {
  return (
    <AppLayout userRole="secretary">
      <SecretaryPatientsContent />
    </AppLayout>
  )
}

function SecretaryPatientsContent() {
  const { activeUnitId, isLoading } = useSecretaryActiveUnit()
  const [doctors, setDoctors] = useState<DoctorListItemModel[]>([])
  const [patients, setPatients] = useState<PatientListItemModel[]>([])

  const load = useCallback(async () => {
    if (!activeUnitId) {
      setDoctors([])
      setPatients([])
      return
    }

    try {
      const [unitDoctors, unitPatients] = await Promise.all([
        GetDoctorsService.getDoctors(activeUnitId),
        GetPatientsService.getMyPatients(activeUnitId),
      ])
      setDoctors(unitDoctors)
      setPatients(unitPatients)
    } catch (error) {
      console.error("Falha ao carregar pacientes da unidade:", error)
    }
  }, [activeUnitId])

  useEffect(() => {
    if (!isLoading) {
      void load()
    }
  }, [isLoading, load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pacientes</h1>
        <p className="mt-1 text-muted-foreground">
          Cadastre pacientes na unidade e, se quiser, vincule um médico.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <SecretaryPatientForm doctors={doctors} onCreated={() => void load()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pacientes da unidade ({patients.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {patients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum paciente vinculado a esta unidade.
            </p>
          ) : (
            patients.map((patient) => {
              const name =
                `${patient.user?.firstName ?? ""} ${patient.user?.lastName ?? ""}`.trim() ||
                "Paciente"
              return (
                <div
                  key={patient.id}
                  className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.user?.email}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    CPF {patient.cpf}
                  </p>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
