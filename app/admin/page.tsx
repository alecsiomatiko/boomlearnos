"use client"

import { useState, useEffect } from "react"
import { useOrgApi } from '@/hooks/useOrgApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Trophy, Gift, Database, Activity, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAchievements: 0,
    totalRewards: 0,
    totalTasks: 0,
    totalGems: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)

  const orgApi = useOrgApi();
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const fetchStats = async () => {
    try {
      const response = await orgApi('/api/admin/stats', { method: 'POST', body: {} });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
        <p className="text-gray-600 mt-2">
          Gestiona el sistema BoomlearnOS desde este panel centralizado
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white border-0 rounded-3xl shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Usuarios Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
            <p className="text-sm text-gray-600 mt-1">Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 rounded-3xl shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Logros Creados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalAchievements}</div>
            <p className="text-sm text-gray-600 mt-1">Achievements disponibles</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 rounded-3xl shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Gift className="h-5 w-5 text-red-500" />
              Recompensas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalRewards}</div>
            <p className="text-sm text-gray-600 mt-1">Recompensas disponibles</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 rounded-3xl shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              Tareas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalTasks}</div>
            <p className="text-sm text-gray-600 mt-1">Tareas en el sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 rounded-3xl shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Gemas en Circulación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalGems.toLocaleString()}</div>
            <p className="text-sm text-gray-600 mt-1">Total de gemas</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 rounded-3xl shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Usuarios Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.activeUsers}</div>
            <p className="text-sm text-gray-600 mt-1">Activos en 30 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white border-0 rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              asChild
              className="bg-red-500 hover:bg-red-600 text-white rounded-2xl h-auto py-4"
            >
              <a href="/admin/achievements" className="flex flex-col items-center gap-2">
                <Trophy className="h-8 w-8" />
                <span className="font-semibold">Gestionar Logros</span>
                <span className="text-xs opacity-90">Crear y editar achievements</span>
              </a>
            </Button>

            <Button 
              asChild
              className="bg-red-500 hover:bg-red-600 text-white rounded-2xl h-auto py-4"
            >
              <a href="/admin/rewards" className="flex flex-col items-center gap-2">
                <Gift className="h-8 w-8" />
                <span className="font-semibold">Gestionar Recompensas</span>
                <span className="text-xs opacity-90">Crear y editar recompensas</span>
              </a>
            </Button>

            <Button 
              asChild
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl h-auto py-4"
            >
              <a href="/admin/users" className="flex flex-col items-center gap-2">
                <Users className="h-8 w-8" />
                <span className="font-semibold">Gestionar Usuarios</span>
                <span className="text-xs opacity-90">Ver y administrar usuarios</span>
              </a>
            </Button>

            <Button 
              asChild
              className="bg-gray-500 hover:bg-gray-600 text-white rounded-2xl h-auto py-4"
            >
              <a href="/dashboard" className="flex flex-col items-center gap-2">
                <Activity className="h-8 w-8" />
                <span className="font-semibold">Ver Dashboard</span>
                <span className="text-xs opacity-90">Ir al dashboard principal</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white border-0 rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">Panel de Admin Configurado</p>
              <p className="text-sm">
                El panel está listo para gestionar logros y recompensas del sistema
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
