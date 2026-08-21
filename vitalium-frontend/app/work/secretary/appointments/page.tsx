"use client"

import { AppLayout } from "@/components/app-layout"
import { SecretarySchedule } from "@/components/secretary/secretary-schedule"

export default function SecretaryAppointmentsPage() {
  return (
    <AppLayout userRole="secretary">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Agenda da unidade</h1>
          <p className="mt-1 text-muted-foreground">
            Marque, confirme, remarque ou cancele consultas dos médicos.
          </p>
        </div>
        <SecretarySchedule />
      </div>
    </AppLayout>
  )
}
