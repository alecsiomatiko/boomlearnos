const { executeQuery } = require('../lib/server/mysql.ts');

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas en la base de datos...');
    
    const tables = await executeQuery('SHOW TABLES');
    console.log('\n📋 Tablas disponibles:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });

    // Verificar tablas específicas relacionadas con diagnósticos
    console.log('\n🔍 Verificando tablas de diagnósticos...');
    const diagnosticTables = [
      'onboarding_diagnostics',
      'question_responses', 
      'questions',
      'user_diagnostic_answers',
      'diagnostic_questions',
      'diagnostic_modules',
      'organizations'
    ];

    for (const tableName of diagnosticTables) {
      try {
        await executeQuery(`SELECT COUNT(*) as count FROM ${tableName} LIMIT 1`);
        console.log(`✅ ${tableName} - EXISTS`);
      } catch (error) {
        console.log(`❌ ${tableName} - NO EXISTS`);
      }
    }

  } catch (error) {
    console.error('❌ Error al verificar tablas:', error.message);
  }
}

checkTables();
