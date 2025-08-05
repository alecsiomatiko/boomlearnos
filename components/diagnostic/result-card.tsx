"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Download, Share2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DiagnosticResult } from "@/types/diagnostic"

interface ResultCardProps {
  result: DiagnosticResult
  onBack: () => void
  onContinue: () => void
}

export function ResultCard({ result, onBack, onContinue }: ResultCardProps) {
  const percentage = Math.round((result.score / result.maxScore) * 100)

  const getLevelColor = () => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-blue-500"
    if (percentage >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className={cn("text-white", getLevelColor())}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Award className="h-6 w-6" />
            Nivel: {result.level}
          </CardTitle>
          <Badge className="bg-white text-gray-800">{percentage}%</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Puntuación</span>
              <span className="text-sm font-medium">
                {result.score}/{result.maxScore}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Recomendaciones</h3>
            <ul className="space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="bg-kalabasboom-red text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.badge && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <Award className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="font-medium text-amber-800">¡Has desbloqueado una medalla!</p>
              <p className="text-sm text-amber-700">
                Revisa tu perfil para ver la medalla "{result.badge.replace("_", " ")}"
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between border-t pt-6">
        <Button variant="outline" className="w-full sm:w-auto" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a módulos
        </Button>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>

          <Button variant="outline" className="w-full sm:w-auto">
            <Share2 className="mr-2 h-4 w-4" />
            Compartir
          </Button>

          <Button className="w-full sm:w-auto bg-kalabasboom-red hover:bg-kalabasboom-red/90" onClick={onContinue}>
            Continuar
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
