"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Target,
  Users,
  Lightbulb,
  Home,
  User
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Estructura del cuestionario con diseño limpio
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
  }
]

export default function DiagnosticoPage() {
  const router = useRouter()
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
    setIsLoading(true)
    try {
      // Aquí integrarías con el API de completar onboarding
      toast({
        title: "¡Diagnóstico completado!",
        description: "Has completado exitosamente el diagnóstico empresarial.",
      })
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al completar el diagnóstico.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isAnswered = answers[question?.id] !== undefined && answers[question?.id] !== null && answers[question?.id] !== ''
  const canProceed = !question?.isRequired || isAnswered
  const isLastQuestion = currentSection === questionSections.length - 1 && currentQuestion === section.questions.length - 1

  if (!section || !question) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/onboarding/identidad')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              Pregunta {currentQuestionNumber} de {totalQuestions}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">Diagnóstico Empresarial</span>
              <span className="text-gray-500">{Math.round(progressPercentage)}% completado</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Section Header */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <section.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">{section.title}</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {section.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Question Card */}
        <Card className="mb-8 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900 leading-relaxed mb-2">
                  {question.question}
                  {question.required && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Requerido
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
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
                className="min-h-[120px] resize-none"
              />
            )}

            {question.type === 'input' && (
              <Input
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={question.placeholder || "Escribe tu respuesta..."}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === 0 && currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">
              Sección: {section.title}
            </div>
            <div className="text-xs text-gray-400">
              {currentQuestion + 1} de {section.questions.length} preguntas
            </div>
          </div>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              "Procesando..."
            ) : isLastQuestion ? (
              "Completar diagnóstico"
            ) : (
              <>
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
