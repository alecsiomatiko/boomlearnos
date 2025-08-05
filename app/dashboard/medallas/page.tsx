"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Trophy, Shield, Calendar, Star, Clock, CheckCircle, Target, Crown } from "lucide-react"
import { BadgeModal } from "@/components/badges/badge-modal"
import { ConfettiExplosion } from "@/components/confetti-explosion"

interface Medal {
  id: string
  name: string
  description: string
  category: string
  level: "starter" | "bronze" | "silver" | "gold" | "platinum"
  icon: string
  unlockedAt: string | null
  requirement?: {
    type: string
    count: number
  }
}

export default function MedallasPage() {
  const [medals, setMedals] = useState<Medal[]>([])
  const [userMedals, setUserMedals] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedMedal, setSelectedMedal] = useState<Medal | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Simular carga de medallas
    const mockMedals: Medal[] = [
      {
        id: "starter_badge",
        name: "STARTER",
        description: "Completaste tus primeros pasos en KALABASBOOM OS",
        category: "progression",
        level: "starter",
        icon: "award",
        unlockedAt: new Date().toISOString(),
      },
      {
        id: "task_master_bronze",
        name: "Maestro de Tareas",
        description: "Completa 5 tareas",
        category: "productivity",
        level: "bronze",
        icon: "check-circle",
        unlockedAt: null,
        requirement: { type: "tasks", count: 5 },
      },
      {
        id: "task_master_silver",
        name: "Maestro de Tareas",
        description: "Completa 25 tareas",
        category: "productivity",
        level: "silver",
        icon: "check-circle",
        unlockedAt: null,
        requirement: { type: "tasks", count: 25 },
      },
      {
        id: "consistency_bronze",
        name: "Consistente",
        description: "Completa check-ins durante 7 días consecutivos",
        category: "consistency",
        level: "bronze",
        icon: "calendar",
        unlockedAt: null,
        requirement: { type: "checkins", count: 7 },
      },
      {
        id: "consistency_silver",
        name: "Hábito Establecido",
        description: "Realiza check-ins durante 30 días consecutivos",
        category: "consistency",
        level: "silver",
        icon: "calendar",
        unlockedAt: null,
        requirement: { type: "checkins", count: 30 },
      },
      {
        id: "builder_badge",
        name: "Constructor",
        description: "Alcanza el nivel Builder",
        category: "progression",
        level: "silver",
        icon: "tool",
        unlockedAt: null,
      },
      {
        id: "strategist_badge",
        name: "Estratega",
        description: "Alcanza el nivel Strategist",
        category: "progression",
        level: "gold",
        icon: "target",
        unlockedAt: null,
      },
      {
        id: "identity_creator",
        name: "Creador de Identidad",
        description: "Define la misión, visión y valores de tu empresa",
        category: "identity",
        level: "bronze",
        icon: "shield",
        unlockedAt: new Date().toISOString(),
      },
    ]

    setMedals(mockMedals)
    setUserMedals(["starter_badge", "identity_creator"])
  }, [])

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "award":
        return <Award className="h-6 w-6" />
      case "check-circle":
        return <CheckCircle className="h-6 w-6" />
      case "calendar":
        return <Calendar className="h-6 w-6" />
      case "tool":
        return <Star className="h-6 w-6" />
      case "target":
        return <Target className="h-6 w-6" />
      case "crown":
        return <Crown className="h-6 w-6" />
      case "shield":
        return <Shield className="h-6 w-6" />
      default:
        return <Trophy className="h-6 w-6" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "starter":
        return "bg-red-600"
      case "bronze":
        return "bg-amber-600"
      case "silver":
        return "bg-gray-400"
      case "gold":
        return "bg-yellow-500"
      case "platinum":
        return "bg-gray-300"
      default:
        return "bg-gray-600"
    }
  }

  const getLevelName = (level: string) => {
    switch (level) {
      case "starter":
        return "Starter"
      case "bronze":
        return "Bronce"
      case "silver":
        return "Plata"
      case "gold":
        return "Oro"
      case "platinum":
        return "Platino"
      default:
        return level
    }
  }

  const filteredMedals = medals.filter((medal) => {
    if (activeCategory === "all") return true
    if (activeCategory === "unlocked") return userMedals.includes(medal.id)
    if (activeCategory === "locked") return !userMedals.includes(medal.id)
    return medal.category === activeCategory
  })

  const handleMedalClick = (medal: Medal) => {
    setSelectedMedal(medal)
    if (userMedals.includes(medal.id)) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }

  return (
    <div className="container py-6">
      {showConfetti && <ConfettiExplosion particleCount={200} duration={5000} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medallas</h1>
          <p className="text-muted-foreground">
            Colecciona medallas completando tareas y alcanzando objetivos en KALABASBOOM OS.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 px-3 py-1">
            <Trophy className="h-4 w-4 mr-1 text-yellow-600" />
            <span>{userMedals.length} Medallas Desbloqueadas</span>
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unlocked">Desbloqueadas</TabsTrigger>
          <TabsTrigger value="locked">Por Desbloquear</TabsTrigger>
          <TabsTrigger value="progression">Progresión</TabsTrigger>
          <TabsTrigger value="productivity">Productividad</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedals.map((medal) => {
          const isUnlocked = userMedals.includes(medal.id)
          return (
            <Card
              key={medal.id}
              className={`overflow-hidden transition-all duration-300 hover:shadow-md ${
                isUnlocked ? "border-2 border-yellow-300" : "opacity-80"
              }`}
              onClick={() => handleMedalClick(medal)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className={`${getLevelColor(medal.level)} text-white border-0 px-2 py-0.5`}>
                    {getLevelName(medal.level)}
                  </Badge>
                  {isUnlocked && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Desbloqueada
                    </Badge>
                  )}
                </div>
                <CardTitle className="flex items-center gap-2 mt-2">
                  <div
                    className={`p-2 rounded-full ${isUnlocked ? getLevelColor(medal.level) : "bg-gray-200"} text-white`}
                  >
                    {getIconComponent(medal.icon)}
                  </div>
                  <span>{medal.name}</span>
                </CardTitle>
                <CardDescription>{medal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  {medal.requirement && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Target className="h-4 w-4 mr-1" />
                      <span>
                        Objetivo: {medal.requirement.count}{" "}
                        {medal.requirement.type === "tasks" ? "tareas" : "check-ins"}
                      </span>
                    </div>
                  )}
                  {isUnlocked ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(medal.unlockedAt!).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="text-xs">
                      Ver detalles
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedMedal && (
        <BadgeModal
          show={!!selectedMedal}
          badgeId={selectedMedal.id}
          badgeName={selectedMedal.name}
          badgeDescription={selectedMedal.description}
          badgeLevel={selectedMedal.level}
          onClose={() => setSelectedMedal(null)}
        />
      )}
    </div>
  )
}
