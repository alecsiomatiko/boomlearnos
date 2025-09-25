import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, generateUUID } from '@/lib/server/mysql'

interface IdentityOnboardingData {
  userId: string;
  companyName: string;
  businessType: string;
  companySize: string;
  businessDescription: string;
  targetAudience: string;
  mainChallenges: string;
  currentGoals: string;
  uniqueValue: string;
  workValues: string;
  communicationStyle: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: IdentityOnboardingData = await request.json()
    console.log('🔍 [ONBOARDING] Datos de identidad recibidos:', data)

    // Validar campos requeridos
    const requiredFields = [
      'userId', 'companyName', 'businessType', 'businessDescription',
      'targetAudience', 'mainChallenges', 'currentGoals', 'uniqueValue'
    ]
    const missingFields = requiredFields.filter(field => !data[field as keyof IdentityOnboardingData])

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      }, { status: 400 })
    }

    // Verificar que el usuario existe
    const user = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [data.userId]
    ) as any[]

    if (!user || user.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    // Intentar generar identidad con IA
    console.log('🤖 [ONBOARDING] Intentando generar identidad con IA...')
    let identity = null
    let identityStatus = 'pending'
    let aiError = null

    try {
      // Verificar si OpenAI está disponible - usando tu API key directamente
  const openaiKey = process.env.OPENAI_API_KEY
      if (!openaiKey || !openaiKey.startsWith('sk-')) {
        throw new Error('OpenAI API key no configurada')
      }

      // Intentar generar con IA
      identity = await generateIdentityWithAI(data)
      identityStatus = 'ai_generated'
      console.log('✅ [ONBOARDING] Identidad generada con IA exitosamente')
    } catch (error: any) {
      console.warn('⚠️ [ONBOARDING] IA no disponible:', error.message)
      aiError = error.message
      identityStatus = 'pending'
    }

    // Crear organización en la base de datos (siempre, incluso si la identidad está pendiente)
    console.log('📝 [ONBOARDING] Creando organización en BD...')
    const organizationId = generateUUID()
    const orgResult: any = await executeQuery(`
      INSERT INTO organizations (
        id,
        name, 
        business_type, 
        size,
        description,
        target_audience,
        main_challenges,
        current_goals,
        unique_value,
        work_values,
        communication_style,
        mission,
        vision,
        values_json,
        identity_status,
        ai_generation_failed,
        ai_error_message,
        owner_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      organizationId,
      data.companyName || null,
      data.businessType || null,
      data.companySize || 'No especificado',
      data.businessDescription || null,
      data.targetAudience || null,
      data.mainChallenges || null,
      data.currentGoals || null,
      data.uniqueValue || null,
      data.workValues || null,
      data.communicationStyle || 'Profesional',
      identity?.mission || null,
      identity?.vision || null,
      JSON.stringify(identity?.values || []),
      identityStatus,
      identityStatus === 'pending',
      aiError || null,
      data.userId
    ])

    // El ID ya lo tenemos generado manualmente
    console.log('✅ [ONBOARDING] Organización creada con ID:', organizationId)

    // Actualizar usuario con la organización y el siguiente paso
    const nextStep = identityStatus === 'ai_generated' ? 'diagnostic' : 'business'
    
    console.log('🔄 [ONBOARDING] Actualizando usuario...');
    console.log('- identityStatus:', identityStatus);
    console.log('- nextStep:', nextStep);
    console.log('- organizationId:', organizationId);
    console.log('- userId:', data.userId);
    
    await executeQuery(`
      UPDATE users 
      SET organization_id = ?, onboarding_step = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [organizationId, nextStep, data.userId])

    console.log('✅ [ONBOARDING] Usuario actualizado exitosamente')
    console.log('✅ [ONBOARDING] Proceso completado exitosamente')

    // Respuesta diferente según si se generó con IA o quedó pendiente
    if (identityStatus === 'ai_generated') {
      return NextResponse.json({
        success: true,
        organization: {
          id: organizationId,
          name: data.companyName,
          mission: identity.mission,
          vision: identity.vision,
          values: identity.values
        },
        identityGenerated: true,
        nextStep: 'diagnostico'
      })
    } else {
      return NextResponse.json({
        success: true,
        organization: {
          id: organizationId,
          name: data.companyName,
          mission: null,
          vision: null,
          values: []
        },
        identityGenerated: false,
        identityPending: true,
        nextStep: 'identity_pending',
        message: 'Organización creada. La identidad será generada en el panel de diagnósticos.'
      })
    }

  } catch (error) {
    console.error('❌ [ONBOARDING] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// Función para generar identidad con IA (llamada directa)
async function generateIdentityWithAI(data: IdentityOnboardingData) {
  const { default: OpenAI } = await import('openai')
  
  const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

El tono debe ser ${data.communicationStyle.toLowerCase()} y profesional.
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
