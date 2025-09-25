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

async function checkCurrentData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });
  
  console.log('=== MÓDULOS EXISTENTES ===');
  const [modules] = await connection.execute('SELECT * FROM diagnostic_modules ORDER BY order_index');
  modules.forEach(mod => {
    console.log(`• ${mod.module_code}: ${mod.title} (ID: ${mod.id})`);
  });
  
  console.log('\n=== SUBMÓDULOS EXISTENTES ===');
  const [submodules] = await connection.execute('SELECT * FROM diagnostic_submodules ORDER BY order_index');
  submodules.forEach(sub => {
    console.log(`• ${sub.submodule_code}: ${sub.title} (Module ID: ${sub.module_id})`);
  });
  
  await connection.end();
}

checkCurrentData().catch(console.error);
