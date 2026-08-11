"use client"

import { AppLayout } from "@/components/app-layout"
import { PatientSymptomLogs } from "@/components/symptoms/patient-symptom-logs"

export default function PatientSymptomsPage() {
  return (
    <AppLayout userRole="patient">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Meus sintomas</h1>
            <p className="mt-1 text-emerald-700">
              Relate como você está se sentindo para o acompanhamento do médico
            </p>
          </div>

          <PatientSymptomLogs />
        </div>
      </div>
    </AppLayout>
  )
}
