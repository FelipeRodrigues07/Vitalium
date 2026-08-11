"use client"

import { Suspense } from "react"
import { AppLayout } from "@/components/app-layout"
import { DoctorPrescriptions } from "@/components/prescriptions/doctor-prescriptions"

export default function DoctorPrescriptionsPage() {
  return (
    <AppLayout userRole="doctor">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Prescrições</h1>
            <p className="mt-1 text-emerald-700">
              Crie e gerencie as receitas dos seus pacientes
            </p>
          </div>

          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Carregando...</p>
            }
          >
            <DoctorPrescriptions />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  )
}
