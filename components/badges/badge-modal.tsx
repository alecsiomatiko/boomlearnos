"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ConfettiExplosion } from "@/components/confetti-explosion"

interface BadgeModalProps {
  show: boolean
  badgeId: string
  badgeName: string
  badgeDescription?: string
  badgeLevel?: "starter" | "bronze" | "silver" | "gold" | "platinum"
  onClose?: () => void
}

export function BadgeModal({
  show,
  badgeId,
  badgeName,
  badgeDescription,
  badgeLevel = "starter",
  onClose,
}: BadgeModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [audioPlayed, setAudioPlayed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const ribbonRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  // Physics state
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  // Physics constants
  const SPRING_CONSTANT = 0.03
  const DAMPING = 0.92
  const GRAVITY = 0.5
  const RIBBON_LENGTH = 600 // Increased ribbon length even more

  // Get badge colors based on level
  const getBadgeColors = () => {
    switch (badgeLevel) {
      case "starter":
        return {
          primary: "#d92121", // KALABASBOOM red
          secondary: "#1a1a1a", // KALABASBOOM black
        }
      case "bronze":
        return {
          primary: "#CD7F32",
          secondary: "#1a1a1a",
        }
      case "silver":
        return {
          primary: "#C0C0C0",
          secondary: "#1a1a1a",
        }
      case "gold":
        return {
          primary: "#FFD700",
          secondary: "#1a1a1a",
        }
      case "platinum":
        return {
          primary: "#E5E4E2",
          secondary: "#1a1a1a",
        }
      default:
        return {
          primary: "#d92121",
          secondary: "#1a1a1a",
        }
    }
  }

  const colors = getBadgeColors()

  // Show/hide badge
  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setPosition({ x: 0, y: 0 })
      setVelocity({ x: 0, y: 0 })
      setShowConfetti(true)

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
      }, 20000)

      return () => clearTimeout(timer)
    }
  }, [show, onClose, audioPlayed])

  // Hide confetti after a few seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  // Physics animation
  useEffect(() => {
    if (!isVisible) return

    // Clean up previous animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const updatePhysics = () => {
      if (!isDragging) {
        // Apply spring force (attraction to center)
        const springForceX = -position.x * SPRING_CONSTANT
        const springForceY = -position.y * SPRING_CONSTANT + GRAVITY

        // Update velocity with spring force and damping
        setVelocity((prev) => ({
          x: (prev.x + springForceX) * DAMPING,
          y: (prev.y + springForceY) * DAMPING,
        }))

        // Update position
        setPosition((prev) => ({
          x: prev.x + velocity.x,
          y: prev.y + velocity.y,
        }))
      }

      // Update ribbon
      if (ribbonRef.current && badgeRef.current) {
        const badgeRect = badgeRef.current.getBoundingClientRect()
        const badgeCenterX = badgeRect.left + badgeRect.width / 2
        const badgeCenterY = badgeRect.top

        // Calculate ribbon properties
        const ribbonStartX = window.innerWidth / 2
        const ribbonStartY = -RIBBON_LENGTH + 20 // Start higher up (negative value)
        const ribbonEndX = badgeCenterX
        const ribbonEndY = badgeCenterY

        // Calculate ribbon length and angle
        const dx = ribbonEndX - ribbonStartX
        const dy = ribbonEndY - ribbonStartY
        const length = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)

        // Update ribbon style
        ribbonRef.current.style.width = `${length}px`
        ribbonRef.current.style.transform = `rotate(${angle}deg)`
        ribbonRef.current.style.top = `${ribbonStartY}px`

        // Adjust ribbon thickness based on stretch
        const baseThickness = 3
        const minThickness = 0.8
        const stretchFactor = Math.min(length / 300, 1)
        const thickness = baseThickness - (baseThickness - minThickness) * stretchFactor

        ribbonRef.current.style.height = `${thickness}px`
      }

      animationRef.current = requestAnimationFrame(updatePhysics)
    }

    animationRef.current = requestAnimationFrame(updatePhysics)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isVisible, position, velocity, isDragging])

  // Mouse/touch event handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    setIsDragging(true)
    setLastMousePos({ x: clientX, y: clientY })

    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      setDragOffset({
        x: clientX - (rect.left + rect.width / 2),
        y: clientY - (rect.top + rect.height / 2),
      })
    }

    // Play sound effect
    const audio = new Audio("/sounds/badge-unlocked.mp3")
    audio.volume = 0.2
    audio.playbackRate = 1.2
    audio.play().catch((e) => console.log("Audio play failed:", e))
  }

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    // Calculate velocity from mouse movement
    const dx = clientX - lastMousePos.x
    const dy = clientY - lastMousePos.y
    setVelocity({ x: dx * 0.3, y: dy * 0.3 })

    // Update last mouse position
    setLastMousePos({ x: clientX, y: clientY })

    // Calculate new badge position relative to center
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    setPosition({
      x: clientX - centerX - dragOffset.x,
      y: clientY - centerY - dragOffset.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    // Play elastic sound
    const audio = new Audio("/sounds/badge-unlocked.mp3")
    audio.volume = 0.3
    audio.playbackRate = 1.5
    audio.play().catch((e) => console.log("Audio play failed:", e))
  }

  // Add and remove event listeners
  useEffect(() => {
    if (isVisible) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("touchmove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchend", handleMouseUp)

      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("touchmove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
        window.removeEventListener("touchend", handleMouseUp)
      }
    }
  }, [isVisible, isDragging, lastMousePos, dragOffset])

  if (!isVisible) return null

  // Determine which icon to show based on badgeId
  const getBadgeIcon = () => {
    if (badgeId === "identity_creator" || badgeLevel === "bronze") {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-white/80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
        </div>
      )
    }
    return null
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70" ref={containerRef}>
      {showConfetti && <ConfettiExplosion particleCount={200} duration={5000} />}

      <div className="relative flex flex-col items-center justify-center h-full">
        {/* Ribbon - anchored at top center */}
        <div
          ref={ribbonRef}
          className="absolute left-1/2 origin-top-left bg-red-600"
          style={{
            width: "3px",
            height: "3px",
            transform: "rotate(90deg)",
            transformOrigin: "top left",
            zIndex: 10,
            boxShadow: "0 0 5px rgba(255, 0, 0, 0.5)",
          }}
        />

        {/* Badge - Draggable with elastic return */}
        <div
          ref={badgeRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className="absolute w-64 shadow-2xl rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) rotate(${position.x * 0.05}deg)`,
            top: "50%",
            left: "50%",
            marginLeft: "-8rem",
            marginTop: "-6rem",
            touchAction: "none",
            zIndex: 20,
          }}
        >
          {/* Top section - KALABASBOOM red */}
          <div className="relative overflow-hidden pt-8 pb-16 px-6" style={{ backgroundColor: colors.primary }}>
            {/* Badge content */}
            <div className="text-center">
              <p className="text-xs font-medium tracking-widest uppercase text-white/80 mb-1">KALABASBOOM</p>
              <div className="h-px w-12 bg-white/30 mx-auto mb-4" />

              <h2 className="text-5xl font-bold text-white mb-1 tracking-tight">{badgeName || "Insignia"}</h2>
              <p className="text-sm uppercase tracking-wider text-white/80">
                {(badgeLevel || "starter").toUpperCase()}
              </p>
            </div>

            {/* Badge icon */}
            {getBadgeIcon()}
          </div>

          {/* Bottom section - KALABASBOOM black */}
          <div className="py-4 px-6 text-center" style={{ backgroundColor: colors.secondary }}>
            <p className="text-xs font-medium tracking-widest uppercase text-gray-400">BADGE ID</p>
            <p className="text-xl font-mono text-white">#{badgeId || badgeLevel}</p>
          </div>
        </div>

        {/* Congratulations message */}
        <div className="fixed top-10 left-0 right-0 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">¡Felicidades!</h2>
          <p className="text-xl text-white/90">
            {badgeDescription || `Has desbloqueado el badge ${(badgeName || "NUEVA").toUpperCase()}`}
          </p>
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
