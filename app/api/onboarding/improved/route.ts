import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, generateUUID } from '@/lib/server/mysql'
import { getOpenAIClient, isOpenAIAvailable } from '@/lib/openai-client'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { userId, answers } = await request.json()
    console.log('📋 [IMPROVED ONBOARDING] Procesando respuestas para userId:', userId)
    console.log('📋 [IMPROVED ONBOARDING] Respuestas recibidas:', Object.keys(answers).length, 'preguntas')

    // Validar usuario
    const user = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    ) as any[]

    if (!user || user.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    // Generar identidad empresarial mejorada con IA usando las respuestas
    console.log('🤖 [IMPROVED ONBOARDING] Generando identidad empresarial con IA...')
    let identity = null
    let identityStatus = 'pending'
    let aiError = null

    try {
      identity = await generateAdvancedIdentityWithAI(answers)
      identityStatus = 'ai_generated'
      console.log('✅ [IMPROVED ONBOARDING] Identidad avanzada generada exitosamente')
    } catch (error: any) {
      console.warn('⚠️ [IMPROVED ONBOARDING] Error generando identidad:', error.message)
      aiError = error.message
      identityStatus = 'pending'
    }

    // Crear organización con la información mejorada
    const organizationId = generateUUID()
    
    // Extraer información clave de las respuestas
    const companyName = extractCompanyName(answers)
    const businessType = extractBusinessType(answers)
    const description = extractDescription(answers)

    console.log('📝 [IMPROVED ONBOARDING] Creando organización mejorada...')
    await executeQuery(`
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
      companyName,
      businessType,
      'startup', // Por defecto
      description,
      extractTargetAudience(answers),
      extractMainChallenges(answers),
      extractGoals(answers),
      extractUniqueValue(answers),
      extractWorkValues(answers),
      'professional', // Por defecto
      identity?.mission || null,
      identity?.vision || null,
      JSON.stringify(identity?.values || []),
      identityStatus,
      identityStatus === 'pending',
      aiError || null,
      userId
    ])

    // Actualizar usuario con información del perfil
    console.log('🔄 [IMPROVED ONBOARDING] Actualizando usuario con perfil completo...')
    console.log('👤 [IMPROVED ONBOARDING] Usuario existente:', {
      id: user[0].id,
      business_type: user[0].business_type,
      position: user[0].position,
      city: user[0].city,
      phone: user[0].phone
    })
    
    // Usar la información existente del usuario y complementar con respuestas del onboarding
    const profileInfo = extractUserProfileInfo(answers, user[0])
    console.log('📋 [IMPROVED ONBOARDING] Información del perfil a guardar:', profileInfo)
    
    // 🔑 ASIGNAR PERMISOS SEGÚN EL ROL DEL USUARIO
    const userRole = user[0].role || 'user'
    let permissions = {}
    
    if (userRole === 'admin') {
      // 👑 ADMIN: Permisos completos
      permissions = {
        team: true,         // Gestión completa de equipo
        tasks: true,        // Gestión completa de tareas
        dashboard: true,    // Dashboard completo
        analytics: true,    // Acceso a analytics
        settings: true,     // Configuración de organización
        users: true,        // Gestión de usuarios
        billing: true,      // Facturación
        admin: true         // Panel de administración
      }
      console.log('👑 [IMPROVED ONBOARDING] Usuario ADMIN detectado - asignando permisos completos')
    } else {
      // 👤 USER: Permisos básicos
      permissions = {
        team: true,      // Puede ver el equipo
        tasks: true,     // Puede ver y gestionar tareas
        dashboard: true  // Puede acceder al dashboard completo
      }
      console.log('� [IMPROVED ONBOARDING] Usuario básico - asignando permisos estándar')
    }
    
    const permissionsJson = JSON.stringify(permissions)
    console.log('🔑 [IMPROVED ONBOARDING] Permisos asignados:', permissionsJson)
    
    await executeQuery(`
      UPDATE users 
      SET 
        organization_id = ?, 
        business_type = COALESCE(?, business_type),
        position = COALESCE(?, position),
        city = COALESCE(?, city),
        phone = COALESCE(?, phone),
        permissions = ?,
        onboarding_step = 'completed', 
        onboarding_completed = 1,
        can_access_dashboard = 1,
        total_gems = total_gems + 100,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [
      organizationId, 
      profileInfo.businessType,
      profileInfo.position,
      profileInfo.city,
      profileInfo.phone,
      permissionsJson,
      userId
    ])

    console.log('✅ [IMPROVED ONBOARDING] Usuario actualizado con perfil completo')

    // 🚀 GENERAR JWT TOKEN PARA AUTO-LOGIN DESPUÉS DEL ONBOARDING
    console.log('🔑 [IMPROVED ONBOARDING] Generando JWT token para auto-login...')
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    
    const authToken = jwt.sign(
      {
        sub: userId,
        id: userId,
        email: user[0].email,
        role: 'user',
        organizationId: organizationId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('✅ [IMPROVED ONBOARDING] Proceso completado exitosamente')

    // 🔑 CREAR RESPUESTA CON TOKEN
    const response = NextResponse.json({
      success: true,
      organization: {
        id: organizationId,
        name: companyName,
        mission: identity?.mission,
        vision: identity?.vision,
        values: identity?.values
      },
      identityGenerated: identityStatus === 'ai_generated',
      rewards: {
        gems: 100,
        badges: ['onboarding_completed']
      },
      nextStep: '/dashboard',
      // 🚀 INCLUIR TOKEN PARA AUTO-LOGIN
      authToken: authToken,
      user: {
        id: userId,
        email: user[0].email,
        role: 'user',
        organizationId: organizationId
      }
    })

    // 🍪 ESTABLECER COOKIE DE AUTENTICACIÓN
    response.cookies.set('auth_token', authToken, {
      httpOnly: false, // Permitir acceso desde JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 días
    })

    console.log('🔑 [IMPROVED ONBOARDING] Token generado y cookie establecida para usuario:', userId)

    return response

  } catch (error) {
    console.error('❌ [IMPROVED ONBOARDING] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// Función para generar identidad avanzada con las respuestas del onboarding
async function generateAdvancedIdentityWithAI(answers: Record<string, any>) {
  // 🤖 Verificar disponibilidad de OpenAI
  if (!isOpenAIAvailable()) {
    throw new Error('OpenAI API key no configurada')
  }

  const openai = getOpenAIClient()

  // Construir un prompt muy detallado basado en las respuestas
  const prompt = `
Genera una identidad organizacional profesional y auténtica basada en estas respuestas detalladas de onboarding:

INSPIRACIÓN Y MOTIVACIÓN:
- Inspiración para crear la empresa: ${answers.business_inspiration || 'No especificado'}
- Visión de éxito en 5 años: ${answers.success_vision || 'No especificado'}
- Motivación diaria: ${answers.daily_motivation || 'No especificado'}

EMPRESA ACTUAL:
- Modelo de negocio: ${answers.business_model || 'No especificado'}
- Etapa actual: ${answers.current_stage || 'No especificado'}
- Principal desafío: ${answers.main_challenge || 'No especificado'}
- Fortaleza única: ${answers.unique_strength || 'No especificado'}

CLIENTES:
- Cómo descubrió su cliente ideal: ${answers.customer_discovery || 'No especificado'}
- Emociones de clientes antes de la solución: ${answers.customer_emotion || 'No especificado'}
- Transformación del cliente: ${answers.customer_transformation || 'No especificado'}
- Frecuencia de feedback: ${answers.customer_feedback_frequency || 'No especificado'}

COMPETENCIA:
- Ventaja competitiva: ${answers.competitive_advantage || 'No especificado'}
- Posición en el mercado: ${answers.market_position || 'No especificado'}
- Estrategia de crecimiento: ${answers.growth_strategy || 'No especificado'}

CULTURA:
- Filosofía de trabajo: ${answers.work_philosophy || 'No especificado'}
- Estilo de toma de decisiones: ${answers.decision_making || 'No especificado'}
- Personalidad de la empresa: ${answers.company_personality || 'No especificado'}

Genera SOLAMENTE un JSON válido con esta estructura exacta:
{
  "mission": "Misión clara y auténtica que refleje el propósito real (máximo 150 caracteres)",
  "vision": "Visión inspiradora basada en sus aspiraciones reales (máximo 150 caracteres)", 
  "values": ["Valor1", "Valor2", "Valor3", "Valor4", "Valor5"]
}

La identidad debe ser:
- Auténtica y específica para este negocio
- Inspirada en las respuestas reales del emprendedor
- Coherente con su filosofía y motivaciones
- Profesional pero con personalidad
- Actionable y significativa
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
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

// Funciones auxiliares para extraer información clave
function extractCompanyName(answers: Record<string, any>): string {
  // Buscar en las respuestas o generar basado en el negocio
  return answers.company_name || 
         answers.business_name || 
         'Mi Empresa' // Fallback
}

function extractBusinessType(answers: Record<string, any>): string {
  return answers.business_model || answers.industry || 'servicios'
}

function extractDescription(answers: Record<string, any>): string {
  return answers.unique_strength || 
         answers.customer_transformation || 
         'Empresa innovadora enfocada en brindar soluciones de calidad'
}

function extractTargetAudience(answers: Record<string, any>): string {
  return answers.customer_transformation || 
         answers.target_customer || 
         'Clientes que buscan soluciones de calidad'
}

function extractMainChallenges(answers: Record<string, any>): string {
  return answers.main_challenge || 
         answers.customer_emotion || 
         'Crecimiento y escalabilidad'
}

function extractGoals(answers: Record<string, any>): string {
  return answers.success_vision || 
         answers.growth_strategy || 
         'Crecer y brindar el mejor servicio posible'
}

function extractUniqueValue(answers: Record<string, any>): string {
  return answers.unique_strength || 
         answers.competitive_advantage || 
         'Calidad y atención personalizada'
}

function extractWorkValues(answers: Record<string, any>): string {
  return answers.work_philosophy || 
         answers.company_personality || 
         'Excelencia, Integridad, Innovación'
}

function extractUserProfileInfo(answers: Record<string, any>, existingUser?: any) {
  return {
    businessType: answers.business_model || answers.industry || existingUser?.business_type || 'servicios',
    position: answers.user_role || answers.position || existingUser?.position || 'Emprendedor',
    city: answers.city || answers.location || existingUser?.city || null,
    phone: answers.phone || answers.contact || existingUser?.phone || null
  }
}