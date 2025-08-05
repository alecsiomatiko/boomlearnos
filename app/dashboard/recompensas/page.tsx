"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, Star, Trophy, Coins, ShoppingCart, Clock, Zap, Target, Award, Crown, Gem } from "lucide-react"
import { initializeAndGetUserData } from "@/lib/data-utils"
import type { User } from "@/types"

export default function RecompensasPage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const currentUser = initializeAndGetUserData()
    setUser(currentUser)
  }, [])

  const rewards = [
    {
      id: 1,
      title: "Día Libre Extra",
      description: "Un día libre adicional para disfrutar",
      cost: 500,
      category: "tiempo",
      rarity: "common",
      icon: <Clock className="h-6 w-6" />,
      available: true,
      claimed: 0,
      limit: 2,
    },
    {
      id: 2,
      title: "Almuerzo Premium",
      description: "Almuerzo en restaurante de lujo para 2 personas",
      cost: 300,
      category: "experiencia",
      rarity: "rare",
      icon: <Gift className="h-6 w-6" />,
      available: true,
      claimed: 1,
      limit: 3,
    },
    {
      id: 3,
      title: "Curso Online Premium",
      description: "Acceso a cualquier curso de desarrollo profesional",
      cost: 800,
      category: "desarrollo",
      rarity: "epic",
      icon: <Target className="h-6 w-6" />,
      available: true,
      claimed: 0,
      limit: 1,
    },
    {
      id: 4,
      title: "Gadget Tecnológico",
      description: "Auriculares inalámbricos de alta gama",
      cost: 1200,
      category: "tecnologia",
      rarity: "legendary",
      icon: <Zap className="h-6 w-6" />,
      available: true,
      claimed: 0,
      limit: 1,
    },
    {
      id: 5,
      title: "Trabajo Remoto Semanal",
      description: "Una semana completa de trabajo desde casa",
      cost: 400,
      category: "tiempo",
      rarity: "rare",
      icon: <Clock className="h-6 w-6" />,
      available: false,
      claimed: 2,
      limit: 2,
    },
    {
      id: 6,
      title: "Certificación Profesional",
      description: "Pago completo de certificación en tu área",
      cost: 1500,
      category: "desarrollo",
      rarity: "legendary",
      icon: <Award className="h-6 w-6" />,
      available: true,
      claimed: 0,
      limit: 1,
    },
  ]

  const achievements = [
    {
      id: 1,
      title: "Primera Misión",
      description: "Completa tu primera tarea",
      points: 50,
      unlocked: true,
      icon: <Star className="h-5 w-5" />,
      rarity: "common",
    },
    {
      id: 2,
      title: "Racha de 7 Días",
      description: "Completa tareas durante 7 días consecutivos",
      points: 200,
      unlocked: true,
      icon: <Trophy className="h-5 w-5" />,
      rarity: "rare",
    },
    {
      id: 3,
      title: "Maestro de Tareas",
      description: "Completa 50 tareas en total",
      points: 500,
      unlocked: false,
      progress: 24,
      total: 50,
      icon: <Crown className="h-5 w-5" />,
      rarity: "epic",
    },
    {
      id: 4,
      title: "Perfeccionista",
      description: "Completa 10 tareas con calificación perfecta",
      points: 300,
      unlocked: false,
      progress: 3,
      total: 10,
      icon: <Gem className="h-5 w-5" />,
      rarity: "legendary",
    },
  ]

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

  const userPoints = user?.points || 0

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
                    Nivel {user.level?.replace("_", " ").toUpperCase() || "INTERN"}
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
                          {reward.claimed}/{reward.limit} canjeados
                        </div>
                      </div>

                      <Button
                        className={`w-full rounded-xl ${
                          reward.available && userPoints >= reward.cost
                            ? "bg-brand-red hover:bg-red-600 text-white"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!reward.available || userPoints < reward.cost}
                      >
                        {!reward.available ? "Agotado" : userPoints < reward.cost ? "Puntos Insuficientes" : "Canjear"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className={`shadow-lg border-0 rounded-2xl ${achievement.unlocked ? "bg-white" : "bg-gray-50"}`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 rounded-xl ${
                              achievement.unlocked ? "bg-yellow-500 text-white" : "bg-gray-300 text-gray-500"
                            }`}
                          >
                            {achievement.icon}
                          </div>
                          <div>
                            <CardTitle
                              className={`text-lg font-bold ${
                                achievement.unlocked ? "text-gray-900" : "text-gray-500"
                              }`}
                            >
                              {achievement.title}
                            </CardTitle>
                            <Badge className={getRarityColor(achievement.rarity)}>
                              {getRarityText(achievement.rarity)}
                            </Badge>
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Desbloqueado</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className={`text-sm ${achievement.unlocked ? "text-gray-600" : "text-gray-400"}`}>
                        {achievement.description}
                      </p>

                      {!achievement.unlocked && achievement.progress !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progreso</span>
                            <span className="font-semibold">
                              {achievement.progress}/{achievement.total}
                            </span>
                          </div>
                          <Progress value={(achievement.progress / achievement.total) * 100} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Coins className={`h-5 w-5 ${achievement.unlocked ? "text-yellow-500" : "text-gray-400"}`} />
                          <span className={`font-bold ${achievement.unlocked ? "text-gray-900" : "text-gray-500"}`}>
                            +{achievement.points} puntos
                          </span>
                        </div>
                        {achievement.unlocked && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Award className="h-3 w-3 mr-1" />
                            Completado
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
