import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text, fieldType, tono, companyName, businessContext } = await request.json()

    // Validar entrada
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Texto requerido", improved: text || "" }, { status: 400 })
    }

    // Verificar API key
    const apiKey = process.env.OPENAI_API_KEY?.trim()

    if (!apiKey || !apiKey.startsWith("sk-")) {
      console.log("⚠️ API key no disponible para mejora de texto, devolviendo texto original")
      return NextResponse.json({
        improved: text,
        fallback: true,
        message: "Texto devuelto sin mejoras (API key no disponible)",
      })
    }

    try {
      const { default: OpenAI } = await import("openai")

      const openai = new OpenAI({
        apiKey: apiKey,
        timeout: 20000,
      })

      const contextInfo = businessContext
        ? `Contexto del negocio: ${JSON.stringify(businessContext)}`
        : `Empresa: ${companyName || "empresa"}`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Eres un experto en redacción corporativa. Mejora el texto manteniendo el tono ${tono}. Responde SOLO con el texto mejorado, sin explicaciones.`,
          },
          {
            role: "user",
            content: `Mejora este ${fieldType} con tono ${tono}:

${contextInfo}

Texto a mejorar: "${text}"

Devuelve SOLO el texto mejorado, sin comillas ni explicaciones.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300
      })

      const improved = completion.choices[0]?.message?.content?.trim()

      if (!improved) {
        return NextResponse.json({
          improved: text,
          fallback: true,
          message: "No se pudo mejorar el texto, devolviendo original",
        })
      }

      return NextResponse.json({
        improved: improved,
        fallback: false,
      })
    } catch (openaiError: any) {
      console.error("❌ Error con OpenAI en mejora de texto:", openaiError.message)

      return NextResponse.json({
        improved: text,
        fallback: true,
        message: "Error con IA, devolviendo texto original",
      })
    }
  } catch (error: any) {
    console.error("❌ Error general en mejora de texto:", error)
    const { text } = await request.json()
    return NextResponse.json({
      improved: text || "",
      fallback: true,
      message: "Error del servidor",
    })
  }
}
