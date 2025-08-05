"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface EKGChartProps {
  healthScore: number
  isLoading: boolean
}

export function EKGChart({ healthScore, isLoading }: EKGChartProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-400"
    if (score >= 50) return "text-yellow-400"
    return "text-red-500"
  }

  const getAnimationDuration = (score: number) => {
    if (score === 0) return 10 // Prevent division by zero and make it slow
    // Slower animation for higher (healthier) scores
    return 3 / (score / 50)
  }

  const color = getScoreColor(healthScore)
  const duration = getAnimationDuration(healthScore)

  const pathVariants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
      },
    },
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: duration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 400 150" className="w-full h-auto">
        {/* Grid lines */}
        <defs>
          <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(217, 33, 33, 0.1)" strokeWidth="0.5" />
          </pattern>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect width="50" height="50" fill="url(#smallGrid)" />
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(217, 33, 33, 0.2)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* EKG Path */}
        {!isLoading && (
          <motion.path
            d="M0 75 H50 L60 75 L70 50 L85 100 L100 75 L110 75 L120 65 L130 85 L140 75 H200 L210 75 L220 50 L235 100 L250 75 L260 75 L270 65 L280 85 L290 75 H350 L360 75 L370 50 L385 100 L400 75"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn("drop-shadow-[0_0_5px]", color)}
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50">
        <motion.div variants={pulseVariants} animate="pulse">
          <span className={cn("text-6xl font-bold tracking-tight", color)}>{isLoading ? "--" : healthScore}</span>
        </motion.div>
        <span className="text-sm font-medium text-gray-400 mt-1">Puntaje de Salud</span>
      </div>
    </div>
  )
}
