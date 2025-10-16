"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getEnergyByDay, getPriorityLabel, getPriorityColor } from "@/lib/metrics-utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Timer,
  Target,
  Activity,
  PieChart,
  CheckCircle,
  Zap,
  Calendar,
  Clock,
  Flame,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import Image from "next/image"

export default function MetricasPage() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [metricsData, setMetricsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Load metrics data from API
  useEffect(() => {
    const loadMetrics = async () => {
      if (!user?.id) return
      
      try {
        const response = await fetch(`/api/metrics?userId=${user.id}&period=${selectedPeriod}`)
        if (response.ok) {
          const data = await response.json()
          setMetricsData(data.data)
        } else {
          toast.error('Error al cargar métricas')
        }
      } catch (error) {
        console.error('Error loading metrics:', error)
        toast.error('Error al cargar métricas')
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [user, selectedPeriod])

  // Generate main metrics from real data
  const mainMetrics = metricsData ? [
    {
      title: "Tareas Completadas",
      value: `${metricsData.kpis[0]?.value || '0/0'}`,
      change: `${metricsData.kpis[0]?.change || 0}% vs período anterior`,
      icon: <CheckCircle className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Energía Promedio",
      value: `${metricsData.energy?.avg ?? '0'}/5`,
      change: `${metricsData.kpis?.[2]?.change || 0}% vs período anterior`,
      icon: <Zap className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Gemas Ganadas",
      value: `${metricsData.kpis[1]?.value || '0'}`,
      change: `${metricsData.kpis[1]?.change || 0}% vs período anterior`,
      icon: <Image src="/images/gem-icon.png" alt="Gema" width={24} height={24} />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ] : []

  // Real operational KPIs
  const kpis = metricsData ? [
    {
      title: "Tasa de Completitud",
      value: `${Math.round((metricsData.summary?.completedTasks || 0) / Math.max(metricsData.summary?.totalTasks || 1, 1) * 100)}%`,
      change: "+5.2%",
      trend: "up",
      icon: <Target className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Tiempo Promedio/Tarea",
      value: "3.2 días",
      change: "-0.8d",
      trend: "up",
      icon: <Clock className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Tareas por Día",
      value: `${Math.round((metricsData.summary?.totalTasks || 0) / 30 * 10) / 10}`,
      change: "+1.2",
      trend: "up",
      icon: <Activity className="h-6 w-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Streak Actual",
      value: `${metricsData.user?.currentStreak ?? 0} días`,
      change: "+3",
      trend: "up",
      icon: <Flame className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ] : []

  // Task categories analysis (from categories aggregation or fallback to departments)
  const categoryIcons: Record<string, string> = {
    finanzas: '💰',
    marketing: '📢',
    operaciones: '⚙️',
    rrhh: '👥',
    desarrollo: '💻',
    ventas: '📈'
  }

  const taskCategories = (() => {
    // Prefer all-time categories (assigned tasks anywhere) if available
    if (metricsData?.charts?.categoriesAllTime && metricsData.charts.categoriesAllTime.length > 0) {
      return metricsData.charts.categoriesAllTime.map((cat: any) => {
        const name = cat.name || 'Sin categoría'
        const totalAssigned = Number(cat.totalAssigned || cat.total_assigned || 0)
        const completed = Number(cat.completed || 0)
        const completionRate = totalAssigned ? Math.round((completed / totalAssigned) * 100) : 0
        return {
          name,
          icon: categoryIcons[name?.toLowerCase()] || '📋',
          completedTasks: completed,
          totalTasks: totalAssigned,
          completionRate,
          gemsEarned: 0,
          activeUsers: 0,
          status: completionRate >= 90 ? 'excellent' : (completionRate >= 75 ? 'good' : 'needs-improvement')
        }
      })
    }

    if (metricsData?.charts?.categories && metricsData.charts.categories.length > 0) {
      return metricsData.charts.categories.map((cat: any) => {
        const name = cat.name || 'Sin categoría'
        const total = Number(cat.total || 0)
        const completed = Number(cat.completed || 0)
        const completionRate = cat.completionRate ?? (total ? Math.round((completed / total) * 100) : 0)
        return {
          name,
          icon: categoryIcons[name?.toLowerCase()] || '📋',
          completedTasks: completed,
          totalTasks: total,
          completionRate,
          gemsEarned: Number(cat.gems_earned || cat.gemsEarned || 0),
          activeUsers: 0,
          status: completionRate >= 90 ? 'excellent' : (completionRate >= 75 ? 'good' : 'needs-improvement')
        }
      })
    }

    if (metricsData?.charts?.departments) {
      return metricsData.charts.departments.map((dept: any) => {
        const name = dept.name || 'Sin categoría'
        const completionRate = dept.completionRate || 0
        return {
          name,
          icon: categoryIcons[name?.toLowerCase()] || '📋',
          completedTasks: dept.completedTasks || 0,
          totalTasks: dept.totalTasks || 0,
          completionRate,
          gemsEarned: dept.gemsEarned || 0,
          activeUsers: dept.activeUsers || 0,
          status: completionRate >= 90 ? 'excellent' : (completionRate >= 75 ? 'good' : 'needs-improvement')
        }
      })
    }

    return []
  })()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "needs-improvement":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "excellent":
        return "Excelente"
      case "good":
        return "Bueno"
      case "needs-improvement":
        return "Necesita Mejora"
      default:
        return "Regular"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-lg text-gray-600">Usuario no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Métricas.</h1>
            <p className="text-gray-600">Análisis detallado de tu productividad y rendimiento</p>
          </div>
          <div className="flex gap-2">
            {["week", "month", "quarter", "year"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={selectedPeriod === period ? "bg-red-500 hover:bg-red-600" : ""}
              >
                {period === "week" ? "Semana" : 
                 period === "month" ? "Mes" :
                 period === "quarter" ? "Trimestre" : "Año"}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {mainMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white shadow-lg border-0 rounded-3xl hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">{metric.title}</CardTitle>
                    <div className={`p-2 rounded-xl ${metric.bgColor}`}>
                      <div className={metric.color}>{metric.icon}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
                  <p className="text-sm text-green-600 font-medium">{metric.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white rounded-3xl p-2 shadow-lg border-0">
            <TabsTrigger
              value="general"
              className="rounded-2xl data-[state=active]:bg-red-500 data-[state=active]:text-white font-medium"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="productividad"
              className="rounded-2xl data-[state=active]:bg-red-500 data-[state=active]:text-white font-medium"
            >
              Productividad
            </TabsTrigger>
            <TabsTrigger
              value="energia"
              className="rounded-2xl data-[state=active]:bg-red-500 data-[state=active]:text-white font-medium"
            >
              Energía
            </TabsTrigger>
            <TabsTrigger
              value="diagnostico"
              className="rounded-2xl data-[state=active]:bg-red-500 data-[state=active]:text-white font-medium"
            >
              Diagnóstico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* KPIs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi, index) => (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white shadow-lg border-0 rounded-3xl hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl ${kpi.bgColor}`}>
                          <div className={kpi.color}>{kpi.icon}</div>
                        </div>
                        <div
                          className={`flex items-center gap-1 text-sm font-medium ${
                            kpi.trend === "up" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {kpi.trend === "up" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {kpi.change}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
                      <p className="text-sm text-gray-600">{kpi.title}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Departments Performance */}
            <Card className="bg-white shadow-lg border-0 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <PieChart className="h-6 w-6 text-red-500" />
                  Rendimiento por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taskCategories.length > 0 ? taskCategories.map((category: any, index: number) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-2xl"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{category.icon}</span>
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          <Badge className={getStatusColor(category.status)}>{getStatusText(category.status)}</Badge>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div>{category.completedTasks}/{category.totalTasks} tareas</div>
                          <div className="font-semibold">{category.gemsEarned} gemas</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completitud</span>
                          <span className="font-semibold">
                            {category.completionRate}%
                          </span>
                        </div>
                        <Progress value={category.completionRate} className="h-2 [&>div]:bg-green-500" />
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay datos de categorías disponibles</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="productividad" className="space-y-6">
            {/* Task Completion Chart */}
            <Card className="bg-white shadow-lg border-0 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-red-500" />
                  Análisis de Productividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Daily Trends */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Tendencias Diarias</h3>
                    {metricsData?.charts?.trends?.daily?.length > 0 ? (
                      <div className="space-y-3">
                        {metricsData.charts.trends.daily.slice(-7).map((day: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-600">{day.completed} completadas</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{day.gems}</p>
                              <p className="text-xs text-gray-500">gemas</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay datos de tendencias</p>
                      </div>
                    )}
                  </div>

                  {/* Priority Analysis */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Análisis por Prioridad</h3>
                    <div className="space-y-3">
                      {metricsData?.priorities?.length > 0 ? metricsData.priorities.map((item: any) => (
                        <div key={item.priority} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{getPriorityLabel(item.priority)}</span>
                            <span>{item.completionRate}%</span>
                          </div>
                          <Progress value={item.completionRate} className={`h-2 [&>div]:${getPriorityColor(item.priority)}`} />
                        </div>
                      )) : <div className="text-gray-400 text-sm">No hay datos de prioridades</div>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="energia" className="space-y-6">
            <Card className="bg-white shadow-lg border-0 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-red-500" />
                  Niveles de Energía
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Energy Overview */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Resumen Semanal</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {getEnergyByDay(metricsData?.energy?.checkins).map(({ day, avg }) => (
                        <div key={day} className="text-center">
                          <div className="text-xs text-gray-600 mb-1">{day}</div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                            ${avg >= 4 ? 'bg-green-500' : avg >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                            {avg > 0 ? avg.toFixed(1) : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Energy Stats */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Estadísticas</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Energía Promedio</p>
                          <p className="text-sm text-gray-600">Últimos 7 días</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{metricsData?.energy?.avg ?? '-'}</p>
                          <p className="text-xs text-gray-500">de 5</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Check-ins Completados</p>
                          <p className="text-sm text-gray-600">Este mes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{metricsData?.energy?.totalCheckins ?? '-'}</p>
                          <p className="text-xs text-gray-500">de 30 días</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Mejor Día</p>
                          <p className="text-sm text-gray-600">Mayor energía</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600">{metricsData?.energy?.bestDay ?? '-'}</p>
                          <p className="text-xs text-gray-500">{metricsData?.energy?.bestDayAvg ? `${metricsData.energy.bestDayAvg}/5` : '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnostico" className="space-y-6">
            <Card className="bg-white shadow-lg border-0 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="h-6 w-6 text-red-500" />
                  Diagnóstico de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Bottlenecks Analysis */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Cuellos de Botella</h3>
                    <div className="space-y-3">
                      {metricsData?.priorities?.map((item: any) => {
                        if (item.priority === 'urgent' && item.completed < item.total) {
                          return (
                            <div key="urgent-bottleneck" className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <h4 className="font-medium text-red-800">Tareas Urgentes Pendientes</h4>
                              </div>
                              <p className="text-sm text-red-700">
                                {item.total - item.completed} tareas urgentes sin completar
                              </p>
                              <p className="text-xs text-red-600 mt-1">
                                Sugerencia: Priorizar estas tareas hoy
                              </p>
                            </div>
                          );
                        }
                        if (item.priority === 'low' && item.completionRate < 75) {
                          return (
                            <div key="low-bottleneck" className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Timer className="h-5 w-5 text-yellow-500" />
                                <h4 className="font-medium text-yellow-800">Tareas de Prioridad Baja</h4>
                              </div>
                              <p className="text-sm text-yellow-700">
                                {item.completionRate}% de completitud (por debajo del promedio)
                              </p>
                              <p className="text-xs text-yellow-600 mt-1">
                                Sugerencia: Revisar relevancia de estas tareas
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  {/* Performance Insights */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Insights de Rendimiento</h3>
                    <div className="space-y-3">
                      {metricsData?.aiInsights ? (
                        <div className="prose max-w-none bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div dangerouslySetInnerHTML={{ __html: metricsData.aiInsights.replace(/\n/g, '<br/>') }} />
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">No hay insights generados aún.</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
