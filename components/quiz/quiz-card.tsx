"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Clock, Award, TrendingUp, CheckCircle2, Play } from "lucide-react"

interface QuizCardProps {
  onStart: () => void
  hasCompletedBefore: boolean
  lastScore?: number
}

export function QuizCard({ onStart, hasCompletedBefore, lastScore }: QuizCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-kalabasboom-red/5 to-blue-500/5">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">🎯</div>
        <CardTitle className="text-2xl">Diagnóstico Empresarial BoomLearn</CardTitle>
        <p className="text-muted-foreground">
          Descubre el perfil de madurez de tu empresa y recibe recomendaciones personalizadas
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Características del quiz */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
            <Clock className="h-5 w-5 text-kalabasboom-red" />
            <div>
              <div className="font-medium">10-15 minutos</div>
              <div className="text-sm text-muted-foreground">Tiempo estimado</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
            <Target className="h-5 w-5 text-kalabasboom-red" />
            <div>
              <div className="font-medium">8 preguntas</div>
              <div className="text-sm text-muted-foreground">Análisis completo</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
            <Award className="h-5 w-5 text-kalabasboom-red" />
            <div>
              <div className="font-medium">+50 puntos</div>
              <div className="text-sm text-muted-foreground">Recompensa</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
            <TrendingUp className="h-5 w-5 text-kalabasboom-red" />
            <div>
              <div className="font-medium">Análisis IA</div>
              <div className="text-sm text-muted-foreground">Recomendaciones</div>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="space-y-3">
          <h3 className="font-semibold">¿Qué obtendrás?</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                Perfil empresarial personalizado (BoomStarter, BoomBuilder, BoomScaler, BoomLeader)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Análisis detallado de fortalezas y áreas de mejora</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Plan de acción estratégico a corto, mediano y largo plazo</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Medalla "Analista Empresarial" y puntos de recompensa</span>
            </li>
          </ul>
        </div>

        {/* Resultado anterior */}
        {hasCompletedBefore && lastScore && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-kalabasboom-red" />
              <span className="font-medium">Último resultado</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{lastScore}% de madurez empresarial</Badge>
              <span className="text-sm text-muted-foreground">¡Realiza el quiz nuevamente para ver tu progreso!</span>
            </div>
          </div>
        )}

        {/* Botón de inicio */}
        <Button onClick={onStart} className="w-full bg-kalabasboom-red hover:bg-kalabasboom-red/90 text-lg py-6">
          <Play className="h-5 w-5 mr-2" />
          {hasCompletedBefore ? "Realizar Quiz Nuevamente" : "Comenzar Diagnóstico"}
        </Button>
      </CardContent>
    </Card>
  )
}
