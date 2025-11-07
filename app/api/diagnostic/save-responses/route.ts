/**
 * POST /api/diagnostic/save-responses
 * 
 * Endpoint para guardar respuestas del diagnóstico.
 * Maneja tanto guardado individual como por lotes (módulo completo).
 * 
 * Request Body:
 * {
 *   "userId": "uuid-del-usuario",
 *   "organizationId": "uuid-de-la-organizacion",
 *   "moduleId": "uuid-del-modulo",
 *   "moduleCode": "MOD2",  // Opcional, alternativa a moduleId
 *   "responses": [
 *     {
 *       "questionId": "uuid-pregunta",
 *       "selectedOptionId": "uuid-opcion"
 *     },
 *     // ... más respuestas
 *   ]
 * }
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "message": "Respuestas guardadas exitosamente",
 *   "stats": {
 *     "savedCount": 5,           // Respuestas nuevas guardadas
 *     "updatedCount": 3,         // Respuestas actualizadas
 *     "totalProcessed": 8,       // Total procesadas
 *     "moduleCompletion": {
 *       "answeredQuestions": 8,
 *       "totalQuestions": 10,
 *       "completionPercentage": 80,
 *       "averageScore": 75.5
 *     }
 *   }
 * }
 * 
 * Response Error (400):
 * {
 *   "error": "Se requieren todos los campos: userId, organizationId, moduleId/moduleCode, responses"
 * }
 * 
 * Notas:
 * - Usa transacciones para asegurar consistencia
 * - Si una respuesta ya existe, la actualiza (no duplica)
 * - Calcula automáticamente el progreso del módulo
 * - Multi-tenant: las respuestas se asocian a la organización
 */

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || '151.106.99.1',
  user: process.env.DB_USER || 'u191251575_BoomlearnOS',
  password: process.env.DB_PASSWORD || 'Cerounocero.com20182417',
  database: process.env.DB_NAME || 'u191251575_BoomlearnOS',
  port: parseInt(process.env.DB_PORT || '3306')
};

export interface SaveResponseRequest {
  userId: string;
  organizationId: string; // NUEVO: ID de la organización
  moduleId: string;
  moduleCode?: string;
  responses: {
    questionId: string; // UUID
    selectedOptionId: string; // UUID
    questionCode?: string;
  }[];
}

export async function POST(request: NextRequest) {
  console.log('🔍 [SAVE RESPONSES] Iniciando guardado de respuestas...');
  
  try {
    const body: SaveResponseRequest = await request.json();
    const { userId, organizationId, moduleId, moduleCode, responses } = body;

    console.log(`🔍 [SAVE RESPONSES] Usuario: ${userId}, Organización: ${organizationId}, Módulo: ${moduleId || moduleCode}, Respuestas: ${responses.length}`);

    if (!userId || !organizationId || (!moduleId && !moduleCode) || !responses || responses.length === 0) {
      console.error('❌ [SAVE RESPONSES] Datos faltantes en la solicitud');
      return NextResponse.json(
        { error: 'Se requieren todos los campos: userId, organizationId, moduleId/moduleCode, responses' },
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

        // Validar que los IDs existan
        if (!questionId || !selectedOptionId) {
          console.error(`❌ [SAVE RESPONSES] IDs faltantes - Pregunta: ${questionId}, Opción: ${selectedOptionId}`);
          continue; // Saltar esta respuesta
        }

        // Obtener módulo y submódulo de la pregunta
        const [questionInfo] = await connection.execute(`
          SELECT ds.module_id, dm.module_code, ds.submodule_code
          FROM diagnostic_questions dq
          JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
          JOIN diagnostic_modules dm ON ds.module_id = dm.id
          WHERE dq.id = ?
        `, [questionId]);

        const moduleInfo = (questionInfo as any[])[0];

        // Verificar si ya existe una respuesta para esta pregunta en esta organización
        const [existingRows] = await connection.execute(`
          SELECT id FROM user_responses 
          WHERE user_id = ? AND organization_id = ? AND question_id = ?
        `, [userId, organizationId, questionId]);

        if ((existingRows as any[]).length > 0) {
          // Actualizar respuesta existente
          await connection.execute(`
            UPDATE user_responses 
            SET selected_option_id = ?, 
                module_code = ?,
                submodule_code = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND organization_id = ? AND question_id = ?
          `, [selectedOptionId, moduleInfo?.module_code, moduleInfo?.submodule_code, userId, organizationId, questionId]);
          updatedCount++;
          console.log(`🔄 [SAVE RESPONSES] Actualizada respuesta para pregunta ${questionId}`);
        } else {
          // Insertar nueva respuesta
          await connection.execute(`
            INSERT INTO user_responses (
              user_id, organization_id, question_id, selected_option_id, 
              module_code, submodule_code,
              created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [userId, organizationId, questionId, selectedOptionId, moduleInfo?.module_code, moduleInfo?.submodule_code]);
          savedCount++;
          console.log(`✅ [SAVE RESPONSES] Nueva respuesta guardada para pregunta ${questionId}`);
        }
      }

      // Confirmar transacción
      await connection.commit();
      console.log('✅ [SAVE RESPONSES] Transacción confirmada');

      // Calcular estadísticas del módulo completado POR ORGANIZACIÓN
      const moduleCodeToUse = moduleCode || moduleId;
      const [moduleStats] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT ur.question_id) as answeredQuestions,
          (SELECT COUNT(*) FROM diagnostic_questions dq
           JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
           JOIN diagnostic_modules dm ON ds.module_id = dm.id
           WHERE dm.module_code = ?) as totalQuestions,
          AVG(dop.weight) as averageScore
        FROM user_responses ur
        INNER JOIN diagnostic_questions dq ON ur.question_id = dq.id
        INNER JOIN diagnostic_options dop ON ur.selected_option_id = dop.id
        WHERE ur.user_id = ? AND ur.organization_id = ? AND ur.module_code = ?
      `, [moduleCodeToUse, userId, organizationId, moduleCodeToUse]);

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
    console.log('📦 [SAVE SINGLE RESPONSE] Body recibido:', JSON.stringify(body));
    
    const { userId, questionId, selectedOptionId } = body;

    if (!userId || !questionId || !selectedOptionId) {
      console.error('❌ [SAVE SINGLE RESPONSE] Campos faltantes:', { userId, questionId, selectedOptionId });
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
