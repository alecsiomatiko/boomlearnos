"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Brain,
  Target,
  Award
} from "lucide-react"
import { getUser } from "@/lib/user-manager"
import type { User } from "@/types/user"
import { Line, Bar, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ModuleResult {
  moduleCode: string
  moduleTitle: string
  totalQuestions: number
  answeredQuestions: number
  averageScore: number
  completionPercentage: number
  strengths: string[]
  improvements: string[]
}

export default function ResultadosPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [moduleResults, setModuleResults] = useState<ModuleResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [overallScore, setOverallScore] = useState(0)

  useEffect(() => {
    async function loadResults() {
      try {
        const currentUser = await getUser()
        setUser(currentUser)

        // ✅ VERIFICAR QUE SEA ADMIN
        if (!currentUser || currentUser.role !== 'admin') {
          console.warn('🚫 [RESULTADOS] Acceso denegado - Usuario no es admin')
          router.push('/dashboard')
          return
        }

        // ✅ BUSCAR organization_id EN CUALQUIER VARIANTE
        const organizationId = currentUser.current_organization_id || (currentUser as any).organization_id || (currentUser as any).organizationId || (currentUser as any).organization?.id;
        
        if (!organizationId) {
          console.error('❌ Usuario sin organización activa')
          router.push('/dashboard')
          return
        }

        // ✅ Cargar respuestas del usuario PARA ESTA ORGANIZACIÓN
        const response = await fetch(
          `/api/diagnostic/user-responses?userId=${currentUser.id}&organizationId=${organizationId}`
        )
        if (response.ok) {
          const { userResponses, stats } = await response.json()
          
          // Agrupar respuestas por módulo
          const moduleMap = new Map<string, any>()
          
          userResponses.forEach((resp: any) => {
            if (!moduleMap.has(resp.moduleCode)) {
              moduleMap.set(resp.moduleCode, {
                moduleCode: resp.moduleCode,
                moduleTitle: resp.moduleTitle,
                responses: [],
                totalScore: 0,
                questionCount: 0
              })
            }
            
            const module = moduleMap.get(resp.moduleCode)
            module.responses.push(resp)
            module.totalScore += resp.optionValue
            module.questionCount++
          })

          // Calcular resultados por módulo
          const results: ModuleResult[] = Array.from(moduleMap.values()).map(module => {
            const averageScore = module.totalScore / module.questionCount
            const completionPercentage = 100 // Ya que solo procesamos preguntas respondidas
            
            return {
              moduleCode: module.moduleCode,
              moduleTitle: module.moduleTitle,
              totalQuestions: module.questionCount,
              answeredQuestions: module.questionCount,
              averageScore: Math.round(averageScore * 10) / 10,
              completionPercentage,
              strengths: getStrengths(averageScore),
              improvements: getImprovements(averageScore)
            }
          })

          setModuleResults(results)
          
          // Calcular puntuación general
          const totalScore = results.reduce((sum, r) => sum + r.averageScore, 0)
          setOverallScore(Math.round((totalScore / results.length) * 10) / 10)
        }
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [])

  const getStrengths = (score: number): string[] => {
    if (score >= 8) return ['Excelente desempeño', 'Área consolidada', 'Mantener estrategias actuales']
    if (score >= 6) return ['Buen desempeño', 'Área en desarrollo', 'Continuar mejorando']
    return ['Área con potencial', 'Oportunidad de crecimiento']
  }

  const getImprovements = (score: number): string[] => {
    if (score < 6) return ['Requiere atención prioritaria', 'Implementar plan de acción', 'Capacitación recomendada']
    if (score < 8) return ['Optimizar procesos', 'Fortalecer capacidades']
    return ['Mantener excelencia', 'Compartir mejores prácticas']
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-100'
    if (score >= 6) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  // Datos para gráficos
  const radarData = {
    labels: moduleResults.map(m => m.moduleCode),
    datasets: [
      {
        label: 'Puntuación por Módulo',
        data: moduleResults.map(m => m.averageScore),
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(239, 68, 68)'
      }
    ]
  }

  const barData = {
    labels: moduleResults.map(m => m.moduleCode),
    datasets: [
      {
        label: 'Puntuación',
        data: moduleResults.map(m => m.averageScore),
        backgroundColor: moduleResults.map(m => {
          if (m.averageScore >= 8) return 'rgba(34, 197, 94, 0.8)'
          if (m.averageScore >= 6) return 'rgba(234, 179, 8, 0.8)'
          return 'rgba(239, 68, 68, 0.8)'
        }),
        borderRadius: 8
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/mega-diagnostico')}
              className="flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Diagnóstico
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Resultados del Diagnóstico<span className="text-red-500">.</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Análisis completo de tu evaluación organizacional
            </p>
          </div>
          <Button className="flex items-center gap-2 bg-brand-red hover:bg-red-700">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Puntuación General */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Puntuación General
                </h2>
                <p className="text-gray-600">
                  Basado en {moduleResults.length} módulos completados
                </p>
              </div>
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </div>
                <div className="text-gray-500 text-sm mt-2">de 10</div>
                <Badge className={`mt-2 ${overallScore >= 8 ? 'bg-green-500' : overallScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                  {overallScore >= 8 ? 'Excelente' : overallScore >= 6 ? 'Bueno' : 'Necesita Mejora'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vista Radar por Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Radar data={radarData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparativa de Puntuaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={barData} options={barOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados por Módulo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Detalle por Módulo
          </h2>
          
          {moduleResults.map((result) => (
            <Card key={result.moduleCode} className="overflow-hidden">
              <CardHeader className={`${getScoreBgColor(result.averageScore)}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Target className="h-5 w-5" />
                    {result.moduleTitle}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${getScoreColor(result.averageScore)}`}>
                      {result.averageScore}/10
                    </span>
                    {result.averageScore >= result.averageScore && (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fortalezas */}
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Fortalezas
                    </h4>
                    <ul className="space-y-2">
                      {result.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-600">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Áreas de Mejora */}
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Áreas de Mejora
                    </h4>
                    <ul className="space-y-2">
                      {result.improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-orange-600">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{result.answeredQuestions} preguntas respondidas</span>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Ver Análisis IA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
