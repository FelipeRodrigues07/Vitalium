"use client"

import { Suspense } from "react"
import { AppLayout } from "@/components/app-layout"
import { DoctorMedicalRecords } from "@/components/medical-records/doctor-medical-records"

export default function DoctorMedicalRecordsPage() {
  return (
    <AppLayout userRole="doctor">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Prontuário</h1>
            <p className="mt-1 text-emerald-700">
              Registre e acompanhe a evolução clínica dos seus pacientes
            </p>
          </div>

          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Carregando...</p>
            }
          >
            <DoctorMedicalRecords />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  )
}
