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

async function migrateAllEtapa2Questions() {
  console.log('🚀 MIGRACIÓN MASIVA DE PREGUNTAS ETAPA 2');
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

    // Leer el archivo TypeScript
    const filePath = path.join(process.cwd(), 'lib/mega-diagnostic/etapa2-modulos-data.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Obtener un submódulo existente para insertar las preguntas
    const [submodules] = await connection.execute(`
      SELECT ds.id, ds.title, dm.title as module_title 
      FROM diagnostic_submodules ds 
      JOIN diagnostic_modules dm ON ds.module_id = dm.id 
      WHERE dm.title LIKE '%MÓDULO 1%' OR dm.title LIKE '%ORGANIZACIÓN%'
      LIMIT 1
    `);
    
    if (submodules.length === 0) {
      // Si no existe, usar el primer submódulo disponible
      const [anySubmodule] = await connection.execute('SELECT id, title FROM diagnostic_submodules LIMIT 1');
      if (anySubmodule.length === 0) {
        throw new Error('No hay submódulos disponibles en la base de datos');
      }
      var targetSubmoduleId = anySubmodule[0].id;
      console.log('📁 Usando submódulo:', anySubmodule[0].title);
    } else {
      var targetSubmoduleId = submodules[0].id;
      console.log('📁 Usando submódulo:', submodules[0].title, 'del', submodules[0].module_title);
    }
    
    // Extraer todas las preguntas del archivo
    const questionBlocks = [...content.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*pregunta:\s*["'](¿[^"']*?)["'],\s*ponderacionPregunta:\s*(\d+),\s*tipo:\s*["']([^"']+)["'],\s*opciones:\s*\[([\s\S]*?)\]\s*}/g)];
    
    console.log(`📊 Encontrados ${questionBlocks.length} bloques de preguntas completas`);
    
    let questionsAdded = 0;
    let optionsAdded = 0;
    let questionOrder = await getNextQuestionOrder(connection, targetSubmoduleId);
    
    for (const questionBlock of questionBlocks) {
      const [, questionId, questionText, weight, questionType, optionsContent] = questionBlock;
      
      console.log(`\n📝 Procesando: ${questionText.substring(0, 50)}...`);
      
      // Verificar si la pregunta ya existe
      const [existingQuestion] = await connection.execute(
        'SELECT id FROM diagnostic_questions WHERE question_code = ?',
        [questionId]
      );
      
      let dbQuestionId;
      
      if (existingQuestion.length > 0) {
        dbQuestionId = existingQuestion[0].id;
        console.log('    ⚠️  Pregunta ya existe, actualizando opciones...');
      } else {
        // Insertar nueva pregunta
        dbQuestionId = uuidv4();
        
        await connection.execute(`
          INSERT INTO diagnostic_questions 
          (id, submodule_id, question_code, question_text, question_type, weight, order_index, is_optional) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          dbQuestionId,
          targetSubmoduleId,
          questionId,
          questionText,
          questionType,
          parseInt(weight),
          questionOrder,
          false
        ]);
        
        questionsAdded++;
        questionOrder++;
        console.log('    ✅ Pregunta insertada');
      }
      
      // Extraer y procesar opciones
      const optionMatches = [...optionsContent.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*text:\s*["']((?:[^"'\\\\]|\\\\.)*)["'],\s*ponderacion:\s*(\d+)(?:\s*,\s*emoji:\s*["']([^"']*)["'])?\s*}/g)];
      
      console.log(`    📋 Procesando ${optionMatches.length} opciones`);
      
      let optionOrder = 1;
      
      for (const optionMatch of optionMatches) {
        const [, optionId, optionText, optionWeight, emoji] = optionMatch;
        
        // Limpiar texto de opciones
        const cleanOptionText = optionText.replace(/\\'/g, "'").replace(/\\"/g, '"');
        
        // Verificar si la opción ya existe
        const [existingOption] = await connection.execute(
          'SELECT id FROM diagnostic_options WHERE option_code = ? AND question_id = ?',
          [optionId, dbQuestionId]
        );
        
        if (existingOption.length === 0) {
          const dbOptionId = uuidv4();
          
          await connection.execute(`
            INSERT INTO diagnostic_options 
            (id, question_id, option_code, option_text, weight, emoji, order_index) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            dbOptionId,
            dbQuestionId,
            optionId,
            cleanOptionText,
            parseInt(optionWeight),
            emoji || null,
            optionOrder
          ]);
          
          optionsAdded++;
        }
        
        optionOrder++;
      }
    }
    
    // Verificación final
    const [finalQuestions] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_questions');
    const [finalOptions] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_options');
    
    console.log('\n🎉 ¡MIGRACIÓN COMPLETADA!');
    console.log('=' .repeat(50));
    console.log(`📊 Resultados:`);
    console.log(`   • Preguntas añadidas: ${questionsAdded}`);
    console.log(`   • Opciones añadidas: ${optionsAdded}`);
    console.log(`   • Total preguntas en DB: ${finalQuestions[0].count}`);
    console.log(`   • Total opciones en DB: ${finalOptions[0].count}`);
    
    if (finalQuestions[0].count >= 50) {
      console.log('✅ ¡ÉXITO! Base de datos con más de 50 preguntas');
    }
    
    await connection.end();
    console.log('🔌 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
  }
}

async function getNextQuestionOrder(connection, submoduleId) {
  const [result] = await connection.execute(
    'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM diagnostic_questions WHERE submodule_id = ?',
    [submoduleId]
  );
  return result[0].next_order;
}

migrateAllEtapa2Questions();
