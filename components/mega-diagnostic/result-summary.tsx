"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import type { UserMegaDiagnosticProfile, ModuleResult } from "@/types/mega-diagnostic"

interface ResultSummaryProps {
  modulo0Result?: UserMegaDiagnosticProfile["modulo0Result"]
  etapa1Result?: UserMegaDiagnosticProfile["etapa1Result"]
  etapa2Results: Record<string, ModuleResult>
  userProfile: UserMegaDiagnosticProfile
  onRestartEtapa: (etapaId: "modulo0" | "etapa1" | "etapa2") => void
  onViewDetailedReport: () => void
}

const ResultSummary: React.FC<ResultSummaryProps> = ({
  modulo0Result,
  etapa1Result,
  etapa2Results,
  userProfile,
  onRestartEtapa,
  onViewDetailedReport,
}) => {
  const router = useRouter()

  const etapa2CompletedModules = Object.values(etapa2Results).filter((result) => result.completed)
  const etapa2TotalModules = Object.keys(etapa2Results).length

  const etapa1Completed = etapa1Result?.completed || false

  return (
    <div className="space-y-4">
      {modulo0Result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-kalabasboom-blue">🧭 Módulo 0: Propósito y BHAG</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Perfil de Propósito:</strong> {modulo0Result.perfilProposito || "No definido"}
            </p>
            {/* Puedes añadir más detalles del Módulo 0 aquí si los guardas */}
          </CardContent>
          <CardFooter>
            <Button onClick={() => onRestartEtapa("modulo0")} variant="outline">
              Revisar Módulo 0
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-kalabasboom-blue">🚀 Etapa 1: Autodescubrimiento</CardTitle>
          <CardDescription>
            {etapa1Completed
              ? "¡Felicidades! Has completado la etapa de Autodescubrimiento."
              : "Aún no has completado la etapa de Autodescubrimiento."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {etapa1Completed ? (
              <>
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                <p className="text-sm text-gray-500">Completado</p>
              </>
            ) : (
              <>
                <HelpCircle className="text-yellow-500 h-5 w-5" />
                <p className="text-sm text-gray-500">Incompleto</p>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => onRestartEtapa("etapa1")} variant="outline">
            {etapa1Completed ? "Revisar Etapa 1" : "Completar Etapa 1"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-kalabasboom-blue">
            🌱 Etapa 2: Crecimiento y Sostenibilidad
          </CardTitle>
          <CardDescription>
            Progreso: {etapa2CompletedModules.length} de {etapa2TotalModules} módulos completados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(etapa2Results).map(([moduleId, result]) => (
              <div key={moduleId} className="flex items-center justify-between">
                <p className="text-sm">{result.moduleName}</p>
                {result.completed ? (
                  <Badge variant="outline">Completado</Badge>
                ) : (
                  <Badge className="text-gray-500 bg-gray-100 border-gray-200">Pendiente</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => onRestartEtapa("etapa2")} variant="outline">
            Continuar Etapa 2
          </Button>
        </CardFooter>
      </Card>

      <Button className="w-full" onClick={onViewDetailedReport}>
        Ver Reporte Detallado
      </Button>
    </div>
  )
}

export default ResultSummary
