const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkOrganizations() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  console.log('\n📋 Estructura de tabla organizations:\n');
  
  const [cols] = await conn.query('SHOW COLUMNS FROM organizations');
  cols.forEach(c => console.log(`   ${c.Field} (${c.Type})`));

  console.log('\n📊 Contenido de organizations:\n');
  
  const [orgs] = await conn.query('SELECT * FROM organizations');
  
  if (orgs.length > 0) {
    orgs.forEach(org => {
      console.log(`   📁 ${org.name} (${org.id})`);
      console.log(`      Campos:`, Object.keys(org));
      console.log('');
    });
  } else {
    console.log('   ⚠️  No hay organizaciones');
  }

  await conn.end();
}

checkOrganizations();
