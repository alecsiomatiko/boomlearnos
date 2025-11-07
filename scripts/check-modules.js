const mysql = require('mysql2/promise');

const dbConfig = {
  host: '151.106.99.1',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
};

async function checkModules() {
  const connection = await mysql.createConnection(dbConfig);

  console.log('\n📊 === VERIFICACIÓN DE MÓDULOS ===\n');

  // Ver todos los módulos
  const [modules] = await connection.execute(`
    SELECT id, module_code, title, is_active
    FROM diagnostic_modules
    ORDER BY order_index
  `);

  console.log(`Total módulos encontrados: ${modules.length}\n`);

  modules.forEach((m, i) => {
    console.log(`${i + 1}. ${m.module_code} (ID: ${m.id.substring(0, 8)}...) - ${m.title} - Activo: ${m.is_active}`);
  });

  await connection.end();
}

checkModules().catch(console.error);
