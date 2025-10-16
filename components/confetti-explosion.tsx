"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfettiExplosionProps {
  trigger: boolean
  onComplete: () => void
}

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  delay: number
}

const COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#eab308", // yellow-500
  "#22c55e", // green-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
]

export function ConfettiExplosion({ trigger, onComplete }: ConfettiExplosionProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true)

      // Generate confetti pieces - MÁS PARTÍCULAS Y MÁS GRANDES
      const pieces: ConfettiPiece[] = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -50, // Empezar desde arriba
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 20 + 10, // Tamaño entre 10-30px (antes 4-12px)
        delay: Math.random() * 0.3,
      }))

      setConfetti(pieces)

      // Clean up after animation
      const timer = setTimeout(() => {
        setConfetti([])
        setIsActive(false)
        onComplete()
      }, 4000) // 4 segundos (antes 3)

      return () => clearTimeout(timer)
    }
  }, [trigger, isActive, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: piece.x,
                y: piece.y,
                rotate: piece.rotation,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight + 100,
                x: piece.x + (Math.random() - 0.5) * 200, // Movimiento horizontal
                rotate: piece.rotation + 1080, // Más rotación (3 vueltas)
                scale: 1,
                opacity: 0,
              }}
              transition={{
                duration: 4, // Más lento
                delay: piece.delay,
                ease: "easeOut",
              }}
              className="absolute shadow-lg"
              style={{
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size,
                borderRadius: "4px", // Más redondeado
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
