import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function GET() {
  try {
    console.log("=== DIAGNÓSTICO DE API KEY DE OPENAI ===")

    // 1. Verificar si existe la variable de entorno
    const apiKey = process.env.OPENAI_API_KEY
    console.log("1. API Key existe:", !!apiKey)

    if (!apiKey) {
      return NextResponse.json({
        status: "error",
        message: "API Key no encontrada en variables de entorno",
        checks: {
          exists: false,
          format: false,
          length: 0,
          connection: false,
        },
      })
    }

    // 2. Verificar formato de la API key
    const hasCorrectFormat = apiKey.startsWith("sk-")
    console.log("2. Formato correcto (sk-):", hasCorrectFormat)
    console.log("3. Longitud de la key:", apiKey.length)
    console.log("4. Primeros 10 caracteres:", apiKey.substring(0, 10) + "...")

    if (!hasCorrectFormat) {
      return NextResponse.json({
        status: "error",
        message: "API Key no tiene el formato correcto (debe empezar con 'sk-')",
        checks: {
          exists: true,
          format: false,
          length: apiKey.length,
          connection: false,
        },
      })
    }

    // 3. Probar conexión con OpenAI
    let connectionTest = false
    let connectionError = null

    try {
      console.log("5. Probando conexión con OpenAI...")
      const openai = new OpenAI({
        apiKey: apiKey.trim(),
        dangerouslyAllowBrowser: true,
      })

      const testResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Responde solo con 'OK'",
          },
        ],
        max_tokens: 5,
        temperature: 0,
      })

      connectionTest = true
      console.log("6. Conexión exitosa! Respuesta:", testResponse.choices[0]?.message?.content)
    } catch (error) {
      connectionError = error.message
      console.log("6. Error de conexión:", error.message)
      console.log("   Código de error:", error.code)
      console.log("   Status:", error.status)
    }

    return NextResponse.json({
      status: connectionTest ? "success" : "error",
      message: connectionTest
        ? "API Key configurada correctamente y funcionando"
        : `API Key existe pero hay problemas de conexión: ${connectionError}`,
      checks: {
        exists: true,
        format: hasCorrectFormat,
        length: apiKey.length,
        connection: connectionTest,
      },
      connectionError: connectionError,
    })
  } catch (error) {
    console.error("Error en diagnóstico:", error)
    return NextResponse.json({
      status: "error",
      message: `Error durante el diagnóstico: ${error.message}`,
      checks: {
        exists: false,
        format: false,
        length: 0,
        connection: false,
      },
    })
  }
}
