'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    console.log('🔍 [ONBOARDING GUARD] Checking state:', { loading, user })
    
    if (loading) {
      console.log('🔍 [ONBOARDING GUARD] Still loading...')
      return
    }

    if (!user) {
      console.log('🔍 [ONBOARDING GUARD] No user, redirecting to login')
      router.push('/login')
      return
    }

    console.log('🔍 [ONBOARDING GUARD] User data:', {
      id: user.id,
      onboardingStep: user.onboardingStep,
      onboardingCompleted: user.onboardingCompleted,
      canAccessDashboard: user.canAccessDashboard
    })

    // Si el usuario no ha completado el onboarding, redirigir al paso correspondiente
    if (user.onboardingCompleted === false) {
      if (user.onboardingStep === 1 || !user.onboardingStep) {
        console.log('🔍 [ONBOARDING GUARD] Redirecting to identity step')
        router.push('/onboarding/identidad')
      } else if (user.onboardingStep === 2) {
        console.log('🔍 [ONBOARDING GUARD] Redirecting to diagnostic step')
        router.push('/onboarding/diagnostico')
      }
      return
    }

    // Si no puede acceder al dashboard, mantenerlo en onboarding
    if (user.canAccessDashboard === false) {
      console.log('🔍 [ONBOARDING GUARD] Cannot access dashboard, redirecting to identity')
      router.push('/onboarding/identidad')
      return
    }

    console.log('✅ [ONBOARDING GUARD] User can access dashboard')
    setIsChecking(false)
  }, [user, loading, router])

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando estado del onboarding...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
