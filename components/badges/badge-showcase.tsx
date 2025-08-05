"use client"

import { useState } from "react"
import { DraggableBadge } from "./draggable-badge"
import { Button } from "@/components/ui/button"
import { Award, Medal, Trophy } from "lucide-react"

export function BadgeShowcase() {
  const [selectedBadge, setSelectedBadge] = useState("starter")

  const badges = [
    {
      id: "starter",
      name: "Iniciador Boom",
      level: "starter",
      number: "#000001",
    },
    {
      id: "bronze",
      name: "Bronce Kalabas",
      level: "bronze",
      number: "#000023",
    },
    {
      id: "silver",
      name: "Plata Boom",
      level: "silver",
      number: "#000045",
    },
    {
      id: "gold",
      name: "Oro Kalabas",
      level: "gold",
      number: "#000067",
    },
    {
      id: "platinum",
      name: "Platino Boom",
      level: "platinum",
      number: "#000089",
    },
  ]

  const getBadgeIcon = (level: string) => {
    switch (level) {
      case "starter":
        return <Trophy className="h-4 w-4" />
      case "bronze":
      case "silver":
      case "gold":
        return <Medal className="h-4 w-4" />
      case "platinum":
        return <Award className="h-4 w-4" />
      default:
        return <Trophy className="h-4 w-4" />
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-8">Colección de Badges</h2>

      <div className="mb-8">
        <DraggableBadge
          badgeId={selectedBadge}
          badgeName={badges.find((b) => b.id === selectedBadge)?.name || "Iniciador Boom"}
          badgeLevel={selectedBadge as any}
          badgeNumber={badges.find((b) => b.id === selectedBadge)?.number || "#000001"}
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {badges.map((badge) => (
          <Button
            key={badge.id}
            variant={selectedBadge === badge.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedBadge(badge.id)}
            className="flex items-center gap-2"
          >
            {getBadgeIcon(badge.level)}
            {badge.level.charAt(0).toUpperCase() + badge.level.slice(1)}
          </Button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground text-center max-w-md">
        ¡Arrastra la badge para verla en acción! Las partículas de lava se mueven dentro de la badge y la cuerda se
        estira de forma realista.
      </p>
    </div>
  )
}
