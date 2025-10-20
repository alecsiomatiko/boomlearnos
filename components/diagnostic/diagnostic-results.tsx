import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BarChart3,
  Lightbulb,
  ArrowRight
} from "lucide-react"

interface DiagnosticResultsProps {
  analysis: {
    maturityLevel: {
      score: number
      description: string
    }
    strengths: string[]
    opportunities: string[]
    immediateActions: Array<{
      action: string
      priority: string
      timeframe: string
      impact: string
    }>
    roadmap: {
      phase1: {
        title: string
        goals: string[]
        actions: string[]
      }
      phase2: {
        title: string
        goals: string[]
        actions: string[]
      }
      phase3: {
        title: string
        goals: string[]
        actions: string[]
      }
    }
    keyMetrics: Array<{
      metric: string
      currentState: string
      target: string
      timeline: string
    }>
  }
}

const priorityColors = {
  'Alta': 'bg-red-100 text-red-800 border-red-200',
  'Media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Baja': 'bg-green-100 text-green-800 border-green-200'
}

const impactColors = {
  'Alto': 'bg-purple-100 text-purple-800',
  'Medio': 'bg-blue-100 text-blue-800',
  'Bajo': 'bg-gray-100 text-gray-800'
}

export function DiagnosticResults({ analysis }: DiagnosticResultsProps) {
  const maturityPercentage = (analysis.maturityLevel.score / 5) * 100

  return (
    <div className="space-y-6">
      {/* Header con nivel de madurez */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-gray-900 mb-2">
                📊 Análisis de Diagnóstico Empresarial
              </CardTitle>
              <CardDescription className="text-gray-600">
                Basado en tus respuestas, aquí tienes tu análisis personalizado
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {analysis.maturityLevel.score}/5
              </div>
              <div className="text-sm text-gray-600">Nivel de Madurez</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Nivel Digital</span>
              <span className="text-gray-600">{Math.round(maturityPercentage)}%</span>
            </div>
            <Progress value={maturityPercentage} className="h-3" />
            <p className="text-sm text-gray-600 mt-2">{analysis.maturityLevel.description}</p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fortalezas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Fortalezas Principales
            </CardTitle>
            <CardDescription>
              Aspectos donde tu negocio ya está bien posicionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>  
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Oportunidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <TrendingUp className="h-5 w-5" />
              Áreas de Oportunidad
            </CardTitle>
            <CardDescription>
              Espacios donde puedes mejorar y crecer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <TrendingUp className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{opportunity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Inmediatas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Acciones Inmediatas Recomendadas
          </CardTitle>
          <CardDescription>
            Pasos concretos que deberías implementar pronto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {analysis.immediateActions.map((action, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex-1">{action.action}</h4>
                  <div className="flex gap-2 ml-4">
                    <Badge variant="outline" className={priorityColors[action.priority as keyof typeof priorityColors]}>
                      {action.priority}
                    </Badge>
                    <Badge variant="secondary" className={impactColors[action.impact as keyof typeof impactColors]}>
                      {action.impact} impacto
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Timeframe: {action.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hoja de Ruta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Target className="h-5 w-5" />
            Hoja de Ruta - Próximos 90 Días
          </CardTitle>
          <CardDescription>
            Plan estructurado para tu transformación empresarial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(analysis.roadmap).map(([phase, data], index) => (
              <div key={phase} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-6 -right-3 w-6 h-0.5 bg-gray-300"></div>
                )}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-gray-900">{data.title}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">🎯 Objetivos:</h5>
                      <ul className="space-y-1">
                        {data.goals.map((goal, goalIndex) => (
                          <li key={goalIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="w-1 h-1 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">⚡ Acciones:</h5>
                      <ul className="space-y-1">
                        {data.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas Clave */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <BarChart3 className="h-5 w-5" />
            Métricas Clave a Monitorear
          </CardTitle>
          <CardDescription>
            KPIs importantes para medir tu progreso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {analysis.keyMetrics.map((metric, index) => (
              <div key={index} className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <h4 className="font-semibold text-gray-900 mb-3">{metric.metric}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado Actual:</span>
                    <span className="font-medium text-gray-800">{metric.currentState}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Objetivo:</span>
                    <span className="font-medium text-indigo-600">{metric.target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plazo:</span>
                    <span className="font-medium text-gray-800">{metric.timeline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Lightbulb className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Listo para empezar tu transformación!
              </h3>
              <p className="text-gray-600 mb-4">
                Ahora que conoces tu situación actual y tienes un plan claro, es momento de implementar estas recomendaciones.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-green-600 hover:bg-green-700">
                Descargar Plan Completo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                Programar Consulta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}