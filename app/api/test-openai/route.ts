import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("=== DIAGNÓSTICO PASO A PASO ===")

    // Paso 1: Verificar variables de entorno
    const apiKey = process.env.OPENAI_API_KEY
    console.log("1. API Key existe:", !!apiKey)
    console.log("1. API Key tipo:", typeof apiKey)
    console.log("1. API Key longitud:", apiKey?.length || 0)
    console.log("1. API Key primeros 20 chars:", apiKey?.substring(0, 20) || "undefined")

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "API key no encontrada",
        step: "validation",
      })
    }

    if (typeof apiKey !== "string") {
      return NextResponse.json({
        success: false,
        error: "API key no es string",
        step: "validation",
        type: typeof apiKey,
      })
    }

    // Paso 2: Limpiar y validar API key
    const cleanApiKey = apiKey.trim()
    console.log("2. API Key limpia longitud:", cleanApiKey.length)
    console.log("2. API Key empieza con sk-:", cleanApiKey.startsWith("sk-"))

    if (!cleanApiKey.startsWith("sk-")) {
      return NextResponse.json({
        success: false,
        error: "API key no tiene formato correcto",
        step: "format_validation",
      })
    }

    // Paso 3: Intentar importar OpenAI
    console.log("3. Importando OpenAI...")
    let OpenAI
    try {
      OpenAI = (await import("openai")).default
      console.log("3. OpenAI importado exitosamente")
    } catch (importError: any) {
      console.error("3. Error importando OpenAI:", importError)
      return NextResponse.json({
        success: false,
        error: "Error importando OpenAI",
        step: "import",
        details: importError.message,
      })
    }

    // Paso 4: Crear cliente con configuración mínima
    console.log("4. Creando cliente OpenAI...")
    let openai
    try {
      openai = new OpenAI({
        apiKey: cleanApiKey,
      })
      console.log("4. Cliente OpenAI creado")
    } catch (clientError: any) {
      console.error("4. Error creando cliente:", clientError)
      return NextResponse.json({
        success: false,
        error: "Error creando cliente OpenAI",
        step: "client_creation",
        details: clientError.message,
      })
    }

    // Paso 5: Hacer llamada mínima
    console.log("5. Haciendo llamada a OpenAI...")
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Di hola",
          },
        ],
        max_tokens: 5,
      })

      console.log("5. Respuesta recibida:", response.choices[0]?.message?.content)

      return NextResponse.json({
        success: true,
        message: "OpenAI funcionando correctamente",
        response: response.choices[0]?.message?.content,
        step: "complete",
      })
    } catch (apiError: any) {
      console.error("5. Error en llamada API:", apiError)
      return NextResponse.json({
        success: false,
        error: "Error en llamada a OpenAI",
        step: "api_call",
        details: {
          message: apiError.message,
          type: apiError.constructor.name,
          code: apiError.code,
          status: apiError.status,
        },
      })
    }
  } catch (generalError: any) {
    console.error("Error general:", generalError)
    return NextResponse.json({
      success: false,
      error: "Error general",
      step: "general",
      details: {
        message: generalError.message,
        stack: generalError.stack?.split("\n").slice(0, 5),
      },
    })
  }
}
