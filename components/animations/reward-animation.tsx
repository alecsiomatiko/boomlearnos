"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gem } from "lucide-react"
import { useEffect } from "react"
import Image from "next/image"

interface RewardAnimationProps {
  show: boolean
  title: string
  description: string
  gems: number
  type: "task" | "checkin" | "achievement"
  icon?: React.ReactNode
  onComplete: () => void
}

export function RewardAnimation({ show, title, description, gems, type, icon, onComplete }: RewardAnimationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
          >
            {/* Mascota feliz en la esquina */}
            <motion.div
              initial={{ y: 100, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
              className="absolute -right-4 -bottom-4 w-28 h-28"
            >
              <Image
                src="/images/mascot-happy.png"
                alt="Mascota celebrando"
                width={112}
                height={112}
                className="object-contain"
              />
            </motion.div>

            {/* Icono de trofeo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
              className="mb-4"
            >
              {icon || (
                <div className="mx-auto w-12 h-12 text-yellow-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M5 16L3 6h5.5l1.5 10M5 16l6.5 0M5 16l-1 4h13l-1-4M18.5 16L20 6h-5.5l-1.5 10M18.5 16l-6.5 0M18.5 16l1 4M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M9 6h6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
              )}
            </motion.div>

            {/* Título */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-2"
            >
              ¡{title}!
            </motion.h2>

            {/* Descripción */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/90 mb-6 text-sm"
            >
              {description}
            </motion.p>

            {/* Gemas ganadas */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", duration: 0.8 }}
              className="bg-red-400/30 rounded-2xl p-6 mb-4 mx-auto max-w-[250px] backdrop-blur-sm"
            >
              <div className="flex items-center justify-center">
                <Gem className="h-6 w-6 text-white mr-2" />
                <span className="text-3xl font-bold text-white">+{gems}</span>
              </div>
              <p className="text-white/80 text-sm mt-1">Gemas ganadas</p>
            </motion.div>

            {/* Mensaje final */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white text-lg font-medium"
            >
              ¡Genial!
            </motion.div>

            {/* Botón invisible para cerrar */}
            <button
              onClick={onComplete}
              className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
              aria-label="Cerrar"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
