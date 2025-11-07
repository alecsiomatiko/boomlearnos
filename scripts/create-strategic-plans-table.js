const mysql = require('mysql2/promise');
require('dotenv').config();

async function createStrategicPlansTable() {
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
      CREATE TABLE IF NOT EXISTS strategic_plans (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        organization_id VARCHAR(36) NULL,
        plan_data JSON NOT NULL,
        objective_general TEXT NULL,
        duration_months INT DEFAULT 6,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_organization_id (organization_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createTableSQL);
    console.log('✅ Tabla strategic_plans creada exitosamente');

    // Verificar si la tabla existe
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'strategic_plans'
    `, [process.env.DB_NAME]);

    if (tables.length > 0) {
      console.log('✅ Verificación exitosa: Tabla strategic_plans existe');
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

createStrategicPlansTable();
