"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, Award, Target, Crown, Medal, Flame, Users } from "lucide-react"
import { IntegratedBadge } from "@/components/badges/integrated-badge"
import { useAuth } from "@/contexts/auth-context"
import { authFetch } from "@/lib/auth-utils"
import Image from "next/image"

interface Achievement {
  id: string
  name: string
  description: string
  category: string
  points: number
  rarity: string
  icon: string
  progress: number
  maxProgress: number
  completed: boolean
  unlockedAt?: string
}

interface AchievementStats {
  completedAchievements: number
  totalAchievements: number
  totalPoints: number
}

const iconMap = {
  Target,
  Medal, 
  Award,
  Star,
  Crown,
  Flame,
  Users
}

export default function LogrosPage() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<AchievementStats | null>(null)
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAchievements() {
      if (!user?.id) return
      
      try {
        console.log('🏆 [LOGROS] Cargando logros del usuario:', user.id)
        const response = await authFetch(`/api/achievements?userId=${user.id}`)
        const data = await response.json()
        
        if (data.success) {
          console.log('✅ [LOGROS] Logros cargados:', data.data.achievements.length)
          setAchievements(data.data.achievements)
          setStats(data.data.stats)
        } else {
          console.error('❌ [LOGROS] Error:', data.error)
        }
      } catch (error) {
        console.error('❌ [LOGROS] Error al cargar logros:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAchievements()
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

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
                    <h2 className="text-3xl font-bold">Gemas: {user?.total_gems?.toLocaleString() || 0}</h2>
                    <p className="text-xl opacity-90">
                      Desbloqueados: {stats?.completedAchievements || 0}/{stats?.totalAchievements || 0}
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
              className={`bg-white border-0 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                achievement.completed ? 'ring-2 ring-green-400' : ''
              }`}
              onClick={() => handleBadgeClick(achievement.id)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Achievement Status */}
                  {achievement.completed && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Award className="w-5 h-5" />
                      <span className="text-sm font-medium">¡Completado!</span>
                    </div>
                  )}
                  
                  {/* Achievement Title */}
                  <h3 className="text-2xl font-bold text-gray-900">{achievement.name}</h3>

                  {/* Description */}
                  <p className="text-gray-500 text-sm">{achievement.description}</p>

                  {/* Progress Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Progreso: {achievement.progress}/{achievement.maxProgress}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      achievement.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                      achievement.rarity === 'epic' ? 'bg-orange-100 text-orange-800' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      achievement.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {achievement.rarity}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress
                      value={achievement.maxProgress > 0 ? (achievement.progress / achievement.maxProgress) * 100 : 0}
                      className="h-2 bg-gray-200"
                      style={
                        {
                          "--progress-background": achievement.completed ? "#22c55e" : "#3b82f6",
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  {/* Gems */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image src="/images/gem-icon.png" alt="Gem" width={24} height={24} className="w-6 h-6" />
                      <span className="text-lg font-semibold text-gray-700">{achievement.points}</span>
                    </div>
                    <span className="text-xs text-gray-500 capitalize">{achievement.category}</span>
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
