"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Target,
  BarChart3,
  Trophy,
  Gift,
  Users,
  MessageCircle,
  LogOut,
  type LucideIcon,
} from "lucide-react"

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string | null
}

const defaultNavItems: NavItem[] = [
  {
    label: "Panel de Control",
    href: "/dashboard/control",
    icon: LayoutDashboard,
  },
  {
    label: "Mega Diagnóstico",
    href: "/dashboard/mega-diagnostico",
    icon: Target,
  },
  {
    label: "Métricas",
    href: "/dashboard/metricas",
    icon: BarChart3,
  },
  {
    label: "Logros",
    href: "/dashboard/logros",
    icon: Trophy,
    badge: "3",
  },
  {
    label: "Recompensas",
    href: "/dashboard/recompensas",
    icon: Gift,
  },
  {
    label: "Equipo",
    href: "/dashboard/equipo",
    icon: Users,
    badge: "2",
  },
  {
    label: "Mensajes",
    href: "/dashboard/mensajes",
    icon: MessageCircle,
    badge: "5",
  },
]

export function MobileSidebar({ navItems = defaultNavItems }: { navItems?: NavItem[] }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="flex h-full flex-col">
      {/* Navigation - Más compacto */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-150 ${
                  isActive ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <div className="flex-shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <span className="font-medium text-xs">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-600 text-xs h-4 w-4 rounded-full flex items-center justify-center p-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Profile - Compacto */}
      <div className="p-2 border-t border-gray-100">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500 text-white mb-2">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="/placeholder.svg?height=32&width=32&text=JP" alt="Juan Pablo" />
            <AvatarFallback className="bg-red-600 text-white font-bold text-xs">JP</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate">JUAN PABLO</div>
            <div className="text-xs text-red-100">Admin</div>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg justify-start h-7 text-xs"
        >
          <LogOut className="h-3 w-3 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
