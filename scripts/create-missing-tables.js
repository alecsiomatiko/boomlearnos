const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'srv440.hstgr.io',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'u191251575_BoomlearnOS',
  password: process.env.DB_PASSWORD || 'Cerounocero.com20182417',
  database: process.env.DB_NAME || 'u191251575_BoomlearnOS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00'
};

async function createMissingTables() {
  let pool;
  try {
    console.log('🚀 Creando tablas faltantes para producción...');
    
    // Crear pool de conexiones
    pool = mysql.createPool(dbConfig);
    
    // Verificar conexión
    await pool.execute('SELECT 1');
    console.log('✅ Conexión a base de datos exitosa');
    
    // Leer el archivo SQL de tablas faltantes
    const schemaPath = path.join(__dirname, '..', 'database', 'missing-tables.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`No se encontró el archivo de schema en: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir en statements individuales más cuidadosamente
    const statements = schema
      .split(/;\s*(?=CREATE|ALTER|DROP|INSERT|UPDATE|DELETE)/g)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📄 Ejecutando ${statements.length} statements SQL...`);
    
    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await pool.execute(statement);
        console.log(`✅ [${i + 1}/${statements.length}] ${statement.substring(0, 50).replace(/\n/g, ' ')}...`);
      } catch (error) {
        // Si la tabla ya existe o la columna ya existe, es normal
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
            error.message.includes('already exists') ||
            error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  [${i + 1}/${statements.length}] Ya existe: ${statement.substring(0, 50).replace(/\n/g, ' ')}...`);
        } else {
          console.error(`❌ Error ejecutando statement ${i + 1}:`, error.message);
          console.error(`Statement: ${statement.substring(0, 200)}...`);
          // No lanzar error, continuar con el siguiente
        }
      }
    }
    
    console.log('🎉 Tablas faltantes creadas correctamente!');
    
    // Verificar que las tablas importantes existan
    const [tables] = await pool.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log('📋 Tablas verificadas:');
    const requiredTables = ['users', 'organizations', 'user_organizations', 'diagnostic_answers', 'user_gems', 'user_medals'];
    
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table} - FALTA`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createMissingTables()
    .then(() => {
      console.log('🏁 Proceso completado exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Proceso falló:', error);
      process.exit(1);
    });
}

module.exports = { createMissingTables };
