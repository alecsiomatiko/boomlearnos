import { pool } from './mysql';

export async function getDiagnosticModules() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.*,
        COUNT(DISTINCT q.id) as total_questions,
        0 as answered_questions
      FROM diagnostic_modules m
      LEFT JOIN diagnostic_submodules s ON s.module_id = m.id
      LEFT JOIN diagnostic_questions q ON q.submodule_id = s.id
      WHERE m.is_active = true
      GROUP BY m.id
      ORDER BY m.order_index
    `);
    return rows;
  } catch (error) {
    console.error('Error fetching diagnostic modules:', error);
    throw error;
  }
}

export async function getModuleQuestions(moduleId: string) {
  try {
    const [questions] = await pool.query(`
      SELECT 
        q.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', o.id,
            'option_code', o.option_code,
            'option_text', o.option_text,
            'weight', o.weight,
            'emoji', o.emoji,
            'order_index', o.order_index
          )
        ) as options
      FROM diagnostic_questions q
      LEFT JOIN diagnostic_options o ON o.question_id = q.id
      WHERE q.submodule_id IN (
        SELECT id FROM diagnostic_submodules WHERE module_id = ?
      )
      GROUP BY q.id
      ORDER BY q.order_index
    `, [moduleId]);
    return questions;
  } catch (error) {
    console.error('Error fetching module questions:', error);
    throw error;
  }
}

export async function saveUserAnswer(
  userId: string,
  questionId: string,
  selectedOptions: string[],
  score: number
) {
  try {
    // Primero obtenemos o creamos una sesión activa
    const [sessions] = await pool.query(`
      SELECT id FROM user_diagnostic_sessions 
      WHERE user_id = ? AND status = 'active'
      LIMIT 1
    `, [userId]);

    let sessionId;
    if (sessions.length === 0) {
      const [result] = await pool.query(`
        INSERT INTO user_diagnostic_sessions (id, user_id, module_id, status)
        SELECT UUID(), ?, 
          (SELECT module_id FROM diagnostic_submodules s 
           JOIN diagnostic_questions q ON q.submodule_id = s.id 
           WHERE q.id = ?), 
          'active'
      `, [userId, questionId]);
      sessionId = result.insertId;
    } else {
      sessionId = sessions[0].id;
    }

    // Guardamos la respuesta
    await pool.query(`
      INSERT INTO user_diagnostic_answers 
      (id, user_id, session_id, question_id, selected_options, calculated_score)
      VALUES (UUID(), ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      selected_options = VALUES(selected_options),
      calculated_score = VALUES(calculated_score)
    `, [userId, sessionId, questionId, JSON.stringify(selectedOptions), score]);

    return true;
  } catch (error) {
    console.error('Error saving user answer:', error);
    throw error;
  }
}

export async function getUserProgress(userId: string, moduleId: string) {
  try {
    const [progress] = await pool.query(`
      SELECT 
        COUNT(DISTINCT q.id) as total_questions,
        COUNT(DISTINCT ua.id) as answered_questions,
        ROUND((COUNT(DISTINCT ua.id) / COUNT(DISTINCT q.id)) * 100, 2) as completion_percentage
      FROM diagnostic_questions q
      JOIN diagnostic_submodules s ON q.submodule_id = s.id
      LEFT JOIN user_diagnostic_answers ua ON ua.question_id = q.id AND ua.user_id = ?
      WHERE s.module_id = ?
    `, [userId, moduleId]);
    
    return progress[0];
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
}

export async function calculateModuleScore(userId: string, moduleId: string) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        s.id as submodule_id,
        s.title as submodule_title,
        COALESCE(ua.calculated_score, 0) as user_score,
        MAX(o.weight) as max_score
      FROM diagnostic_questions q
      JOIN diagnostic_submodules s ON q.submodule_id = s.id
      LEFT JOIN diagnostic_options o ON o.question_id = q.id
      LEFT JOIN user_diagnostic_answers ua ON ua.question_id = q.id AND ua.user_id = ?
      WHERE s.module_id = ?
      GROUP BY q.id, s.id, s.title, ua.calculated_score
    `,
      [userId, moduleId]
    );

    const breakdown: Record<string, { title: string; score: number; maxScore: number }> = {};
    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const row of rows as any[]) {
      totalScore += row.user_score;
      maxPossibleScore += row.max_score || 0;

      if (!breakdown[row.submodule_id]) {
        breakdown[row.submodule_id] = {
          title: row.submodule_title,
          score: 0,
          maxScore: 0,
        };
      }
      breakdown[row.submodule_id].score += row.user_score;
      breakdown[row.submodule_id].maxScore += row.max_score || 0;
    }

    const percentageScore = maxPossibleScore
      ? Number(((totalScore / maxPossibleScore) * 100).toFixed(2))
      : 0;

    return {
      totalScore,
      maxPossibleScore,
      percentageScore,
      breakdown,
    };
  } catch (error) {
    console.error('Error calculating module score:', error);
    throw error;
  }
}