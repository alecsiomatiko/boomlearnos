"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Save, Brain } from "lucide-react"
import { useAuth } from "@/contexts/auth-context" // ✅ CAMBIO: Usar useAuth en lugar de getUser
import { DiagnosticService, type DiagnosticQuestion, type DiagnosticModule } from "@/services/diagnostic-service"
import { QuestionDisplay } from "@/components/mega-diagnostic/question-display"
import { ModuleAIAnalysis } from "@/components/mega-diagnostic/module-ai-analysis"
import { useResponseManager, type QuestionResponse } from "@/hooks/use-response-manager"
import type { User } from "@/types/user"

export default function ModulePage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.moduleId as string
  const { user: authUser } = useAuth() // ✅ CAMBIO: Obtener usuario del contexto

  const [module, setModule] = useState<DiagnosticModule | null>(null)
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModuleCompleted, setIsModuleCompleted] = useState(false)
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  
  // Hook para manejar respuestas
  const { saveModuleResponses, isSaving, lastSaveResult } = useResponseManager()

  useEffect(() => {
    async function initialize() {
      if (!authUser?.id) { // ✅ CAMBIO: Esperar a que authUser esté disponible
        return
      }

      try {
        setIsLoading(true)

        // ✅ VERIFICAR QUE SEA ADMIN
        if (authUser.role !== 'admin') {
          console.warn('🚫 [MODULE] Acceso denegado - Usuario no es admin')
          router.push('/dashboard')
          return
        }

        // Obtener módulos para encontrar el actual
        const modules = await DiagnosticService.getModules()
        const currentModule = modules.find(m => m.module_code === moduleId)
        
        if (!currentModule) {
          console.error('Módulo no encontrado:', moduleId)
          router.push('/dashboard/mega-diagnostico')
          return
        }
        
        setModule(currentModule)

        // Obtener preguntas del módulo
        const moduleQuestions = await DiagnosticService.getModuleQuestions(currentModule.id)
        setQuestions(moduleQuestions)

        // ✅ Cargar respuestas existentes del usuario PARA ESTA ORGANIZACIÓN
        console.log('🔍 [MODULE] Cargando respuestas guardadas para:', moduleId)
        
        // ✅ BUSCAR organization_id EN CUALQUIER VARIANTE
        const organizationId = authUser.current_organization_id || (authUser as any).organization_id || (authUser as any).organizationId || (authUser as any).organization?.id;
        console.log('🏢 [MODULE] Organización:', organizationId)
        
        try {
          const response = await fetch(
            `/api/diagnostic/user-responses?userId=${authUser.id}&organizationId=${organizationId}&moduleCode=${moduleId}`
          )
          if (response.ok) {
            const { userResponses } = await response.json()
            
            if (userResponses && userResponses.length > 0) {
              console.log(`✅ [MODULE] Encontradas ${userResponses.length} respuestas guardadas`)
              
              // Convertir respuestas a formato del estado
              const loadedAnswers: Record<string, string[]> = {}
              userResponses.forEach((resp: any) => {
                loadedAnswers[resp.question_id] = [resp.selected_option_id]
              })
              
              setAnswers(loadedAnswers)
              
              // Calcular el índice de la primera pregunta sin responder
              const firstUnansweredIndex = moduleQuestions.findIndex(q => !loadedAnswers[q.id])
              if (firstUnansweredIndex !== -1) {
                setCurrentQuestionIndex(firstUnansweredIndex)
                console.log(`📍 [MODULE] Posicionando en pregunta ${firstUnansweredIndex + 1}`)
              } else {
                // Todas las preguntas están respondidas - módulo completado
                setIsModuleCompleted(true)
                console.log('✅ [MODULE] Módulo completado previamente')
              }
            } else {
              console.log('📝 [MODULE] Sin respuestas previas - empezando desde cero')
            }
          }
        } catch (error) {
          console.warn('⚠️ [MODULE] Error cargando respuestas previas:', error)
          // Continuar sin respuestas previas
        }

      } catch (error) {
        console.error('Error initializing module:', error)
        router.push('/dashboard/mega-diagnostico')
      } finally {
        setIsLoading(false)
      }
    }

    if (moduleId && authUser?.id) { // ✅ CAMBIO: Agregar authUser como condición
      initialize()
    }
  }, [moduleId, router, authUser?.id]) // ✅ CAMBIO: Agregar authUser.id como dependencia

  const handleAnswer = (questionId: string, selectedOptionIds: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOptionIds
    }))
  }

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIndex]
    
    // ✅ Validar que la pregunta actual tenga respuesta
    if (!answers[currentQuestion.id] || answers[currentQuestion.id].length === 0) {
      alert('⚠️ Por favor responde esta pregunta antes de continuar')
      return
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Módulo completado - guardar todas las respuestas
      await handleModuleCompletion()
    }
  }

  const handleModuleCompletion = async () => {
    if (!authUser || !module) return; // ✅ CAMBIO: user → authUser

    // ✅ Validar que todas las preguntas tengan respuesta
    const unansweredQuestions = questions.filter(q => 
      !answers[q.id] || answers[q.id].length === 0
    );
    
    if (unansweredQuestions.length > 0) {
      const unansweredCount = unansweredQuestions.length;
      const message = `⚠️ Hay ${unansweredCount} pregunta${unansweredCount > 1 ? 's' : ''} sin responder. Por favor completa todas las preguntas antes de finalizar el módulo.`;
      alert(message);
      
      // Ir a la primera pregunta sin responder
      const firstUnansweredIndex = questions.findIndex(q => 
        !answers[q.id] || answers[q.id].length === 0
      );
      if (firstUnansweredIndex !== -1) {
        setCurrentQuestionIndex(firstUnansweredIndex);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('🎯 [MODULE] Completando módulo:', moduleId);
      console.log('👤 [MODULE] Usuario:', { id: authUser.id, email: authUser.email }); // ✅ CAMBIO
      console.log('📋 [MODULE] Respuestas actuales:', answers);

      // Preparar respuestas para el backend
      const responseData: Array<{questionId: string, selectedOptionId: string}> = [];
      
      for (const questionId in answers) {
        const question = questions.find(q => q.id === questionId);
        console.log(`🔍 [MODULE] Procesando pregunta ${questionId}:`, {
          encontrada: !!question,
          respuesta: answers[questionId],
          tieneRespuesta: !!(answers[questionId] && answers[questionId].length > 0)
        });
        
        if (!question || !answers[questionId] || answers[questionId].length === 0) {
          console.warn(`⚠️ [MODULE] Saltando pregunta ${questionId} - sin respuesta o pregunta no encontrada`);
          continue;
        }

        // Para preguntas de opción única, tomar la primera (y única) respuesta
        const selectedOptionCode = answers[questionId][0];
        console.log(`🎯 [MODULE] Código de opción seleccionada para pregunta ${questionId}:`, selectedOptionCode);
        
        // Buscar la opción correspondiente
        const options = Array.isArray(question.options) 
          ? question.options 
          : (typeof question.options === 'string' 
              ? JSON.parse(question.options) 
              : []);
        
        console.log(`📝 [MODULE] Opciones de pregunta ${questionId}:`, options.map((opt: any) => ({
          id: opt.id,
          code: opt.option_code,
          text: opt.option_text
        })));
              
        const selectedOption = options.find((opt: any) => opt.option_code === selectedOptionCode);
        
        if (selectedOption) {
          console.log(`✅ [MODULE] Pregunta ${question.id} - Opción encontrada:`, {
            questionId: question.id,
            selectedOptionCode,
            selectedOptionId: selectedOption.id,
            selectedOptionData: selectedOption
          });
          
          responseData.push({
            questionId: question.id,
            selectedOptionId: selectedOption.id
          });
        } else {
          console.warn(`⚠️ [MODULE] Opción no encontrada para código: ${selectedOptionCode} en pregunta ${question.id}`);
          console.log(`🔍 [MODULE] Opciones disponibles:`, options.map((opt: any) => ({ 
            id: opt.id, 
            code: opt.option_code, 
            text: opt.option_text 
          })));
        }
      }

      console.log(`� [MODULE] Datos finales para enviar (${responseData.length} respuestas):`, responseData);

      if (responseData.length > 0) {
        console.log('🚀 [MODULE] Enviando respuestas al servidor...');
        const result = await saveModuleResponses(moduleId, responseData);
        
        console.log('📬 [MODULE] Respuesta del servidor:', result);
        
        if (result.success) {
          console.log('✅ [MODULE] Módulo completado exitosamente:', result);
          
          // Marcar módulo como completado para mostrar análisis IA
          setIsModuleCompleted(true);
          
          // Mostrar mensaje de éxito
          alert('🎉 ¡Módulo completado! Ahora puedes generar tu análisis IA personalizado.');
          
          // Regresar al overview después de un delay
          setTimeout(() => {
            router.push('/dashboard/mega-diagnostico');
          }, 3000);
        } else {
          console.error('❌ [MODULE] Error completando módulo:', result.message);
        }
      } else {
        console.warn('⚠️ [MODULE] No hay respuestas para guardar');
        router.push('/dashboard/mega-diagnostico');
      }
      
    } catch (error) {
      console.error('❌ [MODULE] Error en completación:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleBackToOverview = () => {
    router.push('/dashboard/mega-diagnostico')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando módulo...</h3>
          <p className="text-gray-600">Preparando las preguntas para ti</p>
        </div>
      </div>
    )
  }

  if (!module || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Módulo no disponible
            </h3>
            <p className="text-gray-600 mb-4">
              Este módulo no contiene preguntas o no está disponible en este momento.
            </p>
            <Button onClick={handleBackToOverview}>
              Volver al Mega-Diagnóstico
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100
  const currentAnswers = answers[currentQuestion?.id] || []
  const canProceed = currentAnswers.length > 0

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={handleBackToOverview}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Mega-Diagnóstico
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {currentQuestionIndex + 1} de {questions.length}
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {module.title}
            </h1>
            <p className="text-gray-600">{module.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Progreso del módulo
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(progressPercentage)}% • {Object.keys(answers).length}/{questions.length} respondidas
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            
            {/* ✅ Indicador visual de preguntas */}
            <div className="flex gap-1 flex-wrap mt-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] && answers[q.id].length > 0;
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      transition-all duration-200
                      ${isCurrent 
                        ? 'bg-brand-red text-white ring-2 ring-red-300 ring-offset-2' 
                        : isAnswered
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }
                    `}
                    title={`Pregunta ${idx + 1}${isAnswered ? ' (respondida)' : ''}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionDisplay
              question={currentQuestion}
              currentAnswers={currentAnswers}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirst={currentQuestionIndex === 0}
              isLast={currentQuestionIndex === questions.length - 1}
              moduleId={moduleId}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentQuestionIndex
                    ? 'bg-red-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting || isSaving}
            className="flex items-center gap-2"
          >
            {(isSubmitting || isSaving) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                {isSaving ? 'Guardando...' : 'Procesando...'}
              </>
            ) : currentQuestionIndex === questions.length - 1 ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Finalizar Módulo
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Mostrar resultado del guardado si existe */}
        {lastSaveResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            lastSaveResult.success 
              ? 'bg-green-100 border border-green-300 text-green-800' 
              : 'bg-red-100 border border-red-300 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {lastSaveResult.success ? <CheckCircle className="h-5 w-5" /> : <div className="h-5 w-5">❌</div>}
              <span className="font-medium">{lastSaveResult.message}</span>
            </div>
            {lastSaveResult.success && lastSaveResult.stats && (
              <div className="mt-2 text-sm">
                <p>✅ Guardadas: {lastSaveResult.stats.savedCount} | Actualizadas: {lastSaveResult.stats.updatedCount}</p>
                <p>📊 Completitud del módulo: {lastSaveResult.stats.moduleCompletion.completionPercentage}%</p>
                <p>⭐ Puntuación promedio: {lastSaveResult.stats.moduleCompletion.averageScore}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección de Análisis IA - Solo se muestra cuando el módulo está completado */}
      {isModuleCompleted && authUser && module && ( // ✅ CAMBIO: user → authUser
        <div className="mt-8">
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="bg-red-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-brand-red" />
                  Análisis IA del Módulo
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                  className="text-brand-red border-red-200 hover:bg-red-50"
                >
                  {showAIAnalysis ? 'Ocultar' : 'Ver'} Análisis IA
                </Button>
              </div>
            </CardHeader>
            {showAIAnalysis && (
              <CardContent>
                <ModuleAIAnalysis
                  userId={authUser.id} // ✅ CAMBIO
                  moduleCode={module.module_code}
                  moduleTitle={module.title}
                  isCompleted={isModuleCompleted}
                  onAnalysisComplete={(analysis) => {
                    console.log('✅ Análisis IA completado:', analysis);
                  }}
                />
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
