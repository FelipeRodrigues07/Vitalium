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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { User, MoreVertical, UserCheck, UserX, Shield, Edit, Trash2, Plus, Filter, Download, Mail } from "lucide-react"
import { NewUserForm } from "./new-user-form-dialog"
import { EditUserForm, type EditableUser } from "./edit-user-form-dialog"
import { GetUsersService } from "@/services/api/users/GetUsers"
import { UpdateUserService } from "@/services/api/users/UpdateUser"
import { DeleteUserService } from "@/services/api/users/DeleteUser"
import { useSession } from "@/services/auth/use-session"

import { isUnitScopedAdmin } from "@/lib/admin-auth"

import { mapToDashboardUser, type DashboardUser, type DashboardUserStatus } from "@/lib/users-mapper"


interface DashboardUserExtended extends DashboardUser {
  registrationDate: string
  verified: boolean
  specialty?: string
  crm?: string
  patientsCount?: number
}

export function UserManagement({ searchQuery }: any) {
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [open, setOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<DashboardUserExtended | null>(null)
  const [users, setUsers] = useState<DashboardUserExtended[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  const { isReady, accessToken, user, activeUnitId } = useSession()

  const { isReady, accessToken, user: currentUser } = useSession()


  const fetchUsers = useCallback(async () => {
    if (!accessToken || currentUser?.role !== "ADMIN") {
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

      const response = await GetUsersService.getUsers()
      setUsers(
        response.map((user) => ({
          ...mapToDashboardUser(user),
          registrationDate: user.createdAt,
          verified: user.isActive,
        })),
      )

    } catch (error) {
      console.error("Falha ao carregar usuários:", error)
      setLoadError("Não foi possível carregar os usuários.")
    } finally {
      setIsLoadingUsers(false)
    }

  }, [accessToken, user, activeUnitId])

  }, [accessToken, currentUser])


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
      case "caregiver":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Cuidador</Badge>
        )
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (status: DashboardUserStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Ativo</Badge>
      case "inactive":
        return <Badge variant="outline">Inativo</Badge>
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

  const toEditableUser = (dashboardUser: DashboardUserExtended): EditableUser => ({
    id: dashboardUser.id,
    firstName: dashboardUser.firstName,
    lastName: dashboardUser.lastName,
    email: dashboardUser.email,
    phone: dashboardUser.phone,
    role: dashboardUser.role,
    status: dashboardUser.status,
  })

  const handleConfirmDelete = async () => {
    if (!deletingUser) {
      return
    }

    try {
      setIsSubmittingAction(true)
      await DeleteUserService.deleteUser(deletingUser.id)
      setDeletingUser(null)
      await fetchUsers()
    } catch (error) {
      console.error("Falha ao excluir usuário:", error)
      setLoadError("Não foi possível desativar o usuário.")
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
                <SelectItem value="caregiver">Cuidadores</SelectItem>
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
                      <DropdownMenuItem onClick={() => setEditingUser(toEditableUser(user))}>
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
                        disabled={isSubmittingAction || user.id === currentUser?.id}
                        onClick={() => setDeletingUser(user)}
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

      <Dialog open={!!editingUser} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
        {editingUser && (
          <EditUserForm
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onUserUpdated={fetchUsers}
          />
        )}
      </Dialog>

      <AlertDialog open={!!deletingUser} onOpenChange={(isOpen) => !isOpen && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingUser && (
                <>
                  O usuário <strong>{deletingUser.name}</strong> será desativado e não poderá mais acessar a
                  plataforma. Esta ação pode ser revertida ativando o usuário novamente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmittingAction}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmittingAction}
              onClick={(event) => {
                event.preventDefault()
                void handleConfirmDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmittingAction ? "Desativando..." : "Desativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
=======

