import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock } from "lucide-react"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { AppointmentList } from "@/components/appointments/appointment-list"
import { AppLayout } from "@/components/app-layout"

export default function AppointmentsPage() {
  return (
    <AppLayout userRole="patient">
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
          <p className="mt-1 text-muted-foreground">
            Visualize suas consultas agendadas pelo médico
          </p>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <Clock className="h-4 w-4" />
              Lista de Consultas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <Suspense fallback={<div>Carregando calendário...</div>}>
              <AppointmentCalendar />
            </Suspense>
          </TabsContent>

          <TabsContent value="list">
            <Suspense fallback={<div>Carregando lista de consultas...</div>}>
              <AppointmentList />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
