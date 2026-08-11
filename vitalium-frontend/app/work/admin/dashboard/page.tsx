"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, Loader2, Stethoscope, UserRound, Users } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { isUnitScopedAdmin } from "@/lib/admin-auth"
import { useAuth } from "@/providers/auth-provider"
import {
  GetAdminDashboardService,
  type AdminDashboardData,
} from "@/services/api/admin/GetAdminDashboard"

export default function AdminDashboardPage() {
  const { user, activeUnitId } = useAuth()
  const unitScoped = isUnitScopedAdmin(user)

  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (unitScoped && !activeUnitId) {
        setLoading(false)
        setError("Selecione uma unidade para ver as contagens.")
        setData(null)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const dashboard = await GetAdminDashboardService.getDashboard(
          unitScoped ? activeUnitId ?? undefined : undefined,
        )
        if (!cancelled) setData(dashboard)
      } catch {
        if (!cancelled) {
          setError("Não foi possível carregar as contagens.")
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [unitScoped, activeUnitId])

  const stats = data?.systemStats

  return (
    <AppLayout userRole="admin">
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              {unitScoped
                ? "Contagens da unidade selecionada no topo"
                : "Visão geral da plataforma"}
            </p>
          </div>
          <Button asChild>
            <Link href="/work/admin/users">Gerenciar usuários</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando contagens...
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div
            className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${
              unitScoped ? "lg:grid-cols-3" : "lg:grid-cols-4"
            }`}
          >
            {!unitScoped && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unidades</CardTitle>
                  <Building2 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalUnits ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hospitais e clínicas ativos
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeUsers ?? 0} ativos
                  {stats?.newUsersToday
                    ? ` · ${stats.newUsersToday} hoje`
                    : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Médicos</CardTitle>
                <Stethoscope className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalDoctors ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {unitScoped
                    ? "Nesta unidade"
                    : "Perfis de médico cadastrados"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
                <UserRound className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalPatients ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {unitScoped
                    ? "Nesta unidade"
                    : "Perfis de paciente cadastrados"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
