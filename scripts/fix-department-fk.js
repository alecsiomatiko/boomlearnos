const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkConstraints() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  console.log('🔍 Verificando foreign keys...\n');

  const [fks] = await conn.query(`
    SELECT 
      CONSTRAINT_NAME, 
      COLUMN_NAME,
      REFERENCED_TABLE_NAME,
      REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = ? 
    AND TABLE_NAME = 'users' 
    AND REFERENCED_TABLE_NAME IS NOT NULL
  `, [process.env.DB_NAME]);

  console.log('Foreign keys en tabla users:');
  fks.forEach(fk => {
    console.log(`  ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
  });

  console.log('\n🔧 Eliminando constraint incorrecta...');
  
  try {
    await conn.query('ALTER TABLE users DROP FOREIGN KEY fk_users_department');
    console.log('✅ Constraint eliminada');
  } catch (e) {
    console.log('ℹ️  Constraint no existe o ya fue eliminada');
  }

  console.log('\n✅ Listo para crear usuarios');
  await conn.end();
}

checkConstraints();
