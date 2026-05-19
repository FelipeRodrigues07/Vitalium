"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Heart,
  Home,
  Users,
  MessageCircle,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Menu,
  LogOut,
  User,
  Stethoscope,
  Activity,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard Paciente",
    href: "/work/patient/dashboard",
    icon: Activity,
    roles: ["patient"],
    public: false
  },
  {
    name: "Dashboard Médico",
    href: "/work/doctor/dashboard",
    icon: Stethoscope,
    roles: ["doctor"],
  },
  {
    name: "Dashboard",
    href: "/work/admin/dashboard",
    icon: Stethoscope,
    roles: ["admin"],
  },
  {
    name: "Chat",
    href: "/work/chat",
    icon: MessageCircle,
    roles: ["patient", "doctor"],
  },
  {
    name: "Gerenciar agendamentos",
    href: "/work/doctor/appointments",
    icon: Calendar,
    roles: ["doctor"],
  },
  {
    name: "Meus agendamentos",
    href: "/work/patient/appointments",
    icon: Calendar,
    roles: ["patient"],
  },
  {
    name: "Usuários",
    href: "/work/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    name: "Configurações",
    href: "/work/settings",
    icon: Settings,
    roles: ["patient", "doctor", "admin"],
  },
]

interface SidebarProps {
  userRole?: string
  className?: string
}

function SidebarContent({ userRole, className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  const filteredNavigation = navigation.filter(
    (item) => item.public || (item.roles && userRole && item.roles.includes(userRole)),
  )

  return (
    <div className={cn("flex h-full flex-col bg-sidebar", className)}>
      {/* Logo - Made logo more compact on mobile */}
      <div className="flex h-14 sm:h-16 items-center border-b border-sidebar-border px-4 sm:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-sidebar-foreground">Vitalium</span>
        </Link>
      </div>

      {/* Navigation - Improved mobile spacing */}
      <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
        <nav className="space-y-1 sm:space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 sm:space-x-3 rounded-lg px-2 sm:px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Actions - Made user actions more compact */}
      <div className="border-t border-sidebar-border p-3 sm:p-4 space-y-1 sm:space-y-2">
        <Button variant="ghost" className="w-full justify-start h-9 sm:h-10 px-2 sm:px-3" asChild>
          <Link href="/profile">
            <User className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="truncate">Perfil</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-9 sm:h-10 px-2 sm:px-3"
          onClick={() => void handleLogout()}
        >
          <LogOut className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
          <span className="truncate">Sair</span>
        </Button>
      </div>
    </div>
  )
}

export function Sidebar({ userRole, className }: SidebarProps) {
  return (
    <div className={cn("hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-50", className)}>
      <SidebarContent userRole={userRole} />
    </div>
  )
}

export function MobileSidebar({ userRole }: { userRole?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 sm:h-10 sm:w-10">
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 sm:w-72">
        <SidebarContent userRole={userRole} />
      </SheetContent>
    </Sheet>
  )
}
