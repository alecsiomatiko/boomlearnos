"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Sparkles } from "lucide-react"
import Image from "next/image"
import type { User } from "@/types"

interface DailyCheckInPanelProps {
  user: User
}

export function DailyCheckInPanel({ user }: DailyCheckInPanelProps) {
  const [energyLevel, setEnergyLevel] = useState([2])
  const [priority, setPriority] = useState("")
  const [hasCheckedIn, setHasCheckedIn] = useState(false)

  const getEnergyMascot = (level: number) => {
    if (level <= 2) return "/images/mascot-energy-low.png"
    if (level === 3) return "/images/mascot-energy-medium.png"
    return "/images/mascot-energy-high.png"
  }

  const getEnergyLabel = (level: number) => {
    if (level <= 2) return "Bajo"
    if (level === 3) return "Medio"
    return "Alto"
  }

  const getEnergyColor = (level: number) => {
    if (level <= 2) return "text-red-500"
    if (level === 3) return "text-yellow-500"
    return "text-green-500"
  }

  const handleCheckIn = () => {
    setHasCheckedIn(true)
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Check-in Diario.</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Medio</span>
            <span>Alto</span>
          </div>
        </div>

        {/* Lion Mascots Display */}
        <div className="flex justify-center gap-4 mb-6">
          {[1, 3, 5].map((level) => (
            <div
              key={level}
              className={`w-16 h-16 relative transition-all duration-300 ${
                (energyLevel[0] <= 2 && level === 1) ||
                (energyLevel[0] === 3 && level === 3) ||
                (energyLevel[0] >= 4 && level === 5)
                  ? "opacity-100 scale-110"
                  : "opacity-30 scale-90"
              }`}
            >
              <Image
                src={getEnergyMascot(level) || "/placeholder.svg"}
                alt={`Energy level ${level}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 mb-6">¿Cómo te sientes hoy?</p>

        {/* Energy Level */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Nivel de Energía.</p>
            <p className={`text-xl font-bold ${getEnergyColor(energyLevel[0])}`}>{getEnergyLabel(energyLevel[0])}</p>
          </div>

          <div className="px-2">
            <Slider
              value={energyLevel}
              onValueChange={setEnergyLevel}
              max={5}
              min={1}
              step={1}
              className="w-full mb-3"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>😢 Bajo</span>
              <span>😊 Alto</span>
            </div>
          </div>
        </div>

        {/* Priority Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Prioridad principal del Día.</label>
          <Textarea
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="Escribe tu prioridad..."
            className="w-full p-3 border border-gray-200 rounded-xl resize-none text-sm focus:border-red-500 focus:ring-red-500"
            rows={3}
          />
        </div>

        {/* Check-in Button */}
        <Button
          onClick={handleCheckIn}
          disabled={hasCheckedIn || !priority.trim()}
          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-3 font-medium disabled:opacity-50"
        >
          <Heart className="h-4 w-4 mr-2" />
          {hasCheckedIn ? "✓ Check-in Completado" : "Registrar Check-in"}
        </Button>

        {hasCheckedIn && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <div className="text-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <p className="text-green-800 font-medium text-sm">¡Excelente!</p>
              <p className="text-green-700 text-xs">Has completado tu check-in diario.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
