import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
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

    // Consulta directa a la tabla de módulos
    const [modules] = await pool.query('SELECT * FROM diagnostic_modules');
    
    // Consulta para contar preguntas por módulo
    const [questions] = await pool.query(`
      SELECT 
        m.id as module_id,
        COUNT(DISTINCT q.id) as question_count
      FROM diagnostic_modules m
      LEFT JOIN diagnostic_submodules s ON s.module_id = m.id
      LEFT JOIN diagnostic_questions q ON q.submodule_id = s.id
      GROUP BY m.id
    `);

    return NextResponse.json({
      success: true,
      modules,
      questionCounts: questions,
      env: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      }
    });
  } catch (error) {
    console.error('Error testing modules:', error);
    return NextResponse.json(
      { 
        error: 'Module test failed', 
        details: error.message,
        env: {
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          user: process.env.DB_USER
        }
      },
      { status: 500 }
    );
  }
}