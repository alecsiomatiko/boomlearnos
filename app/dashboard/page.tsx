"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import IntroScreen from "@/components/dashboard/intro-screen"
import { DiagnosticResults } from "@/components/diagnostic/diagnostic-results"
import { LayoutDashboard, Brain, BarChart3, Trophy, Gift, Users, MessageSquare } from "lucide-react"
import { getUser } from "@/lib/user-manager"
import { useAuth } from "@/contexts/auth-context"
import type { User } from "@/types/user"

const dashboardOptions = [
  {
    id: "control",
    title: "Panel de Control",
    description: "Gestiona tu empresa y revisa métricas clave",
    icon: LayoutDashboard,
    href: "/dashboard/control",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    id: "mega-diagnostico",
    title: "Mega Diagnóstico",
    description: "Evaluación completa de tu organización",
    icon: Brain,
    href: "/dashboard/mega-diagnostico",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    id: "metricas",
    title: "Métricas",
    description: "Analiza el rendimiento y KPIs",
    icon: BarChart3,
    href: "/dashboard/metricas",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
  },
  {
    id: "logros",
    title: "Logros",
    description: "Revisa tus logros y progreso",
    icon: Trophy,
    href: "/dashboard/logros",
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-600",
  },
  {
    id: "recompensas",
    title: "Recompensas",
    description: "Sistema de puntos y beneficios",
    icon: Gift,
    href: "/dashboard/recompensas",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    textColor: "text-pink-600",
  },
  {
    id: "equipo",
    title: "Equipo",
    description: "Gestiona tu equipo de trabajo",
    icon: Users,
    href: "/dashboard/equipo",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    id: "mensajes",
    title: "Mensajes",
    description: "Comunicación y notificaciones",
    icon: MessageSquare,
    href: "/dashboard/mensajes",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
  },
]

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false)
  const { user: authUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function loadUser() {
      console.log('🔍 [DASHBOARD] Iniciando carga de usuario...')
      
      // Verificar si viene del diagnóstico completado
      const diagnosticCompleted = searchParams?.get('diagnostic') === 'completed'
      
      if (diagnosticCompleted && authUser?.id) {
        setLoadingDiagnostic(true)
        try {
          const response = await fetch(`/api/diagnostic/advanced?userId=${authUser.id}`)
          if (response.ok) {
            const data = await response.json()
            setDiagnosticResults(data)
            console.log('✅ [DASHBOARD] Resultados del diagnóstico cargados')
          }
        } catch (error) {
          console.error('❌ [DASHBOARD] Error cargando diagnóstico:', error)
        } finally {
          setLoadingDiagnostic(false)
        }
      }
      
      // Verificar si el usuario autenticado es admin
      if (authUser && authUser.role !== 'admin') {
        console.log('🚫 [DASHBOARD] Usuario no es admin, redirigiendo al panel de control...')
        router.push("/dashboard/control")
        return
      }
      
      // Usar el ID del usuario autenticado
      const userId = authUser?.id
      const user = await getUser(userId)
      console.log('✅ [DASHBOARD] Usuario cargado:', user.name)
      setUser(user)
    }
    loadUser()
  }, [authUser, router, searchParams])

  const handleSelectControl = () => {
    router.push("/dashboard/control")
  }

  const handleSelectSalud = () => {
    router.push("/dashboard/salud")
  }

  // Mostrar resultados del diagnóstico si están disponibles
  if (diagnosticResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <DiagnosticResults analysis={diagnosticResults.analysis} />
        </div>
      </div>
    )
  }

  // Mostrar loading si está cargando el diagnóstico
  if (loadingDiagnostic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando resultados del diagnóstico...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  // Solo mostrar el selector de dashboard para administradores
  if (authUser?.role !== 'admin') {
    return null // El useEffect ya redirige, pero por seguridad
  }

  return <IntroScreen onSelectControl={handleSelectControl} onSelectSalud={handleSelectSalud} />
}
