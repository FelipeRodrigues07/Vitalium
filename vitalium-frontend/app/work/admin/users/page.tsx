"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { UserManagement } from "@/components/admin/user-management"

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <AppLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visualize e gerencie todos os usuários da plataforma
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>

        <UserManagement searchQuery={searchQuery} />
      </div>
    </AppLayout>
  )
}
