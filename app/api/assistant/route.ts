import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const { message, userContext } = await request.json()

    // Obtener la API key de OpenAI
    const apiKey = process.env.OPENAI_API_KEY

    // Si no hay API key en las variables de entorno, devolver un error amigable
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API key no configurada",
          message: "Para usar el asistente, necesitas configurar tu API key de OpenAI en la sección de configuración.",
        },
        { status: 200 },
      )
    }

    // Crear el contexto para el asistente
    const systemPrompt = `
      Eres el asistente virtual de KALABASBOOM OS, una plataforma de productividad y gestión empresarial.
      
      Información sobre el usuario:
      - Nombre de la empresa: ${userContext.companyName || "No disponible"}
      - Tipo de negocio: ${userContext.businessType || "No disponible"}
      - Etapa del negocio: ${userContext.businessStage || "No disponible"}
      
      Misión de la empresa: ${userContext.mission || "No disponible"}
      Visión de la empresa: ${userContext.vision || "No disponible"}
      
      Tu objetivo es ayudar al usuario a aprovechar al máximo KALABASBOOM OS, respondiendo preguntas sobre:
      - Cómo usar las diferentes funcionalidades de la plataforma
      - Consejos para mejorar su productividad y gestión empresarial
      - Interpretación de métricas y datos
      - Recomendaciones personalizadas basadas en su perfil empresarial
      
      Sé amigable, profesional y conciso en tus respuestas. Personaliza tus respuestas según el contexto del usuario.
      Si no conoces la respuesta a algo específico, admítelo y ofrece alternativas útiles.
    `

    // Inicializar el cliente de OpenAI con la API key
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Llamar a la API de OpenAI - CAMBIADO DE GPT-4o A GPT-3.5-TURBO
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    // Obtener la respuesta
    const assistantMessage = response.choices[0]?.message?.content || "Lo siento, no pude procesar tu pregunta."

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error("Error in assistant:", error)
    return NextResponse.json(
      {
        error: "Error processing request",
        message:
          "Lo siento, hubo un problema al procesar tu pregunta. Por favor, intenta de nuevo o contacta a soporte si el problema persiste.",
      },
      { status: 200 }, // Devolvemos 200 para manejar el error en el cliente
    )
  }
}
