"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/services/auth/use-session"

function getRoleHomePath(role?: string | null) {
  switch (role?.trim().toLowerCase()) {
    case "admin":
      return "/work/admin/dashboard"
    case "doctor":
      return "/work/doctor/dashboard"
    case "patient":
      return "/work/patient/dashboard"
    case "secretary":
      return "/work/secretary/dashboard"
    default:
      return "/login"
  }
}

export default function WorkPage() {
  const router = useRouter()
  const { isReady, user } = useSession()

  useEffect(() => {
    if (!isReady) {
      return
    }

    router.replace(getRoleHomePath(user?.role))
  }, [isReady, router, user?.role])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
      Redirecionando...
    </div>
  )
}
