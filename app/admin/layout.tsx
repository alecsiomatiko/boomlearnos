"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-red-600 min-h-screen shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white">🔧 Admin Panel</h1>
            <p className="text-red-100 text-sm mt-2">BoomlearnOS Management</p>
          </div>
          
          <nav className="mt-8">
            <div className="px-6 py-3">
              <h3 className="text-red-200 text-xs uppercase tracking-wider font-semibold mb-3">
                Gestión
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/admin"
                    className="flex items-center px-3 py-2 text-red-100 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    📊 Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/achievements"
                    className="flex items-center px-3 py-2 text-red-100 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    🏆 Logros
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/rewards"
                    className="flex items-center px-3 py-2 text-red-100 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    💎 Recompensas
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/departments"
                    className="flex items-center px-3 py-2 text-red-100 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    🏢 Áreas
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/users"
                    className="flex items-center px-3 py-2 text-red-100 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    👥 Usuarios
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="px-6 py-3 mt-8">
              <h3 className="text-red-200 text-xs uppercase tracking-wider font-semibold mb-3">
                Sistema
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/dashboard"
                    className="flex items-center px-3 py-2 text-red-100 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    ← Volver al Dashboard
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Panel de Administración
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Bienvenido, {user.name}
                  </span>
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
