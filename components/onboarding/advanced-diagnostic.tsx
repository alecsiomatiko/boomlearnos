"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { VoiceInput } from "./voice-input"
import { 
  Settings,
  DollarSign,
  Target,
  AlertTriangle,
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Lightbulb
} from "lucide-react"
import { advancedDiagnosticQuestions, DiagnosticQuestion } from "@/lib/onboarding/advanced-diagnostic"

interface AdvancedDiagnosticProps {
  onComplete: (answers: Record<string, any>) => void
  onBack?: () => void
}

const iconMap = {
  Settings,
  DollarSign,
  Target,
  AlertTriangle,
  Lightbulb
}

export function AdvancedDiagnostic({ onComplete, onBack }: AdvancedDiagnosticProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)

  const currentSection = advancedDiagnosticQuestions[currentSectionIndex]
  const currentQuestion = currentSection.questions[currentQuestionIndex]
  const totalQuestions = advancedDiagnosticQuestions.reduce((sum, section) => sum + section.questions.length, 0)
  const answeredQuestions = Object.keys(answers).length
  const progress = (answeredQuestions / totalQuestions) * 100

  const IconComponent = iconMap[currentSection.icon as keyof typeof iconMap] || Settings

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const isCurrentQuestionAnswered = () => {
    const answer = answers[currentQuestion.id]
    if (currentQuestion.required) {
      if (currentQuestion.type === 'checkbox') {
        return Array.isArray(answer) && answer.length > 0
      }
      return answer && (typeof answer === 'string' ? answer.trim() !== '' : true)
    }
    return true
  }

  const handleNext = () => {
    if (!isCurrentQuestionAnswered()) {
      return
    }

    // Si hay más preguntas en la sección actual
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
    // Si hay más secciones
    else if (currentSectionIndex < advancedDiagnosticQuestions.length - 1) {
      setCurrentSectionIndex(prev => prev + 1)
      setCurrentQuestionIndex(0)
    }
    // Completar diagnóstico
    else {
      handleComplete()
    }
  }

  const handleBack = () => {
    // Si hay preguntas anteriores en la sección actual
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
    // Si hay secciones anteriores
    else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1)
      setCurrentQuestionIndex(advancedDiagnosticQuestions[currentSectionIndex - 1].questions.length - 1)
    }
    // Volver al paso anterior
    else if (onBack) {
      onBack()
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await onComplete(answers)
    } catch (error) {
      console.error('Error completing diagnostic:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderQuestion = (question: DiagnosticQuestion) => {
    const value = answers[question.id] || (question.type === 'checkbox' ? [] : '')

    switch (question.type) {
      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            className="grid gap-3"
          >
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-4 rounded-xl border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer group">
                <RadioGroupItem value={option.value} id={option.value} className="group-hover:border-blue-500" />
                <Label 
                  htmlFor={option.value} 
                  className="flex-1 cursor-pointer text-sm leading-relaxed font-medium group-hover:text-blue-700"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <div className="grid gap-3">
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-4 rounded-xl border-2 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all cursor-pointer group">
                <Checkbox
                  id={option.value}
                  checked={value.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswerChange(question.id, [...value, option.value])
                    } else {
                      handleAnswerChange(question.id, value.filter((v: string) => v !== option.value))
                    }
                  }}
                  className="group-hover:border-green-500"
                />
                <Label 
                  htmlFor={option.value} 
                  className="flex-1 cursor-pointer text-sm leading-relaxed font-medium group-hover:text-green-700"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'voice_text':
        return (
          <VoiceInput
            value={value}
            onChange={(value) => handleAnswerChange(question.id, value)}
            placeholder={question.placeholder}
            className="w-full"
          />
        )

      default:
        return null
    }
  }

  const isLastQuestion = currentSectionIndex === advancedDiagnosticQuestions.length - 1 && 
                       currentQuestionIndex === currentSection.questions.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <IconComponent className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentSection.title}</h1>
                <p className="text-sm text-gray-600">{currentSection.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm bg-white">
              {answeredQuestions}/{totalQuestions} respuestas
            </Badge>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {answeredQuestions + 1}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl leading-relaxed text-gray-900 mb-3">
                  {currentQuestion.question}
                </CardTitle>
                {currentQuestion.required && (
                  <Badge variant="secondary" className="text-xs">
                    Requerida
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-6">
              {renderQuestion(currentQuestion)}
              
              {/* Navigation */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2 hover:bg-gray-50"
                  disabled={currentSectionIndex === 0 && currentQuestionIndex === 0 && !onBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                  <Target className="h-4 w-4" />
                  Sección {currentSectionIndex + 1} de {advancedDiagnosticQuestions.length}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!isCurrentQuestionAnswered() || isLoading}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analizando...
                    </>
                  ) : isLastQuestion ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Completar Diagnóstico
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Progress */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-3">
            {advancedDiagnosticQuestions.map((section, index) => {
              const SectionIcon = iconMap[section.icon as keyof typeof iconMap] || Settings
              const isActive = index === currentSectionIndex
              const isCompleted = index < currentSectionIndex
              
              return (
                <div
                  key={section.id}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all font-medium ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700 shadow-sm'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <SectionIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">{section.title}</span>
                  {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}