"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface DiagnosticResult {
  status: "success" | "error"
  message: string
  checks: {
    exists: boolean
    format: boolean
    length: number
    connection: boolean
  }
  connectionError?: string
}

export default function DiagnosticoOpenAI() {
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/check-openai")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        status: "error",
        message: "Error al ejecutar el diagnóstico",
        checks: {
          exists: false,
          format: false,
          length: 0,
          connection: false,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (status: "success" | "error") => {
    return status === "success" ? (
      <Badge variant="default" className="bg-green-500">
        Funcionando
      </Badge>
    ) : (
      <Badge variant="destructive">Error</Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Diagnóstico de OpenAI</h1>
        <p className="text-muted-foreground">Verifica que tu API key de OpenAI esté configurada correctamente</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Verificación de API Key
          </CardTitle>
          <CardDescription>
            Esta herramienta verifica si tu API key de OpenAI está configurada y funcionando correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostic} disabled={loading} className="w-full">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando diagnóstico...
              </>
            ) : (
              "Ejecutar Diagnóstico"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Resultados del Diagnóstico
              {getStatusBadge(result.status)}
            </CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Variable de entorno existe</h4>
                  <p className="text-sm text-muted-foreground">OPENAI_API_KEY está configurada</p>
                </div>
                {getStatusIcon(result.checks.exists)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Formato correcto</h4>
                  <p className="text-sm text-muted-foreground">La API key tiene el formato correcto (sk-...)</p>
                </div>
                {getStatusIcon(result.checks.format)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Longitud de la key</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.checks.length} caracteres
                    {result.checks.length > 0 && result.checks.length < 50 && " (parece muy corta)"}
                  </p>
                </div>
                {getStatusIcon(result.checks.length > 50)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Conexión con OpenAI</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.checks.connection
                      ? "Conexión exitosa con la API de OpenAI"
                      : result.connectionError || "No se pudo conectar con OpenAI"}
                  </p>
                </div>
                {getStatusIcon(result.checks.connection)}
              </div>
            </div>

            {result.status === "error" && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Pasos para solucionar:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {!result.checks.exists && <li>• Configura la variable de entorno OPENAI_API_KEY</li>}
                  {!result.checks.format && <li>• Verifica que tu API key empiece con "sk-"</li>}
                  {result.checks.length < 50 && <li>• Tu API key parece muy corta, verifica que esté completa</li>}
                  {!result.checks.connection && result.connectionError && (
                    <li>• Error de conexión: {result.connectionError}</li>
                  )}
                </ul>
              </div>
            )}

            {result.status === "success" && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">¡Todo está funcionando!</h4>
                <p className="text-sm text-green-700">
                  Tu API key de OpenAI está configurada correctamente y la conexión es exitosa.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
