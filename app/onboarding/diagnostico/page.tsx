"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Target,
  Users,
  Lightbulb,
  TrendingUp,
  Shield,
  Home,
  User
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

// Estructura del cuestionario con diseño limpio y fondo blanco
const questionSections = [
  {
    id: "empresa",
    title: "Información de tu Empresa",
    icon: Building2,
    description: "Cuéntanos sobre tu negocio actual",
    questions: [
      {
        id: "industry",
        type: "radio",
        question: "¿En qué industria opera tu empresa?",
        required: true,
        options: [
          { value: "tecnologia", label: "Tecnología y Software" },
          { value: "servicios", label: "Servicios Profesionales" },
          { value: "retail", label: "Retail y E-commerce" },
          { value: "manufactura", label: "Manufactura y Producción" },
          { value: "salud", label: "Salud y Bienestar" },
          { value: "educacion", label: "Educación y Formación" },
          { value: "finanzas", label: "Finanzas y Seguros" },
          { value: "inmobiliaria", label: "Bienes Raíces" },
          { value: "alimentaria", label: "Alimentaria y Bebidas" },
          { value: "consultoria", label: "Consultoría" },
          { value: "otro", label: "Otro" }
        ]
      },
      {
        id: "company_size",
        type: "radio",
        question: "¿Cuál es el tamaño actual de tu empresa?",
        required: true,
        options: [
          { value: "solo", label: "Solo yo (emprendedor individual)" },
          { value: "pequena", label: "2-10 empleados" },
          { value: "mediana_pequena", label: "11-50 empleados" },
          { value: "mediana", label: "51-200 empleados" },
          { value: "grande", label: "Más de 200 empleados" }
        ]
      }
    ]
  },
  {
    id: "estrategia",
    title: "Estrategia y Objetivos",
    icon: Target,
    description: "Define tus metas y estrategias de negocio",
    questions: [
      {
        id: "business_stage",
        type: "radio",
        question: "¿En qué etapa se encuentra tu negocio?",
        required: true,
        options: [
          { value: "idea", label: "Tengo una idea, pero aún no he empezado" },
          { value: "startup", label: "Startup en fase inicial (0-2 años)" },
          { value: "crecimiento", label: "En crecimiento (2-5 años)" },
          { value: "establecida", label: "Empresa establecida (5+ años)" },
          { value: "expansion", label: "En expansión o escalamiento" },
          { value: "transformacion", label: "En proceso de transformación" }
        ]
      },
      {
        id: "main_goals",
        type: "textarea",
        question: "¿Cuáles son tus principales objetivos para los próximos 12 meses?",
        required: true,
        placeholder: "Describe tus metas principales..."
      }
    ]
  },
  {
    id: "proposicion",
    title: "Propuesta de Valor",
    icon: Lightbulb,
    description: "Define qué te hace único en el mercado",
    questions: [
      {
        id: "main_product_service",
        type: "textarea",
        question: "Describe en detalle tu producto o servicio principal",
        placeholder: "Ej: Desarrollamos software de gestión empresarial que automatiza procesos contables y financieros para PyMEs, reduciendo el tiempo de procesamiento en un 70%...",
        required: true
      },
      {
        id: "unique_value_proposition",
        type: "textarea",
        question: "¿Qué te diferencia de tu competencia? ¿Cuál es tu ventaja competitiva única?",
        placeholder: "Ej: Somos los únicos que ofrecemos integración completa con bancos locales, soporte 24/7 en español y precios 50% más bajos que la competencia internacional...",
        required: true
      },
      {
        id: "problem_solving",
        type: "textarea",
        question: "¿Qué problema específico resuelves para tus clientes?",
        placeholder: "Ej: Las PyMEs pierden 15 horas semanales en tareas contables manuales y cometen errores costosos. Nosotros automatizamos estos procesos...",
        required: true
      }
    ]
  },
  {
    id: "audiencia",
    title: "Audiencia Objetivo",
    icon: Users,
    description: "Define a quién sirves y por qué te eligen",
    questions: [
      {
        id: "target_customer",
        type: "textarea",
        question: "Describe a tu cliente ideal en detalle (demografía, psicografía, comportamiento)",
        placeholder: "Ej: Dueños de PyMEs de 30-50 años, con facturación de $500K-$5M anuales, que valoran la eficiencia, están abiertos a la tecnología pero necesitan soporte personalizado...",
        required: true
      },
      {
        id: "customer_pain_points",
        type: "checkbox",
        question: "¿Cuáles son los principales dolores de tus clientes? (selecciona todos los que apliquen)",
        required: true,
        options: [
          { value: "tiempo", label: "Falta de tiempo para tareas importantes" },
          { value: "costos", label: "Costos operativos muy altos" },
          { value: "eficiencia", label: "Procesos ineficientes o manuales" },
          { value: "calidad", label: "Problemas de calidad en productos/servicios" },
          { value: "competencia", label: "Presión competitiva intensa" },
          { value: "tecnologia", label: "Falta de herramientas tecnológicas adecuadas" },
          { value: "talento", label: "Dificultad para encontrar talento calificado" },
          { value: "escalabilidad", label: "Dificultad para escalar el negocio" }
        ]
      }
    ]
  }
]

export default function DiagnosticoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)

  const section = questionSections[currentSection]
  const question = section?.questions[currentQuestion]
  const totalQuestions = questionSections.reduce((acc, section) => acc + section.questions.length, 0)
  const currentQuestionNumber = questionSections
    .slice(0, currentSection)
    .reduce((acc, sec) => acc + sec.questions.length, 0) + currentQuestion + 1
  const progressPercentage = (currentQuestionNumber / totalQuestions) * 100

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestion < section.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else if (currentSection < questionSections.length - 1) {
      setCurrentSection(prev => prev + 1)
      setCurrentQuestion(0)
    } else {
      // Completar diagnóstico
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    } else if (currentSection > 0) {
      setCurrentSection(prev => prev - 1)
      setCurrentQuestion(questionSections[currentSection - 1].questions.length - 1)
    }
  }

  const handleComplete = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      // Guardar respuestas del diagnóstico
      const diagnosticResponse = await fetch('/api/onboarding/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          answers: answers
        }),
      })

      if (!diagnosticResponse.ok) {
        throw new Error('Error guardando respuestas del diagnóstico')
      }

      // Completar onboarding
      const onboardingResponse = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      })

      const result = await onboardingResponse.json()

      if (result.success) {
        toast({
          title: "¡Onboarding completado!",
          description: `¡Felicitaciones! Has ganado ${result.rewards?.gems || 50} gemas y una medalla de bienvenida.`,
        })
        
        // Pequeña pausa para mostrar el mensaje
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        throw new Error(result.error || 'Error completando onboarding')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al completar el diagnóstico.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isAnswered = question?.questionType === 'checkbox' 
    ? (answers[question?.id] && Array.isArray(answers[question?.id]) && answers[question?.id].length > 0)
    : (answers[question?.id] !== undefined && answers[question?.id] !== null && answers[question?.id] !== '')
  
  const canProceed = !question?.required || isAnswered

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diagnóstico Empresarial
          </h1>
          <p className="text-gray-600 mb-6">
            Completa este diagnóstico para obtener insights personalizados para tu empresa
          </p>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Pregunta {currentQuestionNumber} de {totalQuestions}</span>
              <span>{Math.round(progressPercentage)}% completado</span>
            </div>
          </div>
        </div>

        {/* Section Progress */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {questionSections.map((sect, index) => {
              const Icon = sect.icon
              const isActive = index === currentSection
              const isCompleted = index < currentSection
              
              return (
                <div
                  key={sect.id}
                  className={`flex flex-col items-center min-w-0 ${
                    isActive ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isActive
                        ? 'bg-red-100 text-red-600 ring-2 ring-red-500'
                        : isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-xs text-center font-medium ${
                    isActive ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {sect.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="text-center bg-white">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full bg-red-500 flex items-center justify-center`}>
                <section.icon className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {section.title}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {section.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 bg-white">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {question.question}
                  {question.required && (
                    <Badge variant="secondary" className="ml-2">
                      Requerido
                    </Badge>
                  )}
                </h3>
              </div>

              {question.type === 'radio' && (
                <RadioGroup 
                  value={answers[question.id] || ''} 
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {question.options?.map((option) => (
                    <div 
                      key={option.value} 
                      className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label 
                        htmlFor={option.value} 
                        className="flex-1 cursor-pointer font-medium text-gray-700"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === 'textarea' && (
                <Textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={question.placeholder || "Escribe tu respuesta aquí..."}
                  className="min-h-[120px] resize-none border-gray-200 focus:border-red-500 focus:ring-red-500"
                />
              )}

              {question.type === 'input' && (
                <Input
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={question.placeholder || "Escribe tu respuesta..."}
                  className="border-gray-200 focus:border-red-500 focus:ring-red-500"
                />
              )}

              {question.type === 'checkbox' && (
                <div className="space-y-3">
                  {question.options?.map((option) => (
                    <div 
                      key={option.value} 
                      className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        id={option.value}
                        checked={(answers[question.id] || []).includes(option.value)}
                        onCheckedChange={(checked) => {
                          const currentAnswers = answers[question.id] || []
                          if (checked) {
                            handleAnswer([...currentAnswers, option.value])
                          } else {
                            handleAnswer(currentAnswers.filter((val: string) => val !== option.value))
                          }
                        }}
                      />
                      <Label 
                        htmlFor={option.value} 
                        className="flex-1 cursor-pointer font-medium text-gray-700"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === 0 && currentQuestion === 0}
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? (
              "Guardando..."
            ) : currentSection === questionSections.length - 1 && currentQuestion === section.questions.length - 1 ? (
              "Completar Diagnóstico"
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
