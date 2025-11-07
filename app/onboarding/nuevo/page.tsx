"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ImprovedOnboarding } from "@/components/onboarding/improved-onboarding"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function NewOnboardingPage() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleComplete = async (answers: Record<string, any>) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('📋 [NEW ONBOARDING] Respuestas completas:', answers)
      
      // Enviar respuestas al servidor
      const response = await fetch('/api/onboarding/improved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          answers: answers
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ [NEW ONBOARDING] Onboarding completado exitosamente')
        
        // 🚀 AUTO-LOGIN: Guardar token si viene en la respuesta
        if (result.authToken && result.user) {
          console.log('🔑 [NEW ONBOARDING] Guardando token de autenticación automático...')
          localStorage.setItem('auth_token', result.authToken)
          localStorage.setItem('auth_user', JSON.stringify(result.user))
          
          // 🔄 ACTUALIZAR CONTEXTO DE AUTENTICACIÓN
          updateUser(result.user)
          console.log('✅ [NEW ONBOARDING] Usuario auto-logueado y contexto actualizado:', result.user.id)
        }
        
        toast({
          title: "¡Bienvenido a BoomLearn! 🎉",
          description: `Perfil empresarial creado exitosamente. ${result.rewards ? `Has ganado ${result.rewards.gems} gemas.` : ''} Ahora puedes acceder al dashboard.`,
        })
        
        // Ir directamente al dashboard - el segundo diagnóstico está disponible en mega-diagnóstico
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        throw new Error(result.error || 'Error procesando respuestas')
      }
      
    } catch (error: any) {
      console.error('❌ [NEW ONBOARDING] Error:', error)
      toast({
        title: "Error",
        description: error.message || "Hubo un problema procesando tus respuestas",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <ImprovedOnboarding 
      onComplete={handleComplete}
      onBack={handleBack}
    />
  )
}