import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'boomlearnos',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function listModules() {
  console.log('🔍 Conectando a la base de datos...\n');
  
  const connection = await mysql.createConnection(config);
  
  try {
    const [modules] = await connection.execute(`
      SELECT 
        id,
        module_code,
        title,
        is_active,
        order_index
      FROM diagnostic_modules
      ORDER BY order_index
    `);
    
    console.log('📋 MÓDULOS EN LA BASE DE DATOS:\n');
    console.log('ID | CODE | TITLE | ACTIVE');
    console.log('-'.repeat(80));
    
    modules.forEach((mod) => {
      const code = mod.module_code || 'NULL';
      const active = mod.is_active ? '✅' : '❌';
      console.log(`${mod.id.substring(0, 8)}... | ${code.padEnd(6)} | ${mod.title.substring(0, 30).padEnd(30)} | ${active}`);
    });
    
    console.log('\n📊 RESUMEN:');
    console.log(`Total módulos: ${modules.length}`);
    console.log(`Módulos activos: ${modules.filter(m => m.is_active).length}`);
    console.log(`Con module_code: ${modules.filter(m => m.module_code).length}`);
    console.log(`Sin module_code (NULL): ${modules.filter(m => !m.module_code).length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

listModules();
