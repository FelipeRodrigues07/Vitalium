"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Calendar, MessageCircle } from "lucide-react"
import { AppointmentsList } from "@/components/patient/appointments-list"
import { AppLayout } from "@/components/app-layout"
import { useAuth } from "@/providers/auth-provider"

export default function PatientDashboard() {
  const { user } = useAuth()
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Paciente"

  return (
    <AppLayout userRole="patient">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <div className="mb-4 flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-foreground">Olá, {displayName}!</h1>
            <Badge variant="secondary">Paciente</Badge>
          </div>
          <p className="text-muted-foreground">Acompanhe suas próximas consultas agendadas pelo médico.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/work/patient/appointments" className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ver calendário
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/work/chat" className="inline-flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Falar com médico
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/work/patient/symptoms" className="inline-flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Relatar sintomas
            </Link>
          </Button>
        </div>

        <AppointmentsList />
      </div>
    </AppLayout>
  )
}
