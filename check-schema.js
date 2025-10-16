const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'srv440.hstgr.io',
    user: 'u191251575_BoomlearnOS',
    password: 'Cerounocero.com20182417',
    database: 'u191251575_BoomlearnOS',
    port: 3306
  });
  
  console.log('📋 Verificando esquema de diagnostic_questions...');
  const [questionsSchema] = await connection.execute('DESCRIBE diagnostic_questions');
  console.log('Columnas de diagnostic_questions:');
  questionsSchema.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
  
  console.log('\n📋 Verificando esquema de diagnostic_submodules...');
  const [submodulesSchema] = await connection.execute('DESCRIBE diagnostic_submodules');
  console.log('Columnas de diagnostic_submodules:');
  submodulesSchema.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
  
  console.log('\n📊 Contando cuestionarios disponibles...');
  const [moduleCount] = await connection.execute('SELECT COUNT(*) as total FROM diagnostic_modules');
  console.log(`Total módulos: ${moduleCount[0].total}`);
  
  const [questionCount] = await connection.execute('SELECT COUNT(*) as total FROM diagnostic_questions');
  console.log(`Total preguntas: ${questionCount[0].total}`);
  
  const [optionCount] = await connection.execute('SELECT COUNT(*) as total FROM diagnostic_options');
  console.log(`Total opciones: ${optionCount[0].total}`);
  
  const [responseCount] = await connection.execute('SELECT COUNT(*) as total FROM user_responses');
  console.log(`Total respuestas guardadas: ${responseCount[0].total}`);
  
  console.log('\n🔍 Verificando respuestas por usuario...');
  const [userResponses] = await connection.execute(`
    SELECT 
      ur.user_id,
      COUNT(*) as total_responses,
      COUNT(DISTINCT ur.question_id) as unique_questions
    FROM user_responses ur
    GROUP BY ur.user_id
    ORDER BY total_responses DESC
    LIMIT 5
  `);
  
  console.log('Top 5 usuarios con más respuestas:');
  userResponses.forEach(user => {
    console.log(`  - Usuario ${user.user_id}: ${user.total_responses} respuestas (${user.unique_questions} preguntas únicas)`);
  });
  
  await connection.end();
}

checkSchema().catch(console.error);