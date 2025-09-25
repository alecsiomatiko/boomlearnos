const mysql = require('mysql2/promise');
const fs = require('fs');

function loadEnv() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value) process.env[key] = value;
    }
  });
}

loadEnv();

async function checkQuestionTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });
  
  const [tables] = await connection.execute(`
    SELECT TABLE_NAME as table_name
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('diagnostic_questions', 'diagnostic_options')
  `, [process.env.DB_NAME]);
  
  console.log('Tablas de preguntas disponibles:', tables.map(t => t.table_name));
  
  if (tables.length > 0) {
    for (const table of tables) {
      console.log(`\n=== ESTRUCTURA DE ${table.table_name} ===`);
      const [columns] = await connection.execute(`DESCRIBE ${table.table_name}`);
      columns.forEach(col => console.log(`  • ${col.Field} - ${col.Type}`));
    }
  } else {
    console.log('\n❌ No existen las tablas diagnostic_questions y diagnostic_options');
    console.log('Necesitas crearlas primero.');
  }
  
  await connection.end();
}

checkQuestionTables().catch(console.error);
