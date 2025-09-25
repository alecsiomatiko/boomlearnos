const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
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
  console.log('✅ Variables de entorno cargadas');
}

loadEnv();

async function migrateEtapa2Direct() {
  console.log('🚀 MIGRACIÓN DIRECTA DE ETAPA 2');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Conectado a MySQL');

    // Leer el archivo TypeScript
    const filePath = path.join(process.cwd(), 'lib/mega-diagnostic/etapa2-modulos-data.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log('📄 Archivo leído, tamaño:', content.length, 'caracteres');
    
    // Buscar todas las preguntas usando un patrón más simple
    const preguntaMatches = [...content.matchAll(/pregunta:\s*["'](¿[^"']*?)["']/g)];
    
    console.log('📊 Preguntas encontradas:', preguntaMatches.length);
    
    // Mostrar algunas preguntas de ejemplo
    preguntaMatches.slice(0, 5).forEach((match, index) => {
      console.log(`  ${index + 1}. ${match[1].substring(0, 60)}...`);
    });
    
    if (preguntaMatches.length > 0) {
      console.log('\n🎉 ¡Archivo contiene preguntas reales!');
      console.log('📝 Para migración completa, ejecutar script específico cuando esté listo');
    } else {
      console.log('\n❌ No se encontraron preguntas en el archivo');
    }
    
    // Verificar estado actual de la base de datos
    const [questions] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_questions');
    const [options] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_options');
    
    console.log('\n📊 Estado actual de la base de datos:');
    console.log(`   • Preguntas: ${questions[0].count}`);
    console.log(`   • Opciones: ${options[0].count}`);
    
    await connection.end();
    console.log('🔌 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

migrateEtapa2Direct();
