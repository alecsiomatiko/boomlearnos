"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface TextImproverProps {
  text: string
  onImproved: (improvedText: string) => void
  className?: string
  fieldType?: "vision" | "mision" | "valores" | "general"
  tono?: string
  companyName?: string
  businessContext?: any
}

export function TextImprover({
  text,
  onImproved,
  className,
  fieldType = "general",
  tono = "profesional",
  companyName = "",
  businessContext = {},
}: TextImproverProps) {
  const [isImproving, setIsImproving] = useState(false)

  const improveText = async () => {
    // Validar entrada
    if (!text || typeof text !== "string" || text.trim().length < 3) {
      toast({
        title: "Información insuficiente",
        description: "Por favor escribe algo para mejorar.",
        variant: "destructive",
      })
      return
    }

    setIsImproving(true)

    try {
      console.log("🚀 Enviando texto para mejorar:", { text, fieldType, tono, companyName })

      const response = await fetch("/api/improve-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          fieldType,
          tono,
          companyName,
          businessContext,
        }),
      })

      console.log("📡 Respuesta recibida:", response.status, response.statusText)

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      // Verificar content-type
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("❌ Respuesta no es JSON:", textResponse)
        throw new Error("La API devolvió un formato inesperado")
      }

      // Parsear respuesta
      let data
      try {
        data = await response.json()
        console.log("✅ Datos parseados:", data)
      } catch (jsonError) {
        console.error("❌ Error parsing JSON:", jsonError)
        throw new Error("Respuesta JSON inválida")
      }

      // Verificar estructura de respuesta
      if (data.error) {
        throw new Error(data.error)
      }

      // Obtener texto mejorado (nuevo formato de API)
      const improvedText = data.improved || data.improvedText || text

      if (typeof improvedText !== "string") {
        throw new Error("Respuesta inválida de la API")
      }

      // Actualizar el texto
      onImproved(improvedText.trim())

      // Mostrar notificación
      const isFallback = data.fallback === true
      toast({
        title: isFallback ? "Texto devuelto" : "¡Texto mejorado!",
        description: isFallback
          ? data.message || "Se devolvió el texto original"
          : `Tu ${fieldType === "general" ? "texto" : fieldType} ha sido mejorado con IA.`,
        variant: isFallback ? "default" : "default",
      })

      console.log("✅ Texto mejorado exitosamente:", { original: text, improved: improvedText, fallback: isFallback })
    } catch (error: any) {
      console.error("❌ Error completo al mejorar texto:", error)

      // Mostrar error al usuario
      toast({
        title: "Error al mejorar el texto",
        description: error.message || "Inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsImproving(false)
    }
  }

  return (
    <Button
      onClick={improveText}
      variant="outline"
      size="sm"
      className={`flex items-center gap-1 text-xs ${className}`}
      disabled={isImproving}
    >
      {isImproving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Mejorando...</span>
        </>
      ) : (
        <>
          <Sparkles className="h-3 w-3" />
          <span>Mejorar con IA</span>
        </>
      )}
    </Button>
  )
}
