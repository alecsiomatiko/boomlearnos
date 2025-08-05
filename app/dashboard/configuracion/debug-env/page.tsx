"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertTriangle, Bug } from "lucide-react"

interface DebugResult {
  status: string
  debug: {
    exists: boolean
    type: string
    length: number
    preview: string
    startsWithSk: boolean
    hasSpaces: boolean
    hasNewlines: boolean
    hasTabs: boolean
    allOpenAIVars: string[]
    trimmedValue: string | null
    nodeEnv: string
    envFileExists: string
    error?: boolean
  }
}

export default function DebugEnv() {
  const [result, setResult] = useState<DebugResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-env")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getWarningIcon = () => {
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bug className="h-8 w-8" />
          Debug Variables de Entorno
        </h1>
        <p className="text-muted-foreground">Diagnóstico detallado de la configuración de OPENAI_API_KEY</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ejecutar Diagnóstico</CardTitle>
          <CardDescription>Esta herramienta verifica exactamente cómo se está leyendo tu API key</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDebug} disabled={loading} className="w-full">
            {loading ? "Ejecutando..." : "Ejecutar Debug"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Variable existe</h4>
                  <p className="text-sm text-muted-foreground">OPENAI_API_KEY está definida</p>
                </div>
                {getStatusIcon(result.debug.exists)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Tipo de dato</h4>
                  <p className="text-sm text-muted-foreground">{result.debug.type}</p>
                </div>
                {getStatusIcon(result.debug.type === "string")}
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Longitud</h4>
                  <p className="text-sm text-muted-foreground">{result.debug.length} caracteres</p>
                </div>
                {getStatusIcon(result.debug.length > 50)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Preview</h4>
                  <p className="text-sm text-muted-foreground font-mono">{result.debug.preview}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validación de Formato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Empieza con "sk-"</h4>
                  <p className="text-sm text-muted-foreground">Formato correcto de OpenAI</p>
                </div>
                {getStatusIcon(result.debug.startsWithSk)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Contiene espacios</h4>
                  <p className="text-sm text-muted-foreground">Los espacios pueden causar problemas</p>
                </div>
                {result.debug.hasSpaces ? getWarningIcon() : getStatusIcon(true)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Contiene saltos de línea</h4>
                  <p className="text-sm text-muted-foreground">Los \n pueden causar problemas</p>
                </div>
                {result.debug.hasNewlines ? getWarningIcon() : getStatusIcon(true)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Contiene tabs</h4>
                  <p className="text-sm text-muted-foreground">Los \t pueden causar problemas</p>
                </div>
                {result.debug.hasTabs ? getWarningIcon() : getStatusIcon(true)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Entorno</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded">
                <h4 className="font-medium">Variables OPENAI encontradas</h4>
                <p className="text-sm text-muted-foreground">
                  {result.debug.allOpenAIVars.length > 0
                    ? result.debug.allOpenAIVars.join(", ")
                    : "Ninguna variable OPENAI encontrada"}
                </p>
              </div>

              <div className="p-3 border rounded">
                <h4 className="font-medium">Entorno Node.js</h4>
                <p className="text-sm text-muted-foreground">{result.debug.nodeEnv}</p>
              </div>
            </CardContent>
          </Card>

          {(!result.debug.exists || !result.debug.startsWithSk) && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Problemas Detectados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-red-700">
                  {!result.debug.exists && <p>• La variable OPENAI_API_KEY no existe o está vacía</p>}
                  {!result.debug.startsWithSk && result.debug.exists && (
                    <p>• La API key no empieza con "sk-" (formato incorrecto)</p>
                  )}
                  {result.debug.hasSpaces && <p>• La API key contiene espacios que pueden causar problemas</p>}
                  {result.debug.hasNewlines && <p>• La API key contiene saltos de línea que pueden causar problemas</p>}
                </div>

                <div className="mt-4 p-3 bg-white border rounded">
                  <h5 className="font-medium mb-2">Soluciones:</h5>
                  <ul className="text-sm space-y-1">
                    <li>1. Verifica que tu archivo .env.local existe en la raíz del proyecto</li>
                    <li>2. Asegúrate de que la línea sea exactamente: OPENAI_API_KEY=sk-tu-key-aqui</li>
                    <li>3. No debe haber espacios antes o después del =</li>
                    <li>4. No debe haber comillas alrededor de la key</li>
                    <li>5. Reinicia el servidor después de cambiar .env.local</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
