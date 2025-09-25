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

export interface UserResponse {
  moduleCode: string;
  moduleTitle: string;
  questionId: number;
  questionText: string;
  selectedOptionId: number;
  optionText: string;
  optionValue: number;
  responseDate: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del usuario' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      // Consulta que obtiene todas las respuestas del usuario con datos completos
      const query = `
        SELECT 
          dm.module_code as moduleCode,
          dm.title as moduleTitle,
          dq.id as questionId,
          dq.question_text as questionText,
          dop.id as selectedOptionId,
          dop.option_text as optionText,
          dop.weight as optionValue,
          ur.created_at as responseDate
        FROM user_responses ur
        INNER JOIN diagnostic_questions dq ON ur.question_id = dq.id
        INNER JOIN diagnostic_options dop ON ur.selected_option_id = dop.id
        INNER JOIN diagnostic_submodules ds ON dq.submodule_code = ds.submodule_code
        INNER JOIN diagnostic_modules dm ON ds.module_code = dm.module_code
        WHERE ur.user_id = ?
        ORDER BY dm.display_order, ds.display_order, dq.display_order
      `;

      const [rows] = await connection.execute(query, [userId]);
      
      const userResponses = (rows as any[]).map(row => ({
        moduleCode: row.moduleCode,
        moduleTitle: row.moduleTitle,
        questionId: row.questionId,
        questionText: row.questionText,
        selectedOptionId: row.selectedOptionId,
        optionText: row.optionText,
        optionValue: row.optionValue,
        responseDate: row.responseDate
      })) as UserResponse[];

      // Si no hay respuestas, intentar obtener información de módulos disponibles
      if (userResponses.length === 0) {
        // Consulta que obtiene información de módulos disponibles
        const modulesQuery = `
          SELECT 
            dm.module_code as code,
            dm.title,
            COUNT(dq.id) as totalQuestions
          FROM diagnostic_modules dm
          LEFT JOIN diagnostic_submodules ds ON dm.module_code = ds.module_code
          LEFT JOIN diagnostic_questions dq ON ds.submodule_code = dq.submodule_code
          GROUP BY dm.id, dm.module_code, dm.title
          ORDER BY dm.display_order
        `;

        const [moduleRows] = await connection.execute(modulesQuery);
        
        return NextResponse.json({
          userResponses: [],
          availableModules: moduleRows,
          message: 'No se encontraron respuestas para este usuario'
        });
      }

      // Estadísticas adicionales
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT dm.module_code) as completedModules,
          COUNT(DISTINCT ur.question_id) as answeredQuestions,
          AVG(dop.weight) as averageScore
        FROM user_responses ur
        INNER JOIN diagnostic_questions dq ON ur.question_id = dq.id
        INNER JOIN diagnostic_options dop ON ur.selected_option_id = dop.id
        INNER JOIN diagnostic_submodules ds ON dq.submodule_code = ds.submodule_code
        INNER JOIN diagnostic_modules dm ON ds.module_code = dm.module_code
        WHERE ur.user_id = ?
      `;

      const [statsRows] = await connection.execute(statsQuery, [userId]);
      const stats = (statsRows as any[])[0];

      return NextResponse.json({
        userResponses,
        stats: {
          completedModules: stats.completedModules || 0,
          answeredQuestions: stats.answeredQuestions || 0,
          averageScore: parseFloat(stats.averageScore || 0).toFixed(2)
        },
        totalResponses: userResponses.length
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Error obteniendo respuestas del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      const checkQuery = `
        SELECT id FROM user_responses 
        WHERE user_id = ? AND question_id = ?
      `;
      
      const [existingRows] = await connection.execute(checkQuery, [userId, questionId]);

      if ((existingRows as any[]).length > 0) {
        // Actualizar respuesta existente
        const updateQuery = `
          UPDATE user_responses 
          SET selected_option_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND question_id = ?
        `;
        
        await connection.execute(updateQuery, [selectedOptionId, userId, questionId]);
      } else {
        // Insertar nueva respuesta
        const insertQuery = `
          INSERT INTO user_responses (user_id, question_id, selected_option_id, created_at, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        await connection.execute(insertQuery, [userId, questionId, selectedOptionId]);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Respuesta guardada correctamente' 
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Error guardando respuesta del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const moduleCode = searchParams.get('moduleCode');

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del usuario' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      let deleteQuery: string;
      let params: any[];

      if (moduleCode) {
        // Eliminar respuestas de un módulo específico
        deleteQuery = `
          DELETE ur FROM user_responses ur
          INNER JOIN diagnostic_questions dq ON ur.question_id = dq.id
          INNER JOIN diagnostic_submodules ds ON dq.submodule_code = ds.submodule_code
          INNER JOIN diagnostic_modules dm ON ds.module_code = dm.module_code
          WHERE ur.user_id = ? AND dm.module_code = ?
        `;
        params = [userId, moduleCode];
      } else {
        // Eliminar todas las respuestas del usuario
        deleteQuery = `DELETE FROM user_responses WHERE user_id = ?`;
        params = [userId];
      }

      const [result] = await connection.execute(deleteQuery, params);
      const affectedRows = (result as any).affectedRows;

      return NextResponse.json({
        success: true,
        message: `Se eliminaron ${affectedRows} respuestas`,
        deletedCount: affectedRows
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Error eliminando respuestas del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
