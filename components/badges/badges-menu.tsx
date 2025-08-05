"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Award, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { BadgeModal } from "./badge-modal"

interface Badge {
  id: string
  name: string
  description: string
  level: "starter" | "bronze" | "silver" | "gold" | "platinum"
}

interface BadgesMenuProps {
  badges: Badge[]
}

export function BadgesMenu({ badges }: BadgesMenuProps) {
  const router = useRouter()
  const [showBadgesMenu, setShowBadgesMenu] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [showBadgeModal, setShowBadgeModal] = useState(false)

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge)
    setShowBadgesMenu(false)
    setShowBadgeModal(true)
  }

  return (
    <>
      <DropdownMenu open={showBadgesMenu} onOpenChange={setShowBadgesMenu}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Mis Badges
            {badges.length > 0 && (
              <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {badges.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Mis Badges</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {badges.length > 0 ? (
            badges.map((badge) => (
              <DropdownMenuItem
                key={badge.id}
                className="flex items-center gap-2 py-2 cursor-pointer"
                onClick={() => handleBadgeClick(badge)}
              >
                <div className="bg-red-600 text-white p-1 rounded-md">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-xs text-gray-500 truncate">{badge.description}</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-gray-500">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Aún no has desbloqueado ningún badge</p>
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-center justify-center"
            onClick={() => {
              setShowBadgesMenu(false)
              router.push("/dashboard/medallas")
            }}
          >
            Ver todos los badges
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedBadge && (
        <BadgeModal
          show={showBadgeModal}
          badgeId={selectedBadge.id}
          badgeName={selectedBadge.name}
          badgeDescription={selectedBadge.description}
          badgeLevel={selectedBadge.level}
          onClose={() => setShowBadgeModal(false)}
        />
      )}
    </>
  )
}
