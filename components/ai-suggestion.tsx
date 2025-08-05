"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AISuggestionProps {
  questionId: string
  questionText: string
  businessContext?: Record<string, string>
  onSuggestionSelect: (suggestion: string) => void
}

export function AISuggestion({
  questionId,
  questionText,
  businessContext = {},
  onSuggestionSelect,
}: AISuggestionProps) {
  const [suggestion, setSuggestion] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSuggestion = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Obtener la API key del localStorage
      const apiKey = localStorage.getItem("openai_api_key")

      const response = await fetch("/api/suggest-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          questionText,
          businessContext,
          apiKey,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.message || "No se pudo generar una sugerencia")
      } else {
        setSuggestion(data.suggestion)
      }
    } catch (err) {
      setError("Error al conectar con el servidor. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSuggestion = () => {
    if (suggestion) {
      onSuggestionSelect(suggestion)
      setSuggestion("")
    }
  }

  return (
    <div className="mt-2">
      {!suggestion && !isLoading && !error && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-xs"
          onClick={generateSuggestion}
        >
          <Sparkles className="h-3 w-3" />
          Sugerir respuesta con IA
        </Button>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Generando sugerencia...
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestion && !isLoading && (
        <div className="mt-2 rounded-md border border-dashed border-gray-300 bg-gray-50 p-3">
          <p className="text-sm text-gray-600">{suggestion}</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="default" onClick={handleSelectSuggestion}>
              Usar esta respuesta
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSuggestion("")}>
              Descartar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
