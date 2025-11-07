const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAIAnalysisTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 20000
    });

    console.log('🔗 Conectado a la base de datos');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ai_analysis (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        analysis_type ENUM('general', 'module') NOT NULL DEFAULT 'general',
        module_id VARCHAR(36) NULL,
        module_code VARCHAR(100) NULL,
        analysis_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_module_code (module_code),
        INDEX idx_user_module (user_id, module_code),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createTableSQL);
    console.log('✅ Tabla ai_analysis creada exitosamente');

    // Verificar si la tabla existe
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'ai_analysis'
    `, [process.env.DB_NAME]);

    if (tables.length > 0) {
      console.log('✅ Verificación exitosa: Tabla ai_analysis existe');
    } else {
      console.log('⚠️ Advertencia: No se pudo verificar la tabla');
    }

  } catch (error) {
    console.error('❌ Error al crear tabla:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Conexión cerrada');
    }
  }
}

createAIAnalysisTable();
