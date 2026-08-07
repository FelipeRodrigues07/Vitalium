"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MessageCircle, Users, AlertTriangle } from "lucide-react"
import { PatientsList } from "@/components/doctor/patients-list"
import { PatientMonitoring } from "@/components/doctor/patient-monitoring"
import { AlertsPanel } from "@/components/doctor/alerts-panel"
import { DoctorAppointments } from "@/components/doctor/doctor-appointments"
import { AppLayout } from "@/components/app-layout"
import { useSession } from "@/services/auth/use-session"
import { GetPatientsService } from "@/services/api/patients/GetPatients"
import { appointmentsApi } from "@/services/api/appointments"
import { patientDoctorApi } from "@/services/api/patient-doctors/patientsByDoctor"

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const { isReady, accessToken, user } = useSession()
  const [linkedPatientsCount, setLinkedPatientsCount] = useState(0)
  const [appointmentsToday, setAppointmentsToday] = useState(0)

  const doctorName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Médico"

  const loadDashboardCounts = useCallback(async () => {
    if (!accessToken || user?.role !== "DOCTOR" || !user.id) {
      return
    }

    try {
      const patients = await GetPatientsService.getMyPatients()
      setLinkedPatientsCount(patients.length)
    } catch (error) {
      console.error("Falha ao contar pacientes do médico:", error)
      setLinkedPatientsCount(0)
    }

    try {
      const links = await patientDoctorApi.listPatientsByUserDoctor(user.id)
      const doctorId = links[0]?.doctorId
      if (!doctorId) {
        setAppointmentsToday(0)
        return
      }

      const appointments = await appointmentsApi.listByDoctor(doctorId)
      const today = new Date()
      const count = appointments.filter((item) => {
        if (item.status === "CANCELLED") return false
        const scheduled = new Date(item.scheduledAt)
        return (
          scheduled.getFullYear() === today.getFullYear() &&
          scheduled.getMonth() === today.getMonth() &&
          scheduled.getDate() === today.getDate()
        )
      }).length
      setAppointmentsToday(count)
    } catch (error) {
      console.error("Falha ao contar consultas do médico:", error)
      setAppointmentsToday(0)
    }
  }, [accessToken, user?.id, user?.role])

  useEffect(() => {
    if (!isReady) {
      return
    }
    void loadDashboardCounts()
  }, [isReady, loadDashboardCounts])

  const todayStats = {
    appointmentsToday,
    newMessages: 0,
    criticalAlerts: 0,
  }

  return (
    <AppLayout userRole="doctor">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-3xl font-bold text-foreground">
              Bom dia, {doctorName}!
            </h1>
            <Badge variant="default">Médico</Badge>
          </div>
          <p className="text-muted-foreground">
            Você tem {linkedPatientsCount} paciente(s) vinculado(s) na plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Pacientes vinculados</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {linkedPatientsCount}
              </div>
              <p className="text-xs text-muted-foreground">responsável ativo</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Consultas Hoje</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {todayStats.appointmentsToday}
              </div>
              <p className="text-xs text-muted-foreground">agendadas para hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Mensagens</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {todayStats.newMessages}
              </div>
              <p className="text-xs text-muted-foreground">em breve na API</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">Alertas Críticos</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {todayStats.criticalAlerts}
              </div>
              <p className="text-xs text-muted-foreground">em breve na API</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="appointments">Consultas</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            <PatientsList searchQuery="" onSelectPatient={setSelectedPatient} />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <PatientMonitoring selectedPatient={selectedPatient} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsPanel />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <DoctorAppointments />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
