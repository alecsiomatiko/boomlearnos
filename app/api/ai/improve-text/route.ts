import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient, isOpenAIAvailable } from '@/lib/openai-client'

export async function POST(request: NextRequest) {
  try {
    const { text, style = 'professional' } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Texto requerido'
      }, { status: 400 })
    }

    // 🤖 Verificar disponibilidad de OpenAI
    if (!isOpenAIAvailable()) {
      return NextResponse.json({ 
        success: false, 
        error: 'OpenAI no está disponible' 
      }, { status: 500 })
    }

    const openai = getOpenAIClient()

    // Diferentes estilos de mejora
    const stylePrompts = {
      jony_ive: `Eres un editor de texto experto. Tu única tarea es MEJORAR LA REDACCIÓN del siguiente texto, manteniendo EXACTAMENTE el mismo contenido, ideas y mensaje que escribió el usuario.

Texto original del usuario: "${text}"

INSTRUCCIONES CRÍTICAS:
- NO cambies el significado, ideas o información del texto
- NO agregues contenido que el usuario no mencionó
- NO elimines información que el usuario proporcionó
- SOLO mejora: gramática, ortografía, fluidez y claridad
- Mantén el tono y estilo del usuario
- Respeta las ideas originales al 100%

Devuelve ÚNICAMENTE el texto corregido, sin explicaciones adicionales.`,

      professional: `Eres un editor de texto experto. MEJORA SOLO LA REDACCIÓN del siguiente texto sin cambiar su contenido.

Texto del usuario: "${text}"

REGLAS ESTRICTAS:
- Mantén TODAS las ideas y conceptos originales del usuario
- NO inventes o agregues información nueva
- Solo corrige: ortografía, gramática y fluidez
- Respeta el mensaje original al 100%
- Mantén la misma longitud aproximada

Devuelve solo el texto mejorado.`,

      concise: `Eres un editor de texto. Mejora la REDACCIÓN del siguiente texto haciéndolo más claro, pero SIN cambiar su contenido o significado.

Texto del usuario: "${text}"

IMPORTANTE:
- NO cambies las ideas del usuario
- NO agregues información nueva
- Solo mejora la claridad y elimina repeticiones innecesarias
- Mantén todas las ideas principales
- Respeta el contenido al 100%

Devuelve solo el texto mejorado.`,

      inspiring: `Eres un editor de texto. Mejora la REDACCIÓN del siguiente texto para que suene más inspirador, pero RESPETANDO completamente el contenido original.

Texto del usuario: "${text}"

REGLAS:
- Mantén TODAS las ideas del usuario
- NO inventes o agregues información
- Solo mejora el tono para que sea más motivador
- Respeta el mensaje original al 100%

Devuelve solo el texto mejorado.`
    }

    const prompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.professional

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Eres un editor de texto profesional. Tu ÚNICA tarea es corregir gramática, ortografía y fluidez. NUNCA cambies el contenido, ideas o información del usuario. Solo mejoras la forma en que está escrito, respetando al 100% lo que el usuario quiso decir.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    })

    const improvedText = completion.choices[0]?.message?.content?.trim()

    if (!improvedText) {
      return NextResponse.json({
        success: false,
        error: 'No se pudo generar mejora'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      originalText: text,
      improvedText: improvedText,
      style: style
    })

  } catch (error) {
    console.error('❌ [AI IMPROVE] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error procesando solicitud'
    }, { status: 500 })
  }
}