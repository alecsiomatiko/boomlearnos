"use client"

import { Lock, ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { User } from "@/types"
import { cn } from "@/lib/utils"
import { allBadges } from "@/lib/badges-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BadgesPanelProps {
  user: User | null
  completedTasks: number
}

export function BadgesPanel({ user, completedTasks }: BadgesPanelProps) {
  const userBadges = user?.badges || []

  return (
    <Card className="col-span-1 lg:col-span-2 bg-card/60 backdrop-blur-lg border-white/10 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-white">Insignias y Logros</CardTitle>
        <Button
          asChild
          variant="ghost"
          className="text-sm text-kalabasboom-red hover:text-kalabasboom-red hover:bg-kalabasboom-red/10"
        >
          <Link href="/dashboard/medallas">
            Ver todas <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4 pt-2">
          {allBadges.slice(0, 3).map((badge) => {
            const hasBadge = userBadges.includes(badge.id)
            const progress = hasBadge ? 100 : Math.min((completedTasks / badge.unlocksAt) * 100, 100)

            return (
              <div key={badge.id} className="flex items-center gap-4">
                <div className={cn("p-3 rounded-full bg-white/10", hasBadge && "bg-kalabasboom-red/20")}>
                  {hasBadge ? (
                    <badge.icon className={cn("h-6 w-6", badge.color)} />
                  ) : (
                    <Lock className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{badge.name}</h3>
                  <p className="text-xs text-gray-400">{badge.description}</p>
                  {!hasBadge && (
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={progress} className="[&>*]:bg-kalabasboom-red" />
                      <span className="text-xs font-mono text-gray-400">
                        {completedTasks}/{badge.unlocksAt}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
