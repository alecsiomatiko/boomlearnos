import { NextResponse } from "next/server"
import { analyzeQuestionnaireResponses } from "@/services/openai-service"

export async function POST(request: Request) {
  try {
    const { answers, apiKey } = await request.json()

    if (!answers) {
      return NextResponse.json({ error: "No se proporcionaron respuestas para analizar" }, { status: 400 })
    }

    // Usar la API key proporcionada o la del entorno
    const keyToUse = apiKey || process.env.OPENAI_API_KEY

    if (!keyToUse) {
      return NextResponse.json(
        {
          error: "API key no configurada",
          message: "Para usar esta funcionalidad, necesitas configurar tu API key de OpenAI.",
        },
        { status: 200 }, // Usamos 200 para manejar el error en el cliente
      )
    }

    // Analizar las respuestas
    const analysis = await analyzeQuestionnaireResponses(answers, keyToUse)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error in analyze-questionnaire:", error)
    return NextResponse.json(
      {
        error: "Error processing request",
        message: "Hubo un problema al analizar las respuestas. Por favor, intenta de nuevo.",
      },
      { status: 200 }, // Usamos 200 para manejar el error en el cliente
    )
  }
}
