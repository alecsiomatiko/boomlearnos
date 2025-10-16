"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, Star, Trophy, Coins, ShoppingCart, Clock, Zap, Target, Award, Crown, Gem } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { authFetch } from "@/lib/auth-utils"
import { ConfettiExplosion } from "@/components/confetti-explosion"
import { toast } from "sonner"

interface Reward {
  id: number
  title: string
  description: string
  cost: number
  category: string
  rarity: string
  icon: string
  available: boolean
  canAfford: boolean
  claimedByUser: number
  stock?: number
  maxClaimsPerUser?: number
}

interface UserGems {
  total: number
  available: number
}

interface RewardStats {
  totalClaimed: number
  totalSpent: number
}

const iconMap: { [key: string]: any } = {
  Clock,
  Gift,
  Target,
  Zap,
  Award,
  Trophy,
  Crown,
  Star,
  Coins,
  Gem
}

export default function RecompensasPage() {
  const { user } = useAuth()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [userGems, setUserGems] = useState<UserGems>({ total: 0, available: 0 })
  const [stats, setStats] = useState<RewardStats>({ totalClaimed: 0, totalSpent: 0 })
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<number | null>(null)
  const [showConfetti, setShowConfetti] = useState(false) // 🎉 CONFETI

  useEffect(() => {
    async function fetchRewards() {
      if (!user?.id) return
      
      try {
        console.log('🎁 [RECOMPENSAS] Cargando recompensas del usuario:', user.id)
        const response = await authFetch(`/api/rewards?userId=${user.id}&category=${selectedCategory}`)
        const data = await response.json()
        
        if (data.success) {
          console.log('✅ [RECOMPENSAS] Recompensas cargadas:', data.data.rewards.length)
          setRewards(data.data.rewards)
          setUserGems(data.data.userGems)
          setStats(data.data.stats)
        } else {
          console.error('❌ [RECOMPENSAS] Error:', data.error)
        }
      } catch (error) {
        console.error('❌ [RECOMPENSAS] Error al cargar recompensas:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRewards()
  }, [user?.id, selectedCategory])

  const handleClaimReward = async (rewardId: number) => {
    if (!user?.id || claiming) return
    
    setClaiming(rewardId)
    try {
      const response = await authFetch('/api/rewards', {
        method: 'POST',
        body: JSON.stringify({ rewardId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ [RECOMPENSAS] Recompensa canjeada exitosamente')
        
        // 🎉 MOSTRAR CONFETI
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
        
        // Mostrar toast de éxito
        toast.success(`¡Recompensa canjeada! 🎉`, {
          description: data.data.message,
          duration: 5000,
        })
        
        // Recargar datos
        const refreshResponse = await authFetch(`/api/rewards?userId=${user.id}&category=${selectedCategory}`)
        const refreshData = await refreshResponse.json()
        
        if (refreshData.success) {
          setRewards(refreshData.data.rewards)
          setUserGems(refreshData.data.userGems)
          setStats(refreshData.data.stats)
        }
      } else {
        console.error('❌ [RECOMPENSAS] Error al canjear:', data.error)
        toast.error('Error al canjear recompensa', {
          description: data.error,
        })
      }
    } catch (error) {
      console.error('❌ [RECOMPENSAS] Error:', error)
      toast.error('Error', {
        description: 'Error al procesar la solicitud',
      })
    } finally {
      setClaiming(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "Común"
      case "rare":
        return "Raro"
      case "epic":
        return "Épico"
      case "legendary":
        return "Legendario"
      default:
        return "Común"
    }
  }

  const categories = [
    { key: "all", label: "Todas", icon: <Gift className="h-4 w-4" /> },
    { key: "tiempo", label: "Tiempo", icon: <Clock className="h-4 w-4" /> },
    { key: "experiencia", label: "Experiencias", icon: <Star className="h-4 w-4" /> },
    { key: "desarrollo", label: "Desarrollo", icon: <Target className="h-4 w-4" /> },
    { key: "tecnologia", label: "Tecnología", icon: <Zap className="h-4 w-4" /> },
  ]

  const filteredRewards =
    selectedCategory === "all" ? rewards : rewards.filter((reward) => reward.category === selectedCategory)

  const userPoints = userGems?.total || user?.total_gems || 0

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* 🎉 CONFETI */}
      {showConfetti && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <ConfettiExplosion trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            
            <h1 className="text-4xl font-bold text-gray-900 text-left">Recompensas</h1>
          </div>
          
        </div>

        {/* Points Overview */}
        <Card className="bg-gradient-to-r from-brand-red to-red-600 text-white shadow-lg border-0 rounded-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Tus Puntos KalabasBoom</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Coins className="h-8 w-8" />
                    <span className="text-4xl font-bold">{userPoints.toLocaleString()}</span>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    Nivel {typeof user.level === 'string' ? user.level.replace("_", " ").toUpperCase() : "INTERN"}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 mb-2">Próximo nivel en</p>
                <p className="text-2xl font-bold">
                  {Math.max(
                    0,
                    (user.level === "intern"
                      ? 100
                      : user.level === "starter"
                        ? 500
                        : user.level === "builder"
                          ? 1500
                          : user.level === "strategist"
                            ? 3000
                            : 5000) - userPoints,
                  )}{" "}
                  puntos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-2xl p-2 shadow-lg border-0">
            <TabsTrigger
              value="rewards"
              className="rounded-xl data-[state=active]:bg-brand-red data-[state=active]:text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Tienda de Recompensas
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="rounded-xl data-[state=active]:bg-brand-red data-[state=active]:text-white"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Logros y Medallas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards" className="space-y-6">
            {/* Category Filter */}
            <Card className="bg-white shadow-lg border-0 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.key}
                      variant={selectedCategory === category.key ? "default" : "outline"}
                      className={`rounded-xl ${
                        selectedCategory === category.key
                          ? "bg-brand-red text-white"
                          : "border-gray-200 hover:border-brand-red hover:text-brand-red"
                      }`}
                      onClick={() => setSelectedCategory(category.key)}
                    >
                      {category.icon}
                      <span className="ml-2">{category.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rewards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className={`shadow-lg border-0 rounded-2xl transition-all duration-300 hover:shadow-xl ${
                      reward.available ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 rounded-xl ${
                              reward.available ? "bg-brand-red text-white" : "bg-gray-300 text-gray-500"
                            }`}
                          >
                            {reward.icon}
                          </div>
                          <div>
                            <CardTitle
                              className={`text-lg font-bold ${reward.available ? "text-gray-900" : "text-gray-500"}`}
                            >
                              {reward.title}
                            </CardTitle>
                            <Badge className={getRarityColor(reward.rarity)}>{getRarityText(reward.rarity)}</Badge>
                          </div>
                        </div>
                        {!reward.available && <Badge className="bg-red-100 text-red-800 border-red-200">Agotado</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className={`text-sm ${reward.available ? "text-gray-600" : "text-gray-400"}`}>
                        {reward.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className={`h-5 w-5 ${reward.available ? "text-yellow-500" : "text-gray-400"}`} />
                          <span className={`font-bold text-lg ${reward.available ? "text-gray-900" : "text-gray-500"}`}>
                            {reward.cost.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {reward.claimedByUser || 0} canjeados
                          {reward.maxClaimsPerUser && ` / ${reward.maxClaimsPerUser} máximo`}
                        </div>
                      </div>

                      <Button
                        className={`w-full rounded-xl ${
                          reward.available && userPoints >= reward.cost
                            ? "bg-brand-red hover:bg-red-600 text-white"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!reward.available || userPoints < reward.cost || claiming === reward.id}
                        onClick={() => handleClaimReward(reward.id)}
                      >
                        {claiming === reward.id 
                          ? "Canjeando..." 
                          : !reward.available 
                            ? "Agotado" 
                            : userPoints < reward.cost 
                              ? "Puntos Insuficientes" 
                              : "Canjear"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="text-center py-12">
              <h3 className="text-xl text-gray-600">Logros relacionados con recompensas próximamente</h3>
              <p className="text-gray-500 mt-2">Esta sección se integrará con el módulo de logros</p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
