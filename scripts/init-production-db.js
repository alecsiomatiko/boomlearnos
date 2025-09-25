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

async function initializeProductionDatabase() {
  let pool;
  try {
    console.log('🚀 Inicializando base de datos de producción...');
    
    // Crear pool de conexiones
    pool = mysql.createPool(dbConfig);
    
    // Verificar conexión
    await pool.execute('SELECT 1');
    console.log('✅ Conexión a base de datos exitosa');
    
    // Leer el archivo SQL del schema
    const schemaPath = path.join(__dirname, '..', 'database', 'production-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`No se encontró el archivo de schema en: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir en statements individuales
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📄 Ejecutando ${statements.length} statements SQL...`);
    
    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await pool.execute(statement);
        console.log(`✅ [${i + 1}/${statements.length}] ${statement.substring(0, 50)}...`);
      } catch (error) {
        // Si la tabla ya existe, es normal
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists')) {
          console.log(`⚠️  [${i + 1}/${statements.length}] Tabla ya existe: ${statement.substring(0, 50)}...`);
        } else {
          console.error(`❌ Error ejecutando statement ${i + 1}:`, error.message);
          console.error(`Statement: ${statement}`);
          throw error;
        }
      }
    }
    
    console.log('🎉 Base de datos inicializada correctamente!');
    console.log('📋 Tablas creadas:');
    console.log('  - users (usuarios con onboarding obligatorio)');
    console.log('  - organizations (empresas con identidad IA)');
    console.log('  - user_organizations (relaciones usuario-empresa)');
    console.log('  - diagnostic_modules (módulos de diagnóstico)');
    console.log('  - diagnostic_submodules (submódulos)');
    console.log('  - diagnostic_questions (preguntas)');
    console.log('  - diagnostic_options (opciones de respuesta)');
    console.log('  - diagnostic_answers (respuestas de usuarios)');
    console.log('  - user_gems (sistema de puntos)');
    console.log('  - user_medals (sistema de medallas)');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error inicializando BD:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeProductionDatabase()
    .then(() => {
      console.log('🏁 Proceso completado exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Proceso falló:', error);
      process.exit(1);
    });
}

module.exports = { initializeProductionDatabase };
