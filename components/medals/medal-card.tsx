"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface Medal {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  level: "bronze" | "silver" | "gold" | "platinum"
  unlockedAt?: string
  unlocked: boolean
}

interface MedalCardProps {
  medal: Medal
  onClick?: () => void
  className?: string
}

export function MedalCard({ medal, onClick, className }: MedalCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getBorderColor = () => {
    if (!medal.unlocked) return "border-gray-200 dark:border-gray-800"

    switch (medal.level) {
      case "bronze":
        return "border-amber-600"
      case "silver":
        return "border-slate-400"
      case "gold":
        return "border-yellow-400"
      case "platinum":
        return "border-cyan-300"
    }
  }

  const getBackgroundColor = () => {
    if (!medal.unlocked) return "bg-gray-100 dark:bg-gray-900"

    switch (medal.level) {
      case "bronze":
        return "bg-gradient-to-br from-amber-500/10 to-amber-700/10"
      case "silver":
        return "bg-gradient-to-br from-slate-300/10 to-slate-500/10"
      case "gold":
        return "bg-gradient-to-br from-yellow-300/10 to-yellow-500/10"
      case "platinum":
        return "bg-gradient-to-br from-cyan-200/10 to-cyan-400/10"
    }
  }

  const getIconBackground = () => {
    if (!medal.unlocked) return "bg-gray-200 dark:bg-gray-800"

    switch (medal.level) {
      case "bronze":
        return "bg-gradient-to-br from-amber-500 to-amber-700"
      case "silver":
        return "bg-gradient-to-br from-slate-300 to-slate-500"
      case "gold":
        return "bg-gradient-to-br from-yellow-300 to-yellow-500"
      case "platinum":
        return "bg-gradient-to-br from-cyan-200 to-cyan-400"
    }
  }

  const getLevelText = () => {
    switch (medal.level) {
      case "bronze":
        return "Bronce"
      case "silver":
        return "Plata"
      case "gold":
        return "Oro"
      case "platinum":
        return "Platino"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 border-2",
        getBorderColor(),
        getBackgroundColor(),
        medal.unlocked ? "cursor-pointer" : "opacity-70",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={medal.unlocked ? onClick : undefined}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <motion.div
          animate={
            isHovered && medal.unlocked
              ? {
                  rotate: [0, -5, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
          className={cn(
            "flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white",
            getIconBackground(),
          )}
        >
          {medal.unlocked ? (
            medal.icon
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          )}
        </motion.div>

        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold">{medal.name}</h3>
            <Badge variant="outline" className={cn("ml-2", medal.unlocked ? "border-current" : "text-gray-400")}>
              {getLevelText()}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mt-1">{medal.description}</p>

          {medal.unlocked && medal.unlockedAt && (
            <p className="text-xs text-muted-foreground mt-2">Desbloqueada el {formatDate(medal.unlockedAt)}</p>
          )}
        </div>
      </CardContent>

      {isHovered && medal.unlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/5 flex items-center justify-center"
        >
          <span className="text-sm font-medium">Ver detalles</span>
        </motion.div>
      )}
    </Card>
  )
}
