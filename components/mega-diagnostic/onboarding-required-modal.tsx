"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Target, Eye, Heart } from "lucide-react"
import { motion } from "framer-motion"

interface OnboardingRequiredModalProps {
  isOpen: boolean
  userName?: string
  onClose?: () => void
}

export function OnboardingRequiredModal({ 
  isOpen, 
  userName,
  onClose 
}: OnboardingRequiredModalProps) {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleStartDiagnostic = () => {
    setIsRedirecting(true)
    router.push('/onboarding/diagnostico')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* Header con colores de marca */}
        <div className="bg-gradient-to-br from-red-600 via-red-500 to-red-700 p-8 text-white relative overflow-hidden">
          {/* Patrón decorativo sutil */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center relative z-10"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold mb-2">
              ¡Bienvenido{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋
            </DialogTitle>
            <DialogDescription className="text-white/90 text-lg">
              Antes de continuar con el Mega Diagnóstico
            </DialogDescription>
          </motion.div>
        </div>

        {/* Contenido */}
        <div className="p-8">
          <div className="space-y-6">
            <p className="text-gray-700 text-center text-lg">
              Para brindarte la mejor experiencia y análisis personalizado, necesitamos conocer mejor tu negocio.
            </p>

            <div className="bg-gradient-to-r from-red-50 to-white rounded-lg p-6 border-2 border-red-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-red" />
                Completarás un diagnóstico inicial de 10 preguntas que nos ayudará a:
              </h3>
              
              <div className="space-y-3">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-brand-red rounded-full flex items-center justify-center shadow-sm">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Crear tu Misión empresarial</p>
                    <p className="text-sm text-gray-600">Definiremos el propósito y razón de ser de tu negocio</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-brand-red rounded-full flex items-center justify-center shadow-sm">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Establecer tu Visión a futuro</p>
                    <p className="text-sm text-gray-600">Trazaremos el camino hacia dónde quieres llegar</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-brand-red rounded-full flex items-center justify-center shadow-sm">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Definir tus Valores corporativos</p>
                    <p className="text-sm text-gray-600">Los principios que guiarán todas tus decisiones</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-brand-red rounded-full flex items-center justify-center shadow-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Generar tu diagnóstico inicial personalizado</p>
                    <p className="text-sm text-gray-600">Con análisis IA y plan de acción a 90 días</p>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900 text-center font-medium">
                ⏱️ <strong>Solo tomará 5-7 minutos.</strong> Tu tiempo será recompensado con un análisis profundo y accionable.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-gray-50 px-8 py-6 border-t">
          <div className="w-full flex flex-col sm:flex-row gap-3 justify-center">
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isRedirecting}
                className="order-2 sm:order-1"
              >
                Después
              </Button>
            )}
            <Button
              onClick={handleStartDiagnostic}
              disabled={isRedirecting}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 shadow-lg order-1 sm:order-2"
              size="lg"
            >
              {isRedirecting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  Cargando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Completar Diagnóstico Inicial
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
