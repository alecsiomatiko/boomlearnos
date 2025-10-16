"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, CheckCircle2, Trophy, Gem, ArrowRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"

interface OrganizationIdentity {
  mission: string
  vision: string
  values: string[]
}

export default function OnboardingFinalPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [identity, setIdentity] = useState<OrganizationIdentity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadOrganizationIdentity()
    }
  }, [user])

  const loadOrganizationIdentity = async () => {
    try {
      // Cargar la identidad organizacional generada
      const response = await fetch(`/api/user/profile?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success && data.profile.organization) {
        const org = data.profile.organization
        setIdentity({
          mission: org.mission || 'Misión en proceso de generación...',
          vision: org.vision || 'Visión en proceso de generación...',
          values: org.values ? (typeof org.values === 'string' ? org.values.split(',') : org.values) : ['Excelencia', 'Innovación', 'Integridad']
        })
      }
    } catch (error) {
      console.error('Error loading organization identity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteOnboarding = async () => {
    if (!user?.id) return
    
    setIsCompleting(true)
    try {
      // Completar onboarding con análisis final
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "¡Onboarding completado!",
          description: `¡Felicitaciones! Has ganado ${result.rewards?.gems || 50} gemas y una medalla de bienvenida.`,
        })
        
        // Pequeña pausa para mostrar el mensaje
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        throw new Error(result.error || 'Error completando onboarding')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al completar el onboarding.",
        variant: "destructive",
      })
    } finally {
      setIsCompleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu identidad organizacional...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              ¡Tu Identidad Organizacional!
            </h1>
            <Sparkles className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-xl text-gray-600">
            Hemos generado la esencia de tu organización con Inteligencia Artificial
          </p>
        </motion.div>

        {/* Identity Cards */}
        <div className="space-y-6 mb-8">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  Misión
                </CardTitle>
                <CardDescription className="text-blue-100">
                  El propósito fundamental de tu organización
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {identity?.mission}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Visión
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Hacia dónde se dirige tu organización
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {identity?.vision}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Gem className="h-6 w-6" />
                  Valores Organizacionales
                </CardTitle>
                <CardDescription className="text-green-100">
                  Los principios que guían tu organización
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  {identity?.values.map((value, index) => (
                    <Badge 
                      key={index}
                      className="bg-green-100 text-green-800 text-lg px-4 py-2 rounded-full border-green-200"
                    >
                      {value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Complete Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-0 shadow-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                ¡Estás listo para comenzar!
              </h3>
              <p className="text-yellow-100 mb-6 text-lg">
                Tu identidad organizacional ha sido creada. Ahora puedes acceder a tu dashboard personalizado.
              </p>
              <Button
                onClick={handleCompleteOnboarding}
                disabled={isCompleting}
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-xl"
              >
                {isCompleting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-2"></div>
                    Completando...
                  </>
                ) : (
                  <>
                    Acceder al Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}