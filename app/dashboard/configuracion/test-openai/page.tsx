"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Play, RefreshCw } from "lucide-react"

interface TestResult {
  success: boolean
  message?: string
  response?: string
  model?: string
  usage?: any
  error?: string
  type?: string
  code?: string
  status?: number
  details?: any
}

export default function TestOpenAI() {
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        error: "Error de red o parsing",
        details: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Prueba de OpenAI</h1>
        <p className="text-muted-foreground">Prueba simple para verificar que OpenAI esté funcionando correctamente</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Prueba de Conexión
          </CardTitle>
          <CardDescription>
            Esta prueba hace una llamada simple a OpenAI para verificar que todo esté funcionando.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runTest} disabled={loading} className="w-full">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando prueba...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Ejecutar Prueba
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Resultado de la Prueba
              {result.success ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Éxito
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Error
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.success ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">¡OpenAI está funcionando!</h4>
                  <p className="text-sm text-green-700">{result.message}</p>
                </div>

                {result.response && (
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-1">Respuesta de OpenAI:</h5>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">"{result.response}"</p>
                  </div>
                )}

                {result.model && (
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-1">Modelo utilizado:</h5>
                    <p className="text-sm">{result.model}</p>
                  </div>
                )}

                {result.usage && (
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-1">Uso de tokens:</h5>
                    <div className="text-sm space-y-1">
                      <p>Prompt: {result.usage.prompt_tokens} tokens</p>
                      <p>Completion: {result.usage.completion_tokens} tokens</p>
                      <p>Total: {result.usage.total_tokens} tokens</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Error detectado</h4>
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>

                {result.type && (
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-1">Tipo de error:</h5>
                    <p className="text-sm font-mono">{result.type}</p>
                  </div>
                )}

                {result.code && (
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-1">Código de error:</h5>
                    <p className="text-sm font-mono">{result.code}</p>
                  </div>
                )}

                {result.status && (
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-1">Status HTTP:</h5>
                    <p className="text-sm">{result.status}</p>
                  </div>
                )}

                {result.details && (
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-1">Detalles:</h5>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
