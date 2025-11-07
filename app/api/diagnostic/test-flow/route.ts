import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: '151.106.99.1',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
  port: 3306
};

/**
 * GET /api/diagnostic/test-flow
 * Prueba completa del flujo del mega diagnóstico
 */
export async function GET(request: NextRequest) {
  console.log('🧪 [TEST FLOW] Iniciando prueba del flujo completo');
  
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // TEST 1: Verificar estructura de user_responses
    console.log('📋 TEST 1: Estructura de user_responses');
    const [structure] = await connection.execute('DESCRIBE user_responses');
    results.tests.push({
      name: 'Estructura user_responses',
      status: 'success',
      data: structure
    });

    // TEST 2: Verificar Foreign Keys
    console.log('🔗 TEST 2: Foreign Keys');
    const [fks] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user_responses'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    results.tests.push({
      name: 'Foreign Keys',
      status: 'success',
      count: (fks as any[]).length,
      data: fks
    });

    // TEST 3: Obtener una pregunta de ejemplo
    console.log('❓ TEST 3: Pregunta de ejemplo');
    const [questions] = await connection.execute(`
      SELECT 
        dq.id as question_id,
        dq.question_code,
        dq.question_text,
        ds.id as submodule_id,
        ds.submodule_code,
        dm.id as module_id,
        dm.module_code,
        dm.title as module_title
      FROM diagnostic_questions dq
      JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
      JOIN diagnostic_modules dm ON ds.module_id = dm.id
      LIMIT 1
    `);
    
    const question = (questions as any[])[0];
    results.tests.push({
      name: 'Pregunta de ejemplo',
      status: 'success',
      data: question
    });

    // TEST 4: Obtener opciones de esa pregunta
    if (question) {
      console.log('✅ TEST 4: Opciones de respuesta');
      const [options] = await connection.execute(`
        SELECT 
          id as option_id,
          option_code,
          option_text,
          weight
        FROM diagnostic_options
        WHERE question_id = ?
        LIMIT 3
      `, [question.question_id]);
      
      results.tests.push({
        name: 'Opciones de respuesta',
        status: 'success',
        count: (options as any[]).length,
        data: options
      });

      // TEST 5: Simular guardado de respuesta
      console.log('💾 TEST 5: Simular guardado (DRY RUN)');
      const testOption = (options as any[])[0];
      if (testOption) {
        results.tests.push({
          name: 'Simulación de guardado',
          status: 'success',
          message: 'Estructura válida para guardar',
          simulatedPayload: {
            userId: 'TEST_USER_UUID',
            moduleCode: question.module_code,
            responses: [{
              questionId: question.question_id,
              selectedOptionId: testOption.option_id
            }]
          }
        });
      }
    }

    // TEST 6: Contar módulos disponibles
    console.log('📊 TEST 6: Módulos disponibles');
    const [modules] = await connection.execute(`
      SELECT 
        dm.module_code,
        dm.title,
        COUNT(DISTINCT ds.id) as submodules,
        COUNT(DISTINCT dq.id) as questions
      FROM diagnostic_modules dm
      LEFT JOIN diagnostic_submodules ds ON dm.id = ds.module_id
      LEFT JOIN diagnostic_questions dq ON ds.id = dq.submodule_id
      WHERE dm.is_active = 1
      GROUP BY dm.id, dm.module_code, dm.title
      ORDER BY dm.order_index
    `);
    
    results.tests.push({
      name: 'Módulos disponibles',
      status: 'success',
      count: (modules as any[]).length,
      data: modules
    });

    // TEST 7: Verificar VIEW
    console.log('👁️ TEST 7: user_diagnostic_overview VIEW');
    try {
      const [viewTest] = await connection.execute(`
        SELECT * FROM user_diagnostic_overview LIMIT 1
      `);
      results.tests.push({
        name: 'VIEW user_diagnostic_overview',
        status: 'success',
        message: 'VIEW funciona correctamente',
        sample: viewTest
      });
    } catch (viewError: any) {
      results.tests.push({
        name: 'VIEW user_diagnostic_overview',
        status: 'error',
        error: viewError.message
      });
    }

    await connection.end();

    // Resumen final
    const successCount = results.tests.filter((t: any) => t.status === 'success').length;
    const totalTests = results.tests.length;

    results.summary = {
      total: totalTests,
      passed: successCount,
      failed: totalTests - successCount,
      success_rate: `${((successCount / totalTests) * 100).toFixed(1)}%`
    };

    console.log(`✅ [TEST FLOW] Completado: ${successCount}/${totalTests} tests pasaron`);

    return NextResponse.json(results, { status: 200 });

  } catch (error: any) {
    console.error('❌ [TEST FLOW] Error:', error);
    return NextResponse.json({
      error: 'Error en pruebas del flujo',
      message: error.message,
      tests: results.tests
    }, { status: 500 });
  }
}
