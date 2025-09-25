"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { LayoutGrid, ShoppingBag, BarChart3, CheckCircle, DollarSign, Users, MessageSquare, ChevronLeft, ChevronRight, Brain } from 'lucide-react'

const navigationItems = [
  {
    name: "Panel de Control",
    href: "/dashboard/control",
    icon: LayoutGrid,
    badge: null,
  },
  {
    name: "Mega Diagnóstico",
    href: "/dashboard/mega-diagnostico",
    icon: ShoppingBag,
    badge: null,
  },
  {
    name: "Análisis IA",
    href: "/dashboard/analisis",
    icon: Brain,
    badge: "Nuevo",
  },
  {
    name: "Métricas",
    href: "/dashboard/metricas",
    icon: BarChart3,
    badge: null,
  },
  {
    name: "Logros",
    href: "/dashboard/logros",
    icon: CheckCircle,
    badge: null,
  },
  {
    name: "Recompensas",
    href: "/dashboard/recompensas",
    icon: DollarSign,
    badge: null,
  },
  {
    name: "Equipo",
    href: "/dashboard/equipo",
    icon: Users,
    badge: null,
  },
  {
    name: "Mensajes",
    href: "/dashboard/mensajes",
    icon: MessageSquare,
    badge: null,
  },
]

interface DashboardSidebarProps {
  onToggle?: (collapsed: boolean) => void
}

export default function DashboardSidebar({ onToggle }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()

  // Cargar datos del perfil del usuario
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        const result = await response.json()
        if (result.success) {
          setUserProfile(result.profile)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [])

  const handleToggle = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    if (onToggle) {
      onToggle(newCollapsed)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <TooltipProvider>
      <motion.div
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative h-full bg-white flex flex-col shadow-sm"
        style={{ borderRadius: isCollapsed ? "0 20px 20px 0" : "0 20px 20px 0" }}
      >
        {/* Toggle Button */}
        <Button
          onClick={handleToggle}
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-6 z-50 h-8 w-8 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {/* Header */}
        <div className={`${isCollapsed ? "p-4" : "p-6"} transition-all duration-300`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="h-12 w-12 flex-shrink-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2877%29-eM9vyfaC9F7LxuGQO3OVh8ZqZaL2Lu.png"
                alt="Kalabasboom Logo"
                className="h-12 w-12 rounded-full"
              />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold text-gray-900"
                >
                  kalabasboom
                </motion.h1>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${isCollapsed ? "px-4" : "px-6"} space-y-2 transition-all duration-300`}>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            const navItem = (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center ${
                    isCollapsed ? "justify-center py-4" : "gap-4 py-3 px-4"
                  } rounded-xl transition-all duration-200 relative group ${
                    isActive 
                      ? "bg-red-50 text-red-600" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-red-500"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Icon className={`${isCollapsed ? "h-6 w-6" : "h-5 w-5"} ${isActive ? "text-red-600" : "text-red-500"}`} />
                  </div>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between flex-1"
                      >
                        <span className="font-medium text-sm">{item.name}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-600 text-xs h-5 w-5 rounded-full flex items-center justify-center p-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.name}</span>
                      {item.badge && (
                        <Badge className="bg-red-500 text-white text-xs h-4 w-4 rounded-full flex items-center justify-center p-0">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return navItem
          })}
        </nav>

        {/* User Profile */}
        <div className={`${isCollapsed ? "p-4" : "p-6"} transition-all duration-300`}>
          {isCollapsed ? (
            // Collapsed state - Solo avatar
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/perfil">
                  <div className="flex justify-center">
                    <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-red-400 transition-all duration-200 bg-gray-800">
                      <AvatarImage src={userProfile?.profileImage || "/placeholder.svg?height=48&width=48&text=JP"} alt={userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Usuario"} />
                      <AvatarFallback className="bg-gray-800 text-white font-bold text-lg">
                        {userProfile ? `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase() : 'JP'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <div className="text-center">
                  <div className="font-medium text-sm">
                    {userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim().toUpperCase() : 'JUAN PABLO'}
                  </div>
                  <div className="text-xs text-gray-500">{userProfile?.position || 'Administrador'}</div>
                  <div className="text-xs text-gray-400 mt-1">Click para ver perfil</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            // Expanded state - Perfil completo
            <Link href="/dashboard/perfil">
              <div className="bg-red-500 rounded-2xl p-4 hover:bg-red-600 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 flex-shrink-0 bg-gray-800">
                    <AvatarImage src={userProfile?.profileImage || "/placeholder.svg?height=48&width=48&text=JP"} alt={userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Usuario"} />
                    <AvatarFallback className="bg-gray-800 text-white font-bold text-lg">
                      {userProfile ? `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase() : 'JP'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim().toUpperCase() : 'JUAN PABLO'}
                    </div>
                    <div className="text-xs text-red-100">{userProfile?.position || 'Administrador'}</div>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
