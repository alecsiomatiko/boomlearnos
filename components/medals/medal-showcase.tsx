"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import type { Medal } from "@/components/medals/medal-card"
import { formatDate } from "@/lib/utils"

interface MedalShowcaseProps {
  medal: Medal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MedalShowcase({ medal, open, onOpenChange }: MedalShowcaseProps) {
  const [animationComplete, setAnimationComplete] = useState(false)

  if (!medal) return null

  const getLevelColor = () => {
    switch (medal.level) {
      case "bronze":
        return "from-amber-500 to-amber-700"
      case "silver":
        return "from-slate-300 to-slate-500"
      case "gold":
        return "from-yellow-300 to-yellow-500"
      case "platinum":
        return "from-cyan-200 to-cyan-400"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Medalla Desbloqueada</DialogTitle>
          <DialogDescription>Has desbloqueado una nueva medalla para tu colección.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <AnimatePresence>
            <motion.div
              key={medal.id}
              initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotateY: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  duration: 0.8,
                },
              }}
              onAnimationComplete={() => setAnimationComplete(true)}
              className={`w-32 h-32 rounded-full bg-gradient-to-br ${getLevelColor()} flex items-center justify-center text-white shadow-lg`}
            >
              <div className="text-5xl">{medal.icon}</div>
            </motion.div>
          </AnimatePresence>

          {animationComplete && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.3 },
                }}
                className="mt-6 text-center"
              >
                <h3 className="text-xl font-bold">{medal.name}</h3>
                <div className="mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Nivel: {getLevelText()}
                </div>
                <p className="mt-3 text-muted-foreground">{medal.description}</p>
                {medal.unlockedAt && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Desbloqueada el {formatDate(new Date(medal.unlockedAt))}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { delay: 0.6 },
                }}
                className="mt-6 flex justify-center"
              >
                <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  ¡Sigue así para desbloquear más medallas!
                </div>
              </motion.div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
