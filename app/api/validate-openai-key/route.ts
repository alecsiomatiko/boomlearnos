import { NextResponse } from "next/server"
import { validateOpenAIKey } from "@/services/openai-service"

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ valid: false, message: "No se proporcionó una API key" })
    }

    const isValid = await validateOpenAIKey(apiKey)

    return NextResponse.json({
      valid: isValid,
      message: isValid ? "API key válida" : "API key inválida",
    })
  } catch (error) {
    console.error("Error validating OpenAI key:", error)
    return NextResponse.json(
      {
        valid: false,
        message: "Error al validar la API key",
      },
      { status: 500 },
    )
  }
}
