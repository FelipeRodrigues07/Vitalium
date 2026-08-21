"use client"

import Link from "next/link"
import { Calendar, UserPlus } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/providers/auth-provider"
import { SecretarySchedule } from "@/components/secretary/secretary-schedule"

export default function SecretaryDashboardPage() {
  return (
    <AppLayout userRole="secretary">
      <SecretaryDashboardContent />
    </AppLayout>
  )
}

function SecretaryDashboardContent() {
  const { user } = useAuth()
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Secretaria"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold">Olá, {displayName}</h1>
            <Badge variant="secondary">Secretaria</Badge>
          </div>
          <p className="text-muted-foreground">
            Cadastre pacientes e gerencie a agenda dos médicos da unidade.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/work/secretary/patients" className="inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Cadastrar paciente
            </Link>
          </Button>
          <Button asChild>
            <Link href="/work/secretary/appointments" className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agenda completa
            </Link>
          </Button>
        </div>
      </div>

      <SecretarySchedule />
    </div>
  )
}
