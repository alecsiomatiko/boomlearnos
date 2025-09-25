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

async function migrateMod1Questions() {
  console.log('🚀 MIGRANDO PREGUNTAS FALTANTES DEL MÓDULO 1');
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

    // Leer el archivo de Etapa 2
    const etapa2Path = path.join(process.cwd(), 'lib/mega-diagnostic/etapa2-modulos-data.ts');
    const content = fs.readFileSync(etapa2Path, 'utf8');
    
    // Buscar el submódulo del MÓDULO 1
    const [mod1Submodules] = await connection.execute(`
      SELECT ds.id, ds.title
      FROM diagnostic_submodules ds
      JOIN diagnostic_modules dm ON ds.module_id = dm.id
      WHERE dm.module_code = 'MOD1'
      LIMIT 1
    `);

    if (mod1Submodules.length === 0) {
      console.log('❌ No se encontró submódulo para MÓDULO 1');
      return;
    }

    const targetSubmoduleId = mod1Submodules[0].id;
    console.log(`📁 Usando submódulo: ${mod1Submodules[0].title}`);

    // Extraer preguntas que empiecen con m1s
    const mod1Questions = [...content.matchAll(/{\s*id:\s*["'](m1s[^"']+)["'],\s*pregunta:\s*["'](¿[^"']*?)["'],\s*ponderacionPregunta:\s*(\d+),\s*tipo:\s*["']([^"']+)["'],\s*opciones:\s*\[([\s\S]*?)\],?\s*}/g)];
    
    console.log(`📊 Encontradas ${mod1Questions.length} preguntas para MÓDULO 1`);

    let questionsAdded = 0;
    let optionsAdded = 0;

    for (const questionMatch of mod1Questions) {
      const [, questionId, questionText, weight, questionType, optionsContent] = questionMatch;
      
      // Verificar si la pregunta ya existe
      const [existingQuestion] = await connection.execute(
        'SELECT id FROM diagnostic_questions WHERE question_code = ?',
        [questionId]
      );
      
      if (existingQuestion.length === 0) {
        const questionUuid = uuidv4();
        
        // Insertar pregunta
        await connection.execute(`
          INSERT INTO diagnostic_questions (
            id, question_code, submodule_id, question_text, question_type,
            weight, order_index, is_optional, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          questionUuid,
          questionId,
          targetSubmoduleId,
          questionText,
          questionType,
          parseInt(weight),
          questionsAdded + 1,
          0
        ]);
        
        questionsAdded++;
        
        // Extraer y migrar opciones
        const optionMatches = [...optionsContent.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*text:\s*["']((?:[^"'\\\\]|\\\\.)*)["'],\s*ponderacion:\s*(\d+)/g)];
        
        let optionOrder = 1;
        for (const optionMatch of optionMatches) {
          const [, optionId, optionText, optionWeight] = optionMatch;
          
          const cleanOptionText = optionText.replace(/\\'/g, "'").replace(/\\"/g, '"');
          const optionUuid = uuidv4();
          
          await connection.execute(`
            INSERT INTO diagnostic_options (
              id, option_code, question_id, option_text, weight,
              order_index, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
          `, [
            optionUuid,
            optionId,
            questionUuid,
            cleanOptionText,
            parseInt(optionWeight),
            optionOrder
          ]);
          
          optionsAdded++;
          optionOrder++;
        }
        
        console.log(`  ✅ ${questionId}: ${questionText.substring(0, 50)}... (${optionMatches.length} opciones)`);
      }
    }

    // Verificar estado final
    const [finalCount] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM diagnostic_questions q
      JOIN diagnostic_submodules ds ON q.submodule_id = ds.id
      JOIN diagnostic_modules dm ON ds.module_id = dm.id
      WHERE dm.module_code = 'MOD1'
    `);

    console.log(`\n🎉 ¡MIGRACIÓN DE MÓDULO 1 COMPLETADA!`);
    console.log(`📈 Preguntas añadidas: ${questionsAdded}`);
    console.log(`📈 Opciones añadidas: ${optionsAdded}`);
    console.log(`📊 Total preguntas en MÓDULO 1: ${finalCount[0].count}`);

    // Obtener ID del módulo 1 para pruebas
    const [mod1Details] = await connection.execute(
      'SELECT id FROM diagnostic_modules WHERE module_code = "MOD1"'
    );

    if (mod1Details.length > 0) {
      console.log(`\n🎯 PRUEBA MÓDULO 1:`);
      console.log(`   URL: http://localhost:3000/api/diagnostic/questions?moduleId=${mod1Details[0].id}`);
    }

    await connection.end();
    console.log('🔌 Conexión cerrada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

migrateMod1Questions();
