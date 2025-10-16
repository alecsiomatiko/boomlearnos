import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, generateUUID } from '@/lib/server/mysql'

interface CompleteOnboardingData {
  userId: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: CompleteOnboardingData = await request.json()
    console.log('🔍 [ONBOARDING] Completando onboarding para usuario:', data.userId)

    // Verificar que el usuario existe y está en el paso de diagnóstico o ya completado
    console.log('🔍 [ONBOARDING] Buscando usuario...');
    const user = await executeQuery(
      'SELECT id, onboarding_step, onboarding_completed FROM users WHERE id = ?',
      [data.userId]
    ) as any[]

    if (user && user.length > 0) {
      console.log('👤 [ONBOARDING] Usuario encontrado:');
      console.log('- ID:', user[0].id);
      console.log('- Paso actual:', user[0].onboarding_step);
      console.log('- Completado:', user[0].onboarding_completed);
      
      // Si ya completó el onboarding, devolver éxito sin hacer nada
      if (user[0].onboarding_step === 'completed' && user[0].onboarding_completed) {
        console.log('✅ [ONBOARDING] Usuario ya completó el onboarding, devolviendo éxito');
        return NextResponse.json({
          success: true,
          message: 'Onboarding ya completado anteriormente',
          rewards: {
            gems: 0,
            medal: null
          },
          alreadyCompleted: true
        })
      }
      
      if (user[0].onboarding_step !== 'diagnostic') {
        console.log('❌ [ONBOARDING] Usuario no está en paso diagnostic');
        return NextResponse.json({
          success: false,
          error: 'Usuario no está en el paso de diagnóstico. Paso actual: ' + user[0].onboarding_step
        }, { status: 400 })
      }
    } else {
      console.log('❌ [ONBOARDING] Usuario no encontrado:', data.userId);
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    // Completar onboarding, habilitar acceso al dashboard y asignar rol admin
    await executeQuery(`
      UPDATE users 
      SET onboarding_completed = true, 
          can_access_dashboard = true,
          onboarding_step = 'completed',
          role = 'admin'
      WHERE id = ?
    `, [data.userId])

    // Obtener organization_id del usuario
    const orgResult = await executeQuery('SELECT current_organization_id FROM users WHERE id = ?', [data.userId]) as any[];
    const organizationId = orgResult && orgResult[0] ? orgResult[0].current_organization_id : null;

    // Otorgar gemas de bienvenida
    const welcomeGems = 50
    await executeQuery(`
      UPDATE users 
      SET total_gems = total_gems + ?
      WHERE id = ?
    `, [welcomeGems, data.userId])

    // Registrar las gemas otorgadas (usando la estructura correcta de user_gems)
    await executeQuery(`
      INSERT INTO user_gems (user_id, gems_count, total_earned)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      gems_count = gems_count + VALUES(gems_count),
      total_earned = total_earned + VALUES(total_earned)
    `, [data.userId, welcomeGems, welcomeGems])

    // Otorgar medalla de bienvenida (usando la estructura correcta de user_medals)
    if (organizationId) {
      await executeQuery(`
        INSERT INTO user_medals (id, user_id, organization_id, medal_code, medal_name, medal_description)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        generateUUID(),
        data.userId,
        organizationId,
        'welcome-medal',
        'Bienvenido a BoomLearnOS',
        'Completaste exitosamente el proceso de onboarding'
      ])
    } else {
      console.error('❌ [ONBOARDING] No se encontró organization_id para el usuario:', data.userId);
    }

    console.log('✅ [ONBOARDING] Onboarding completado exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Onboarding completado exitosamente',
      rewards: {
        gems: welcomeGems,
        medal: {
          id: 'welcome-medal',
          name: 'Bienvenido a BoomLearnOS',
          description: 'Completaste exitosamente el proceso de onboarding'
        }
      }
    })

  } catch (error) {
    console.error('❌ [ONBOARDING] Error completando onboarding:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
