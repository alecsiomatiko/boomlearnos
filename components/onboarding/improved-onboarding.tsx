"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { VoiceInput } from "./voice-input"
import { 
  Building2, 
  Users, 
  Target, 
  Heart, 
  Eye, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react"
import { improvedOnboardingQuestions, OnboardingQuestion, OnboardingSection } from "@/lib/onboarding/improved-questions"

interface ImprovedOnboardingProps {
  onComplete: (answers: Record<string, any>) => void
  onBack?: () => void
}

const iconMap = {
  Building2,
  Users,
  Target,
  Heart,
  Eye
}

export function ImprovedOnboarding({ onComplete, onBack }: ImprovedOnboardingProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)

  const currentSection = improvedOnboardingQuestions[currentSectionIndex]
  const currentQuestion = currentSection.questions[currentQuestionIndex]
  const totalQuestions = improvedOnboardingQuestions.reduce((sum, section) => sum + section.questions.length, 0)
  const answeredQuestions = Object.keys(answers).length
  const progress = (answeredQuestions / totalQuestions) * 100

  const IconComponent = iconMap[currentSection.icon as keyof typeof iconMap] || Building2

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const isCurrentQuestionAnswered = () => {
    const answer = answers[currentQuestion.id]
    if (currentQuestion.required) {
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
    else if (currentSectionIndex < improvedOnboardingQuestions.length - 1) {
      setCurrentSectionIndex(prev => prev + 1)
      setCurrentQuestionIndex(0)
    }
    // Completar onboarding
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
      setCurrentQuestionIndex(improvedOnboardingQuestions[currentSectionIndex - 1].questions.length - 1)
    }
    // Volver al paso anterior del onboarding
    else if (onBack) {
      onBack()
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await onComplete(answers)
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderQuestion = (question: OnboardingQuestion) => {
    const value = answers[question.id] || ''

    switch (question.type) {
      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            className="grid gap-3"
          >
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label 
                  htmlFor={option.value} 
                  className="flex-1 cursor-pointer text-sm leading-relaxed"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
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

      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="w-full"
          />
        )

      default:
        return null
    }
  }

  const isLastQuestion = currentSectionIndex === improvedOnboardingQuestions.length - 1 && 
                       currentQuestionIndex === currentSection.questions.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <IconComponent className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentSection.title}</h1>
                <p className="text-sm text-gray-600">{currentSection.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {answeredQuestions}/{totalQuestions} preguntas
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {answeredQuestions + 1}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl leading-relaxed text-gray-900 mb-2">
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
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                  disabled={currentSectionIndex === 0 && currentQuestionIndex === 0 && !onBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {currentSectionIndex + 1} de {improvedOnboardingQuestions.length} secciones
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!isCurrentQuestionAnswered() || isLoading}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : isLastQuestion ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Completar
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
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            {improvedOnboardingQuestions.map((section, index) => {
              const SectionIcon = iconMap[section.icon as keyof typeof iconMap] || Building2
              const isActive = index === currentSectionIndex
              const isCompleted = index < currentSectionIndex
              
              return (
                <div
                  key={section.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <SectionIcon className="h-4 w-4" />
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