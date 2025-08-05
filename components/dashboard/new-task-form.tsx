"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CalendarIcon,
  X,
  Target,
  Clock,
  Gem,
  Star,
  Flag,
  User,
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Megaphone,
  Cog,
  AlertTriangle,
  CheckCircle,
  Circle,
  Zap,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import type { Task } from "@/types"

interface NewTaskFormProps {
  onSubmit: (task: Omit<Task, "id">) => void
  onCancel: () => void
}

const CATEGORIES = [
  {
    id: "finanzas",
    name: "Finanzas",
    icon: DollarSign,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Control financiero, presupuestos, reportes",
    baseGems: 25,
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: Megaphone,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Campañas, branding, comunicación",
    baseGems: 20,
  },
  {
    id: "operaciones",
    name: "Operaciones",
    icon: Cog,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Procesos, logística, optimización",
    baseGems: 22,
  },
  {
    id: "rrhh",
    name: "Recursos Humanos",
    icon: Users,
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Talento, evaluaciones, cultura",
    baseGems: 24,
  },
]

const PRIORITIES = [
  {
    id: "low",
    name: "Baja",
    icon: Circle,
    color: "bg-gray-500",
    textColor: "text-gray-700",
    multiplier: 1,
    description: "Puede esperar",
  },
  {
    id: "medium",
    name: "Media",
    icon: CheckCircle,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    multiplier: 1.5,
    description: "Importante pero no urgente",
  },
  {
    id: "high",
    name: "Alta",
    icon: Flag,
    color: "bg-orange-500",
    textColor: "text-orange-700",
    multiplier: 2,
    description: "Requiere atención pronta",
  },
  {
    id: "urgent",
    name: "Urgente",
    icon: AlertTriangle,
    color: "bg-red-500",
    textColor: "text-red-700",
    multiplier: 3,
    description: "Crítica, acción inmediata",
  },
]

const DIFFICULTIES = [
  {
    id: "simple",
    name: "Simple",
    stars: 1,
    multiplier: 1,
    description: "Tarea rutinaria, proceso conocido",
    color: "text-green-600",
  },
  {
    id: "medium",
    name: "Medio",
    stars: 2,
    multiplier: 1.5,
    description: "Requiere análisis y planificación",
    color: "text-blue-600",
  },
  {
    id: "complicated",
    name: "Complicado",
    stars: 3,
    multiplier: 2,
    description: "Múltiples variables, coordinación",
    color: "text-orange-600",
  },
  {
    id: "complex",
    name: "Complejo",
    stars: 4,
    multiplier: 3,
    description: "Alto impacto, innovación requerida",
    color: "text-red-600",
  },
]

const TEAM_MEMBERS = [
  "Juan Pablo Martínez",
  "María García López",
  "Carlos Rodríguez",
  "Ana Fernández",
  "Roberto Silva",
  "Laura Martín",
  "Diego Herrera",
  "Carmen Ruiz",
]

export function NewTaskForm({ onSubmit, onCancel }: NewTaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    difficulty: "",
    assignedTo: "",
    estimatedHours: 2,
  })
  const [selectedDate, setSelectedDate] = useState<Date>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.category || !formData.priority || !formData.difficulty || !selectedDate) return

    const estimatedGems = calculateEstimatedGems()

    onSubmit({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      difficulty: formData.difficulty,
      assignedTo: formData.assignedTo || "Sin asignar",
      completed: false,
      gems: estimatedGems,
      dueDate: selectedDate,
      completionPercentage: 0,
      comments: [],
    })
  }

  const calculateEstimatedGems = () => {
    if (!formData.category || !formData.priority || !formData.difficulty) return 0

    const category = CATEGORIES.find((c) => c.id === formData.category)
    const priority = PRIORITIES.find((p) => p.id === formData.priority)
    const difficulty = DIFFICULTIES.find((d) => d.id === formData.difficulty)

    if (!category || !priority || !difficulty) return 0

    const baseGems = category.baseGems
    const multiplier = priority.multiplier * difficulty.multiplier
    const timeBonus = Math.floor(formData.estimatedHours / 2) * 5

    return Math.round(baseGems * multiplier + timeBonus)
  }

  const selectedCategory = CATEGORIES.find((c) => c.id === formData.category)
  const selectedPriority = PRIORITIES.find((p) => p.id === formData.priority)
  const selectedDifficulty = DIFFICULTIES.find((d) => d.id === formData.difficulty)
  const estimatedGems = calculateEstimatedGems()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Nueva Tarea</h2>
            <p className="text-gray-600">Crea una nueva tarea para el proyecto</p>
          </div>
        </div>
        <Button variant="ghost" onClick={onCancel} className="p-2 h-10 w-10 rounded-full hover:bg-gray-100">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-3">
              <Building2 className="h-5 w-5 text-red-500" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Título de la Tarea *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Implementar sistema de control de inventarios"
                className="rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500 h-12 text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Descripción Detallada</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe los objetivos, entregables y criterios de éxito de la tarea..."
                className="rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500 resize-none min-h-[100px]"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Área de Negocio *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.map((category) => {
                const IconComponent = category.icon
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: category.id })}
                    className={`p-6 rounded-2xl border-2 transition-all text-left hover:shadow-md ${
                      formData.category === category.id
                        ? "border-red-500 bg-red-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                        <Badge variant="outline" className="text-xs">
                          Base: {category.baseGems} gemas
                        </Badge>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priority and Difficulty */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Priority */}
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <Flag className="h-5 w-5 text-red-500" />
                Prioridad *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PRIORITIES.map((priority) => {
                  const IconComponent = priority.icon
                  return (
                    <button
                      key={priority.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: priority.id })}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left hover:shadow-sm ${
                        formData.priority === priority.id
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${priority.color} flex items-center justify-center`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{priority.name}</span>
                            <Badge variant="outline" className="text-xs">
                              ×{priority.multiplier}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{priority.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Difficulty */}
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <Zap className="h-5 w-5 text-red-500" />
                Complejidad *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DIFFICULTIES.map((difficulty) => (
                  <button
                    key={difficulty.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: difficulty.id })}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left hover:shadow-sm ${
                      formData.difficulty === difficulty.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {Array.from({ length: 4 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < difficulty.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${difficulty.color}`}>{difficulty.name}</span>
                          <Badge variant="outline" className="text-xs">
                            ×{difficulty.multiplier}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{difficulty.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment and Timeline */}
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-3">
              <Clock className="h-5 w-5 text-red-500" />
              Asignación y Cronograma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Asignar a</label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                >
                  <SelectTrigger className="rounded-xl border-gray-200 h-12">
                    <SelectValue placeholder="Seleccionar miembro" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_MEMBERS.map((member) => (
                      <SelectItem key={member} value={member}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          {member}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Fecha Límite *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal rounded-xl border-gray-200 h-12 bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Horas Estimadas</label>
                <Input
                  type="number"
                  min="0.5"
                  max="40"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: Number.parseFloat(e.target.value) })}
                  className="rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500 h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gems Preview */}
        {estimatedGems > 0 && (
          <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Gem className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-800">Gemas Estimadas</h3>
                    <p className="text-red-600">Recompensa al completar</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-red-600">{estimatedGems}</p>
                  <p className="text-sm text-red-500">gemas</p>
                </div>
              </div>

              {selectedCategory && selectedPriority && selectedDifficulty && (
                <div className="bg-white/50 rounded-xl p-4">
                  <p className="text-sm font-medium text-red-700 mb-3">Cálculo de Recompensa:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge className={selectedCategory.color}>{selectedCategory.name}</Badge>
                      <span className="text-gray-600">{selectedCategory.baseGems} base</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {selectedPriority.name} ×{selectedPriority.multiplier}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {selectedDifficulty.name} ×{selectedDifficulty.multiplier}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-red-600 mt-2">
                    + {Math.floor(formData.estimatedHours / 2) * 5} gemas por tiempo estimado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mascot Tip */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-16 h-16 flex-shrink-0">
            <Image
              src="/images/mascot-happy.png"
              alt="Mascota dando consejos"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-800 mb-2">💡 Consejo de Productividad</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              Las tareas con mayor prioridad y complejidad otorgan más gemas. ¡Divide las tareas grandes en subtareas
              más pequeñas para obtener recompensas más frecuentes y mantener la motivación alta!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-2xl border-gray-300 hover:bg-gray-50 h-12 bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold h-12 shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={
              !formData.title || !formData.category || !formData.priority || !formData.difficulty || !selectedDate
            }
          >
            <Target className="h-5 w-5 mr-2" />
            Crear Tarea ({estimatedGems} gemas)
          </Button>
        </div>
      </form>
    </div>
  )
}
