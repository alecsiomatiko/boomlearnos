// Verificar estructura de organizations
const mysql = require('mysql2/promise');

async function checkStructure() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('🔍 Verificando estructura de organizations...');
    
    const [structure] = await pool.execute('DESCRIBE organizations');
    console.log('\n📋 Columnas:');
    structure.forEach((col, index) => {
      console.log(`${index + 1}. ${col.Field} (${col.Type})`);
    });

    console.log('\n📊 Datos de ejemplo:');
    const [data] = await pool.execute('SELECT * FROM organizations LIMIT 3');
    console.log(`Total registros: ${data.length}`);
    
    if (data.length > 0) {
      console.log('Primer registro:');
      Object.keys(data[0]).forEach(key => {
        console.log(`  ${key}: ${data[0][key]}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkStructure();
