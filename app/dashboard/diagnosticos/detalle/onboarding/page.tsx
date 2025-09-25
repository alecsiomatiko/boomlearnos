"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, CheckCircle, User, Building2, Target, Eye } from "lucide-react"

interface OnboardingData {
  completed: boolean
  completedAt: string | null
  answers: Record<string, any>
}

interface OrganizationData {
  companyName: string
  businessType: string
  companySize: string
  mission: string | null
  vision: string | null
  values: any
}

export default function OnboardingDetailPage() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/diagnostics/overview')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.diagnostics) {
            setOnboardingData(result.diagnostics.onboardingDiagnostic)
            setOrganizationData(result.diagnostics.organization)
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No disponible'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAnswerValue = (key: string) => {
    if (!onboardingData?.answers) return 'No respondido'
    const value = onboardingData.answers[key]
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    return value || 'No respondido'
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Diagnóstico de Onboarding
              </h1>
              <p className="text-gray-600 mt-2">
                Detalles completos de tu diagnóstico inicial
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Completado
              </Badge>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <p className="text-lg font-semibold text-green-600">
                  {onboardingData?.completed ? 'Completado' : 'Pendiente'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Finalización</p>
                <p className="text-lg">{formatDate(onboardingData?.completedAt || null)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Información de la Organización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre de la Empresa</p>
                  <p className="text-lg">{organizationData?.companyName || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Negocio</p>
                  <p className="text-lg">{organizationData?.businessType || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tamaño de la Empresa</p>
                  <p className="text-lg">{organizationData?.companySize || 'No especificado'}</p>
                </div>
              </div>
              
              {organizationData?.mission && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Misión</p>
                  <p className="text-lg">{organizationData.mission}</p>
                </div>
              )}
              
              {organizationData?.vision && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Visión</p>
                  <p className="text-lg">{organizationData.vision}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Diagnostic Answers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Respuestas del Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {onboardingData?.answers && Object.keys(onboardingData.answers).length > 0 ? (
                Object.entries(onboardingData.answers).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-l-4 border-red-500 pl-4 py-2"
                  >
                    <p className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-lg mt-1">
                      {Array.isArray(value) ? value.join(', ') : value || 'No respondido'}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay respuestas disponibles
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={() => router.push('/dashboard/mega-diagnostico')}
            className="bg-red-500 hover:bg-red-600"
          >
            Ir al Mega Diagnóstico
          </Button>
        </div>
      </div>
    </div>
  )
}
