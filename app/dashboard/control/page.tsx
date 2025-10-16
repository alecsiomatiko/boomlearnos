"use client"

import { useState, useEffect } from "react"
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
import { useAuth } from "@/contexts/auth-context"
import { authFetch } from "@/lib/auth-utils"

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
  const { user, updateUser } = useAuth()
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
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
  const [teamMembers, setTeamMembers] = useState<Array<{id: string, name: string, email: string}>>([])
  const [userGems, setUserGems] = useState<number>(0)

  // Load user data and tasks
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return
      
      // Initialize gems from user context
      setUserGems(user.total_gems || 0);
      
      try {
        // Load tasks
        const tasksResponse = await authFetch(`/api/tasks?userId=${user.id}`)
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json()
          const tasksWithComments = await Promise.all(
            (tasksData.data?.tasks || []).map(async (task: Task) => {
              try {
                const commentsResponse = await authFetch(`/api/tasks/comments?taskId=${task.id}`)
                if (commentsResponse.ok) {
                  const commentsData = await commentsResponse.json()
                  return { ...task, comments: commentsData.data?.comments || [] }
                }
                return { ...task, comments: [] }
              } catch {
                return { ...task, comments: [] }
              }
            })
          )
          setTasks(tasksWithComments)
        }
        
        // Check daily check-in status
        const checkinResponse = await authFetch(`/api/checkin?userId=${user.id}`)
        if (checkinResponse.ok) {
          const checkinData = await checkinResponse.json()
          setHasCheckedIn(checkinData.data?.hasCheckedIn || false)
        }
        
        // Load team members
        const teamResponse = await authFetch(`/api/team?userId=${user.id}`)
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          setTeamMembers(teamData.data?.users || [])
        } else {
          console.error('Error loading team members:', await teamResponse.text())
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Sync userGems when user.total_gems changes
  useEffect(() => {
    if (user?.total_gems !== undefined) {
      console.log('[useEffect] Syncing gems from user context:', user.total_gems);
      setUserGems(user.total_gems);
    }
  }, [user?.total_gems]);

  // Function to refresh user data (gems, level, etc.)
  const refreshUserData = async () => {
    if (!user?.id) return
    
    try {
      console.log('[refreshUserData] Fetching updated user data...');
      const response = await authFetch(`/api/user/profile?userId=${user.id}`);
      
      if (response.ok) {
        const result = await response.json();
        const userData = result.data;
        console.log('[refreshUserData] Updated user data:', userData);
        
        // Update local gems state
        if (userData.totalGems !== undefined) {
          setUserGems(userData.totalGems);
          console.log('[refreshUserData] Gems updated to:', userData.totalGems);

          // Update auth context with snake_case total_gems
          updateUser({ total_gems: userData.totalGems });
        }
      } else {
        console.error('[refreshUserData] Failed to fetch user data:', response.status);
      }
    } catch (error) {
      console.error('[refreshUserData] Error:', error);
    }
  }

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

  const handleTaskCheck = async (taskId: string, checked: boolean) => {
    console.log('handleTaskCheck called:', { taskId, checked, userId: user?.id });
    
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (!checked) {
      // Unchecking is not allowed for completed tasks
      console.log('Attempted to uncheck task');
      return;
    }

    const task = tasks.find((t) => t.id === taskId);
    console.log('Task found:', task);
    
    if (!task) {
      toast.error('Tarea no encontrada');
      return;
    }

    if (task.completed || completedTasks[taskId]) {
      console.log('Task already completed');
      return;
    }

    // Optimistically update UI
    setCompletedTasks((prev) => ({ ...prev, [taskId]: true }));

    try {
      console.log('Sending PUT request to complete task...');
      const response = await authFetch(`/api/tasks`, {
        method: 'PUT',
        body: JSON.stringify({
          id: taskId,
          status: 'completed',
          completionPercentage: 100
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Update task in local state with server response
        const updatedTask = {
          ...data.data,
          comments: task.comments || []
        };
        
        setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
        triggerCelebration(task);

        // Show gems earned notification
        const gemsEarned = data.gemsEarned || 0;
        console.log('Gems earned:', gemsEarned);
        
        if (gemsEarned > 0) {
          toast.success(`¡Tarea completada! +${gemsEarned} gemas`, {
            icon: <Gem className="h-4 w-4 text-yellow-500" />,
          });
        } else {
          toast.success('¡Tarea completada!', {
            icon: <Trophy className="h-4 w-4 text-green-500" />,
          });
        }
        
        // If server returned the updated total, update auth context and local state immediately
        if (data.newTotalGems !== undefined && data.newTotalGems !== null) {
          console.log('[handleTaskCheck] Server returned newTotalGems:', data.newTotalGems);
          setUserGems(data.newTotalGems);
          updateUser({ total_gems: data.newTotalGems });
        } else {
          // Fallback to full refresh
          await refreshUserData();
        }

        // 🏆 VERIFICAR LOGROS AUTOMÁTICOS
        try {
          const achievementsResponse = await authFetch('/api/achievements/check', {
            method: 'POST'
          });
          const achievementsData = await achievementsResponse.json();
          
          if (achievementsData.success && achievementsData.data.unlockedCount > 0) {
            // Mostrar notificación de logro desbloqueado
            achievementsData.data.unlockedAchievements.forEach((achievement: any) => {
              toast.success(`🏆 ¡Logro desbloqueado!`, {
                description: `${achievement.name} (+${achievement.points} gemas)`,
                duration: 5000,
              });
            });
            
            // Refrescar datos del usuario para mostrar las gemas del logro
            await refreshUserData();
          }
        } catch (error) {
          console.error('Error checking achievements:', error);
        }
      } else {
        const errorData = data;
        console.error('Error response:', errorData);
        toast.error(errorData.error || 'Error al completar tarea');
        setCompletedTasks((prev) => ({ ...prev, [taskId]: false }));
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Error de conexión al completar tarea');
      setCompletedTasks((prev) => ({ ...prev, [taskId]: false }));
    }
  }

  const handleTaskExpand = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId)
  }

  const handleCompletionChange = async (taskId: string, completion: number) => {
    setTaskCompletions((prev) => ({ ...prev, [taskId]: completion }))

    const updatedTask = tasks.find((t) => t.id === taskId)
    if (updatedTask && user?.id) {
      // Update task in local state immediately
      const newTask = {
        ...updatedTask,
        completionPercentage: completion,
      }
      setTasks(tasks.map((t) => (t.id === taskId ? newTask : t)))

      // Auto-complete when reaches 100%
      if (completion === 100 && !updatedTask.completed) {
        handleTaskCheck(taskId, true)
      }
    }
  }

  const handleAddComment = async (taskId: string) => {
    const commentText = newComments[taskId]
    if (!commentText?.trim() || !user?.id) return

    try {
      const response = await authFetch('/api/tasks/comments', {
        method: 'POST',
        body: JSON.stringify({
          taskId,
          userId: user.id,
          content: commentText.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        const updatedTask = tasks.find((t) => t.id === taskId)
        if (updatedTask) {
          const newComment = {
            id: data.data.commentId,
            author: user.name || "Usuario",
            text: commentText.trim(),
            date: new Date().toISOString(),
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
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al agregar comentario')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Error al agregar comentario')
    }
  }

  const handleNewTask = async (newTask: Omit<Task, "id">) => {
    if (!user?.id) return
    
    try {
      const response = await authFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          category: newTask.category,
          difficulty: newTask.difficulty,
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          estimatedHours: 1,
          assignedTo: newTask.assignedTo,
          createdBy: user.id,
          userId: user.id
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Use the task returned from the server
        const newTask: Task = {
          ...data.data.task,
          comments: [],
        }
        setTasks([...tasks, newTask])
        setShowNewTaskForm(false)
        toast.success("Tarea creada exitosamente", {
          icon: <Plus className="h-4 w-4 text-green-500" />,
        })
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al crear tarea')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Error al crear tarea')
    }
  }

  const handleCheckIn = async () => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }
    
    console.log('handleCheckIn called:', {
      userId: user.id,
      energyLevel: energyLevel[0],
      priority: priority.trim()
    });
    
    try {
      const response = await authFetch('/api/checkin', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          energyLevel: energyLevel[0],
          priority: priority.trim(),
          notes: ''
        })
      });
      
      console.log('Check-in response status:', response.status);
      const data = await response.json();
      console.log('Check-in response data:', data);
      
      if (response.ok) {
        setHasCheckedIn(true);
        
        // Show success message with gems earned
        toast.success(data.data?.message || 'Check-in registrado exitosamente', {
          icon: <Gem className="h-4 w-4 text-yellow-500" />,
        });
        
        // Show confetti for successful check-in
        setShowConfetti(true);
        
        // Refresh user data to update gems
        await refreshUserData();

        // 🏆 VERIFICAR LOGROS AUTOMÁTICOS (racha de días)
        try {
          const achievementsResponse = await authFetch('/api/achievements/check', {
            method: 'POST'
          });
          const achievementsData = await achievementsResponse.json();
          
          if (achievementsData.success && achievementsData.data.unlockedCount > 0) {
            achievementsData.data.unlockedAchievements.forEach((achievement: any) => {
              toast.success(`🏆 ¡Logro desbloqueado!`, {
                description: `${achievement.name} (+${achievement.points} gemas)`,
                duration: 5000,
              });
            });
            
            await refreshUserData();
          }
        } catch (error) {
          console.error('Error checking achievements:', error);
        }
        
      } else {
        const errorData = data;
        console.error('Check-in error:', errorData);
        toast.error(errorData.error || 'Error al registrar check-in');
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Error de conexión al registrar check-in');
    }
  }

  const achievementIcons = [Timer, Settings, Crown, Zap, Star, Crosshair]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Usuario no encontrado</p>
        </div>
      </div>
    )
  }

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
                    {userGems}
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
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
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
                                    <p className="font-semibold text-sm">
                                      {(() => {
                                        if (!task.assignedTo) return 'Sin asignar';
                                        const member = teamMembers.find(m => m.id === task.assignedTo);
                                        if (member) return member.name || member.email;
                                        // If not found in team members, might be the current user
                                        if (task.assignedTo === user?.id) return user.name || user.email || 'Yo';
                                        return 'Usuario no encontrado';
                                      })()}
                                    </p>
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
                                  {task.comments.map((comment, index) => (
                                    <div key={comment.id || index} className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                                        <span className="text-xs text-gray-500">
                                          {comment.date ? new Date(comment.date).toLocaleDateString() : 
                                           (comment as any).timestamp || 'Ahora'}
                                        </span>
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
                        className={`w-16 h-16 relative transition-all duration-300 ${(energyLevel[0] <= 2 && level === 1) ||
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
                        disabled={hasCheckedIn}
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
                      placeholder={hasCheckedIn ? "Ya completaste tu check-in de hoy ✓" : "Escribe tu prioridad principal..."}
                      disabled={hasCheckedIn}
                      className="flex-grow w-full p-4 border border-gray-200 rounded-xl resize-none text-sm focus:border-red-500 focus:ring-red-500 shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleCheckIn}
                    disabled={hasCheckedIn || !priority.trim()}
                    className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {hasCheckedIn ? "✓ Ya hiciste tu check-in hoy" : "Registrar Check-in"}
                  </Button>

                  {hasCheckedIn && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-sm"
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Heart className="h-6 w-6 text-white fill-white" />
                        </div>
                        <p className="text-green-800 font-bold text-base mb-1">¡Check-in Completado!</p>
                        <p className="text-green-700 text-sm">Ya registraste tu check-in del día.</p>
                        <p className="text-green-600 text-xs mt-2">Vuelve mañana para continuar tu racha 🔥</p>
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
