const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function checkAccessCodesTable() {
  let connection;
  
  try {
    console.log('🔍 Conectando a la base de datos...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 20000
    });

    console.log('✅ Conexión establecida\n');

    // Verificar si la tabla existe
    try {
      const [rows] = await connection.execute('DESCRIBE access_codes');
      console.log('✅ Tabla access_codes existe:');
      console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
      console.log('❌ Tabla access_codes NO existe');
      console.log('Error:', err.message);
      console.log('\n📝 Necesitas crear la tabla con este SQL:\n');
      console.log(`
CREATE TABLE access_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(9) NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  used_by_user_id VARCHAR(36) NULL,
  FOREIGN KEY (used_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_code (code),
  INDEX idx_is_used (is_used)
);
      `);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAccessCodesTable();
