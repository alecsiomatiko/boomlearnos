import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Validar que el request tenga contenido
    const requestData = await request.json().catch(() => ({}))

    // Extraer y sanitizar datos con valores por defecto robustos
    const {
      companyName = "Mi Empresa",
      businessType = "Servicios",
      businessStage = "En crecimiento",
      targetAudience = "Clientes generales",
      uniqueValue = "Calidad y servicio",
      goals = "Crecimiento sostenible",
      challenges = "Competencia del mercado",
      tono = "profesional",
    } = requestData

    // Sanitizar todos los valores
    const sanitizedData = {
      companyName: String(companyName || "Mi Empresa").trim(),
      businessType: String(businessType || "Servicios").trim(),
      businessStage: String(businessStage || "En crecimiento").trim(),
      targetAudience: String(targetAudience || "Clientes generales").trim(),
      uniqueValue: String(uniqueValue || "Calidad y servicio").trim(),
      goals: String(goals || "Crecimiento sostenible").trim(),
      challenges: String(challenges || "Competencia del mercado").trim(),
      tono: String(tono || "profesional").trim(),
    }

    console.log("📊 Datos sanitizados:", sanitizedData)

    // Debug de variables de entorno
    console.log("🔍 Variables de entorno disponibles:")
    console.log("- NODE_ENV:", process.env.NODE_ENV)
    console.log("- OPENAI_API_KEY existe:", !!process.env.OPENAI_API_KEY)
    console.log("- OPENAI_API_KEY length:", process.env.OPENAI_API_KEY?.length || 0)
    console.log("- OPENAI_API_KEY primeros 10 chars:", process.env.OPENAI_API_KEY?.substring(0, 10) || "undefined")

    // Verificar API key con más detalle
    const apiKey = process.env.OPENAI_API_KEY?.trim()

    if (!apiKey) {
      console.error("❌ API key no encontrada en process.env")
      console.log("🔍 Todas las variables que empiezan con OPENAI:")
      Object.keys(process.env)
        .filter((key) => key.startsWith("OPENAI"))
        .forEach((key) => {
          console.log(`- ${key}: ${process.env[key]?.substring(0, 10)}...`)
        })

      // Usar identidad predeterminada si no hay API key
      return NextResponse.json({
        mision: `${sanitizedData.companyName} se dedica a ofrecer ${sanitizedData.businessType} de alta calidad para ${sanitizedData.targetAudience}, destacando por ${sanitizedData.uniqueValue} y comprometidos con ${sanitizedData.goals}.`,
        vision: `Ser la empresa líder en ${sanitizedData.businessType}, reconocida por ${sanitizedData.uniqueValue} y por contribuir al crecimiento y éxito de ${sanitizedData.targetAudience} a nivel nacional e internacional.`,
        valores: ["innovation", "excellence", "customer_focus"],
        avatarSugerido: "rocket",
        fallback: true,
        reason: "API key no configurada",
      })
    }

    if (!apiKey.startsWith("sk-")) {
      console.error("❌ API key formato incorrecto:", apiKey.substring(0, 15))
      console.log("🔍 API key completa length:", apiKey.length)
      console.log("🔍 API key tipo:", typeof apiKey)

      // Usar identidad predeterminada si la API key es incorrecta
      return NextResponse.json({
        mision: `${sanitizedData.companyName} se dedica a ofrecer ${sanitizedData.businessType} de alta calidad para ${sanitizedData.targetAudience}, destacando por ${sanitizedData.uniqueValue} y comprometidos con ${sanitizedData.goals}.`,
        vision: `Ser la empresa líder en ${sanitizedData.businessType}, reconocida por ${sanitizedData.uniqueValue} y por contribuir al crecimiento y éxito de ${sanitizedData.targetAudience} a nivel nacional e internacional.`,
        valores: ["innovation", "excellence", "customer_focus"],
        avatarSugerido: "rocket",
        fallback: true,
        reason: "API key formato incorrecto",
      })
    }

    console.log("✅ API key validada correctamente")

    // Generar identidad predeterminada como fallback
    const fallbackIdentity = {
      mision: `${sanitizedData.companyName} se dedica a ofrecer ${sanitizedData.businessType} de alta calidad para ${sanitizedData.targetAudience}, destacando por ${sanitizedData.uniqueValue} y comprometidos con ${sanitizedData.goals}.`,
      vision: `Ser la empresa líder en ${sanitizedData.businessType}, reconocida por ${sanitizedData.uniqueValue} y por contribuir al crecimiento y éxito de ${sanitizedData.targetAudience} a nivel nacional e internacional.`,
      valores: ["innovation", "excellence", "customer_focus"],
      avatarSugerido: "rocket",
      fallback: true,
    }

    // Intentar usar OpenAI
    try {
      const { default: OpenAI } = await import("openai")

      const openai = new OpenAI({
        apiKey: apiKey,
        timeout: 30000, // 30 segundos timeout
      })

      console.log("🤖 Llamando a OpenAI...")

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Eres un experto en branding e identidad corporativa. Genera una identidad coherente con tono ${sanitizedData.tono}. Responde SOLO con JSON válido.`,
          },
          {
            role: "user",
            content: `Genera identidad corporativa para:
            
Empresa: ${sanitizedData.companyName}
Tipo: ${sanitizedData.businessType}
Etapa: ${sanitizedData.businessStage}
Público: ${sanitizedData.targetAudience}
Valor único: ${sanitizedData.uniqueValue}
Objetivos: ${sanitizedData.goals}
Desafíos: ${sanitizedData.challenges}
Tono: ${sanitizedData.tono}

Responde con este JSON exacto:
{
  "mision": "Misión clara de 2-3 oraciones con tono ${sanitizedData.tono}",
  "vision": "Visión inspiradora de 2-3 oraciones con tono ${sanitizedData.tono}",
  "valores": ["innovation", "excellence", "customer_focus"],
  "avatarSugerido": "rocket"
}

Valores disponibles: innovation, excellence, integrity, customer_focus, teamwork
Avatares disponibles: rocket, target, zap, shield, heart`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
        timeout: 25000,
      })

      const content = completion.choices[0]?.message?.content?.trim()

      if (!content) {
        console.log("⚠️ OpenAI no devolvió contenido, usando fallback")
        return NextResponse.json(fallbackIdentity)
      }

      console.log("📝 Respuesta de OpenAI:", content.substring(0, 200) + "...")

      // Parsear respuesta JSON
      try {
        // Extraer JSON de la respuesta
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        const jsonString = jsonMatch ? jsonMatch[0] : content

        const identity = JSON.parse(jsonString)

        // Validar estructura
        if (!identity.mision || !identity.vision || !Array.isArray(identity.valores)) {
          throw new Error("Estructura JSON incompleta")
        }

        console.log("✅ Identidad generada con OpenAI exitosamente")
        return NextResponse.json({
          ...identity,
          fallback: false,
        })
      } catch (parseError) {
        console.error("❌ Error parseando JSON de OpenAI:", parseError)
        console.log("📄 Contenido raw:", content)
        return NextResponse.json(fallbackIdentity)
      }
    } catch (openaiError: any) {
      console.error("❌ Error con OpenAI:", {
        message: openaiError.message,
        type: openaiError.constructor.name,
        code: openaiError.code,
        status: openaiError.status,
      })

      // Devolver fallback en caso de error de OpenAI
      return NextResponse.json({
        ...fallbackIdentity,
        openaiError: openaiError.message,
      })
    }
  } catch (error: any) {
    console.error("❌ Error general:", error)

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error.message,
        fallback: true,
      },
      { status: 500 },
    )
  }
}
