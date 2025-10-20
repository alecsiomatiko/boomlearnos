"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { AdvancedDiagnostic } from "@/components/onboarding/advanced-diagnostic"

export default function DiagnosticoPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
  }, [user, router])

  const handleDiagnosticComplete = async (answers: Record<string, any>) => {
    try {
      const response = await fetch('/api/diagnostic/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          userId: user?.id
        }),
      })

      if (!response.ok) {
        throw new Error('Error al procesar el diagnóstico')
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "¡Diagnóstico completado!",
          description: "Tu análisis empresarial ha sido procesado exitosamente.",
        })
        
        router.push('/dashboard?diagnostic=completed')
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (error) {
      console.error('Error completing diagnostic:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al procesar tu diagnóstico. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleBack = () => {
    router.push('/onboarding/nuevo')
  }

  if (!user) {
    return null
  }

  return (
    <AdvancedDiagnostic 
      onComplete={handleDiagnosticComplete}
      onBack={handleBack}
    />
  )
}
