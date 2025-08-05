"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface DraggableBadgeProps {
  badgeId: string
  badgeName: string
  badgeLevel?: "starter" | "bronze" | "silver" | "gold" | "platinum"
  badgeCategory?: string
  badgeNumber?: string
  className?: string
}

export function DraggableBadge({
  badgeId,
  badgeName,
  badgeLevel = "starter",
  badgeCategory = "KALABASBOOM",
  badgeNumber = "#000001",
  className,
}: DraggableBadgeProps) {
  // Referencias y estado
  const constraintsRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number }>>(
    [],
  )

  // Valores de movimiento para la física
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Configuración de resorte para movimiento más natural
  const springConfig = { damping: 20, stiffness: 200, mass: 1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  // Rotación basada en la posición X para efecto de balanceo
  const rotate = useTransform(springX, [-100, 0, 100], [-10, 0, 10])

  // Estiramiento de la cuerda
  const stringLength = useTransform(springY, [0, 200], [50, 250])

  // Colores según el nivel del badge
  const getBadgeColors = () => {
    switch (badgeLevel) {
      case "starter":
        return "from-red-500 to-orange-500 border-yellow-400"
      case "bronze":
        return "from-amber-700 to-amber-900 border-amber-500"
      case "silver":
        return "from-gray-400 to-gray-600 border-gray-300"
      case "gold":
        return "from-yellow-400 to-yellow-600 border-yellow-300"
      case "platinum":
        return "from-blue-400 to-indigo-600 border-blue-300"
      default:
        return "from-red-500 to-orange-500 border-yellow-400"
    }
  }

  // Inicializar partículas
  useEffect(() => {
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 15 + 5,
      speed: Math.random() * 0.5 + 0.2,
    }))
    setParticles(newParticles)
  }, [])

  // Animación de partículas
  useEffect(() => {
    if (!badgeRef.current) return

    let animationId: number

    const animateParticles = () => {
      setParticles((prev) =>
        prev.map((particle) => {
          // Movimiento ascendente con variación
          let newY = particle.y - particle.speed

          // Si la partícula sale por arriba, reiniciarla abajo
          if (newY < -10) {
            newY = 110
            particle.x = Math.random() * 100
          }

          // Añadir movimiento horizontal ondulante
          const newX = particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.3

          return {
            ...particle,
            x: newX,
            y: newY,
          }
        }),
      )

      animationId = requestAnimationFrame(animateParticles)
    }

    animationId = requestAnimationFrame(animateParticles)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Efecto de audio al arrastrar
  useEffect(() => {
    if (isDragging) {
      const audio = new Audio("/sounds/badge-unlocked.mp3")
      audio.volume = 0.2
      audio.play().catch((e) => console.log("Audio play failed:", e))
    }
  }, [isDragging])

  return (
    <div className="relative h-[400px] flex items-center justify-center" ref={constraintsRef}>
      {/* Cuerda */}
      <motion.div
        className="absolute top-0 left-1/2 w-1 bg-red-500 origin-top"
        style={{
          height: stringLength,
          translateX: "-50%",
        }}
      />

      {/* Badge */}
      <motion.div
        ref={badgeRef}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.7}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        whileDrag={{ scale: 1.05 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        style={{
          x: springX,
          y: springY,
          rotate,
        }}
        className={cn(
          "w-64 h-80 rounded-xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing",
          "flex flex-col border-4",
          isDragging ? "shadow-2xl" : "shadow-xl",
          className,
        )}
      >
        {/* Parte superior del badge */}
        <div className={cn("flex-1 relative overflow-hidden bg-gradient-to-b p-4", getBadgeColors())}>
          {/* Partículas de lava */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-white/70"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  filter: "blur(1px)",
                  opacity: 0.4 + Math.random() * 0.6,
                }}
              />
            ))}
          </div>

          {/* Contenido del badge */}
          <div className="relative z-10 text-white">
            <div className="text-center mb-2">
              <h3 className="text-sm font-bold tracking-wider">{badgeCategory}</h3>
              <div className="w-12 h-0.5 bg-white/40 mx-auto my-2"></div>
            </div>

            <div className="mt-6 text-center">
              <h2 className="text-4xl font-bold mb-1">{badgeName.split(" ")[0]}</h2>
              <h2 className="text-4xl font-bold">{badgeName.split(" ").slice(1).join(" ")}</h2>
            </div>
          </div>
        </div>

        {/* Parte inferior del badge */}
        <div className="h-16 bg-gray-900 p-3 flex items-center justify-between text-white">
          <div className="text-xs uppercase tracking-wider opacity-70">KALABASBOOM</div>
          <div className="text-sm font-mono">{badgeNumber}</div>
        </div>
      </motion.div>
    </div>
  )
}
