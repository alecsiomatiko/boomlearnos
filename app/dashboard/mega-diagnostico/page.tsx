"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, FileText, Plus, Shield, Bell, ClipboardList, Building2, Target, Eye, Brain, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/user-manager"
import { DiagnosticService, type DiagnosticModule } from "@/services/diagnostic-service"
import { useResponseManager } from "@/hooks/use-response-manager"
import type { User } from "@/types/user"
import AIAnalysisComponent from "@/components/mega-diagnostic/ai-analysis"
import { useModuleAIAnalysis } from "@/hooks/use-module-ai-analysis"
import { OnboardingRequiredModal } from "@/components/mega-diagnostic/onboarding-required-modal"
import { OnboardingBanner } from "@/components/mega-diagnostic/onboarding-banner"

interface DiagnosticOverview {
  onboardingDiagnostic: {
    completed: boolean
    completedAt: string | null
    answers: Record<string, any>
  }
  organization: {
    companyName: string
    businessType: string
    companySize: string
    mission: string | null
    vision: string | null
  }
}

interface ModuleProgress {
  moduleCode: string
  isCompleted: boolean
  completionPercentage: number
  answeredQuestions: number
  totalQuestions?: number
}

export default function MegaDiagnosticoPage() {
  const [user, setUser] = useState<User | null>(null)
  const [modules, setModules] = useState<DiagnosticModule[]>([])
  const [diagnosticOverview, setDiagnosticOverview] = useState<DiagnosticOverview | null>(null)
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingModule, setLoadingModule] = useState<string | null>(null)
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // ✅ NUEVO: key para forzar refresh
  const router = useRouter()
  
  // Hook para manejar respuestas
  const { getUserResponses, checkModuleCompletion, isAuthenticated } = useResponseManager()
  
  // Hook para análisis IA por módulo
  const { analyzeModule, loading: aiLoading } = useModuleAIAnalysis()

  // ✅ NUEVO: Detectar cuando se regresa de un módulo para refrescar el progreso
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 [OVERVIEW] Ventana recuperó focus - refrescando progreso...')
      setRefreshKey(prev => prev + 1)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  useEffect(() => {
    async function initialize() {
      const currentUser = await getUser()
      setUser(currentUser)

      // ✅ VERIFICAR QUE SEA ADMIN
      if (!currentUser || currentUser.role !== 'admin') {
        console.warn('🚫 [MEGA-DIAGNOSTICO] Acceso denegado - Usuario no es admin')
        router.push('/dashboard')
        return
      }

      try {
        // Cargar módulos de diagnóstico
        const diagnosticModules = await DiagnosticService.getModules()
        setModules(diagnosticModules)

        // Cargar overview de diagnósticos
        console.log('🔍 [MEGA-DIAGNOSTICO] Cargando overview para usuario:', currentUser?.id)
        const overviewResponse = await fetch(`/api/diagnostics/overview?userId=${currentUser?.id}`)
        console.log('📡 [MEGA-DIAGNOSTICO] Response status:', overviewResponse.status)
        console.log('📡 [MEGA-DIAGNOSTICO] Response headers:', Object.fromEntries(overviewResponse.headers.entries()))
        const overviewData = await overviewResponse.json()
        console.log('📋 [MEGA-DIAGNOSTICO] Respuesta overview:', JSON.stringify(overviewData, null, 2))
        if (overviewData.success) {
          setDiagnosticOverview(overviewData.diagnostics)
          console.log('✅ [MEGA-DIAGNOSTICO] DiagnosticOverview actualizado:', JSON.stringify(overviewData.diagnostics.onboardingDiagnostic, null, 2))
          
          // 🔍 VERIFICAR SI EL USUARIO NECESITA COMPLETAR DIAGNÓSTICO DE ONBOARDING
          const hasOnboardingDiagnostic = overviewData.diagnostics?.onboardingDiagnostic?.completed
          console.log('🔍 [MEGA-DIAGNOSTICO] ¿Tiene diagnóstico de onboarding?', hasOnboardingDiagnostic)
          
          if (!hasOnboardingDiagnostic) {
            console.log('⚠️ [MEGA-DIAGNOSTICO] Usuario sin diagnóstico de onboarding - Mostrando modal')
            // Mostrar el modal después de un pequeño delay para mejor UX
            setTimeout(() => {
              setShowOnboardingModal(true)
            }, 800)
          }
        } else {
          console.log('❌ [MEGA-DIAGNOSTICO] Error en la respuesta:', overviewData)
        }

        // Cargar progreso real de cada módulo desde las respuestas guardadas
        if (isAuthenticated) {
          await loadModuleProgress(diagnosticModules)
        }

      } catch (error) {
        console.error('Error fetching diagnostic data:', error)
      }
    }

    initialize()
  }, [isAuthenticated, refreshKey]) // ✅ AGREGADO: refreshKey como dependencia

  const loadModuleProgress = async (diagnosticModules: DiagnosticModule[]) => {
    console.log('🔍 [OVERVIEW] Cargando progreso real de módulos...')
    
    try {
      const progressData: Record<string, ModuleProgress> = {}
      
      for (const module of diagnosticModules) {
        const progress = await checkModuleCompletion(module.module_code)
        
        progressData[module.module_code] = {
          moduleCode: module.module_code,
          isCompleted: progress.isCompleted,
          completionPercentage: progress.completionPercentage || 0,
          answeredQuestions: progress.answeredQuestions || 0,
          totalQuestions: module.total_questions || 10 // Fallback si no tenemos el total
        }
        
        console.log(`📊 [OVERVIEW] Módulo ${module.module_code}: ${progress.completionPercentage}% completado`)
      }
      
      setModuleProgress(progressData)
    } catch (error) {
      console.error('❌ [OVERVIEW] Error cargando progreso:', error)
    }
  }

  const getModuleStatus = (module: DiagnosticModule) => {
    // Obtener el progreso real desde las respuestas guardadas
    const realProgress = moduleProgress[module.module_code]
    
    if (realProgress) {
      return {
        ...module,
        answered_questions: realProgress.answeredQuestions,
        completion_percentage: realProgress.completionPercentage,
        is_completed: realProgress.isCompleted
      }
    }

    // Fallback al progreso por defecto del módulo
    const progress = (module.answered_questions / module.total_questions) * 100
    return {
      ...module,
      progress,
      status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending',
      buttonText: progress === 100 ? 'Revisar / Repetir' : progress > 0 ? 'Continuar' : 'Comenzar',
      route: `/dashboard/mega-diagnostico/${module.module_code}`,
    }
  }

  const processedModules = modules.map(getModuleStatus)

  /*const demoModules = [
    {
      id: "modulo-0",
      title: "Módulo 0",
      description:
        "Información básica de la empresa y contexto organizacional. Establece los fundamentos para el diagnóstico.",
      progress: 100,
      status: "completed",
      questions: 25,
      completed: 25,
      buttonText: "Revisar / Repetir",
      route: "/onboarding/diagnostico?module=0",
    },
    {
      id: "modulo-1",
      title: "Módulo 1",
      description: "Evaluación de cultura organizacional, liderazgo y comunicación interna. Identifica patrones clave.",
      progress: 0,
      status: "pending",
      questions: 30,
      completed: 0,
      buttonText: "Comenzar",
      route: "/onboarding/diagnostico?module=1",
    },
    {
      id: "modulo-2",
      title: "Módulo 2",
      description:
        "Análisis de procesos, eficiencia operativa y gestión de recursos. Evalúa la efectividad organizacional.",
      progress: 0,
      status: "pending",
      questions: 20,
      completed: 0,
      buttonText: "Comenzar",
      route: "/onboarding/diagnostico?module=2",
    },
  ]
  */

  const handleModuleAnalysis = async (moduleCode: string) => {
    if (!user?.id) {
      alert('Error: Usuario no identificado');
      return;
    }

    try {
      console.log(`🤖 Iniciando análisis IA para módulo ${moduleCode}`);
      const analysis = await analyzeModule(user.id, moduleCode);
      
      if (analysis) {
        alert(`✅ Análisis IA completado para ${moduleCode}. Ve a la página del módulo para ver los resultados.`);
      } else {
        alert('❌ Error al generar el análisis IA. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error en análisis IA:', error);
      alert('❌ Error al generar el análisis IA. Intenta de nuevo.');
    }
  };

  const handleModuleClick = async (module: (typeof modules)[0]) => {
    setIsLoading(true)
    setLoadingModule(module.id)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      router.push(`/dashboard/mega-diagnostico/${module.module_code}`)
    } catch (error) {
      console.error(`Error al cargar ${module.title}:`, error)
      alert(`Error al cargar ${module.title}. Por favor, intenta de nuevo.`)
    } finally {
      setIsLoading(false)
      setLoadingModule(null)
    }
  }

  // Calcular módulos completados del mega diagnóstico usando el progreso real
  const megaDiagnosticCompleted = Object.values(moduleProgress).filter(p => p.isCompleted).length
  
  // Agregar el diagnóstico de onboarding al conteo (si existe)
  const onboardingCompleted = diagnosticOverview?.onboardingDiagnostic?.completed ? 1 : 0
  const totalModules = modules.length + 1 // mega diagnóstico + onboarding
  const completedModules = megaDiagnosticCompleted + onboardingCompleted
  
  const totalQuestions = modules.reduce((acc, mod) => acc + mod.total_questions, 0)

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Mega Diagnóstico<span className="text-red-500">.</span>
          </h1>
          <div className="flex items-center gap-3">
            {/* ✅ Botón de Resultados */}
            {Object.values(moduleProgress).filter(p => p.isCompleted).length > 0 && (
              <Button
                onClick={() => router.push('/dashboard/mega-diagnostico/resultados')}
                className="flex items-center gap-2 bg-brand-red hover:bg-red-700"
              >
                <Target className="h-4 w-4" />
                Ver Resultados
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowAIAnalysis(!showAIAnalysis)}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              {showAIAnalysis ? 'Ocultar' : 'Ver'} Análisis IA
            </Button>
            <div className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
              <Bell className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Banner de Onboarding Pendiente */}
        <OnboardingBanner
          show={showOnboardingBanner && !diagnosticOverview?.onboardingDiagnostic?.completed}
          onDismiss={() => setShowOnboardingBanner(false)}
        />

        {/* AI Analysis Section */}
        {showAIAnalysis && (
          <AIAnalysisComponent />
        )}

        {/* SECCIÓN PROMINENTE: Misión, Visión y Valores */}
        {diagnosticOverview?.organization?.mission && (
          <Card className="border-2 border-red-200 bg-gradient-to-br from-white via-red-50/30 to-white shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  Identidad Corporativa
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Misión */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-brand-red" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Misión</h3>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                    <p className="text-gray-700 leading-relaxed">
                      {diagnosticOverview.organization.mission}
                    </p>
                  </div>
                </motion.div>

                {/* Visión */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Eye className="h-5 w-5 text-brand-red" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Visión</h3>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                    <p className="text-gray-700 leading-relaxed">
                      {diagnosticOverview.organization.vision}
                    </p>
                  </div>
                </motion.div>

                {/* Valores */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-brand-red" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Valores</h3>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                    {diagnosticOverview.organization.vision && 
                     typeof diagnosticOverview.organization.vision === 'object' ? (
                      <ul className="space-y-2">
                        {(Array.isArray(diagnosticOverview.organization.vision) 
                          ? diagnosticOverview.organization.vision 
                          : Object.values(diagnosticOverview.organization.vision)
                        ).map((value: any, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-brand-red font-bold mt-0.5">•</span>
                            <span className="text-gray-700 text-sm">
                              {typeof value === 'string' ? value : value.name || value.title || JSON.stringify(value)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {diagnosticOverview.organization.vision || 'No especificados'}
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen de la Empresa y Diagnóstico de Onboarding */}
        {diagnosticOverview && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información de la Empresa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-red-600" />
                  {diagnosticOverview.organization.companyName || 'Tu Empresa'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tipo de Negocio</p>
                    <p className="text-gray-900">{diagnosticOverview.organization.businessType || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tamaño</p>
                    <p className="text-gray-900">{diagnosticOverview.organization.companySize || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estado de Identidad</p>
                    <div className="flex items-center gap-2">
                      {diagnosticOverview.organization.mission ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">Completa</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-600 font-medium">Pendiente</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnóstico de Onboarding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-600" />
                  Diagnóstico de Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent>
                {diagnosticOverview.onboardingDiagnostic.completed ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Completado</span>
                      {diagnosticOverview.onboardingDiagnostic.completedAt && (
                        <span className="text-sm text-gray-500">
                          el {new Date(diagnosticOverview.onboardingDiagnostic.completedAt).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(diagnosticOverview.onboardingDiagnostic.answers || {}).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium capitalize text-gray-700">
                            {key.replace(/_/g, ' ')}: 
                          </span>
                          <span className="ml-1 text-gray-900">
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/dashboard/diagnosticos/detalle/onboarding')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles Completos
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Diagnóstico Inicial Pendiente
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Tu diagnóstico inicial aún no ha sido completado. Este se completa automáticamente durante el onboarding.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Hero Section con Mascota */}
        <Card className="bg-white rounded-3xl shadow-md overflow-hidden border-0 relative">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-8 relative">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ClipboardList className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  Mega Cuestionario Organizacional<span className="text-red-500">.</span>
                </h2>
                <p className="text-gray-600 mt-2">
                  Este cuestionario te ayudará a evaluar diferentes aspectos de tu organización para identificar áreas
                  de mejora y fortalezas. Completa cada módulo para obtener un diagnóstico completo.
                </p>
              </div>
              
              {/* 🦁 MASCOTA ÚNICA Y PROMINENTE */}
              <div className="hidden xl:block flex-shrink-0">
                <motion.img 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  src="/images/onboarding.png" 
                  alt="Mascota Boomlearn" 
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center">
                <div className="bg-red-100 rounded-full p-3 mb-2">
                  <CheckCircle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-gray-500 text-sm">Módulos completados</p>
                <p className="text-2xl font-bold text-black">
                  {Object.values(moduleProgress).filter(p => p.isCompleted).length + (diagnosticOverview?.onboardingDiagnostic?.completed ? 1 : 0)}/{Object.keys(moduleProgress).length + 1}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-red-100 rounded-full p-3 mb-2">
                  <Clock className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-gray-500 text-sm">Preguntas respondidas</p>
                <p className="text-2xl font-bold text-black">
                  {Object.values(moduleProgress).reduce((total, p) => total + p.answeredQuestions, 0) || 0}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-red-100 rounded-full p-3 mb-2">
                  <CheckCircle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-gray-500 text-sm">Preguntas totales</p>
                <p className="text-2xl font-bold text-black">
                  {Object.values(moduleProgress).reduce((total, p) => total + (p.totalQuestions || 0), 0) || modules.reduce((total, m) => total + (m.total_questions || 0), 0)}
                </p>
              </div>
            </div>

            {/* ✅ BOTÓN PARA VER PLAN ESTRATÉGICO CUANDO TODO ESTÉ COMPLETO */}
            {Object.values(moduleProgress).filter(p => p.isCompleted).length === modules.length && modules.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <Card className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-white bg-opacity-20 rounded-full p-4">
                          <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">
                            🎉 ¡Felicidades! Diagnóstico Completo
                          </h3>
                          <p className="text-white text-opacity-90">
                            Has completado todos los módulos. Tu plan estratégico personalizado está listo.
                          </p>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="bg-white text-green-600 hover:bg-gray-100 font-bold shadow-lg"
                        onClick={() => router.push('/dashboard/estrategia')}
                      >
                        <Brain className="h-5 w-5 mr-2" />
                        Ver Plan Estratégico
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Modules Row - ARQUITECTURA CORREGIDA */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {processedModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="bg-white shadow-md rounded-2xl border-0 overflow-hidden relative">
                {/* Badge de completado en esquina superior derecha */}
                {moduleProgress[module.module_code]?.isCompleted && (
                  <div className="absolute top-2 right-2 z-20">
                    <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      <CheckCircle className="h-3 w-3" />
                      COMPLETADO
                    </div>
                  </div>
                )}

                {/* ESTRUCTURA CORRECTA: Header rojo con padding interno */}
                <div className="p-4">
                  <div className="bg-red-500 rounded-t-2xl p-4 -mx-4 -mt-4">
                    <div className="flex items-center justify-between text-white">
                      <h3 className="text-xl font-bold">{module.title}</h3>
                      {/* Mostrar progreso real */}
                      <div className="text-sm font-medium">
                        {moduleProgress[module.module_code] ? (
                          `${moduleProgress[module.module_code].answeredQuestions}/${moduleProgress[module.module_code].totalQuestions}`
                        ) : (
                          `${module.answered_questions || 0}/${module.total_questions || 10}`
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body con padding apropiado */}
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 min-h-[4.5rem]">{module.description}</p>

                  {/* Progreso visual */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Progreso</span>
                      <span className="text-sm font-bold text-gray-800">
                        {moduleProgress[module.module_code] ? 
                          `${Math.round(moduleProgress[module.module_code].completionPercentage)}%` : 
                          `${Math.round((module.answered_questions / module.total_questions) * 100)}%`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${moduleProgress[module.module_code] ? 
                            moduleProgress[module.module_code].completionPercentage : 
                            ((module.answered_questions / module.total_questions) * 100)
                          }%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm transition-all duration-300 disabled:opacity-50 h-12"
                    onClick={() => handleModuleClick(module)}
                    disabled={isLoading}
                  >
                    {loadingModule === module.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span>Cargando...</span>
                      </div>
                    ) : (
                      <span>
                        {moduleProgress[module.module_code]?.isCompleted ? 
                          'Revisar / Repetir' : 
                          moduleProgress[module.module_code]?.completionPercentage > 0 ? 
                            'Continuar' : 
                            'Comenzar'
                        }
                      </span>
                    )}
                  </Button>

                  {/* ✅ Botón para ver resultados individuales del módulo */}
                  {moduleProgress[module.module_code]?.isCompleted && (
                    <Button
                      variant="outline"
                      className="w-full mt-2 border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/mega-diagnostico/resultados?module=${module.module_code}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Resultados
                    </Button>
                  )}

                  {/* Botón de Análisis IA para módulos completados */}
                  {moduleProgress[module.module_code]?.isCompleted && (
                    <Button
                      variant="outline"
                      className="w-full mt-2 border-red-200 text-red-700 hover:bg-red-50 transition-all duration-300 disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModuleAnalysis(module.module_code);
                      }}
                      disabled={aiLoading}
                    >
                      {aiLoading ? (
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 animate-pulse" />
                          <span>Analizando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          <span>🤖 Análisis IA</span>
                        </div>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Information Cards Row */}
        <div className="grid gap-6 grid-cols-1">
          <Card className="bg-red-500 text-white shadow-md rounded-2xl overflow-hidden border-0">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="p-6 flex items-start gap-4 border-b lg:border-b-0 lg:border-r border-red-400">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg flex-shrink-0">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Completa todos los módulos para un diagnóstico completo.</h4>
                    <p className="text-white text-opacity-90 text-sm leading-relaxed">
                      Para obtener resultados precisos y recomendaciones personalizadas, es importante completar todos
                      los módulos del cuestionario.
                    </p>
                  </div>
                </div>

                <div className="p-6 flex items-start gap-4 border-b lg:border-b-0 lg:border-r border-red-400">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg flex-shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Completa todos los módulos para un diagnóstico completo.</h4>
                    <p className="text-white text-opacity-90 text-sm leading-relaxed">
                      No es necesario completar todo el cuestionario de una vez. Tu progreso se guardará
                      automáticamente.
                    </p>
                  </div>
                </div>

                <div className="p-6 flex items-start gap-4">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Completa todos los módulos para un diagnóstico completo.</h4>
                    <p className="text-white text-opacity-90 text-sm leading-relaxed">
                      Toda tu información proporcionada se maneja con estricta confidencialidad y solo se utiliza para
                      generar tu diagnóstico.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando módulo...</h3>
              <p className="text-gray-600 text-sm">Preparando el cuestionario para ti</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal para completar diagnóstico de onboarding */}
      <OnboardingRequiredModal
        isOpen={showOnboardingModal}
        userName={user?.name}
        onClose={() => {
          setShowOnboardingModal(false)
          // Mostrar el banner cuando se cierra el modal
          setShowOnboardingBanner(true)
        }}
      />
    </div>
  )
}
