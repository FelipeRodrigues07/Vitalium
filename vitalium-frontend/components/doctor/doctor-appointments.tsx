"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DoctorSchedule } from "@/components/appointments/doctor-schedule"

export function DoctorAppointments() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/work/doctor/appointments">Abrir agenda completa</Link>
        </Button>
      </div>
      <DoctorSchedule />
    </div>
  )
}
