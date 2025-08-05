"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, MoreHorizontal, Trophy } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import type { Task } from "@/types"
import { ConfettiExplosion } from "@/components/confetti-explosion"
import { RewardAnimation } from "@/components/animations/reward-animation"
import { IntegratedBadge } from "@/components/badges/integrated-badge"
import { TaskDetailsModal } from "@/components/dashboard/task-details-modal"
import { addUserPoints } from "@/lib/data-utils"
import { toast } from "sonner"

interface DailyQuestsProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
  onTaskSelect: (task: Task) => void
  onNewTask: () => void
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
      return "bg-gray-500"
  }
}

export function DailyQuests({ tasks, onTaskUpdate, onTaskSelect, onNewTask }: DailyQuestsProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [rewardData, setRewardData] = useState({ title: "", description: "", points: 0 })
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [unlockedBadgeId, setUnlockedBadgeId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)

  const pendingTasks = tasks.filter((task) => task.status !== "completed")
  const completedTasksCount = tasks.filter((task) => task.status === "completed").length

  const triggerCelebration = (task: Task) => {
    const pointsEarned = task.points || 50
    addUserPoints(pointsEarned)

    setShowConfetti(true)
    setRewardData({
      title: "¡Misión Completada!",
      description: `Has completado: ${task.title}`,
      points: pointsEarned,
    })
    setShowReward(true)

    toast.success(`¡Completaste "${task.title}"! +${pointsEarned} puntos`, {
      duration: 3000,
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
    })

    const newCompletedCount = completedTasksCount + 1
    if (newCompletedCount === 3) {
      setTimeout(() => {
        setUnlockedBadgeId("starter_badge")
        setShowBadgeModal(true)
      }, 2000)
    } else if (newCompletedCount === 10) {
      setTimeout(() => {
        setUnlockedBadgeId("task_master_bronze")
        setShowBadgeModal(true)
      }, 2000)
    } else if (newCompletedCount === 25) {
      setTimeout(() => {
        setUnlockedBadgeId("task_master_silver")
        setShowBadgeModal(true)
      }, 2000)
    }

    setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleCompleteClick = (task: Task) => {
    const updatedTask = {
      ...task,
      status: "completed" as const,
      completionPercentage: 100,
      updatedAt: new Date().toISOString(),
    }
    onTaskUpdate(updatedTask)
    triggerCelebration(task)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    onTaskUpdate(updatedTask)
    if (updatedTask.completionPercentage === 100 && updatedTask.status === "completed") {
      triggerCelebration(updatedTask)
    }
  }

  return (
    <>
      {showConfetti && <ConfettiExplosion onComplete={() => setShowConfetti(false)} />}

      <AnimatePresence>
        {showReward && (
          <RewardAnimation
            {...rewardData}
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

      <TaskDetailsModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(null)
        }}
        onUpdate={handleTaskUpdate}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Misiones Diarias.</h3>
          <Button
            onClick={onNewTask}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-2 font-semibold"
          >
            Nueva Tarea
          </Button>
        </div>

        <div className="space-y-3">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border-0 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <div className="w-20">
                  <Progress value={task.completionPercentage} className="h-2 bg-gray-200 [&>*]:bg-red-500" />
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+{task.points} Gemas</p>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                  onClick={() => handleEditTask(task)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="icon"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full h-8 w-8 shadow-lg"
                    onClick={() => handleCompleteClick(task)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}
