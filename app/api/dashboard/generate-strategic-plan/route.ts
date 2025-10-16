import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

// Utilidad para generar el prompt para OpenAI
function buildStrategicPlanPrompt({ companyName, businessType, mission, vision, mainGoals, mainChallenges, uniqueValue, targetAudience }) {
  return `
Eres un consultor experto en estrategia empresarial. Genera un plan estratégico a 6 meses para la siguiente organización:

EMPRESA: ${companyName}
TIPO DE NEGOCIO: ${businessType}
MISIÓN: ${mission}
VISIÓN: ${vision}
OBJETIVOS PRINCIPALES: ${mainGoals}
DESAFÍOS PRINCIPALES: ${mainChallenges}
PROPUESTA ÚNICA DE VALOR: ${uniqueValue}
AUDIENCIA OBJETIVO: ${targetAudience}

Devuelve SOLO un JSON con esta estructura:
{
  "objetivo_general": "...",
  "objetivos_especificos": ["...", "...", "..."],
  "acciones_clave": ["...", "...", "..."],
  "indicadores_exito": ["...", "...", "..."],
  "cronograma": [
    { "mes": 1, "acciones": ["...", "..."] },
    { "mes": 2, "acciones": ["...", "..."] },
    { "mes": 3, "acciones": ["...", "..."] },
    { "mes": 4, "acciones": ["...", "..."] },
    { "mes": 5, "acciones": ["...", "..."] },
    { "mes": 6, "acciones": ["...", "..."] }
  ]
}
El plan debe ser concreto, accionable y adaptado a la información dada.`
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId es requerido' }, { status: 400 })
    }

    // Obtener datos de la organización y diagnóstico del usuario
    const [user] = await executeQuery(`
      SELECT u.id, u.first_name, u.last_name, org.name as companyName, org.business_type, org.mission, org.vision, org.target_audience, org.unique_value
      FROM users u
      LEFT JOIN organizations org ON u.organization_id = org.id
      WHERE u.id = ?
    `, [userId]) as any[]

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
    }


    // Obtener respuestas del diagnóstico principal
    let mainGoals = ''
    let mainChallenges = ''
    let uniqueValue = user.unique_value || ''
    let targetAudience = user.target_audience || ''


    // Buscar primero en user_diagnostics, pero si la tabla no existe o hay error, continuar con onboarding_diagnostics
    let diagnostic: any = null
    try {
      [diagnostic] = await executeQuery(`
        SELECT main_goals, main_challenges
        FROM user_diagnostics
        WHERE user_id = ?
        ORDER BY completed_at DESC LIMIT 1
      `, [userId]) as any[]
    } catch (err) {
      let errMsg = ''
      if (err && typeof err === 'object' && 'message' in err) {
        errMsg = (err as any).message
      } else if (typeof err === 'string') {
        errMsg = err
      } else {
        errMsg = JSON.stringify(err)
      }
      console.warn('[STRATEGIC PLAN] user_diagnostics no disponible, usando solo onboarding:', errMsg)
      diagnostic = null
    }

    if (diagnostic) {
      mainGoals = diagnostic.main_goals || ''
      mainChallenges = diagnostic.main_challenges || ''
    } else {
      // Si no hay en user_diagnostics, buscar en onboarding_diagnostics
      const [onboarding] = await executeQuery(`
        SELECT diagnostic_answers
        FROM onboarding_diagnostics
        WHERE user_id = ?
        ORDER BY created_at DESC LIMIT 1
      `, [userId]) as any[]
      if (onboarding && onboarding.diagnostic_answers) {
        try {
          const answers = JSON.parse(onboarding.diagnostic_answers)
          mainGoals = answers.main_goals || ''
          mainChallenges = answers.main_challenges || ''
          uniqueValue = answers.unique_value_proposition || answers.unique_value || uniqueValue
          targetAudience = answers.target_customer || targetAudience
        } catch (e) {
          // fallback: dejar vacíos
        }
      }
    }

    // Construir el prompt
    const prompt = buildStrategicPlanPrompt({
      companyName: user.companyName,
      businessType: user.business_type,
      mission: user.mission,
      vision: user.vision,
      mainGoals,
      mainChallenges,
      uniqueValue,
      targetAudience
    })

    // Llamar a OpenAI
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.7
    })
    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI')
    }
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[0] : content
    const plan = JSON.parse(jsonString)

    // Puedes guardar el plan en la base de datos si lo deseas aquí

    return NextResponse.json({ success: true, plan })
  } catch (error) {
    let errorMsg = 'Error generando plan estratégico'
    if (error && typeof error === 'object' && 'message' in error) {
      errorMsg = (error as any).message || errorMsg
    } else if (typeof error === 'string') {
      errorMsg = error
    }
    console.error('[STRATEGIC PLAN] Error:', error)
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
