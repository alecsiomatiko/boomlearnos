"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Target,
  Eye,
  Heart,
  CheckCircle2,
  Loader2,
  Users
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

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
    communicationStyle: ''
  })

  const totalSteps = 3
  const progressPercentage = (currentStep / totalSteps) * 100

  const handleInputChange = (field: keyof IdentityFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validar datos básicos
      if (!formData.companyName || !formData.businessType || !formData.businessDescription) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa nombre de empresa, tipo de negocio y descripción.",
          variant: "destructive",
        })
        return
      }
    } else if (currentStep === 2) {
      // Validar datos estratégicos
      if (!formData.targetAudience || !formData.mainChallenges || !formData.currentGoals || !formData.uniqueValue) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa todos los campos estratégicos.",
          variant: "destructive",
        })
        return
      }
    }
    
    setCurrentStep(prev => prev + 1)
  }

  const handleGenerateIdentity = async () => {
    if (!user?.id) return

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
        if (result.identityGenerated) {
          // IA disponible - identidad generada exitosamente
          setGeneratedIdentity(result.organization)
          toast({
            title: "¡Identidad creada con IA!",
            description: "Tu identidad organizacional ha sido generada exitosamente.",
          })
          
          // Continuar al diagnóstico
          setTimeout(() => {
            router.push('/onboarding/diagnostico')
          }, 3000)
        } else {
          // IA no disponible - identidad pendiente
          toast({
            title: "Organización Creada",
            description: "Tu organización se creó exitosamente. Continuemos con el diagnóstico.",
            duration: 5000,
          })
          
          // Ir al diagnóstico para completar el flujo
          setTimeout(() => {
            router.push('/onboarding/diagnostico')
          }, 3000)
        }
      } else {
        // Error en el servidor
        console.warn('API falló, usando fallback frontend:', result.error)
        
        const fallbackIdentity = {
          mission: `${formData.companyName} se dedica a ${formData.businessDescription || 'brindar servicios de alta calidad'}, enfocándose en ${formData.targetAudience || 'nuestros clientes'} y destacando por ${formData.uniqueValue || 'nuestra excelencia'}.`,
          vision: `Ser una empresa líder en ${formData.businessType || 'nuestro sector'}, reconocida por la innovación, calidad y compromiso con el éxito de ${formData.targetAudience || 'nuestros clientes'}.`,
          values: formData.workValues ? formData.workValues.split(',').map(v => v.trim()).slice(0, 5) : ['Excelencia', 'Integridad', 'Innovación', 'Compromiso']
        }
        
        setGeneratedIdentity(fallbackIdentity)
        
        toast({
          title: "Identidad Generada",
          description: "Se ha creado tu identidad organizacional básica.",
        })
        
        // Continuar al diagnóstico
        setTimeout(() => {
          router.push('/onboarding/diagnostico')
        }, 3000)
      }
    } catch (error: any) {
      console.error('Error de conexión:', error)
      
      // Fallback final si hay problemas de red
      const fallbackIdentity = {
        mission: `${formData.companyName} se dedica a brindar servicios de alta calidad, enfocándose en la excelencia y el compromiso con nuestros clientes.`,
        vision: `Ser una empresa líder reconocida por la innovación, calidad y compromiso con el éxito de nuestros clientes.`,
        values: ['Excelencia', 'Integridad', 'Innovación', 'Compromiso']
      }
      
      setGeneratedIdentity(fallbackIdentity)
      
      toast({
        title: "Identidad Creada",
        description: "Se ha generado una identidad básica para continuar.",
      })
      
      // Continuar al diagnóstico
      setTimeout(() => {
        router.push('/onboarding/diagnostico')
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValidStep1 = formData.companyName && formData.businessType && formData.businessDescription
  const isFormValidStep2 = formData.targetAudience && formData.mainChallenges && formData.currentGoals && formData.uniqueValue

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">BoomLearnOS</h1>
                <p className="text-sm text-gray-500">Identidad Organizacional</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Paso {currentStep} de {totalSteps}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">Configuración de Identidad</span>
              <span className="text-gray-500">{Math.round(progressPercentage)}% completado</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentStep === 1 && (
          <>
            {/* Step 1: Company Basic Info */}
            <Card className="mb-6 bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-red-600" />
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

            <Card className="shadow-sm mb-8 bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg text-gray-900">Datos Básicos</CardTitle>
                <CardDescription className="text-gray-600">
                  Esta información nos ayudará a generar tu identidad única
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 bg-white">
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
                      placeholder="Ej: Tecnología, Consultoría, Retail"
                      className="border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize" className="text-gray-700 font-medium">Tamaño de la empresa</Label>
                  <select
                    id="companySize"
                    value={formData.companySize}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                  <Label htmlFor="businessDescription" className="text-gray-700 font-medium">
                    Descripción del negocio <Badge variant="secondary" className="ml-1 text-xs">Requerido</Badge>
                  </Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    placeholder="Describe a qué se dedica tu empresa, qué productos o servicios ofrece..."
                    className="min-h-[100px] border-gray-200"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {currentStep === 2 && (
          <>
            {/* Step 2: Strategic Information */}
            <Card className="mb-6 bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Estrategia y Posicionamiento</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Define tu mercado y propuesta de valor
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-sm mb-8 bg-white border-gray-200">
              <CardContent className="pt-6 space-y-6 bg-white">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience" className="text-gray-700 font-medium">
                    Público objetivo <Badge variant="secondary" className="ml-1 text-xs">Requerido</Badge>
                  </Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="¿A quién le vendes? Describe tu cliente ideal..."
                    className="min-h-[80px] border-gray-200"
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
                    className="min-h-[80px] border-gray-200"
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
                    className="min-h-[80px] border-gray-200"
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
                    className="min-h-[80px] border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workValues" className="text-gray-700 font-medium">Valores importantes</Label>
                    <Textarea
                      id="workValues"
                      value={formData.workValues}
                      onChange={(e) => handleInputChange('workValues', e.target.value)}
                      placeholder="Ej: Innovación, transparencia, excelencia..."
                      className="min-h-[60px] border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="communicationStyle" className="text-gray-700 font-medium">Estilo de comunicación</Label>
                    <select
                      id="communicationStyle"
                      value={formData.communicationStyle}
                      onChange={(e) => handleInputChange('communicationStyle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Formal">Formal y profesional</option>
                      <option value="Casual">Casual y cercano</option>
                      <option value="Inspiracional">Inspiracional y motivador</option>
                      <option value="Técnico">Técnico y preciso</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {currentStep === 3 && (
          <>
            {/* Step 3: Generate Identity */}
            <Card className="mb-6 bg-white border-gray-200 shadow-sm">
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
              <Card className="shadow-sm text-center mb-8 bg-white border-gray-200">
                <CardContent className="py-12 bg-white">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
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
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
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
              <Card className="shadow-sm mb-8 bg-white border-gray-200">
                <CardHeader className="bg-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <CardTitle className="text-xl text-gray-900">¡Identidad Generada Exitosamente!</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    Tu identidad organizacional única ha sido creada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Misión</h4>
                      <p className="text-red-800">{generatedIdentity.mission}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Visión</h4>
                      <p className="text-green-800">{generatedIdentity.vision}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Valores</h4>
                      <ul className="text-purple-800 space-y-1">
                        {generatedIdentity.values.map((value: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 mb-2">Continuando al diagnóstico empresarial en 3 segundos...</p>
                    <div className="animate-pulse text-red-600">Preparando siguiente paso...</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => currentStep === 1 ? router.push('/register') : setCurrentStep(prev => prev - 1)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 1 ? 'Volver al registro' : 'Anterior'}
          </Button>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">
              {currentStep === 1 && 'Información básica'}
              {currentStep === 2 && 'Datos estratégicos'}
              {currentStep === 3 && 'Generación de identidad'}
            </div>
          </div>

          {currentStep < 3 && (
            <Button
              onClick={handleNextStep}
              disabled={(currentStep === 1 && !isFormValidStep1) || (currentStep === 2 && !isFormValidStep2)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {currentStep === 3 && generatedIdentity && (
            <Button
              onClick={() => router.push('/onboarding/diagnostico')}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
            >
              Continuar al diagnóstico
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
