const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 PROBANDO CONEXIÓN A BASE DE DATOS...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'srv440.hstgr.io',
      user: 'u191251575_BoomlearnOS',
      password: 'I6H-LF-Z5RRgR',
      database: 'u191251575_BoomlearnOS'
    });

    console.log('✅ Conexión exitosa a MySQL');
    
    // Verificar estado actual
    const [questions] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_questions');
    const [options] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_options');
    const [modules] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_modules');
    
    console.log('📊 Estado actual de la base de datos:');
    console.log(`   • Módulos: ${modules[0].count}`);
    console.log(`   • Preguntas: ${questions[0].count}`);
    console.log(`   • Opciones: ${options[0].count}`);
    
    if (questions[0].count >= 50) {
      console.log('🎉 ¡La migración ya está completa!');
    } else {
      console.log('🚀 Listo para ejecutar migración completa');
      console.log('📝 Ejecutar: node scripts/migrate-complete-questionnaires.js');
    }
    
    await connection.end();
    console.log('🔌 Conexión cerrada correctamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('⏳ Intentar más tarde cuando la conexión esté estable');
  }
}

testConnection();
