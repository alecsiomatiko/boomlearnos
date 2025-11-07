const mysql = require('mysql2/promise');

const dbConfig = {
  host: '151.106.99.1',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
};

async function checkQuestionIds() {
  const connection = await mysql.createConnection(dbConfig);

  console.log('\n📊 === REVISIÓN DE IDs DE PREGUNTAS ===\n');

  // 1. Ver las primeras 10 preguntas
  const [questions] = await connection.execute(`
    SELECT id, question_code, question_text,submodule_id
    FROM diagnostic_questions
    LIMIT 10
  `);

  console.log('🔍 Primeras 10 preguntas en la BD:');
  questions.forEach((q, i) => {
    console.log(`${i + 1}. ID: ${q.id} | Code: ${q.question_code} | Texto: ${q.question_text.substring(0, 50)}...`);
  });

  // 2. Ver preguntas del MOD2
  console.log('\n📋 Preguntas del MOD2:');
  const [mod2Questions] = await connection.execute(`
    SELECT dq.id, dq.question_code, dq.question_text
    FROM diagnostic_questions dq
    INNER JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
    INNER JOIN diagnostic_modules dm ON ds.module_id = dm.id
    WHERE dm.module_code = 'MOD2'
    ORDER BY dq.order_index
    LIMIT 15
  `);

  mod2Questions.forEach((q, i) => {
    console.log(`${i + 1}. ID: ${q.id} | Code: ${q.question_code}`);
  });

  // 3. Verificar si existen los IDs numéricos que están fallando
  console.log('\n❌ Verificando IDs problemáticos (84, 410):');
  const [exists84] = await connection.execute(`SELECT id, question_code FROM diagnostic_questions WHERE id = '84' OR id = 84`);
  const [exists410] = await connection.execute(`SELECT id, question_code FROM diagnostic_options WHERE id = '410' OR id = 410`);

  console.log('Pregunta ID 84:', exists84.length > 0 ? '✅ Existe' : '❌ NO EXISTE');
  console.log('Opción ID 410:', exists410.length > 0 ? '✅ Existe' : '❌ NO EXISTE');

  // 4. Contar total de preguntas y opciones
  const [qCount] = await connection.execute(`SELECT COUNT(*) as total FROM diagnostic_questions`);
  const [oCount] = await connection.execute(`SELECT COUNT(*) as total FROM diagnostic_options`);

  console.log(`\n📊 Total preguntas: ${qCount[0].total}`);
  console.log(`📊 Total opciones: ${oCount[0].total}`);

  await connection.end();
}

checkQuestionIds().catch(console.error);
