import { NextResponse } from "next/server"
import { suggestAnswerForQuestion } from "@/services/openai-service"

export async function POST(request: Request) {
  try {
    const { questionId, questionText, businessContext, apiKey } = await request.json()

    if (!questionId || !questionText) {
      return NextResponse.json({ error: "Faltan datos requeridos (questionId, questionText)" }, { status: 400 })
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

    // Generar sugerencia
    const suggestion = await suggestAnswerForQuestion(questionId, questionText, businessContext || {}, keyToUse)

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error("Error in suggest-answer:", error)
    return NextResponse.json(
      {
        error: "Error processing request",
        message: "Hubo un problema al generar la sugerencia. Por favor, intenta de nuevo.",
      },
      { status: 200 }, // Usamos 200 para manejar el error en el cliente
    )
  }
}
