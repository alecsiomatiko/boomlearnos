"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Heart,
  Trophy,
  ChevronDown,
  ChevronUp,
  Calendar,
  Bell,
  Timer,
  Settings,
  Crown,
  Zap,
  Crosshair,
  Gem,
  MessageSquare,
  Percent,
  Flag,
  Target,
  Plus,
  Send,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import type { Task } from "@/types"
import { ConfettiExplosion } from "@/components/confetti-explosion"
import { RewardAnimation } from "@/components/animations/reward-animation"
import { IntegratedBadge } from "@/components/badges/integrated-badge"
import { NewTaskForm } from "@/components/dashboard/new-task-form"
import { toast } from "sonner"

// Mock data
const mockUser = {
  id: "1",
  name: "Juan Pablo",
  email: "juan@example.com",
  phone: "",
  city: "",
  business_type: "",
  role: "user",
  level: "5",
  total_gems: 2450,
  current_streak: 6,
  longest_streak: 12,
  energy: 4,
  badges: ["first-task", "week-warrior", "productivity-master"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Establecer sistema de control financiero",
    description: "Implementar controles internos para el seguimiento de gastos e ingresos mensuales",
    completed: false,
    gems: 100,
    dueDate: new Date("2024-01-15"),
    category: "finanzas",
    priority: "high",
    completionPercentage: 85,
    assignedTo: "Juan Pablo",
    comments: [
      { id: "1", author: "María García", text: "Ya revisé los reportes iniciales", timestamp: "2024-01-10" },
      { id: "2", author: "Carlos López", text: "Necesitamos definir los KPIs", timestamp: "2024-01-11" },
    ],
  },
  {
    id: "2",
    title: "Campaña de marketing digital Q1",
    description: "Desarrollar estrategia de marketing digital para el primer trimestre",
    completed: false,
    gems: 75,
    dueDate: new Date("2024-01-16"),
    category: "marketing",
    priority: "medium",
    completionPercentage: 60,
    assignedTo: "Ana Martínez",
    comments: [],
  },
  {
    id: "3",
    title: "Optimización de procesos operativos",
    description: "Revisar y mejorar los procesos operativos actuales para aumentar eficiencia",
    completed: false,
    gems: 50,
    dueDate: new Date("2024-01-17"),
    category: "operaciones",
    priority: "low",
    completionPercentage: 30,
    assignedTo: "Roberto Silva",
    comments: [],
  },
  {
    id: "4",
    title: "Evaluación de desempeño trimestral",
    description: "Realizar evaluaciones de desempeño del equipo para el trimestre",
    completed: false,
    gems: 120,
    dueDate: new Date("2024-01-14"),
    category: "rrhh",
    priority: "urgent",
    completionPercentage: 40,
    assignedTo: "Laura Rodríguez",
    comments: [
      { id: "3", author: "Director RRHH", text: "Priorizar evaluaciones de líderes", timestamp: "2024-01-12" },
    ],
  },
]

const getPriorityBadgeVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (priority) {
    case "urgent":
      return "destructive"
    case "high":
      return "default"
    case "medium":
      return "secondary"
    default:
      return "outline"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-500"
    case "high":
      return "bg-orange-500"
    case "medium":
      return "bg-blue-500"
    default:
      return "bg-gray-400"
  }
}

const getProgressBarColor = (percentage: number) => {
  if (percentage >= 80) return "bg-red-500"
  if (percentage >= 60) return "bg-orange-400"
  if (percentage >= 30) return "bg-blue-400"
  return "bg-gray-300"
}

const getCategoryColor = (category: string) => {
  const colors = {
    finanzas: "bg-green-100 text-green-800 border-green-200",
    marketing: "bg-blue-100 text-blue-800 border-blue-200",
    operaciones: "bg-orange-100 text-orange-800 border-orange-200",
    rrhh: "bg-red-100 text-red-800 border-red-200",
  }
  return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
}

const getCategoryIcon = (category: string) => {
  const icons = {
    finanzas: "💰",
    marketing: "📢",
    operaciones: "⚙️",
    rrhh: "👥",
  }
  return icons[category as keyof typeof icons] || "📋"
}

export default function ControlPage() {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [taskCompletions, setTaskCompletions] = useState<Record<string, number>>({})
  const [energyLevel, setEnergyLevel] = useState([3])
  const [priority, setPriority] = useState("")
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [rewardData, setRewardData] = useState({ title: "", description: "", gems: 0 })
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [unlockedBadgeId, setUnlockedBadgeId] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [newComments, setNewComments] = useState<Record<string, string>>({})

  const completedTasksCount = tasks.filter((task) => task.completed).length

  const getEnergyMascot = (level: number) => {
    if (level <= 2) return "/images/mascot-energy-low.png"
    if (level === 3) return "/images/mascot-energy-medium.png"
    return "/images/mascot-energy-high.png"
  }

  const getEnergyLabel = (level: number) => {
    if (level <= 2) return "Bajo"
    if (level === 3) return "Medio"
    return "Alto"
  }

  const getEnergyColor = (level: number) => {
    if (level <= 2) return "text-red-500"
    if (level === 3) return "text-yellow-500"
    return "text-green-500"
  }

  const triggerCelebration = (task: Task) => {
    const gemsEarned = task.gems || 50

    setShowConfetti(true)
    setRewardData({
      title: "¡Tarea Completada!",
      description: `Has completado: ${task.title}`,
      gems: gemsEarned,
    })
    setShowReward(true)

    toast.success(`¡Completaste "${task.title}"! +${gemsEarned} gemas`, {
      duration: 3000,
      icon: <Gem className="h-4 w-4 text-red-500" />,
    })

    const newCompletedCount = completedTasksCount + 1
    if (newCompletedCount === 3) {
      setTimeout(() => {
        setUnlockedBadgeId("starter_badge")
        setShowBadgeModal(true)
      }, 2000)
    }

    setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleTaskCheck = (taskId: string, checked: boolean) => {
    if (!checked) {
      setCompletedTasks((prev) => ({ ...prev, [taskId]: false }))
      return
    }

    if (completedTasks[taskId]) return

    setCompletedTasks((prev) => ({ ...prev, [taskId]: true }))

    const task = tasks.find((t) => t.id === taskId)
    if (task && !task.completed) {
      const updatedTask = {
        ...task,
        completed: true,
        completionPercentage: 100,
      }
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)))
      triggerCelebration(task)
    }
  }

  const handleTaskExpand = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId)
  }

  const handleCompletionChange = (taskId: string, completion: number) => {
    setTaskCompletions((prev) => ({ ...prev, [taskId]: completion }))

    const updatedTask = tasks.find((t) => t.id === taskId)
    if (updatedTask) {
      const newTask = {
        ...updatedTask,
        completionPercentage: completion,
      }
      setTasks(tasks.map((t) => (t.id === taskId ? newTask : t)))

      if (completion === 100 && !updatedTask.completed) {
        const finalTask = { ...newTask, completed: true }
        setTasks(tasks.map((t) => (t.id === taskId ? finalTask : t)))
        triggerCelebration(finalTask)
      }
    }
  }

  const handleAddComment = (taskId: string) => {
    const commentText = newComments[taskId]
    if (!commentText?.trim()) return

    const updatedTask = tasks.find((t) => t.id === taskId)
    if (updatedTask) {
      const newComment = {
        id: Date.now().toString(),
        author: mockUser.name,
        text: commentText.trim(),
        timestamp: new Date().toISOString().split("T")[0],
      }

      const taskWithComment = {
        ...updatedTask,
        comments: [...(updatedTask.comments || []), newComment],
      }

      setTasks(tasks.map((t) => (t.id === taskId ? taskWithComment : t)))
      setNewComments((prev) => ({ ...prev, [taskId]: "" }))

      toast.success("Comentario agregado", {
        icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
      })
    }
  }

  const handleNewTask = (newTask: Omit<Task, "id">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
      comments: [],
    }
    setTasks([...tasks, task])
    setShowNewTaskForm(false)
    toast.success("Tarea creada exitosamente", {
      icon: <Plus className="h-4 w-4 text-green-500" />,
    })
  }

  const handleCheckIn = () => {
    setHasCheckedIn(true)
  }

  const achievementIcons = [Timer, Settings, Crown, Zap, Star, Crosshair]

  return (
    <>
      {showConfetti && <ConfettiExplosion trigger={showConfetti} onComplete={() => setShowConfetti(false)} />}

      <AnimatePresence>
        {showReward && (
          <RewardAnimation
            title={rewardData.title}
            description={rewardData.description}
            gems={rewardData.gems}
            show={showReward}
            type="task"
            icon={<Trophy className="h-12 w-12 text-yellow-500" />}
            onComplete={() => setShowReward(false)}
          />
        )}
      </AnimatePresence>

      {unlockedBadgeId && (
        <IntegratedBadge
          show={showBadgeModal}
          badgeId={unlockedBadgeId}
          badgeName="STARTER"
          badgeLevel="starter"
          onClose={() => {
            setShowBadgeModal(false)
            setUnlockedBadgeId(null)
          }}
        />
      )}

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900">Panel de Control</h1>
            <Bell className="h-6 w-6 text-gray-600" />
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ranking Card */}
            <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 relative">
                    <Image
                      src="/images/medal-gold.png"
                      alt="Gold Medal"
                      fill
                      className="object-contain drop-shadow-md"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Ranking</p>
                    <p className="text-5xl font-bold text-gray-900">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Completed Card */}
            <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-600">Tareas Completadas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {completedTasksCount}/{tasks.length}
                  </p>
                  <Progress
                    value={(completedTasksCount / tasks.length) * 100}
                    className="h-3 bg-gray-200 [&>*]:bg-green-500 rounded-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gems Card */}
            <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-600">Gemas Totales</p>
                  <p className="text-3xl font-bold text-red-500 flex items-center gap-2">
                    <Gem className="h-8 w-8" />
                    {mockUser.total_gems}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {achievementIcons.slice(0, 6).map((Icon, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md hover:shadow-lg transition-shadow duration-200"
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Tasks */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Tareas del Proyecto</h2>
                <Button
                  onClick={() => setShowNewTaskForm(true)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Tarea
                </Button>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* Task Header */}
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Priority Dot */}
                        <div className={`w-4 h-4 rounded-full ${getPriorityColor(task.priority)} shadow-sm`} />

                        {/* Checkbox */}
                        <Checkbox
                          checked={completedTasks[task.id] || task.completed}
                          onCheckedChange={(checked) => handleTaskCheck(task.id, checked as boolean)}
                          className="w-6 h-6 border-2 border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 rounded-lg shadow-sm"
                        />

                        {/* Task Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-lg">{task.title}</h4>
                            <Badge variant="outline" className={getCategoryColor(task.category)}>
                              {getCategoryIcon(task.category)} {task.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Flag className="h-3 w-3" />
                              {task.assignedTo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {task.dueDate?.toLocaleDateString()}
                            </span>
                            {task.comments && task.comments.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {task.comments.length} comentarios
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-24">
                          <div className="bg-gray-200 rounded-full h-2 shadow-inner">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(
                                taskCompletions[task.id] ?? task.completionPercentage,
                              )}`}
                              style={{ width: `${taskCompletions[task.id] ?? task.completionPercentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            {taskCompletions[task.id] ?? task.completionPercentage}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-6">
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600 flex items-center gap-1">
                            <Gem className="h-4 w-4" />+{task.gems} Gemas
                          </p>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 shadow-sm hover:shadow-md transition-all duration-200"
                          onClick={() => handleTaskExpand(task.id)}
                        >
                          {expandedTask === task.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Task Details */}
                    <AnimatePresence>
                      {expandedTask === task.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100"
                        >
                          <div className="p-6 space-y-6 bg-gray-50">
                            {/* Progress Section */}
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                  <Percent className="h-4 w-4 text-red-500" />
                                  Progreso de la Tarea
                                </label>
                                <span className="text-lg font-bold text-red-500">
                                  {taskCompletions[task.id] ?? task.completionPercentage}%
                                </span>
                              </div>
                              <Slider
                                value={[taskCompletions[task.id] ?? task.completionPercentage]}
                                onValueChange={(value) => handleCompletionChange(task.id, value[0])}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                            </div>

                            {/* Task Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <Target className="h-4 w-4 text-red-500" />
                                  <div>
                                    <p className="text-xs text-gray-500">Prioridad</p>
                                    <Badge
                                      variant={getPriorityBadgeVariant(task.priority)}
                                      className="capitalize text-xs"
                                    >
                                      <Flag className="h-3 w-3 mr-1" />
                                      {task.priority}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <Flag className="h-4 w-4 text-red-500" />
                                  <div>
                                    <p className="text-xs text-gray-500">Asignado a</p>
                                    <p className="font-semibold text-sm">{task.assignedTo}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Comments Section */}
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="h-4 w-4 text-red-500" />
                                <h4 className="font-semibold text-gray-900">Comentarios</h4>
                                <Badge variant="outline" className="text-xs">
                                  {task.comments?.length || 0}
                                </Badge>
                              </div>

                              {/* Existing Comments */}
                              {task.comments && task.comments.length > 0 && (
                                <div className="space-y-3 mb-4">
                                  {task.comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                      </div>
                                      <p className="text-sm text-gray-700">{comment.text}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Comment */}
                              <div className="flex gap-2">
                                <Textarea
                                  value={newComments[task.id] || ""}
                                  onChange={(e) => setNewComments((prev) => ({ ...prev, [task.id]: e.target.value }))}
                                  placeholder="Agregar un comentario..."
                                  className="flex-1 min-h-[60px] text-sm"
                                  rows={2}
                                />
                                <Button
                                  onClick={() => handleAddComment(task.id)}
                                  disabled={!newComments[task.id]?.trim()}
                                  className="bg-red-500 hover:bg-red-600 text-white px-4"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Rewards */}
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200 shadow-sm">
                              <div className="flex items-center gap-3">
                                <Gem className="h-5 w-5 text-red-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Gemas de Recompensa</p>
                                  <p className="text-2xl font-bold text-red-500">{task.gems}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column - Check-in */}
            <div className="lg:col-span-1">
              <Card className="bg-white shadow-lg border-0 rounded-2xl h-full hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check-in Diario</h2>
                    <p className="text-sm text-gray-600">¿Cómo te sientes hoy?</p>
                  </div>

                  <div className="flex justify-center gap-4 mb-6">
                    {[1, 3, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-16 h-16 relative transition-all duration-300 ${
                          (energyLevel[0] <= 2 && level === 1) ||
                          (energyLevel[0] === 3 && level === 3) ||
                          (energyLevel[0] >= 4 && level === 5)
                            ? "opacity-100 scale-110 drop-shadow-lg"
                            : "opacity-40 scale-90"
                        }`}
                      >
                        <Image
                          src={getEnergyMascot(level) || "/placeholder.svg"}
                          alt={`Energy level ${level}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mb-6">
                    <div className="text-center mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Nivel de Energía</p>
                      <p className={`text-xl font-bold ${getEnergyColor(energyLevel[0])}`}>
                        {getEnergyLabel(energyLevel[0])}
                      </p>
                    </div>

                    <div className="px-2">
                      <Slider
                        value={energyLevel}
                        onValueChange={setEnergyLevel}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full mb-3 [&>*]:bg-red-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Bajo</span>
                        <span>Medio</span>
                        <span>Alto</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Prioridad principal del día</label>
                    <Textarea
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      placeholder="Escribe tu prioridad principal..."
                      className="flex-grow w-full p-4 border border-gray-200 rounded-xl resize-none text-sm focus:border-red-500 focus:ring-red-500 shadow-sm"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleCheckIn}
                    disabled={hasCheckedIn || !priority.trim()}
                    className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-3 font-medium disabled:opacity-50 text-sm shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {hasCheckedIn ? "✓ Check-in Completado" : "Registrar Check-in"}
                  </Button>

                  {hasCheckedIn && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-sm"
                    >
                      <div className="text-center">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-green-800 font-medium text-sm">¡Excelente!</p>
                        <p className="text-green-700 text-xs">Has completado tu check-in diario.</p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* New Task Form Modal */}
          {showNewTaskForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <NewTaskForm onSubmit={handleNewTask} onCancel={() => setShowNewTaskForm(false)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
