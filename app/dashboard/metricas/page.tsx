"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Activity,
  PieChart,
  CheckCircle,
  Zap,
} from "lucide-react"
import { initializeAndGetUserData } from "@/lib/data-utils"
import type { User } from "@/types"
import Image from "next/image"

export default function MetricasPage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  useEffect(() => {
    const currentUser = initializeAndGetUserData()
    setUser(currentUser)
  }, [])

  // Métricas principales basadas en los datos del usuario
  const mainMetrics = [
    {
      title: "Tareas Completadas",
      value: "24/30",
      change: "+100% vs período anterior",
      icon: <CheckCircle className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Energía Promedio",
      value: "5/5",
      change: "+100% vs período anterior",
      icon: <Zap className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Gemas Ganadas",
      value: "100,000",
      change: "+100% vs período anterior",
      icon: <Image src="/images/gem-icon.png" alt="Gema" width={24} height={24} />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const kpis = [
    {
      title: "Ingresos Totales",
      value: "$125,430",
      change: "+12.5%",
      trend: "up",
      icon: <DollarSign className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Productividad",
      value: "87%",
      change: "+5.2%",
      trend: "up",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Satisfacción Cliente",
      value: "4.8/5",
      change: "-0.1",
      trend: "down",
      icon: <Target className="h-6 w-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Equipo Activo",
      value: "24",
      change: "+2",
      trend: "up",
      icon: <Users className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const departments = [
    {
      name: "Ventas",
      performance: 92,
      target: 100,
      status: "excellent",
      members: 8,
      revenue: "$45,200",
    },
    {
      name: "Marketing",
      performance: 78,
      target: 85,
      status: "good",
      members: 5,
      revenue: "$12,800",
    },
    {
      name: "Operaciones",
      performance: 65,
      target: 80,
      status: "needs-improvement",
      members: 11,
      revenue: "$67,430",
    },
    {
      name: "RRHH",
      performance: 88,
      target: 90,
      status: "good",
      members: 3,
      revenue: "-",
    },
  ]

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

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
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
        <div className="text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Métricas.</h1>
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
                  Rendimiento por Departamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <motion.div
                      key={dept.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-2xl"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                          <Badge className={getStatusColor(dept.status)}>{getStatusText(dept.status)}</Badge>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div>{dept.members} miembros</div>
                          <div className="font-semibold">{dept.revenue}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rendimiento</span>
                          <span className="font-semibold">
                            {dept.performance}% / {dept.target}%
                          </span>
                        </div>
                        <Progress value={dept.performance} className="h-2 [&>div]:bg-green-500" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="productividad" className="space-y-6">
            <Card className="bg-white shadow-lg border-0 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-red-500" />
                  Análisis de Productividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">Métricas de Productividad</p>
                    <p className="text-sm">Análisis detallado de rendimiento y eficiencia</p>
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
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">Monitoreo de Energía</p>
                    <p className="text-sm">Seguimiento de niveles de energía del equipo</p>
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
                  Resultados de Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">Diagnóstico Organizacional</p>
                    <p className="text-sm">Análisis y recomendaciones basadas en evaluaciones</p>
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
