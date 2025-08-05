"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, Plus, Mail, Phone, MapPin, Calendar, Award, TrendingUp, UserPlus, Filter } from "lucide-react"
import { initializeAndGetUserData } from "@/lib/data-utils"
import type { User } from "@/types"

export default function EquipoPage() {
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  useEffect(() => {
    const currentUser = initializeAndGetUserData()
    setUser(currentUser)
  }, [])

  const teamMembers = [
    {
      id: 1,
      name: "Ana García",
      role: "Gerente de Ventas",
      department: "Ventas",
      email: "ana.garcia@empresa.com",
      phone: "+1 234 567 8901",
      location: "Madrid, España",
      joinDate: "2023-01-15",
      performance: 95,
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40&text=AG",
      badges: ["Top Performer", "Team Leader"],
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      role: "Desarrollador Senior",
      department: "Tecnología",
      email: "carlos.rodriguez@empresa.com",
      phone: "+1 234 567 8902",
      location: "Barcelona, España",
      joinDate: "2022-08-20",
      performance: 88,
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40&text=CR",
      badges: ["Innovation Award"],
    },
    {
      id: 3,
      name: "María López",
      role: "Especialista en Marketing",
      department: "Marketing",
      email: "maria.lopez@empresa.com",
      phone: "+1 234 567 8903",
      location: "Valencia, España",
      joinDate: "2023-03-10",
      performance: 82,
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40&text=ML",
      badges: ["Creative Excellence"],
    },
    {
      id: 4,
      name: "David Martín",
      role: "Analista Financiero",
      department: "Finanzas",
      email: "david.martin@empresa.com",
      phone: "+1 234 567 8904",
      location: "Sevilla, España",
      joinDate: "2022-11-05",
      performance: 90,
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40&text=DM",
      badges: ["Accuracy Award"],
    },
    {
      id: 5,
      name: "Laura Sánchez",
      role: "Coordinadora RRHH",
      department: "RRHH",
      email: "laura.sanchez@empresa.com",
      phone: "+1 234 567 8905",
      location: "Bilbao, España",
      joinDate: "2023-06-01",
      performance: 87,
      status: "vacation",
      avatar: "/placeholder.svg?height=40&width=40&text=LS",
      badges: ["People Champion"],
    },
    {
      id: 6,
      name: "Roberto Jiménez",
      role: "Diseñador UX/UI",
      department: "Diseño",
      email: "roberto.jimenez@empresa.com",
      phone: "+1 234 567 8906",
      location: "Málaga, España",
      joinDate: "2023-02-14",
      performance: 85,
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40&text=RJ",
      badges: ["Design Excellence"],
    },
  ]

  const departments = [
    { key: "all", label: "Todos", count: teamMembers.length },
    { key: "Ventas", label: "Ventas", count: teamMembers.filter((m) => m.department === "Ventas").length },
    { key: "Tecnología", label: "Tecnología", count: teamMembers.filter((m) => m.department === "Tecnología").length },
    { key: "Marketing", label: "Marketing", count: teamMembers.filter((m) => m.department === "Marketing").length },
    { key: "Finanzas", label: "Finanzas", count: teamMembers.filter((m) => m.department === "Finanzas").length },
    { key: "RRHH", label: "RRHH", count: teamMembers.filter((m) => m.department === "RRHH").length },
    { key: "Diseño", label: "Diseño", count: teamMembers.filter((m) => m.department === "Diseño").length },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>
      case "vacation":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Vacaciones</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactivo</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Desconocido</Badge>
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 80) return "text-blue-600"
    if (performance >= 70) return "text-yellow-600"
    return "text-red-600"
  }

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
              <div className="text-3xl font-bold text-gray-900">{teamMembers.length}</div>
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
                {Math.round(teamMembers.reduce((acc, member) => acc + member.performance, 0) / teamMembers.length)}%
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
              <div className="text-3xl font-bold text-gray-900">{departments.length - 1}</div>
              <p className="text-sm text-gray-600">Áreas de trabajo</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-brand-red" />
                Nuevos Este Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">2</div>
              <p className="text-sm text-gray-600">Incorporaciones recientes</p>
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
                <Button className="bg-brand-red hover:bg-red-600 text-white rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Miembro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Tabs */}
        <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 bg-white rounded-2xl p-2 shadow-lg border-0 w-full">
            {departments.map((dept) => (
              <TabsTrigger
                key={dept.key}
                value={dept.key}
                className="rounded-xl data-[state=active]:bg-brand-red data-[state=active]:text-white text-sm"
              >
                {dept.label} ({dept.count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedDepartment} className="space-y-6">
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
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
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
                          <Phone className="h-4 w-4" />
                          <span>{member.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{member.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Desde {new Date(member.joinDate).toLocaleDateString("es-ES")}</span>
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

                      {member.badges.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-sm text-gray-600">Reconocimientos</span>
                          <div className="flex flex-wrap gap-1">
                            {member.badges.map((badge, badgeIndex) => (
                              <Badge
                                key={badgeIndex}
                                className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs"
                              >
                                <Award className="h-3 w-3 mr-1" />
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

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
