"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, FileText, Plus, Shield, Bell, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import { initializeAndGetUserData } from "@/lib/data-utils"
import type { User } from "@/types"

export default function MegaDiagnosticoPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingModule, setLoadingModule] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = initializeAndGetUserData()
    setUser(currentUser)
  }, [])

  const modules = [
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

  const handleModuleClick = async (module: (typeof modules)[0]) => {
    setIsLoading(true)
    setLoadingModule(module.id)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      router.push(module.route)
    } catch (error) {
      console.error(`Error al cargar ${module.title}:`, error)
      alert(`Error al cargar ${module.title}. Por favor, intenta de nuevo.`)
    } finally {
      setIsLoading(false)
      setLoadingModule(null)
    }
  }

  const completedModules = modules.filter((m) => m.status === "completed").length
  const totalQuestions = modules.reduce((acc, mod) => acc + mod.questions, 0)

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
          <div className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
            <Bell className="h-6 w-6 text-gray-600" />
          </div>
        </div>

        {/* Main Hero Section */}
        <Card className="bg-white rounded-3xl shadow-md overflow-hidden border-0">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0">
                <ClipboardList className="h-16 w-16 text-red-500" />
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
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center">
                <div className="bg-red-100 rounded-full p-3 mb-2">
                  <CheckCircle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-gray-500 text-sm">Módulos completados</p>
                <p className="text-2xl font-bold text-black">
                  {completedModules}/{modules.length}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-red-100 rounded-full p-3 mb-2">
                  <Clock className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-gray-500 text-sm">Tiempo estimado</p>
                <p className="text-2xl font-bold text-black">45 min</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-red-100 rounded-full p-3 mb-2">
                  <CheckCircle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-gray-500 text-sm">Preguntas totales</p>
                <p className="text-2xl font-bold text-black">{totalQuestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Row - ARQUITECTURA CORREGIDA */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="bg-white shadow-md rounded-2xl border-0 overflow-hidden">
                {/* ESTRUCTURA CORRECTA: Header rojo con padding interno */}
                <div className="p-4">
                  <div className="bg-red-500 rounded-t-2xl p-4 -mx-4 -mt-4">
                    <h3 className="text-xl font-bold text-white">{module.title}</h3>
                  </div>
                </div>

                {/* Body con padding apropiado */}
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 min-h-[4.5rem]">{module.description}</p>

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
                      <span>{module.buttonText}</span>
                    )}
                  </Button>
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
    </div>
  )
}
