import mysql from 'mysql2/promise';

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function getDiagnosticModules() {
  try {
    // Consulta simplificada que sabemos que funciona
    const [rows] = await pool.query(`
      SELECT 
        m.*,
        (
          SELECT COUNT(DISTINCT q.id)
          FROM diagnostic_submodules s
          LEFT JOIN diagnostic_questions q ON q.submodule_id = s.id
          WHERE s.module_id = m.id
        ) as total_questions
      FROM diagnostic_modules m
      WHERE m.is_active = 1
      ORDER BY m.order_index
    `);

    console.log('Raw database rows:', rows);

    // Transformar los resultados para que coincidan con la interfaz esperada
    const modules = (rows as any[]).map((row: any) => ({
      id: row.module_code || row.id,
      title: row.title,
      description: row.description || 'Descripción del módulo',
      progress: 0,
      status: 'pending',
      questions: parseInt(row.total_questions) || 0,
      completed: 0,
      buttonText: 'Comenzar',
      route: `/onboarding/diagnostico?module=${row.module_code}`,
    }));

    console.log('Transformed modules:', modules);
    return modules;
  } catch (error) {
    console.error('Error fetching diagnostic modules:', error);
    console.error('Error details:', error.message);
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