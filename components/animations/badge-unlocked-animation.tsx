"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ConfettiExplosion } from "@/components/confetti-explosion"
import { Award, Star, Trophy, Medal } from "lucide-react"
import { cn } from "@/lib/utils"

interface BadgeUnlockedAnimationProps {
  show: boolean
  badgeName: string
  badgeDescription?: string
  badgeType?: "starter" | "bronze" | "silver" | "gold" | "platinum"
  onClose?: () => void
}

export function BadgeUnlockedAnimation({
  show,
  badgeName,
  badgeDescription,
  badgeType = "starter",
  onClose,
}: BadgeUnlockedAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setShowConfetti(true)

      // Reproducir sonido de logro
      const audio = new Audio("/sounds/badge-unlocked.mp3")
      audio.volume = 0.6
      audio.play().catch((e) => console.log("Audio play failed:", e))

      // Cerrar automáticamente después de un tiempo
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onClose) onClose()
      }, 7000)

      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  const getBadgeIcon = () => {
    switch (badgeType) {
      case "starter":
        return <Trophy className="h-16 w-16 text-yellow-500" />
      case "bronze":
        return <Medal className="h-16 w-16 text-amber-700" />
      case "silver":
        return <Medal className="h-16 w-16 text-gray-400" />
      case "gold":
        return <Medal className="h-16 w-16 text-yellow-500" />
      case "platinum":
        return <Award className="h-16 w-16 text-blue-300" />
      default:
        return <Star className="h-16 w-16 text-yellow-500" />
    }
  }

  const getBadgeColor = () => {
    switch (badgeType) {
      case "starter":
        return "from-yellow-400 to-orange-600"
      case "bronze":
        return "from-amber-600 to-amber-800"
      case "silver":
        return "from-gray-400 to-gray-600"
      case "gold":
        return "from-yellow-400 to-yellow-600"
      case "platinum":
        return "from-blue-400 to-indigo-600"
      default:
        return "from-purple-500 to-purple-700"
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          {showConfetti && (
            <ConfettiExplosion
              particleCount={300}
              force={0.8}
              duration={3000}
              onComplete={() => setShowConfetti(false)}
            />
          )}

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
              },
            }}
            exit={{
              scale: 1.2,
              opacity: 0,
              transition: { duration: 0.3 },
            }}
            className="relative max-w-md w-full mx-4"
          >
            <div
              className={cn(
                "rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br",
                getBadgeColor(),
                "p-8 text-white",
              )}
            >
              <div className="absolute inset-0 bg-white/10 rounded-xl"></div>

              <div className="relative z-10">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      transition: { delay: 0.2 },
                    }}
                    className="text-center mb-6"
                  >
                    <h2 className="text-3xl font-bold mb-2">¡BADGE DESBLOQUEADO!</h2>
                    <p className="text-white/80">Has conseguido un nuevo logro</p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      transition: { delay: 0.4, duration: 0.5 },
                    }}
                    className="bg-white/20 rounded-full p-8 mb-6"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, -5, 5, -5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      }}
                    >
                      {getBadgeIcon()}
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      transition: { delay: 0.6 },
                    }}
                    className="text-center"
                  >
                    <h3 className="text-2xl font-bold mb-2">{badgeName}</h3>
                    {badgeDescription && <p className="text-white/90 mb-6">{badgeDescription}</p>}

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: { delay: 1 },
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsVisible(false)
                        if (onClose) onClose()
                      }}
                      className="bg-white text-gray-800 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      ¡Continuar!
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
