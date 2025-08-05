"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface IntroScreenProps {
  onSelectControl: () => void
  onSelectSalud: () => void
}

export default function IntroScreen({ onSelectControl, onSelectSalud }: IntroScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-gray-900 mb-4">Dashboard</h1>
        </motion.div>

        {/* Main Content - Reduced gap from gap-16 to gap-12 (approximately 10% closer) */}
        <div className="flex items-center justify-center gap-12">
          {/* Panel de Control Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="w-80 bg-white shadow-xl border-0 overflow-hidden hover:scale-105 transition-transform duration-300">
              {/* Red top border */}
              <div className="h-4 bg-red-500"></div>
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Panel de Control.</h2>
                <Button
                  onClick={onSelectControl}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Acceder
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex-shrink-0"
          >
            <div className="relative animate-float">
              <Image
                src="/images/mascot-lion.png"
                alt="KalabasBoom Lion Mascot"
                width={300}
                height={300}
                className="drop-shadow-lg"
              />
            </div>
          </motion.div>

          {/* Salud Empresarial Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="w-80 bg-white shadow-xl border-0 overflow-hidden hover:scale-105 transition-transform duration-300">
              {/* Red top border */}
              <div className="h-4 bg-red-500"></div>
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Salud Empresarial.</h2>
                <Button
                  onClick={onSelectSalud}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Acceder
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
