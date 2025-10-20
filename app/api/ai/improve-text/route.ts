import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { text, style = 'professional' } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Texto requerido'
      }, { status: 400 })
    }

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI no configurado'
      }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: openaiKey,
    })

    // Diferentes estilos de mejora
    const stylePrompts = {
      jony_ive: `Reescribe el siguiente texto con el estilo elegante, claro y visionario de Jony Ive (ex-diseñador jefe de Apple). 

Características del estilo Jony Ive:
- Frases simples pero poderosas
- Enfoque en la esencia y propósito
- Lenguaje que evoca emociones y valores
- Visión clara del futuro
- Elegancia en la simplicidad
- Conexión humana y significado profundo

Texto original: "${text}"

Reescribe este texto manteniendo el mensaje principal pero con la elegancia, claridad visionaria y el toque humano característico de Jony Ive. Que sea inspirador pero auténtico.`,

      professional: `Mejora el siguiente texto para que sea más profesional, claro y impactante:

"${text}"

Hazlo más conciso, elimina redundancias, mejora la estructura y hazlo más persuasivo manteniendo el mensaje original.`,

      concise: `Haz este texto más conciso y directo al grano:

"${text}"

Mantén las ideas principales pero elimina palabras innecesarias.`,

      inspiring: `Reescribe este texto para que sea más inspirador y motivador:

"${text}"

Mantén el mensaje pero hazlo más emocional e inspirador.`
    }

    const prompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.professional

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto editor y comunicador que ayuda a mejorar textos. Siempre mantienes el mensaje original pero lo mejoras significativamente.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
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