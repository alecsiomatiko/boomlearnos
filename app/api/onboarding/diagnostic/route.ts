import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, answers } = body;

    if (!userId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📊 [DIAGNOSTIC] Guardando respuestas del cuestionario de onboarding...');
    console.log('📊 [DIAGNOSTIC] UserId:', userId);
    console.log('📊 [DIAGNOSTIC] Answers:', answers);

    // Verificar si ya existe un registro de diagnóstico para este usuario
    const existingRecord = await executeQuery(`
      SELECT id FROM onboarding_diagnostics 
      WHERE user_id = ?
    `, [userId]) as any[];

    if (existingRecord.length > 0) {
      // Actualizar registro existente
      await executeQuery(`
        UPDATE onboarding_diagnostics 
        SET 
          diagnostic_answers = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [JSON.stringify(answers), userId]);
      
      console.log('✅ [DIAGNOSTIC] Diagnóstico actualizado exitosamente');
    } else {
      // Crear nuevo registro
      await executeQuery(`
        INSERT INTO onboarding_diagnostics (
          id,
          user_id,
          diagnostic_answers,
          created_at,
          updated_at
        ) VALUES (UUID(), ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [userId, JSON.stringify(answers)]);
      
      console.log('✅ [DIAGNOSTIC] Diagnóstico creado exitosamente');
    }

    // Actualizar el paso del onboarding a 'diagnostic'
    await executeQuery(`
      UPDATE users 
      SET onboarding_step = 'diagnostic'
      WHERE id = ?
    `, [userId]);
    
    console.log('✅ [DIAGNOSTIC] Paso de onboarding actualizado a diagnostic');

    return NextResponse.json({ 
      success: true,
      message: 'Diagnóstico guardado exitosamente'
    });

  } catch (error) {
    console.error('❌ [DIAGNOSTIC] Error saving diagnostic:', error);
    return NextResponse.json(
      { error: 'Error saving diagnostic answers' },
      { status: 500 }
    );
  }
}
