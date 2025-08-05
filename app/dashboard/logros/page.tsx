"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, Award, Target, Crown, Medal, Flame, Users } from "lucide-react"
import { IntegratedBadge } from "@/components/badges/integrated-badge"
import { initializeAndGetUserData, getTasks } from "@/lib/data-utils"
import type { User, Task } from "@/types"
import Image from "next/image"

// Mock data para logros
const achievements = [
  {
    id: "first_task",
    name: "Primera Misión",
    description: "Completa tu primera tarea",
    icon: Target,
    category: "Inicio",
    points: 50,
    unlocked: true,
    unlockedAt: "2024-01-15",
    rarity: "common",
    progress: 100,
    maxProgress: 100,
  },
  {
    id: "task_master_bronze",
    name: "Maestro de Tareas - Bronce",
    description: "Completa 10 tareas",
    icon: Medal,
    category: "Productividad",
    points: 100,
    unlocked: true,
    unlockedAt: "2024-01-20",
    rarity: "uncommon",
    progress: 10,
    maxProgress: 10,
  },
  {
    id: "task_master_silver",
    name: "Maestro de Tareas - Plata",
    description: "Completa 25 tareas",
    icon: Medal,
    category: "Productividad",
    points: 250,
    unlocked: false,
    rarity: "rare",
    progress: 18,
    maxProgress: 25,
  },
  {
    id: "task_master_gold",
    name: "Maestro de Tareas - Oro",
    description: "Completa 50 tareas",
    icon: Medal,
    category: "Productividad",
    points: 500,
    unlocked: false,
    rarity: "epic",
    progress: 18,
    maxProgress: 50,
  },
  {
    id: "streak_master",
    name: "Racha Perfecta",
    description: "Mantén una racha de 7 días completando tareas",
    icon: Flame,
    category: "Consistencia",
    points: 200,
    unlocked: false,
    rarity: "rare",
    progress: 3,
    maxProgress: 7,
  },
  {
    id: "team_player",
    name: "Jugador de Equipo",
    description: "Colabora en 5 proyectos de equipo",
    icon: Users,
    category: "Colaboración",
    points: 150,
    unlocked: false,
    rarity: "uncommon",
    progress: 2,
    maxProgress: 5,
  },
  {
    id: "productivity_master",
    name: "Maestro de Productividad",
    description: "Completa 100 tareas en total",
    icon: Award,
    category: "Productividad",
    points: 1000,
    unlocked: false,
    rarity: "legendary",
    progress: 18,
    maxProgress: 100,
  },
  {
    id: "early_bird",
    name: "Madrugador",
    description: "Completa 10 tareas antes de las 9 AM",
    icon: Star,
    category: "Hábitos",
    points: 300,
    unlocked: false,
    rarity: "rare",
    progress: 2,
    maxProgress: 10,
  },
  {
    id: "empire_builder",
    name: "Constructor de Imperio",
    description: "Alcanza el nivel Empire Master",
    icon: Crown,
    category: "Progresión",
    points: 2000,
    unlocked: false,
    rarity: "legendary",
    progress: 0,
    maxProgress: 1,
  },
]

export default function LogrosPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const [showBadgeModal, setShowBadgeModal] = useState(false)

  useEffect(() => {
    const currentUser = initializeAndGetUserData()
    setUser(currentUser)
    const userTasks = getTasks()
    setTasks(userTasks)
  }, [])

  const completedTasksCount = tasks.filter((task) => task.status === "completed").length
  const totalPoints = user?.points || 0
  const totalGems = 120000
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length
  const totalAchievements = 20

  const handleBadgeClick = (badgeId: string) => {
    setSelectedBadge(badgeId)
    setShowBadgeModal(true)
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <>
      {/* Badge Modal */}
      {selectedBadge && (
        <IntegratedBadge
          show={showBadgeModal}
          badgeId={selectedBadge}
          badgeName="STARTER"
          badgeLevel="starter"
          onClose={() => {
            setShowBadgeModal(false)
            setSelectedBadge(null)
          }}
        />
      )}

      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex gap-6">
          {/* Logros Section */}
          <Card className="flex-1 bg-red-500 border-0 rounded-3xl shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h1 className="text-4xl font-bold">Logros</h1>
                </div>
                <div className="flex items-center gap-6">
                  {/* Gem Icon */}
                  <div className="w-16 h-16 flex items-center justify-center">
                    <Image src="/images/gem-icon.png" alt="Gem Icon" width={64} height={64} className="w-16 h-16" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Gemas: {totalGems.toLocaleString()}</h2>
                    <p className="text-xl opacity-90">
                      Desbloqueados: {unlockedAchievements}/{totalAchievements}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metas Section */}
          <Card className="w-64 bg-white border-0 rounded-3xl shadow-lg">
            <CardContent className="p-8 flex items-center justify-center">
              <h2 className="text-3xl font-bold text-gray-900">Metas</h2>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <Card
              key={achievement.id}
              className="bg-white border-0 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => handleBadgeClick(achievement.id)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Achievement Title */}
                  <h3 className="text-2xl font-bold text-gray-900">{achievement.name}</h3>

                  {/* Description */}
                  <p className="text-gray-500 text-sm">{achievement.description}</p>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress
                      value={achievement.progress ? (achievement.progress / achievement.maxProgress) * 100 : 75}
                      className="h-2 bg-gray-200"
                      style={
                        {
                          "--progress-background": "#22c55e",
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  {/* Gems */}
                  <div className="flex items-center gap-2">
                    <Image src="/images/gem-icon.png" alt="Gem" width={24} height={24} className="w-6 h-6" />
                    <span className="text-lg font-semibold text-gray-700">{achievement.points}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <style jsx>{`
        .progress-bar {
          background-color: #22c55e !important;
        }
      `}</style>
    </>
  )
}
