"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface OnboardingBannerProps {
  show: boolean
  onDismiss?: () => void
}

export function OnboardingBanner({ show, onDismiss }: OnboardingBannerProps) {
  const router = useRouter()
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    setTimeout(() => {
      onDismiss?.()
    }, 300)
  }

  const handleComplete = () => {
    router.push('/onboarding/diagnostico')
  }

  return (
    <AnimatePresence>
      {show && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="bg-gradient-to-r from-red-50 to-white border-red-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-red-500/5" />
            
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <AlertTitle className="text-gray-900 font-semibold text-lg flex items-center gap-2">
                    Completa tu Diagnóstico Inicial
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                      Pendiente
                    </Badge>
                  </AlertTitle>
                  
                  <AlertDescription className="text-gray-700">
                    Responde 10 preguntas estratégicas y obtén tu <strong>Misión</strong>, <strong>Visión</strong>, <strong>Valores</strong> y un diagnóstico personalizado con IA. Solo toma 5-7 minutos.
                  </AlertDescription>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md"
                      size="sm"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Completar Ahora
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    
                    {onDismiss && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Recordar después
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
