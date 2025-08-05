"use client"

import { useRef, useEffect } from "react"

interface BadgePhysicsProps {
  x: any // MotionValue<number>
  y: any // MotionValue<number>
  isDragging: boolean
}

export function useBadgePhysics({ x, y, isDragging }: BadgePhysicsProps) {
  const velocityX = useRef(0)
  const velocityY = useRef(0)
  const lastX = useRef(0)
  const lastY = useRef(0)
  const lastTime = useRef(0)

  // Configuración de física
  const gravity = 0.5
  const friction = 0.95
  const elasticity = 0.7

  // Aplicar física cuando no se está arrastrando
  useEffect(() => {
    if (isDragging) return

    let animationId: number

    const applyPhysics = () => {
      const currentX = x.get()
      const currentY = y.get()
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime.current

      if (deltaTime > 0 && lastTime.current !== 0) {
        // Calcular velocidad
        velocityX.current = ((currentX - lastX.current) / deltaTime) * 16
        velocityY.current = ((currentY - lastY.current) / deltaTime) * 16
      }

      // Aplicar gravedad
      velocityY.current += gravity

      // Aplicar fricción
      velocityX.current *= friction
      velocityY.current *= friction

      // Actualizar posición
      x.set(currentX + velocityX.current)
      y.set(currentY + velocityY.current)

      // Guardar valores actuales
      lastX.current = currentX
      lastY.current = currentY
      lastTime.current = currentTime

      animationId = requestAnimationFrame(applyPhysics)
    }

    animationId = requestAnimationFrame(applyPhysics)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isDragging, x, y])

  return {
    velocityX,
    velocityY,
  }
}
