"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { User } from "@/types"
import { allBadges } from "@/lib/badges-data"
import { cn } from "@/lib/utils"

interface BadgeSummaryCardProps {
  user: User | null
}

export function BadgeSummaryCard({ user }: BadgeSummaryCardProps) {
  const userBadges = user?.badges || []
  const unlockedBadges = allBadges.filter((badge) => userBadges.includes(badge.id))
  const totalBadges = allBadges.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-full"
    >
      <Card className="bg-gray-800 text-white rounded-2xl p-6 shadow-lg h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Insignias y Logros</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div className="text-2xl font-bold">
            {unlockedBadges.length}/{totalBadges}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Insignias desbloqueadas</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {unlockedBadges.slice(0, 3).map((badge) => (
              <div key={badge.id} className={cn("p-2 rounded-full bg-white/10", badge.color)}>
                <badge.icon className="h-5 w-5" />
              </div>
            ))}
            {unlockedBadges.length === 0 && (
              <div className="flex items-center text-gray-400 text-sm">
                <Lock className="h-4 w-4 mr-1" />
                <span>Ninguna aún</span>
              </div>
            )}
          </div>
          <Button asChild variant="outline" size="sm" className="mt-4 w-full bg-transparent">
            <Link href="/dashboard/medallas">Ver todas</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
