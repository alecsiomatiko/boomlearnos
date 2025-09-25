import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'srv440.hstgr.io',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
  port: 3306
};

export interface SaveResponseRequest {
  userId: string;
  moduleId: string;
  responses: {
    questionId: number;
    selectedOptionId: number;
  }[];
}

export async function POST(request: NextRequest) {
  console.log('🔍 [SAVE RESPONSES] Iniciando guardado de respuestas...');
  
  try {
    const body: SaveResponseRequest = await request.json();
    const { userId, moduleId, responses } = body;

    console.log(`🔍 [SAVE RESPONSES] Usuario: ${userId}, Módulo: ${moduleId}, Respuestas: ${responses.length}`);

    if (!userId || !moduleId || !responses || responses.length === 0) {
      console.error('❌ [SAVE RESPONSES] Datos faltantes en la solicitud');
      return NextResponse.json(
        { error: 'Se requieren todos los campos: userId, moduleId, responses' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ [SAVE RESPONSES] Conexión a BD establecida');

    try {
      // Iniciar transacción para asegurar consistencia
      await connection.beginTransaction();
      console.log('🔄 [SAVE RESPONSES] Transacción iniciada');

      let savedCount = 0;
      let updatedCount = 0;

      // Procesar cada respuesta
      for (const response of responses) {
        const { questionId, selectedOptionId } = response;

        console.log(`🔍 [SAVE RESPONSES] Procesando - Pregunta: ${questionId}, Opción: ${selectedOptionId}`);
        console.log(`🔍 [SAVE RESPONSES] Tipos - Pregunta: ${typeof questionId}, Opción: ${typeof selectedOptionId}`);

        // Validar que los datos no sean null/undefined
        if (!questionId || !selectedOptionId) {
          console.error(`❌ [SAVE RESPONSES] Datos inválidos - Pregunta: ${questionId}, Opción: ${selectedOptionId}`);
          continue; // Saltar esta respuesta
        }

        // Verificar si ya existe una respuesta para esta pregunta
        const [existingRows] = await connection.execute(`
          SELECT id FROM user_responses 
          WHERE user_id = ? AND question_id = ?
        `, [userId, questionId]);

        if ((existingRows as any[]).length > 0) {
          // Actualizar respuesta existente
          await connection.execute(`
            UPDATE user_responses 
            SET selected_option_id = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND question_id = ?
          `, [selectedOptionId, userId, questionId]);
          updatedCount++;
          console.log(`🔄 [SAVE RESPONSES] Actualizada respuesta para pregunta ${questionId}`);
        } else {
          // Insertar nueva respuesta
          await connection.execute(`
            INSERT INTO user_responses (user_id, question_id, selected_option_id, created_at, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [userId, questionId, selectedOptionId]);
          savedCount++;
          console.log(`✅ [SAVE RESPONSES] Nueva respuesta guardada para pregunta ${questionId}`);
        }
      }

      // Confirmar transacción
      await connection.commit();
      console.log('✅ [SAVE RESPONSES] Transacción confirmada');

      // Calcular estadísticas del módulo completado
      const [moduleStats] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT ur.question_id) as answeredQuestions,
          COUNT(DISTINCT dq.id) as totalQuestions,
          AVG(dop.weight) as averageScore
        FROM user_responses ur
        INNER JOIN diagnostic_questions dq ON ur.question_id = dq.id
        INNER JOIN diagnostic_options dop ON ur.selected_option_id = dop.id
        INNER JOIN diagnostic_submodules ds ON dq.submodule_code = ds.submodule_code
        INNER JOIN diagnostic_modules dm ON ds.module_code = dm.module_code
        WHERE ur.user_id = ? AND dm.module_code = ?
      `, [userId, moduleId]);

      const stats = (moduleStats as any[])[0];
      const completionPercentage = (stats.answeredQuestions / stats.totalQuestions) * 100;

      console.log(`📊 [SAVE RESPONSES] Estadísticas del módulo:`, {
        answeredQuestions: stats.answeredQuestions,
        totalQuestions: stats.totalQuestions,
        completionPercentage: completionPercentage.toFixed(1),
        averageScore: parseFloat(stats.averageScore || 0).toFixed(2)
      });

      return NextResponse.json({
        success: true,
        message: `Respuestas guardadas correctamente`,
        stats: {
          savedCount,
          updatedCount,
          totalProcessed: responses.length,
          moduleCompletion: {
            answeredQuestions: stats.answeredQuestions,
            totalQuestions: stats.totalQuestions,
            completionPercentage: parseFloat(completionPercentage.toFixed(1)),
            averageScore: parseFloat(stats.averageScore || 0)
          }
        }
      });

    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      console.error('❌ [SAVE RESPONSES] Error en transacción, revertida:', error);
      throw error;
    } finally {
      await connection.end();
      console.log('🔌 [SAVE RESPONSES] Conexión cerrada');
    }

  } catch (error) {
    console.error('❌ [SAVE RESPONSES] Error guardando respuestas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al guardar respuestas' },
      { status: 500 }
    );
  }
}

// Endpoint para guardar una respuesta individual (para uso en tiempo real)
export async function PUT(request: NextRequest) {
  console.log('🔍 [SAVE SINGLE RESPONSE] Guardando respuesta individual...');
  
  try {
    const body = await request.json();
    const { userId, questionId, selectedOptionId } = body;

    if (!userId || !questionId || !selectedOptionId) {
      return NextResponse.json(
        { error: 'Se requieren todos los campos: userId, questionId, selectedOptionId' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      // Verificar si ya existe una respuesta para esta pregunta
      const [existingRows] = await connection.execute(`
        SELECT id FROM user_responses 
        WHERE user_id = ? AND question_id = ?
      `, [userId, questionId]);

      let operation = '';
      if ((existingRows as any[]).length > 0) {
        // Actualizar respuesta existente
        await connection.execute(`
          UPDATE user_responses 
          SET selected_option_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND question_id = ?
        `, [selectedOptionId, userId, questionId]);
        operation = 'updated';
      } else {
        // Insertar nueva respuesta
        await connection.execute(`
          INSERT INTO user_responses (user_id, question_id, selected_option_id, created_at, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [userId, questionId, selectedOptionId]);
        operation = 'created';
      }

      console.log(`✅ [SAVE SINGLE RESPONSE] Respuesta ${operation} - Usuario: ${userId}, Pregunta: ${questionId}`);

      return NextResponse.json({ 
        success: true, 
        message: `Respuesta ${operation === 'created' ? 'guardada' : 'actualizada'} correctamente`,
        operation
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ [SAVE SINGLE RESPONSE] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
