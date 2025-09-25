import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json()

    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'organizationId es requerido'
      }, { status: 400 })
    }

    // Buscar organización específica con identidad pendiente
    const organizations = await executeQuery(`
      SELECT * FROM organizations 
      WHERE id = ? AND identity_status = 'pending'
    `, [organizationId]) as any[]

    if (!organizations || organizations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No se encontró la organización o ya tiene identidad generada'
      }, { status: 404 })
    }

    const organization = organizations[0]

    // Intentar generar identidad con IA
    try {
      // Verificar si OpenAI está disponible - usando tu API key directamente
      const openaiKey = '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'
      if (!openaiKey || !openaiKey.startsWith('sk-')) {
        throw new Error('OpenAI API key no configurada')
      }

      console.log('🤖 [DASHBOARD] Generando identidad con IA para:', organization.name)
      
      const identity = await generateIdentityWithAI({
        companyName: organization.name,
        businessType: organization.business_type,
        businessDescription: organization.description,
        targetAudience: organization.target_audience,
        uniqueValue: organization.unique_value,
        currentGoals: organization.current_goals,
        mainChallenges: organization.main_challenges,
        communicationStyle: organization.communication_style
      })

      // Actualizar organización con la identidad generada
      await executeQuery(`
        UPDATE organizations 
        SET 
          mission = ?,
          vision = ?,
          values_json = ?,
          identity_status = 'ai_generated',
          ai_generation_failed = false,
          ai_error_message = NULL,
          identity_generated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        identity.mission,
        identity.vision,
        JSON.stringify(identity.values),
        organization.id
      ])

      console.log('✅ [DASHBOARD] Identidad generada y guardada exitosamente')

      return NextResponse.json({
        success: true,
        organization: {
          id: organization.id,
          name: organization.name,
          mission: identity.mission,
          vision: identity.vision,
          values: identity.values
        },
        message: 'Identidad generada exitosamente con IA'
      })

    } catch (aiError: any) {
      console.error('❌ [DASHBOARD] Error generando con IA:', aiError.message)
      
      // Actualizar el estado para indicar que la IA falló
      await executeQuery(`
        UPDATE organizations 
        SET 
          ai_generation_failed = true,
          ai_error_message = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [aiError.message, organization.id])

      return NextResponse.json({
        success: false,
        error: 'IA no disponible en este momento',
        canGenerateManually: true,
        organization: {
          id: organization.id,
          name: organization.name,
          businessType: organization.business_type,
          description: organization.description
        }
      }, { status: 503 })
    }

  } catch (error) {
    console.error('❌ [DASHBOARD] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// Función para generar identidad con IA
async function generateIdentityWithAI(data: any) {
  const { default: OpenAI } = await import('openai')
  
  const openai = new OpenAI({
    apiKey: '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',
    timeout: 30000
  })

  const prompt = `
Genera una identidad organizacional profesional para:

EMPRESA: ${data.companyName}
TIPO DE NEGOCIO: ${data.businessType}
DESCRIPCIÓN: ${data.businessDescription}
AUDIENCIA: ${data.targetAudience}
VALOR ÚNICO: ${data.uniqueValue}
OBJETIVOS: ${data.currentGoals}
DESAFÍOS: ${data.mainChallenges}
ESTILO: ${data.communicationStyle}

Genera SOLAMENTE un JSON válido con esta estructura exacta:
{
  "mission": "Misión clara y concisa (máximo 200 caracteres)",
  "vision": "Visión inspiradora (máximo 200 caracteres)", 
  "values": ["Valor1", "Valor2", "Valor3", "Valor4", "Valor5"]
}

El tono debe ser ${data.communicationStyle?.toLowerCase() || 'profesional'} y profesional.
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // Modelo más económico
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.7
  })

  const content = completion.choices[0]?.message?.content?.trim()
  if (!content) {
    throw new Error('No se recibió respuesta de OpenAI')
  }

  // Extraer JSON del contenido
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const jsonString = jsonMatch ? jsonMatch[0] : content

  const identity = JSON.parse(jsonString)

  // Validar estructura
  if (!identity.mission || !identity.vision || !Array.isArray(identity.values)) {
    throw new Error('Estructura JSON incompleta')
  }

  return identity
}
