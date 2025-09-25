const mysql = require('mysql2/promise');
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

async function findMod1Questions() {
  console.log('🔍 BUSCANDO PREGUNTAS DEL MÓDULO 1');
  console.log('=' .repeat(50));
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Conectado a MySQL');

    // Buscar preguntas que empiecen con m1s
    const [mod1Questions] = await connection.execute(`
      SELECT 
        q.question_code, 
        q.question_text,
        ds.title as submodule_title,
        dm.module_code,
        dm.title as module_title
      FROM diagnostic_questions q
      JOIN diagnostic_submodules ds ON q.submodule_id = ds.id
      JOIN diagnostic_modules dm ON ds.module_id = dm.id
      WHERE q.question_code LIKE 'm1s%'
      ORDER BY q.question_code
    `);

    console.log(`📊 Encontradas ${mod1Questions.length} preguntas con código m1s:`);
    console.log('');

    mod1Questions.forEach(question => {
      console.log(`📝 ${question.question_code}: ${question.question_text.substring(0, 50)}...`);
      console.log(`   📁 Módulo: ${question.module_code} - ${question.module_title}`);
      console.log(`   📂 Submódulo: ${question.submodule_title}`);
      console.log('');
    });

    // Verificar módulo 1 específicamente
    const [mod1Info] = await connection.execute(`
      SELECT id, module_code, title FROM diagnostic_modules WHERE module_code = 'MOD1'
    `);

    if (mod1Info.length > 0) {
      console.log(`🎯 INFORMACIÓN DEL MÓDULO 1:`);
      console.log(`   ID: ${mod1Info[0].id}`);
      console.log(`   Código: ${mod1Info[0].module_code}`);
      console.log(`   Título: ${mod1Info[0].title}`);

      // Verificar submódulos
      const [submodules] = await connection.execute(`
        SELECT id, submodule_code, title FROM diagnostic_submodules WHERE module_id = ?
      `, [mod1Info[0].id]);

      console.log(`\n📂 Submódulos del MÓDULO 1 (${submodules.length}):`);
      submodules.forEach(sub => {
        console.log(`   📂 ${sub.submodule_code}: ${sub.title} (ID: ${sub.id})`);
      });

      // Verificar preguntas en submódulos del MOD1
      const [questionsInMod1] = await connection.execute(`
        SELECT q.question_code, q.question_text, ds.title as submodule_title
        FROM diagnostic_questions q
        JOIN diagnostic_submodules ds ON q.submodule_id = ds.id
        WHERE ds.module_id = ?
        ORDER BY q.question_code
      `, [mod1Info[0].id]);

      console.log(`\n📝 Preguntas en MÓDULO 1 (${questionsInMod1.length}):`);
      questionsInMod1.forEach(q => {
        console.log(`   ✅ ${q.question_code}: ${q.question_text.substring(0, 50)}...`);
      });
    }

    await connection.end();
    console.log('\n🔌 Conexión cerrada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findMod1Questions();
