"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, MoreVertical, UserCheck, UserX, Shield, Edit, Trash2, Plus, Filter, Download, Mail } from "lucide-react"
import { NewUserForm } from "./new-user-form-dialog"
import { GetUsersService, type ListedUserModel } from "@/services/api/users/GetUsers"
import { UpdateUserService } from "@/services/api/users/UpdateUser"
import { DeleteUserService } from "@/services/api/users/DeleteUser"
import { useSession } from "@/services/auth/use-session"
import { isUnitScopedAdmin } from "@/lib/admin-auth"

interface DashboardUser {
  id: string
  name: string
  email: string
  phone: string
  role: "doctor" | "patient" | "nurse" | "secretary" | "admin" | "caregiver"
  status: "active" | "inactive"
  lastLogin: string | null
  registrationDate: string
  verified: boolean
  specialty?: string
  crm?: string
  patientsCount?: number
}

export function UserManagement({ searchQuery }: any) {
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<DashboardUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const { isReady, accessToken, user, activeUnitId } = useSession()

  const fetchUsers = useCallback(async () => {
    if (!accessToken || user?.role !== "ADMIN") {
      setIsLoadingUsers(false)
      return
    }

    if (isUnitScopedAdmin(user) && !activeUnitId) {
      setIsLoadingUsers(false)
      return
    }

    try {
      setIsLoadingUsers(true)
      setLoadError(null)
      const response = await GetUsersService.getUsers(
        isUnitScopedAdmin(user) ? activeUnitId ?? undefined : undefined,
      )
      setUsers(response.map(mapToDashboardUser))
    } catch (error) {
      console.error("Falha ao carregar usuários:", error)
      setLoadError("Não foi possível carregar os usuários.")
    } finally {
      setIsLoadingUsers(false)
    }
  }, [accessToken, user, activeUnitId])

  useEffect(() => {
    if (!isReady) {
      return
    }

    fetchUsers()
  }, [fetchUsers, isReady])

  const filteredUsers = useMemo(() => users.filter((user) => {
    const query = searchQuery ? searchQuery.toLowerCase() : "";

    const matchesSearch =
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  }), [users, searchQuery, filterRole, filterStatus])

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "doctor":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Médico</Badge>
      case "patient":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Paciente</Badge>
      case "admin":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Admin</Badge>
      case "nurse":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Enfermeira</Badge>
        )
      case "secretary":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Secretária</Badge>
        )
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Ativo</Badge>
      case "inactive":
        return <Badge variant="outline">Inativo</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleApproveUser = async (userId: string) => {
    try {
      setIsSubmittingAction(true)
      await UpdateUserService.updateUser(userId, { isActive: true })
      await fetchUsers()
    } catch (error) {
      console.error("Falha ao ativar usuário:", error)
      setLoadError("Não foi possível ativar o usuário.")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      setIsSubmittingAction(true)
      await UpdateUserService.updateUser(userId, { isActive: false })
      await fetchUsers()
    } catch (error) {
      console.error("Falha ao suspender usuário:", error)
      setLoadError("Não foi possível suspender o usuário.")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsSubmittingAction(true)
      await DeleteUserService.deleteUser(userId)
      await fetchUsers()
    } catch (error) {
      console.error("Falha ao excluir usuário:", error)
      setLoadError("Não foi possível excluir o usuário.")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>Gerencie todos os usuários da plataforma</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <NewUserForm onClose={() => setOpen(false)} onUserCreated={fetchUsers} />
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadError && <p className="text-sm text-red-600 mb-3">{loadError}</p>}
          <div className="flex items-center space-x-4">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="doctor">Médicos</SelectItem>
                <SelectItem value="patient">Pacientes</SelectItem>
                <SelectItem value="nurse">Enfermeiras</SelectItem>
                <SelectItem value="secretary">Secretárias</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Mais Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoadingUsers && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Carregando usuários...
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
                      {user.verified && <Shield className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                        <User className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar Email
                      </DropdownMenuItem>
                      {user.status === "active" ? (
                        <DropdownMenuItem
                          disabled={isSubmittingAction}
                          onClick={() => handleSuspendUser(user.id)}
                          className="text-red-600"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Suspender
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem disabled={isSubmittingAction} onClick={() => handleApproveUser(user.id)}>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Ativar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        disabled={isSubmittingAction}
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir (desativar)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="text-sm font-medium">{user.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cadastro</p>
                  <p className="text-sm font-medium">{new Date(user.registrationDate).toLocaleDateString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Último acesso</p>
                  <p className="text-sm font-medium">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("pt-BR") : "Nunca"}
                  </p>
                </div>
              </div>

              {user.role === "doctor" && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {user.specialty ?? "Especialidade não informada"} • {user.crm ?? "CRM não informado"}
                    </span>
                    <span className="font-medium">{user.patientsCount ?? 0} pacientes</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoadingUsers && filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum usuário encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros ou termo de busca.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function mapToDashboardUser(user: ListedUserModel): DashboardUser {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phone ?? "-",
    role: mapRole(user.role),
    status: user.isActive ? "active" : "inactive",
    lastLogin: null,
    registrationDate: user.createdAt,
    verified: user.isActive,
  }
}

function mapRole(role: ListedUserModel["role"]): DashboardUser["role"] {
  switch (role) {
    case "DOCTOR":
      return "doctor"
    case "PATIENT":
      return "patient"
    case "NURSE":
      return "nurse"
    case "ADMIN":
      return "admin"
    case "CAREGIVER":
    default:
      return "caregiver"
  }
}
