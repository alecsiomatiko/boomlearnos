const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
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

async function checkTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });
  
  console.log('=== COLUMNAS DE diagnostic_modules ===');
  const [modules] = await connection.execute('DESCRIBE diagnostic_modules');
  modules.forEach(col => console.log('  •', col.Field, '-', col.Type));
  
  console.log('\n=== COLUMNAS DE diagnostic_submodules ===');
  const [submodules] = await connection.execute('DESCRIBE diagnostic_submodules');
  submodules.forEach(col => console.log('  •', col.Field, '-', col.Type));
  
  await connection.end();
}

checkTables().catch(console.error);
