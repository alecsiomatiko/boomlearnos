const mysql = require('mysql2/promise');

// Configuración de la base de datos (usando las credenciales del .env.local)
const dbConfig = {
  host: 'srv440.hstgr.io',
  port: 3306,
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00'
};

async function createAnalysisAITables() {
  console.log('🚀 Creando tablas para sistema de análisis IA...');
  
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a base de datos exitosa');

    // SQL para crear tabla user_responses (sin foreign keys por ahora)
    const createUserResponsesTable = `
      CREATE TABLE IF NOT EXISTS user_responses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id VARCHAR(255) NOT NULL,
        question_id INT NOT NULL,
        selected_option_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_question_id (question_id),
        INDEX idx_user_question (user_id, question_id),
        
        UNIQUE KEY unique_user_question (user_id, question_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // SQL para crear tabla ai_analysis_cache
    const createAIAnalysisCacheTable = `
      CREATE TABLE IF NOT EXISTS ai_analysis_cache (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id VARCHAR(255) NOT NULL,
        analysis_type ENUM('comprehensive', 'module', 'insights') DEFAULT 'comprehensive',
        analysis_data JSON NOT NULL,
        ai_insights JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        
        INDEX idx_user_id (user_id),
        INDEX idx_analysis_type (analysis_type),
        INDEX idx_expires_at (expires_at),
        
        UNIQUE KEY unique_user_analysis (user_id, analysis_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // SQL para crear tabla ai_chat_conversations
    const createAIChatConversationsTable = `
      CREATE TABLE IF NOT EXISTS ai_chat_conversations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        message_role ENUM('user', 'ai') NOT NULL,
        message_content TEXT NOT NULL,
        related_modules JSON,
        attachments JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_session_id (session_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const tables = [
      { name: 'user_responses', sql: createUserResponsesTable },
      { name: 'ai_analysis_cache', sql: createAIAnalysisCacheTable },
      { name: 'ai_chat_conversations', sql: createAIChatConversationsTable }
    ];

    for (const table of tables) {
      try {
        console.log(`📋 Creando tabla ${table.name}...`);
        await connection.execute(table.sql);
        console.log(`✅ Tabla ${table.name} creada exitosamente`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`ℹ️  Tabla ${table.name} ya existe`);
        } else {
          console.error(`❌ Error creando tabla ${table.name}:`, error.message);
        }
      }
    }

    // Verificar que las tablas existen
    console.log('\n🔍 Verificando tablas creadas...');
    const [tables_result] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME IN ('user_responses', 'ai_analysis_cache', 'ai_chat_conversations')
      ORDER BY TABLE_NAME
    `);

    console.log('📋 Tablas del sistema de análisis IA:');
    tables_result.forEach(table => {
      console.log(`  ✅ ${table.TABLE_NAME} (${table.TABLE_ROWS || 0} filas)`);
    });

    // Insertar datos de prueba si no existen
    console.log('\n🧪 Verificando datos de prueba...');
    const [userResponsesCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM user_responses'
    );

    if (userResponsesCount[0].count === 0) {
      console.log('📝 Insertando datos de prueba...');
      
      // Obtener algunas preguntas y opciones para datos de prueba
      const [questions] = await connection.execute(`
        SELECT dq.id as question_id, dop.id as option_id 
        FROM diagnostic_questions dq 
        LEFT JOIN diagnostic_options dop ON dq.id = dop.question_id 
        WHERE dop.id IS NOT NULL 
        LIMIT 10
      `);

      if (questions.length > 0) {
        for (let i = 0; i < Math.min(5, questions.length); i++) {
          const question = questions[i];
          try {
            await connection.execute(`
              INSERT IGNORE INTO user_responses (user_id, question_id, selected_option_id) 
              VALUES (?, ?, ?)
            `, ['demo_user', question.question_id, question.option_id]);
          } catch (error) {
            console.log(`ℹ️  Datos de prueba ya existen para pregunta ${question.question_id}`);
          }
        }
        console.log('✅ Datos de prueba insertados');
      }
    } else {
      console.log(`ℹ️  Ya existen ${userResponsesCount[0].count} respuestas en la base de datos`);
    }

    console.log('\n🎉 Sistema de análisis IA configurado correctamente!');
    console.log('📋 Resumen:');
    console.log('  ✅ Tablas de respuestas de usuarios');
    console.log('  ✅ Cache de análisis IA');
    console.log('  ✅ Conversaciones de chat IA');
    console.log('  ✅ Datos de prueba disponibles');

  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  createAnalysisAITables()
    .then(() => {
      console.log('🏁 Proceso completado exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { createAnalysisAITables };
