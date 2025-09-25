'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Building2, 
  Target, 
  Sparkles,
  CheckCircle
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface IdentityFormData {
  companyName: string
  businessType: string
  companySize: string
  businessDescription: string
  targetAudience: string
  mainChallenges: string
  currentGoals: string
  uniqueValue: string
  workValues: string
  communicationStyle: string
}

export default function IdentidadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedIdentity, setGeneratedIdentity] = useState<any>(null)
  
  const [formData, setFormData] = useState<IdentityFormData>({
    companyName: '',
    businessType: '',
    companySize: '',
    businessDescription: '',
    targetAudience: '',
    mainChallenges: '',
    currentGoals: '',
    uniqueValue: '',
    workValues: '',
    communicationStyle: 'Profesional'
  })

  const totalSteps = 3
  const progressPercentage = (currentStep / totalSteps) * 100

  const handleInputChange = (field: keyof IdentityFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleStep1Submit = () => {
    // Validar campos básicos
    if (!formData.companyName || !formData.businessType || !formData.businessDescription) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre de empresa, tipo de negocio y descripción.",
        variant: "destructive",
      })
      return
    }
    setCurrentStep(2)
  }

  const handleStep2Submit = () => {
    // Validar campos de estrategia
    if (!formData.targetAudience || !formData.mainChallenges || !formData.currentGoals || !formData.uniqueValue) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos de esta sección.",
        variant: "destructive",
      })
      return
    }
    setCurrentStep(3)
  }

  const handleGenerateIdentity = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "No se encontró información del usuario.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/onboarding/identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        }),
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedIdentity(result.organization)
        toast({
          title: "¡Identidad generada exitosamente!",
          description: "Tu identidad corporativa ha sido creada con IA.",
        })
        
        // Esperar un momento para mostrar la identidad y luego continuar
        setTimeout(() => {
          router.push('/onboarding/diagnostico')
        }, 3000)
      } else {
        throw new Error(result.error || 'Error generando identidad')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error.message || "Error al generar la identidad organizacional",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">BoomLearnOS</h1>
                <p className="text-sm text-gray-500">Configuración de Identidad Organizacional</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Paso {currentStep} de {totalSteps}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">Identidad Organizacional</span>
              <span className="text-gray-500">{Math.round(progressPercentage)}% completado</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentStep === 1 && (
          <>
            {/* Step 1: Información Básica */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Información de tu Empresa</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Cuéntanos sobre tu negocio actual
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-sm mb-8">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Datos Básicos de la Empresa</CardTitle>
                <CardDescription className="text-gray-600">
                  Esta información nos ayudará a entender tu negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-gray-700 font-medium">
                      Nombre de la empresa <Badge variant="secondary" className="ml-1 text-xs">Requerido</Badge>
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Ej: TechCorp Solutions"
                      className="border-gray-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="text-gray-700 font-medium">
                      Tipo de negocio <Badge variant="secondary" className="ml-1 text-xs">Requerido</Badge>
                    </Label>
                    <Input
                      id="businessType"
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      placeholder="Ej: Tecnología, Consultoria, Retail"
                      className="border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySize" className="text-gray-700 font-medium">Tamaño de la empresa</Label>
                    <select
                      id="companySize"
                      value={formData.companySize}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="1-10">1-10 empleados</option>
                      <option value="11-50">11-50 empleados</option>
                      <option value="51-200">51-200 empleados</option>
                      <option value="201-1000">201-1000 empleados</option>
                      <option value="1000+">Más de 1000 empleados</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="communicationStyle" className="text-gray-700 font-medium">Estilo de comunicación</Label>
                    <select
                      id="communicationStyle"
                      value={formData.communicationStyle}
                      onChange={(e) => handleInputChange('communicationStyle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Formal">Formal y profesional</option>
                      <option value="Casual">Casual y cercano</option>
                      <option value="Inspiracional">Inspiracional y motivador</option>
                      <option value="Técnico">Técnico y preciso</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription" className="text-gray-700 font-medium">
                    Descripción del negocio <Badge variant="secondary" className="ml-1 text-xs">Requerido</Badge>
                  </Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    placeholder="Describe a qué se dedica tu empresa, qué productos o servicios ofrece..."
                    rows={3}
                    className="border-gray-200"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => router.push('/register')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>

              <Button
                onClick={handleStep1Submit}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            {/* Step 2: Estrategia y Audiencia */}
            <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Estrategia y Mercado</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Define tu audiencia y propuesta de valor
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-sm mb-8">
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience" className="text-gray-700 font-medium">
                    Público objetivo <Badge variant="secondary" className="ml-1 text-xs">Requerido</Badge>
                  </Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="¿A quién le vendes? Describe tu cliente ideal..."
                    rows={2}
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainChallenges" className="text-gray-700 font-medium">
                    Principales desafíos <Badge variant="secondary" className="ml-1 text-xs">Requerido</Badge>
                  </Label>
                  <Textarea
                    id="mainChallenges"
                    value={formData.mainChallenges}
                    onChange={(e) => handleInputChange('mainChallenges', e.target.value)}
                    placeholder="¿Cuáles son los principales retos que enfrenta tu empresa?"
                    rows={2}
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentGoals" className="text-gray-700 font-medium">
                    Objetivos actuales <Badge variant="secondary" className="ml-1 text-xs">Requerido</Badge>
                  </Label>
                  <Textarea
                    id="currentGoals"
                    value={formData.currentGoals}
                    onChange={(e) => handleInputChange('currentGoals', e.target.value)}
                    placeholder="¿Qué quieres lograr este año? ¿Cuáles son tus metas?"
                    rows={2}
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uniqueValue" className="text-gray-700 font-medium">
                    Propuesta de valor única <Badge variant="secondary" className="ml-1 text-xs">Requerido</Badge>
                  </Label>
                  <Textarea
                    id="uniqueValue"
                    value={formData.uniqueValue}
                    onChange={(e) => handleInputChange('uniqueValue', e.target.value)}
                    placeholder="¿Qué te hace diferente de la competencia? ¿Por qué deberían elegirte?"
                    rows={2}
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workValues" className="text-gray-700 font-medium">Valores importantes para tu empresa</Label>
                  <Textarea
                    id="workValues"
                    value={formData.workValues}
                    onChange={(e) => handleInputChange('workValues', e.target.value)}
                    placeholder="Ej: Innovación, transparencia, excelencia, colaboración..."
                    rows={2}
                    className="border-gray-200"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>

              <Button
                onClick={handleStep2Submit}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            {/* Step 3: Generar Identidad */}
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Generar Identidad con IA</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Crearemos tu misión, visión y valores únicos
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {!generatedIdentity ? (
              <Card className="shadow-sm text-center mb-8">
                <CardContent className="py-12">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        ¿Listo para crear tu identidad única?
                      </h3>
                      <p className="text-gray-600">
                        Nuestra IA analizará tu información y generará una identidad corporativa 
                        profesional que refleje la esencia de tu empresa.
                      </p>
                    </div>

                    <div className="space-y-3 text-left bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Target className="h-4 w-4 text-green-600" />
                        Misión empresarial personalizada
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Target className="h-4 w-4 text-green-600" />
                        Visión de futuro inspiradora
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Target className="h-4 w-4 text-green-600" />
                        Valores corporativos auténticos
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateIdentity}
                      disabled={isLoading}
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Generando identidad...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Generar Identidad Corporativa
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <CardTitle className="text-xl text-gray-900">¡Identidad Generada!</CardTitle>
                      <CardDescription className="text-gray-600">
                        Tu identidad corporativa ha sido creada exitosamente
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Misión</h4>
                      <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        {generatedIdentity.mission}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Visión</h4>
                      <p className="text-gray-700 bg-green-50 p-4 rounded-lg border border-green-200">
                        {generatedIdentity.vision}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Valores</h4>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        {Array.isArray(generatedIdentity.values) ? (
                          <ul className="space-y-2">
                            {generatedIdentity.values.map((value: string, index: number) => (
                              <li key={index} className="text-gray-700 flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                {value}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-700">{JSON.stringify(generatedIdentity.values)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Continuarás automáticamente al diagnóstico empresarial en unos momentos...
                    </p>
                    <Button
                      onClick={() => router.push('/onboarding/diagnostico')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Continuar al Diagnóstico
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                disabled={isLoading || generatedIdentity}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="text-sm text-gray-500">
                {generatedIdentity ? "¡Identidad creada exitosamente!" : "Genera tu identidad para continuar"}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
