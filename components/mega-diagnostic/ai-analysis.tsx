"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Brain, 
  Building2, 
  CheckCircle, 
  Target, 
  AlertTriangle, 
  ArrowRight,
  RefreshCw,
  Lightbulb,
  TrendingUp
} from "lucide-react"
import { useRouter } from "next/navigation"

interface AIAnalysis {
  overview: {
    title: string
    summary: string
    completedDiagnostics: {
      onboarding: boolean
      megaDiagnostic: boolean
    }
    generatedAt: string
  }
  insights: Array<{
    category: string
    icon: string
    status: 'completed' | 'pending' | 'in_progress'
    findings: string[]
  }>
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    action: string
    route: string
  }>
  nextSteps: string[]
}

export default function AIAnalysisComponent() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const fetchAnalysis = async () => {
    try {
      const response = await fetch('/api/diagnostics/ai-analysis')
      const data = await response.json()
      
      if (data.success) {
        setAnalysis(data.analysis)
      } else {
        console.error('Error fetching AI analysis:', data.error)
      }
    } catch (error) {
      console.error('Error fetching AI analysis:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAnalysis()
  }

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Building2,
      CheckCircle,
      Target,
      Brain
    }
    return icons[iconName] || Brain
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "default" as const, label: "Completado", className: "bg-green-100 text-green-800" },
      in_progress: { variant: "secondary" as const, label: "En Progreso", className: "bg-blue-100 text-blue-800" },
      pending: { variant: "outline" as const, label: "Pendiente", className: "bg-gray-100 text-gray-600" }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "border-red-200 bg-red-50",
      medium: "border-yellow-200 bg-yellow-50", 
      low: "border-green-200 bg-green-50"
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
            </div>
            <CardTitle className="text-xl">Generando Análisis IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-600">
              <div className="animate-spin mx-auto mb-4 h-8 w-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
              Analizando tus datos de diagnóstico...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No se pudo cargar el análisis. 
          <Button variant="link" onClick={handleRefresh} className="ml-2 p-0 h-auto">
            Intentar de nuevo
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del Análisis */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{analysis.overview?.title || 'Análisis IA'}</CardTitle>
                <p className="text-gray-600 mt-1">{analysis.overview?.summary || 'Generando análisis personalizado...'}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${analysis.overview?.completedDiagnostics?.onboarding ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm">Diagnóstico de Onboarding</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${analysis.overview?.completedDiagnostics?.megaDiagnostic ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm">Mega Diagnóstico</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analysis.insights && Array.isArray(analysis.insights) ? 
          analysis.insights.map((insight, index) => {
            const IconComponent = getIconComponent(insight?.icon || 'target')
            const statusBadge = getStatusBadge(insight?.status || 'completed')
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <Badge className={statusBadge.className}>
                        {statusBadge.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{insight?.category || 'Insight'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insight?.findings && Array.isArray(insight.findings) ?
                        insight.findings.map((finding, fIndex) => (
                          <li key={fIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                            {finding}
                          </li>
                        )) : (
                          <li className="text-sm text-gray-500">No hay información disponible</li>
                        )
                      }
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )
          }) : (
            <div className="col-span-3 text-center text-gray-500 py-8">
              <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No hay insights disponibles en este momento.</p>
            </div>
          )
        }
      </div>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Recomendaciones Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.recommendations && Array.isArray(analysis.recommendations) ? 
            analysis.recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${getPriorityColor(rec?.priority || 'medium')}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={rec?.priority === 'high' ? 'destructive' : rec?.priority === 'medium' ? 'default' : 'secondary'}>
                        {rec?.priority === 'high' ? 'Alta Prioridad' : rec?.priority === 'medium' ? 'Media Prioridad' : 'Baja Prioridad'}
                      </Badge>
                    </div>
                    <h4 className="font-semibold">{rec?.title || 'Recomendación'}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec?.description || 'Descripción no disponible'}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(rec?.route || '/dashboard')}
                    className="ml-4"
                  >
                    {rec?.action || 'Ver más'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8">
                <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No hay recomendaciones disponibles en este momento.</p>
              </div>
            )
          }
        </CardContent>
      </Card>

      {/* Próximos Pasos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Próximos Pasos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {analysis.nextSteps && Array.isArray(analysis.nextSteps) ?
              analysis.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{step}</span>
                </li>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p>No hay próximos pasos definidos en este momento.</p>
                </div>
              )
            }
          </ol>
        </CardContent>
      </Card>

      {/* Información de Última Actualización */}
      <div className="text-center text-sm text-gray-500">
        {analysis.overview?.generatedAt ? 
          `Análisis generado el ${new Date(analysis.overview.generatedAt).toLocaleString()}` :
          'Análisis generado recientemente'
        }
      </div>
    </div>
  )
}
