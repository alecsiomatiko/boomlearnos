import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== DEBUG DE VARIABLES DE ENTORNO ===")

    // Obtener la API key
    const apiKey = process.env.OPENAI_API_KEY

    // Información detallada
    const debugInfo = {
      // Verificar si existe
      exists: !!apiKey,

      // Tipo de dato
      type: typeof apiKey,

      // Longitud
      length: apiKey ? apiKey.length : 0,

      // Primeros 10 caracteres (seguro para mostrar)
      preview: apiKey ? apiKey.substring(0, 10) + "..." : "No encontrada",

      // Verificar formato
      startsWithSk: apiKey ? apiKey.startsWith("sk-") : false,

      // Verificar si tiene espacios o caracteres raros
      hasSpaces: apiKey ? apiKey.includes(" ") : false,
      hasNewlines: apiKey ? apiKey.includes("\n") : false,
      hasTabs: apiKey ? apiKey.includes("\t") : false,

      // Todas las variables de entorno que empiecen con OPENAI
      allOpenAIVars: Object.keys(process.env).filter((key) => key.startsWith("OPENAI")),

      // Verificar si está en diferentes formatos
      rawValue: apiKey,
      trimmedValue: apiKey ? apiKey.trim() : null,

      // Información del entorno
      nodeEnv: process.env.NODE_ENV,

      // Verificar archivo .env.local
      envFileExists: "Verificar manualmente",
    }

    // Log detallado en consola del servidor
    console.log("API Key existe:", debugInfo.exists)
    console.log("Tipo:", debugInfo.type)
    console.log("Longitud:", debugInfo.length)
    console.log("Preview:", debugInfo.preview)
    console.log("Empieza con sk-:", debugInfo.startsWithSk)
    console.log("Tiene espacios:", debugInfo.hasSpaces)
    console.log("Tiene saltos de línea:", debugInfo.hasNewlines)
    console.log("Variables OPENAI encontradas:", debugInfo.allOpenAIVars)

    if (apiKey) {
      console.log("Primeros 20 caracteres:", apiKey.substring(0, 20))
      console.log("Últimos 10 caracteres:", apiKey.substring(apiKey.length - 10))
    }

    return NextResponse.json({
      status: "debug_complete",
      debug: {
        ...debugInfo,
        // No incluir el valor raw en la respuesta por seguridad
        rawValue: apiKey ? "***OCULTO***" : null,
      },
    })
  } catch (error: any) {
    console.error("Error en debug:", error)
    return NextResponse.json({
      status: "error",
      message: error?.message || 'Unknown error',
      debug: {
        exists: false,
        error: true,
      },
    })
  }
}
