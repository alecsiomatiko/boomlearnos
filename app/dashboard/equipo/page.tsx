"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, Plus, Mail, Calendar, Award, TrendingUp, UserPlus, Filter } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  department: string
  departmentColor: string
  profileImage?: string
  totalGems: number
  joinDate: string
  performance: number
  stats: {
    totalTasks: number
    completedTasks: number
    completionRate: number
    avgRating: string | null
    achievements: number
  }
  status: string
}

interface Department {
  name: string
  color: string
  memberCount: number
}

interface TeamStats {
  totalMembers: number
  totalDepartments: number
  avgGems: number
  departments: Array<{
    name: string
    count: number
  }>
}

export default function EquipoPage() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [stats, setStats] = useState<TeamStats>({ totalMembers: 0, totalDepartments: 0, avgGems: 0, departments: [] })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeamData() {
      if (!user?.id) return
      
      try {
        console.log('💼 [EQUIPO] Cargando datos del equipo...')
        const response = await fetch(`/api/team?userId=${user.id}&department=${selectedDepartment}&search=${encodeURIComponent(searchTerm)}`)
        const data = await response.json()
        
        if (data.success) {
          console.log('✅ [EQUIPO] Datos cargados:', data.data.teamMembers.length, 'miembros')
          setTeamMembers(data.data.teamMembers)
          setDepartments(data.data.departments)
          setStats(data.data.stats)
        } else {
          console.error('❌ [EQUIPO] Error:', data.error)
        }
      } catch (error) {
        console.error('❌ [EQUIPO] Error al cargar equipo:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTeamData()
  }, [user?.id, selectedDepartment, searchTerm])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>
      case "vacation":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Vacaciones</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactivo</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Activo</Badge>
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 75) return "text-yellow-600"
    if (performance >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const departmentOptions = [
    { key: "all", label: "Todos", count: teamMembers.length },
    ...stats.departments.map(dept => ({
      key: dept.name,
      label: dept.name,
      count: dept.count
    }))
  ]

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || member.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
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
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            
            <h1 className="text-4xl font-bold text-gray-900 text-left">Equipo</h1>
          </div>
          
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-white shadow-lg border-0 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-red" />
                Total Miembros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalMembers}</div>
              <p className="text-sm text-gray-600">Personas en el equipo</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-red" />
                Rendimiento Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {teamMembers.length > 0 ? Math.round(teamMembers.reduce((acc, member) => acc + member.performance, 0) / teamMembers.length) : 0}%
              </div>
              <p className="text-sm text-gray-600">Evaluación general</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Award className="h-4 w-4 text-brand-red" />
                Departamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalDepartments}</div>
              <p className="text-sm text-gray-600">Áreas de trabajo</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-brand-red" />
                Gemas Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.avgGems}</div>
              <p className="text-sm text-gray-600">Por empleado</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white shadow-lg border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, rol o departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-gray-200"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-gray-200 hover:border-brand-red hover:text-brand-red bg-transparent"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Tabs */}
        <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 bg-white rounded-2xl p-2 shadow-lg border-0 w-full">
            {departmentOptions.map((dept) => (
              <TabsTrigger
                key={dept.key}
                value={dept.key}
                className="rounded-xl text-sm font-medium data-[state=active]:bg-brand-red data-[state=active]:text-white"
              >
                {dept.label} ({dept.count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedDepartment} className="space-y-6">`
            {/* Team Members Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.profileImage || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback className="bg-brand-red text-white font-semibold">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">{member.name}</CardTitle>
                            <p className="text-sm text-gray-600">{member.role}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {member.department}
                            </Badge>
                          </div>
                        </div>
                        {getStatusBadge(member.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Desde {new Date(member.joinDate).toLocaleDateString("es-ES")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Award className="h-4 w-4" />
                          <span>{member.totalGems} gemas totales</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Rendimiento</span>
                          <span className={`font-semibold ${getPerformanceColor(member.performance)}`}>
                            {member.performance}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-brand-red h-2 rounded-full transition-all duration-300"
                            style={{ width: `${member.performance}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-brand-red">{member.stats.completedTasks}</div>
                          <div className="text-xs text-gray-600">Tareas completadas</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-brand-red">{member.stats.achievements}</div>
                          <div className="text-xs text-gray-600">Logros obtenidos</div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-xl border-gray-200 hover:border-brand-red hover:text-brand-red bg-transparent"
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Mensaje
                        </Button>
                        <Button size="sm" className="flex-1 bg-brand-red hover:bg-red-600 text-white rounded-xl">
                          Ver Perfil
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="font-bold text-xl text-gray-700 mb-2">No se encontraron miembros</h3>
                <p className="text-gray-600">Intenta ajustar los filtros de búsqueda.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
