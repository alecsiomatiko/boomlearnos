const mysql = require('mysql2/promise');

const dbConfig = {
  host: '151.106.99.1',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
};

async function testModuleQuestionsAPI() {
  const connection = await mysql.createConnection(dbConfig);

  console.log('\n🔍 === SIMULANDO API DE PREGUNTAS ===\n');

  // Obtener el module_id de MOD2
  const [modules] = await connection.execute(`
    SELECT id, module_code, title
    FROM diagnostic_modules
    WHERE module_code = 'MOD2'
  `);

  if (modules.length === 0) {
    console.log('❌ MOD2 no encontrado');
    await connection.end();
    return;
  }

  const moduleId = modules[0].id;
  console.log(`📦 Módulo encontrado: ${modules[0].title}`);
  console.log(`🆔 Module ID: ${moduleId}\n`);

  // Simular la query del API (igual que en diagnostic-service.ts)
  const [questions] = await connection.execute(`
    SELECT 
      q.*,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', o.id,
          'option_code', o.option_code,
          'option_text', o.option_text,
          'weight', o.weight,
          'emoji', o.emoji,
          'order_index', o.order_index
        )
      ) as options
    FROM diagnostic_questions q
    LEFT JOIN diagnostic_options o ON o.question_id = q.id
    WHERE q.submodule_id IN (
      SELECT id FROM diagnostic_submodules WHERE module_id = ?
    )
    GROUP BY q.id
    ORDER BY q.order_index
    LIMIT 5
  `, [moduleId]);

  console.log(`📋 Total preguntas devueltas: ${questions.length}\n`);

  questions.forEach((q, i) => {
    console.log(`\n--- Pregunta ${i + 1} ---`);
    console.log(`ID: ${q.id}`);
    console.log(`Tipo de ID: ${typeof q.id}`);
    console.log(`Code: ${q.question_code}`);
    console.log(`Texto: ${q.question_text.substring(0, 60)}...`);
    
    const options = JSON.parse(q.options);
    console.log(`Opciones (${options.length}):`);
    options.slice(0, 2).forEach(opt => {
      console.log(`  - ID: ${opt.id} (${typeof opt.id}) | ${opt.option_text.substring(0, 40)}...`);
    });
  });

  await connection.end();
}

testModuleQuestionsAPI().catch(console.error);
