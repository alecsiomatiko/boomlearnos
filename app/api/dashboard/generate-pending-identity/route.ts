import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function POST(request: NextRequest) {
  try {
    const { organizationId, userId } = await request.json()

    let targetOrganizationId = organizationId

    // Si se proporciona userId, obtener la organización del usuario
    if (userId && !organizationId) {
      const users = await executeQuery(`
        SELECT organization_id FROM users WHERE id = ?
      `, [userId]) as any[]

      if (!users || users.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Usuario no encontrado'
        }, { status: 404 })
      }

      targetOrganizationId = users[0].organization_id
    }

    if (!targetOrganizationId) {
      return NextResponse.json({
        success: false,
        error: 'organizationId o userId es requerido'
      }, { status: 400 })
    }

    // Buscar organización específica con identidad pendiente
    const organizations = await executeQuery(`
      SELECT * FROM organizations 
      WHERE id = ? AND identity_status = 'pending'
    `, [targetOrganizationId]) as any[]

    if (!organizations || organizations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No se encontró la organización o ya tiene identidad generada'
      }, { status: 404 })
    }

    const organization = organizations[0]

    // Intentar generar identidad con IA
    try {
      // Verificar si OpenAI está disponible
      const openaiKey = process.env.OPENAI_API_KEY
      if (!openaiKey || openaiKey === 'your_openai_api_key_here' || !openaiKey.startsWith('sk-')) {
        console.log('⚠️ [DASHBOARD] OpenAI no configurada, usando identidad manual para:', organization.name)
        
        // Generar identidad manual como fallback
        const manualIdentity = generateManualIdentity({
          companyName: organization.name,
          businessType: organization.business_type,
          businessDescription: organization.description,
          targetAudience: organization.target_audience,
          uniqueValue: organization.unique_value,
          currentGoals: organization.current_goals,
          mainChallenges: organization.main_challenges,
          communicationStyle: organization.communication_style
        })

        // Actualizar la organización con la identidad manual
        await executeQuery(`
          UPDATE organizations SET
            mission = ?,
            vision = ?,
            values_json = ?,
            identity_status = 'completed',
            ai_generation_failed = true,
            ai_error_message = 'OpenAI no configurada - identidad generada manualmente'
          WHERE id = ?
        `, [
          manualIdentity.mission,
          manualIdentity.vision,
          JSON.stringify(manualIdentity.values),
          targetOrganizationId
        ])

        return NextResponse.json({
          success: true,
          identity: manualIdentity,
          isManual: true,
          message: 'Identidad generada manualmente (OpenAI no disponible)'
        })
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
      
      // Si falla la IA, generar identidad manual como fallback
      console.log('🔄 [DASHBOARD] Generando identidad manual como fallback...')
      
      const manualIdentity = generateManualIdentity({
        companyName: organization.name,
        businessType: organization.business_type,
        businessDescription: organization.description,
        targetAudience: organization.target_audience,
        uniqueValue: organization.unique_value,
        currentGoals: organization.current_goals,
        mainChallenges: organization.main_challenges,
        communicationStyle: organization.communication_style
      })

      // Actualizar la organización con la identidad manual
      await executeQuery(`
        UPDATE organizations SET
          mission = ?,
          vision = ?,
          values_json = ?,
          identity_status = 'completed',
          ai_generation_failed = true,
          ai_error_message = ?
        WHERE id = ?
      `, [
        manualIdentity.mission,
        manualIdentity.vision,
        JSON.stringify(manualIdentity.values),
        `Error de IA: ${aiError.message}`,
        organization.id
      ])

      return NextResponse.json({
        success: true,
        identity: manualIdentity,
        isManual: true,
        organization: {
          id: organization.id,
          name: organization.name,
          mission: manualIdentity.mission,
          vision: manualIdentity.vision,
          values: manualIdentity.values
        },
        message: 'Identidad generada manualmente (IA no disponible)'
      })
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

// Función para generar identidad manual (fallback cuando OpenAI no está disponible)
function generateManualIdentity(data: any) {
  const businessTypeToMission: { [key: string]: string } = {
    'Tecnología': `Impulsar la innovación tecnológica para transformar la forma en que ${data.targetAudience || 'nuestros clientes'} trabajan y viven.`,
    'Educación': `Democratizar el acceso a educación de calidad y empoderar a ${data.targetAudience || 'estudiantes'} para alcanzar su máximo potencial.`,
    'Salud': `Mejorar la calidad de vida de ${data.targetAudience || 'las personas'} a través de soluciones de salud innovadoras y accesibles.`,
    'Consultoría': `Ser el socio estratégico que ${data.targetAudience || 'las empresas'} necesitan para alcanzar sus objetivos de negocio.`,
    'Retail': `Ofrecer productos excepcionales que enriquezcan la vida de ${data.targetAudience || 'nuestros clientes'}.`,
    'Finanzas': `Facilitar el crecimiento financiero y la prosperidad de ${data.targetAudience || 'individuos y empresas'}.`,
    'Marketing': `Conectar marcas con ${data.targetAudience || 'su audiencia'} de manera auténtica y efectiva.`,
    'Manufactura': `Producir soluciones de calidad que impulsen el progreso de ${data.targetAudience || 'la industria'}.`
  }

  const businessTypeToVision: { [key: string]: string } = {
    'Tecnología': 'Ser líderes en innovación tecnológica, creando un futuro más conectado y eficiente.',
    'Educación': 'Transformar el panorama educativo global a través de metodologías innovadoras.',
    'Salud': 'Ser referentes en salud integral, mejorando vidas en todo el mundo.',
    'Consultoría': 'Ser la consultora más confiable y efectiva del mercado.',
    'Retail': 'Convertirnos en la marca preferida por la calidad y experiencia que ofrecemos.',
    'Finanzas': 'Ser el motor financiero que impulse el crecimiento sostenible.',
    'Marketing': 'Revolucionar la forma en que las marcas se comunican con el mundo.',
    'Manufactura': 'Ser sinónimo de excelencia en fabricación y sostenibilidad.'
  }

  const mission = businessTypeToMission[data.businessType] || 
    `Ofrecer soluciones excepcionales que transformen la experiencia de ${data.targetAudience || 'nuestros clientes'} y generen valor sostenible.`

  const vision = businessTypeToVision[data.businessType] || 
    'Ser reconocidos como líderes en nuestro sector, impulsando el cambio positivo en la industria.'

  const values = [
    'Excelencia',
    'Innovación', 
    'Integridad',
    'Colaboración',
    'Compromiso con el cliente'
  ]

  return {
    mission,
    vision,
    values
  }
}
