"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

interface IntegratedBadgeProps {
  show: boolean
  badgeId: string
  badgeName: string
  badgeLevel?: "starter" | "bronze" | "silver" | "gold" | "platinum"
  onClose?: () => void
}

export function IntegratedBadge({ show, badgeId, badgeName, badgeLevel = "starter", onClose }: IntegratedBadgeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [audioPlayed, setAudioPlayed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const ribbonRef = useRef<SVGPathElement>(null)
  const animationRef = useRef<number | null>(null)

  // Physics constants
  const SPRING_STRENGTH = 0.08
  const SPRING_DAMPING = 0.12
  const GRAVITY = 0.05
  const MAX_VELOCITY = 30

  // Physics state
  const [physics, setPhysics] = useState({
    velocity: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    isDragging: false,
  })

  // Get badge colors based on level - using KALABASBOOM colors
  const getBadgeColors = () => {
    switch (badgeLevel) {
      case "starter":
        return {
          primary: "#d92121", // KALABASBOOM red from tailwind.config.ts
          secondary: "#1a1a1a", // KALABASBOOM black from tailwind.config.ts
          text: "#ffffff",
        }
      case "bronze":
        return {
          primary: "#CD7F32", // Bronze
          secondary: "#1a1a1a",
          text: "#ffffff",
        }
      case "silver":
        return {
          primary: "#C0C0C0", // Silver
          secondary: "#1a1a1a",
          text: "#ffffff",
        }
      case "gold":
        return {
          primary: "#FFD700", // Gold
          secondary: "#1a1a1a",
          text: "#ffffff",
        }
      case "platinum":
        return {
          primary: "#E5E4E2", // Platinum
          secondary: "#1a1a1a",
          text: "#333333",
        }
      default:
        return {
          primary: "#d92121", // KALABASBOOM red
          secondary: "#1a1a1a", // KALABASBOOM black
          text: "#ffffff",
        }
    }
  }

  const colors = getBadgeColors()

  // Show/hide badge
  useEffect(() => {
    if (show) {
      setIsVisible(true)

      // Reset physics
      setPhysics({
        velocity: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
        target: { x: 0, y: 0 },
        isDragging: false,
      })

      // Play sound
      if (!audioPlayed) {
        const audio = new Audio("/sounds/badge-unlocked.mp3")
        audio.volume = 0.6
        audio.play().catch((e) => console.log("Audio play failed:", e))
        setAudioPlayed(true)
      }

      // Auto close after delay
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onClose) onClose()
      }, 15000)

      return () => clearTimeout(timer)
    }
  }, [show, onClose, audioPlayed])

  // Advanced physics animation
  useEffect(() => {
    if (!isVisible) return

    // Clean up previous animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    let lastTime = performance.now()

    // Function to update physics and animation
    const updatePhysics = (currentTime: number) => {
      // Calculate delta time for smooth animation regardless of frame rate
      const deltaTime = Math.min(currentTime - lastTime, 30) / 16.67 // Cap at 30ms, normalize to ~60fps
      lastTime = currentTime

      setPhysics((prev) => {
        if (prev.isDragging) {
          return prev // Don't update physics while dragging
        }

        // Calculate spring force
        const dx = prev.target.x - prev.position.x
        const dy = prev.target.y - prev.position.y

        // Apply spring physics
        const springForceX = dx * SPRING_STRENGTH
        const springForceY = dy * SPRING_STRENGTH + GRAVITY // Add slight gravity

        // Apply damping to velocity
        let newVelocityX = prev.velocity.x + springForceX
        let newVelocityY = prev.velocity.y + springForceY

        newVelocityX *= 1 - SPRING_DAMPING
        newVelocityY *= 1 - SPRING_DAMPING

        // Limit maximum velocity
        const velocityMagnitude = Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY)
        if (velocityMagnitude > MAX_VELOCITY) {
          const scale = MAX_VELOCITY / velocityMagnitude
          newVelocityX *= scale
          newVelocityY *= scale
        }

        // Update position based on velocity
        const newPositionX = prev.position.x + newVelocityX * deltaTime
        const newPositionY = prev.position.y + newVelocityY * deltaTime

        // Update ribbon path
        if (ribbonRef.current) {
          const startX = window.innerWidth / 2
          const startY = 0
          const endX = window.innerWidth / 2 + newPositionX
          const endY = window.innerHeight / 2 + newPositionY

          // Calculate distance for tension effect
          const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)
          const tensionFactor = Math.min(distance / 300, 1)

          // Control points for natural curve
          const cp1x = startX + (endX - startX) * 0.25
          const cp1y = startY + (endY - startY) * 0.25

          const cp2x = startX + (endX - startX) * 0.75
          const cp2y = startY + (endY - startY) * 0.75

          // Update ribbon path
          ribbonRef.current.setAttribute("d", `M${startX},${startY} C${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`)

          // Update ribbon width based on tension
          const baseWidth = 2
          const minWidth = 0.5
          ribbonRef.current.setAttribute("stroke-width", `${baseWidth - (baseWidth - minWidth) * tensionFactor}`)
        }

        // Update badge position and rotation
        if (badgeRef.current) {
          badgeRef.current.style.transform = `translate(${newPositionX}px, ${newPositionY}px) rotate(${newPositionX * 0.05}deg)`
        }

        return {
          ...prev,
          velocity: { x: newVelocityX, y: newVelocityY },
          position: { x: newPositionX, y: newPositionY },
        }
      })

      // Continue animation
      animationRef.current = requestAnimationFrame(updatePhysics)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(updatePhysics)

    // Clean up on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isVisible])

  // Handle mouse/touch events for dragging
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()

    // Get initial position
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const offsetX = clientX - rect.left - rect.width / 2
    const offsetY = clientY - rect.top - rect.height / 2

    // Start dragging
    setPhysics((prev) => ({
      ...prev,
      isDragging: true,
      velocity: { x: 0, y: 0 }, // Reset velocity when starting drag
    }))

    // Handle mouse/touch move
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      const newX = clientX - centerX - offsetX
      const newY = clientY - centerY - offsetY

      // Update position while dragging
      setPhysics((prev) => ({
        ...prev,
        position: { x: newX, y: newY },
        target: { x: 0, y: 0 }, // Target is always center
      }))
    }

    // Handle mouse/touch up
    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
      // Calculate release velocity based on distance from center
      setPhysics((prev) => {
        const dx = prev.position.x
        const dy = prev.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Release with velocity proportional to distance
        const releaseVelocityFactor = distance / 100
        const releaseVelocityX = -dx * releaseVelocityFactor * 0.2
        const releaseVelocityY = -dy * releaseVelocityFactor * 0.2

        return {
          ...prev,
          isDragging: false,
          velocity: {
            x: releaseVelocityX,
            y: releaseVelocityY,
          },
        }
      })

      // Play elastic sound
      const audio = new Audio("/sounds/badge-unlocked.mp3")
      audio.volume = 0.3
      audio.playbackRate = 1.5
      audio.play().catch((e) => console.log("Audio play failed:", e))

      // Remove event listeners
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("touchmove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchend", handleMouseUp)
    }

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("touchmove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("touchend", handleMouseUp)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70" ref={containerRef}>
      <div className="relative flex flex-col items-center justify-center h-full">
        {/* Ribbon - directly connected to badge */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <path
            ref={ribbonRef}
            d={`M${window.innerWidth / 2},0 C${window.innerWidth / 2},100 ${window.innerWidth / 2},${
              window.innerHeight / 2 - 100
            } ${window.innerWidth / 2},${window.innerHeight / 2}`}
            stroke="#d92121" // KALABASBOOM red
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        {/* Badge - Draggable with elastic return */}
        <div
          ref={badgeRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 shadow-2xl rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
          style={{
            touchAction: "none", // Prevent scrolling while dragging on mobile
          }}
        >
          {/* Top section - KALABASBOOM red */}
          <div className="relative overflow-hidden pt-8 pb-16 px-6" style={{ backgroundColor: colors.primary }}>
            {/* Badge content */}
            <div className="text-center">
              <p className="text-xs font-medium tracking-widest uppercase text-white/80 mb-1">KALABASBOOM</p>
              <div className="h-px w-12 bg-white/30 mx-auto mb-4" />

              <h2 className="text-5xl font-bold text-white mb-1 tracking-tight">{badgeLevel.toUpperCase()}</h2>
              <p className="text-sm uppercase tracking-wider text-white/80">{badgeName}</p>
            </div>
          </div>

          {/* Bottom section - KALABASBOOM black */}
          <div className="py-4 px-6 text-center" style={{ backgroundColor: colors.secondary }}>
            <p className="text-xs font-medium tracking-widest uppercase text-gray-400">BADGE ID</p>
            <p className="text-xl font-mono text-white">#{badgeId || badgeLevel}</p>
          </div>
        </div>

        {/* Continue button */}
        <button
          className="fixed bottom-10 bg-white text-gray-800 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors"
          onClick={() => {
            setIsVisible(false)
            if (onClose) onClose()
          }}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
