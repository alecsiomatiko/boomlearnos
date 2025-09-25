import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

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

    // Verificar que el usuario existe y está en el paso correcto
    const user = await executeQuery(
      'SELECT * FROM users WHERE id = ? AND onboarding_step = 1 AND onboarding_completed = false',
      [data.userId]
    ) as any[]

    if (!user || user.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado o ya completó este paso'
      }, { status: 404 })
    }

    // Generar identidad organizacional usando IA o fallback
    console.log('🤖 [ONBOARDING] Generando identidad...')
    const aiIdentityResponse = await generateIdentity(data)
    
    if (!aiIdentityResponse.success) {
      console.log('❌ [ONBOARDING] Error generando identidad:', aiIdentityResponse.error)
      return NextResponse.json({
        success: false,
        error: 'Error generando la identidad organizacional'
      }, { status: 500 })
    }

    const aiIdentity = aiIdentityResponse.identity
    console.log('✅ [ONBOARDING] Identidad generada exitosamente')

    // Crear organización en la base de datos
    console.log('📝 [ONBOARDING] Creando organización en BD...')
    const orgResult: any = await executeQuery(`
      INSERT INTO organizations (
        name, 
        business_type, 
        company_size,
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
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.companyName,
      data.businessType,
      data.companySize || 'No especificado',
      data.businessDescription,
      data.targetAudience,
      data.mainChallenges,
      data.currentGoals,
      data.uniqueValue,
      data.workValues || '',
      data.communicationStyle || 'Profesional',
      aiIdentity.mission,
      aiIdentity.vision,
      JSON.stringify(aiIdentity.values),
      data.userId
    ])

    if (orgResult.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        error: 'Error creando la organización'
      }, { status: 500 })
    }

    // Obtener la organización creada
    const newOrg = await executeQuery(
      'SELECT * FROM organizations WHERE created_by = ? ORDER BY created_at DESC LIMIT 1',
      [data.userId]
    ) as any[]

    if (!newOrg || newOrg.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo la organización creada'
      }, { status: 500 })
    }

    const organization = newOrg[0]

    // Relacionar usuario con organización
    await executeQuery(`
      INSERT INTO user_organizations (user_id, organization_id, role, is_owner)
      VALUES (?, ?, ?, ?)
    `, [data.userId, organization.id, 'owner', true])

    // Actualizar usuario: paso de onboarding y organización actual
    await executeQuery(`
      UPDATE users 
      SET onboarding_step = 2, current_organization_id = ?
      WHERE id = ?
    `, [organization.id, data.userId])

    console.log('✅ [ONBOARDING] Identidad organizacional completada')

    return NextResponse.json({
      success: true,
      message: 'Identidad organizacional creada exitosamente',
      organization: {
        id: organization.id,
        name: organization.name,
        mission: organization.mission,
        vision: organization.vision,
        values: JSON.parse(organization.values_json || '[]')
      },
      nextStep: 2
    })

  } catch (error) {
    console.error('❌ [ONBOARDING] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// Función auxiliar para generar identidad (extraída del endpoint existente)
async function generateIdentity(data: IdentityOnboardingData) {
  try {
    // Crear el contexto para la IA basado en los datos del onboarding
    const context = `
Empresa: ${data.companyName}
Tipo de negocio: ${data.businessType}
Descripción: ${data.businessDescription}
Público objetivo: ${data.targetAudience}
Principales desafíos: ${data.mainChallenges}
Objetivos actuales: ${data.currentGoals}
Propuesta de valor única: ${data.uniqueValue}
Valores de trabajo: ${data.workValues || 'No especificados'}
Estilo de comunicación: ${data.communicationStyle || 'Profesional'}
`

    // Intentar usar OpenAI primero
    try {
      console.log('🤖 [IDENTITY] Intentando generar con IA...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: data.companyName,
          businessType: data.businessType,
          description: data.businessDescription,
          context: context
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.identity) {
          console.log('✅ [IDENTITY] Generada exitosamente con IA')
          return result
        }
      }
    } catch (aiError) {
      console.log('⚠️ [IDENTITY] IA no disponible, usando fallback...', aiError)
    }

    // Fallback: Generar identidad básica sin IA
    console.log('📝 [IDENTITY] Generando identidad con plantillas...')
    const fallbackIdentity = generateFallbackIdentity(data)
    
    return {
      success: true,
      identity: fallbackIdentity
    }

  } catch (error) {
    console.error('❌ [IDENTITY] Error general:', error)
    // Último recurso: identidad mínima
    return {
      success: true,
      identity: {
        mission: `${data.companyName} se dedica a ${data.businessDescription.toLowerCase()}`,
        vision: `Ser líder en ${data.businessType.toLowerCase()} y crear valor para nuestros clientes`,
        values: ['Excelencia', 'Integridad', 'Innovación']
      }
    }
  }
}

// Función para generar identidad de fallback
function generateFallbackIdentity(data: IdentityOnboardingData) {
  const businessType = data.businessType.toLowerCase()
  const companyName = data.companyName
  
  // Plantillas básicas según el tipo de negocio
  const templates = {
    mission: {
      tecnologia: `En ${companyName}, desarrollamos soluciones tecnológicas innovadoras que simplifican y potencian los procesos de nuestros clientes, creando valor a través de la innovación digital.`,
      servicios: `${companyName} ofrece servicios profesionales de alta calidad que ayudan a nuestros clientes a alcanzar sus objetivos de negocio con excelencia y confiabilidad.`,
      retail: `En ${companyName}, nos dedicamos a ofrecer productos y experiencias excepcionales que satisfacen las necesidades de nuestros clientes y superan sus expectativas.`,
      manufactura: `${companyName} produce soluciones de calidad superior que contribuyen al éxito de nuestros clientes a través de procesos eficientes e innovación constante.`,
      default: `En ${companyName}, nos dedicamos a ${data.businessDescription.toLowerCase()} con un enfoque en la excelencia y la satisfacción del cliente.`
    },
    vision: {
      tecnologia: `Ser reconocidos como líderes en innovación tecnológica, transformando industrias y mejorando la vida de las personas a través de soluciones digitales avanzadas.`,
      servicios: `Convertirnos en el socio estratégico preferido por empresas que buscan excelencia y resultados excepcionales en sus operaciones.`,
      retail: `Ser la primera opción para clientes que valoran la calidad, la innovación y el servicio excepcional en cada experiencia de compra.`,
      manufactura: `Establecernos como líder en nuestro sector, reconocidos por la calidad superior, sostenibilidad e innovación en todos nuestros productos.`,
      default: `Ser líder en ${businessType}, reconocidos por nuestra excelencia, innovación y compromiso con el éxito de nuestros clientes.`
    }
  }

  // Seleccionar plantillas
  const missionTemplate = templates.mission[businessType as keyof typeof templates.mission] || templates.mission.default
  const visionTemplate = templates.vision[businessType as keyof typeof templates.vision] || templates.vision.default

  // Valores según estilo de comunicación y tipo de negocio
  let values = ['Excelencia', 'Integridad', 'Innovación']
  
  if (data.workValues && data.workValues.trim()) {
    // Si especificó valores, usarlos
    values = data.workValues.split(',').map(v => v.trim()).filter(v => v.length > 0).slice(0, 5)
  } else {
    // Valores según tipo de negocio
    if (businessType.includes('tecnologia')) {
      values = ['Innovación', 'Excelencia', 'Agilidad', 'Transparencia']
    } else if (businessType.includes('servicios')) {
      values = ['Calidad', 'Confiabilidad', 'Profesionalismo', 'Compromiso']
    } else if (businessType.includes('salud')) {
      values = ['Cuidado', 'Excelencia', 'Compasión', 'Integridad']
    }
  }

  return {
    mission: missionTemplate,
    vision: visionTemplate,
    values: values
  }
}
