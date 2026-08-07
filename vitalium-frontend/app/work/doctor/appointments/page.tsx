"use client"

import { Calendar, List } from "lucide-react"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { DoctorSchedule } from "@/components/appointments/doctor-schedule"
import { AppLayout } from "@/components/app-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DoctorAppointmentsPage() {
  return (
    <AppLayout userRole="doctor">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Minha Agenda</h1>
            <p className="mt-1 text-emerald-700">
              Gerencie as consultas dos seus pacientes
            </p>
          </div>

          <Tabs defaultValue="schedule" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule" className="gap-2">
                <List className="h-4 w-4" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendário
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule">
              <DoctorSchedule />
            </TabsContent>

            <TabsContent value="calendar">
              <AppointmentCalendar viewer="doctor" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}
