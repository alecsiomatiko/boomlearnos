"use client"

import { useRef } from "react"

interface ElasticBoxPhysicsProps {
  tension?: number
  friction?: number
  mass?: number
  initialVelocity?: number
}

export function useElasticBoxPhysics({
  tension = 170,
  friction = 26,
  mass = 1,
  initialVelocity = 0,
}: ElasticBoxPhysicsProps = {}) {
  const physicsRef = useRef({
    tension,
    friction,
    mass,
    initialVelocity,
  })

  // Actualizar valores si cambian
  physicsRef.current = {
    tension,
    friction,
    mass,
    initialVelocity,
  }

  // Devolver configuración de física para usar en animaciones
  return {
    tension: physicsRef.current.tension,
    friction: physicsRef.current.friction,
    mass: physicsRef.current.mass,
    initialVelocity: physicsRef.current.initialVelocity,

    // Configuración para framer-motion
    getSpringConfig: () => ({
      type: "spring",
      stiffness: physicsRef.current.tension,
      damping: physicsRef.current.friction,
      mass: physicsRef.current.mass,
      velocity: physicsRef.current.initialVelocity,
    }),

    // Configuración para animaciones de entrada
    getEntryTransition: (delay = 0) => ({
      type: "spring",
      stiffness: physicsRef.current.tension,
      damping: physicsRef.current.friction,
      mass: physicsRef.current.mass,
      velocity: physicsRef.current.initialVelocity,
      delay,
    }),

    // Configuración para animaciones de salida
    getExitTransition: (delay = 0) => ({
      type: "spring",
      stiffness: physicsRef.current.tension * 0.7, // Reducir tensión para salida más suave
      damping: physicsRef.current.friction * 1.2, // Aumentar fricción para salida más controlada
      mass: physicsRef.current.mass,
      delay,
    }),
  }
}
