"use client"

import { useState } from "react"
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  SortAsc,
  X,
  MessageSquare,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskDetailsModal } from "./task-details-modal"
import { NewTaskForm } from "./new-task-form"
import { RewardAnimation } from "../animations/reward-animation"
import type { Task } from "@/types"
import Image from "next/image"

// Datos de ejemplo
const initialTasks: Task[] = [
  {
    id: "1",
    title: "Desarrollar estrategia de marketing digital Q1",
    description:
      "Crear plan de marketing digital para el primer trimestre enfocado en redes sociales y email marketing.",
    category: "marketing",
    priority: "alta",
    progress: 75,
    dueDate: "2024-03-15",
    createdAt: "2024-02-01",
    assignedTo: "Ana Martínez",
    gems: 75,
    comments: [
      {
        author: "Carlos López",
        text: "¿Podemos incluir una sección sobre SEO?",
        date: "2024-02-05T10:30:00",
      },
      {
        author: "Ana Martínez",
        text: "Sí, lo agregaré en la próxima actualización.",
        date: "2024-02-05T11:45:00",
      },
    ],
  },
  {
    id: "2",
    title: "Optimización de procesos operativos",
    description: "Revisar y optimizar los procesos operativos actuales para mejorar la eficiencia.",
    category: "operaciones",
    priority: "media",
    progress: 30,
    dueDate: "2024-04-10",
    createdAt: "2024-02-15",
    assignedTo: "Carlos López",
    gems: 50,
    comments: [],
  },
  {
    id: "3",
    title: "Revisión de presupuesto anual",
    description: "Analizar el presupuesto anual y hacer ajustes según los resultados del primer trimestre.",
    category: "finanzas",
    priority: "alta",
    progress: 10,
    dueDate: "2024-03-30",
    createdAt: "2024-03-01",
    assignedTo: "María Rodríguez",
    gems: 60,
    comments: [],
  },
  {
    id: "4",
    title: "Planificación de capacitación de equipo",
    description: "Organizar sesiones de capacitación para el equipo sobre nuevas herramientas y metodologías.",
    category: "rrhh",
    priority: "baja",
    progress: 0,
    dueDate: "2024-05-20",
    createdAt: "2024-03-05",
    assignedTo: "",
    gems: 40,
    comments: [],
  },
]

export function TaskPanel() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showReward, setShowReward] = useState(false)
  const [rewardTask, setRewardTask] = useState<Task | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [activeSort, setActiveSort] = useState<string | null>(null)

  // Filtrar tareas
  const filteredTasks = tasks.filter((task) => {
    // Filtro de búsqueda
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Filtro de categoría
    const matchesFilter = !activeFilter || task.category === activeFilter

    return matchesSearch && matchesFilter
  })

  // Ordenar tareas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (activeSort === "dueDate") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    } else if (activeSort === "priority") {
      const priorityValues = { alta: 3, media: 2, baja: 1 }
      return (
        (priorityValues[b.priority as keyof typeof priorityValues] || 0) -
        (priorityValues[a.priority as keyof typeof priorityValues] || 0)
      )
    } else if (activeSort === "progress") {
      return b.progress - a.progress
    }
    return 0
  })

  // Agrupar tareas por estado
  const pendingTasks = sortedTasks.filter((task) => task.progress < 100)
  const completedTasks = sortedTasks.filter((task) => task.progress === 100)

  const handleOpenDetails = (task: Task) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedTask(null)
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
    handleCloseDetails()
  }

  const handleCompleteTask = (id: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const completedTask = { ...task, progress: 100 }
        setRewardTask(completedTask)
        setShowReward(true)
        return completedTask
      }
      return task
    })
    setTasks(updatedTasks)
  }

  const handleProgressUpdate = (id: string, progress: number) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, progress }
      }
      return task
    })
    setTasks(updatedTasks)
  }

  const handleAddComment = (id: string, commentText: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const newComment = {
          author: "Usuario",
          text: commentText,
          date: new Date().toISOString(),
        }
        return {
          ...task,
          comments: [...(task.comments || []), newComment],
        }
      }
      return task
    })
    setTasks(updatedTasks)
  }

  const handleCreateTask = (newTask: Task) => {
    const taskWithId = {
      ...newTask,
      id: `${tasks.length + 1}`,
    }
    setTasks([taskWithId, ...tasks])
    setIsNewTaskOpen(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return "text-red-500"
      case "media":
        return "text-orange-500"
      case "baja":
        return "text-green-500"
      default:
        return "text-blue-500"
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "finanzas":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Finanzas</Badge>
      case "marketing":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Marketing</Badge>
      case "operaciones":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Operaciones</Badge>
      case "rrhh":
        return <Badge className="bg-amber-500 hover:bg-amber-600">RRHH</Badge>
      default:
        return <Badge>{category}</Badge>
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar tareas..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex gap-1 bg-transparent">
                  <Filter className="h-4 w-4" />
                  <span>Filtrar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className={!activeFilter ? "bg-red-50" : ""} onClick={() => setActiveFilter(null)}>
                  Todas las categorías
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={activeFilter === "finanzas" ? "bg-red-50" : ""}
                  onClick={() => setActiveFilter("finanzas")}
                >
                  Finanzas
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={activeFilter === "marketing" ? "bg-red-50" : ""}
                  onClick={() => setActiveFilter("marketing")}
                >
                  Marketing
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={activeFilter === "operaciones" ? "bg-red-50" : ""}
                  onClick={() => setActiveFilter("operaciones")}
                >
                  Operaciones
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={activeFilter === "rrhh" ? "bg-red-50" : ""}
                  onClick={() => setActiveFilter("rrhh")}
                >
                  RRHH
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex gap-1 bg-transparent">
                  <SortAsc className="h-4 w-4" />
                  <span>Ordenar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className={activeSort === "dueDate" ? "bg-red-50" : ""}
                  onClick={() => setActiveSort("dueDate")}
                >
                  Fecha límite
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={activeSort === "priority" ? "bg-red-50" : ""}
                  onClick={() => setActiveSort("priority")}
                >
                  Prioridad
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={activeSort === "progress" ? "bg-red-50" : ""}
                  onClick={() => setActiveSort("progress")}
                >
                  Progreso
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setIsNewTaskOpen(true)} className="bg-red-500 hover:bg-red-600">
              <Plus className="h-4 w-4 mr-1" />
              Nueva tarea
            </Button>
          </div>
        </div>

        {activeFilter && (
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Filtro activo:</span>
            <Badge variant="outline" className="flex gap-1 bg-red-50">
              {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => setActiveFilter(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="flex gap-2">
              <Clock className="h-4 w-4" />
              Pendientes
              <Badge variant="secondary" className="ml-1 bg-gray-100">
                {pendingTasks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completadas
              <Badge variant="secondary" className="ml-1 bg-gray-100">
                {completedTasks.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingTasks.length > 0 ? (
              <AnimatePresence>
                {pendingTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="mb-4 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getCategoryBadge(task.category)}
                              <Badge
                                variant="outline"
                                className={`${getPriorityColor(task.priority)} border-none bg-opacity-10`}
                              >
                                <Flag className="h-3 w-3 mr-1" />
                                {task.priority}
                              </Badge>
                            </div>

                            <h3
                              className="text-lg font-medium mb-2 cursor-pointer hover:text-red-600"
                              onClick={() => handleOpenDetails(task)}
                            >
                              {task.title}
                            </h3>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-3">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{format(new Date(task.dueDate), "d MMM yyyy", { locale: es })}</span>
                              </div>

                              {task.assignedTo && (
                                <div className="flex items-center">
                                  <Badge variant="outline" className="font-normal border-gray-200">
                                    {task.assignedTo}
                                  </Badge>
                                </div>
                              )}

                              {task.comments && task.comments.length > 0 && (
                                <div className="flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  <span>{task.comments.length}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Progress value={task.progress} className="h-2 flex-1" />
                              <span className="text-xs font-medium">{task.progress}%</span>
                            </div>
                          </div>

                          <div className="ml-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDetails(task)}>
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                                  Marcar como completada
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-10">
                <div className="mx-auto w-20 h-20 mb-4">
                  <Image
                    src="/images/mascot-happy.png"
                    alt="Mascota feliz"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">¡No hay tareas pendientes!</h3>
                <p className="text-gray-500 mb-4">Excelente trabajo. Has completado todas tus tareas.</p>
                <Button onClick={() => setIsNewTaskOpen(true)} className="bg-red-500 hover:bg-red-600">
                  <Plus className="h-4 w-4 mr-1" />
                  Crear nueva tarea
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedTasks.length > 0 ? (
              completedTasks.map((task) => (
                <Card key={task.id} className="mb-4 bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryBadge(task.category)}
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-none">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completada
                          </Badge>
                        </div>

                        <h3
                          className="text-lg font-medium mb-2 cursor-pointer hover:text-red-600"
                          onClick={() => handleOpenDetails(task)}
                        >
                          {task.title}
                        </h3>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{format(new Date(task.dueDate), "d MMM yyyy", { locale: es })}</span>
                          </div>

                          {task.assignedTo && (
                            <div className="flex items-center">
                              <Badge variant="outline" className="font-normal border-gray-200">
                                {task.assignedTo}
                              </Badge>
                            </div>
                          )}

                          <div className="flex items-center">
                            <Badge className="bg-red-100 text-red-600 hover:bg-red-200">+{task.gems} gemas</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDetails(task)}>Ver detalles</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="mx-auto w-20 h-20 mb-4">
                  <Image
                    src="/images/mascot-happy.png"
                    alt="Mascota esperando"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No hay tareas completadas aún</h3>
                <p className="text-gray-500 mb-4">Completa algunas tareas para verlas aquí y ganar gemas.</p>
                <Button onClick={() => setIsNewTaskOpen(true)} className="bg-red-500 hover:bg-red-600">
                  <Plus className="h-4 w-4 mr-1" />
                  Crear nueva tarea
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <TaskDetailsModal
        task={selectedTask}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onDelete={handleDeleteTask}
        onComplete={handleCompleteTask}
        onProgressUpdate={handleProgressUpdate}
        onAddComment={handleAddComment}
      />

      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="sm:max-w-[700px] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold">Nueva tarea</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2">
            <NewTaskForm onSubmit={handleCreateTask} onCancel={() => setIsNewTaskOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <RewardAnimation
        show={showReward}
        title="Tarea Completada"
        description={`Has completado: ${rewardTask?.title || ""}`}
        gems={rewardTask?.gems || 0}
        type="task"
        onComplete={() => setShowReward(false)}
      />
    </>
  )
}
