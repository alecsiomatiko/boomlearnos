"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Lightbulb, CheckCircle2, AlertTriangle, Download, Share2 } from "lucide-react"
import type { QuizResult } from "@/types/quiz"

interface ResultsAnalysisProps {
  result: QuizResult
  onRestart: () => void
}

export function ResultsAnalysis({ result, onRestart }: ResultsAnalysisProps) {
  const { profile, categoryScores, percentage } = result

  const handleDownloadReport = () => {
    // Implementar descarga de PDF
    console.log("Descargando reporte...")
  }

  const handleShareResults = () => {
    // Implementar compartir resultados
    console.log("Compartiendo resultados...")
  }

  return (
    <div className="space-y-6">
      {/* Header con perfil */}
      <Card className="bg-gradient-to-r from-kalabasboom-red/10 to-blue-500/10">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">
            {profile.type === "BoomLeader"
              ? "👑"
              : profile.type === "BoomScaler"
                ? "📈"
                : profile.type === "BoomBuilder"
                  ? "🏗️"
                  : "🚀"}
          </div>
          <CardTitle className="text-2xl">{profile.title}</CardTitle>
          <p className="text-muted-foreground">{profile.description}</p>
          <div className="flex justify-center gap-4 mt-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {Math.round(percentage)}% de madurez empresarial
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs con análisis detallado */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="strengths">Fortalezas</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="action-plan">Plan de Acción</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Puntuación por Categorías
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryScores.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {category.score}/{category.maxScore} ({Math.round(category.percentage)}%)
                    </span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strengths" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Fortalezas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Áreas de Mejora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recomendaciones Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {profile.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="bg-kalabasboom-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action-plan" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Plan de Acción Estratégico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-3">🎯 Corto Plazo (1-3 meses)</h4>
                  <ul className="space-y-2">
                    {profile.actionPlan.shortTerm.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-600 mb-3">🚀 Mediano Plazo (3-12 meses)</h4>
                  <ul className="space-y-2">
                    {profile.actionPlan.mediumTerm.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-600 mb-3">🌟 Largo Plazo (1+ años)</h4>
                  <ul className="space-y-2">
                    {profile.actionPlan.longTerm.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Acciones */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={handleDownloadReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Descargar Reporte
        </Button>
        <Button onClick={handleShareResults} variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Compartir Resultados
        </Button>
        <Button onClick={onRestart} className="bg-kalabasboom-red hover:bg-kalabasboom-red/90">
          Realizar Quiz Nuevamente
        </Button>
      </div>
    </div>
  )
}
