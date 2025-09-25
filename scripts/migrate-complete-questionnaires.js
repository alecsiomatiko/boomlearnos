const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Configuración de base de datos
const dbConfig = {
  host: 'srv440.hstgr.io',
  user: 'u191251575_BoomlearnOS',
  password: 'I6H-LF-Z5RRgR',
  database: 'u191251575_BoomlearnOS'
};

// MIGRACIÓN COMPLETA ORGANIZADA
async function migrateAllQuestionnaires() {
  console.log('🚀 MIGRACIÓN COMPLETA DE CUESTIONARIOS HARDCODEADOS');
  console.log('=' .repeat(60));
  
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');
    
    // PASO 1: Migrar Etapa 2 (Prioridad Alta - 53+ preguntas)
    console.log('\n📋 PASO 1: MIGRANDO ETAPA 2 (PRIORIDAD ALTA)');
    await migrateEtapa2(connection);
    
    // PASO 2: Migrar Etapa 1 (Mapeo de negocio)
    console.log('\n📋 PASO 2: MIGRANDO ETAPA 1 (MAPEO DE NEGOCIO)');
    await migrateEtapa1(connection);
    
    // PASO 3: Migrar Quiz General
    console.log('\n📋 PASO 3: MIGRANDO QUIZ GENERAL');
    await migrateQuizGeneral(connection);
    
    // PASO 4: Verificación final
    console.log('\n📊 VERIFICACIÓN FINAL');
    await verifyFinalMigration(connection);
    
    console.log('\n🎉 ¡MIGRACIÓN COMPLETA FINALIZADA!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// MIGRAR ETAPA 2 (PRIORIDAD ALTA)
async function migrateEtapa2(connection) {
  const filePath = path.join(process.cwd(), 'lib/mega-diagnostic/etapa2-modulos-data.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Archivo etapa2-modulos-data.ts no encontrado');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let questionsCount = 0;
  let optionsCount = 0;
  
  // Extraer módulos usando regex
  const moduleMatches = [...content.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*titulo:\s*["']([^"']+)["'],\s*icon:[^}]+,\s*submodules:\s*\[([\s\S]*?)\]\s*},?(?=\s*\/\/\s*MÓDULO|\s*\])/g)];
  
  console.log(`  📊 Encontrados ${moduleMatches.length} módulos en Etapa 2`);
  
  for (const moduleMatch of moduleMatches) {
    const [, moduleId, moduleTitle, submodulesContent] = moduleMatch;
    
    console.log(`  🔍 Procesando: ${moduleTitle}`);
    
    // Buscar el módulo en la base de datos
    const [moduleRows] = await connection.execute(
      'SELECT id FROM diagnostic_modules WHERE module_code = ?',
      [moduleId]
    );
    
    if (moduleRows.length === 0) {
      console.log(`    ⚠️  Módulo ${moduleId} no encontrado en DB, saltando...`);
      continue;
    }
    
    const dbModuleId = moduleRows[0].id;
    
    // Extraer submódulos
    const submoduleMatches = [...submodulesContent.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*titulo:\s*["']([^"']+)["'],\s*preguntas:\s*\[([\s\S]*?)\]\s*}/g)];
    
    for (const submoduleMatch of submoduleMatches) {
      const [, submoduleId, submoduleTitle, preguntasContent] = submoduleMatch;
      
      // Buscar el submódulo en la base de datos
      const [submoduleRows] = await connection.execute(
        'SELECT id FROM diagnostic_submodules WHERE submodule_code = ? AND module_id = ?',
        [submoduleId, dbModuleId]
      );
      
      if (submoduleRows.length === 0) {
        console.log(`    ⚠️  Submódulo ${submoduleId} no encontrado en DB, saltando...`);
        continue;
      }
      
      const dbSubmoduleId = submoduleRows[0].id;
      
      // Extraer preguntas
      const questionMatches = [...preguntasContent.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*pregunta:\s*["']((?:[^"'\\\\]|\\\\.)*)["'],\s*ponderacionPregunta:\s*(\d+),\s*tipo:\s*["']([^"']+)["'],\s*opciones:\s*\[([\s\S]*?)\]\s*},?/g)];
      
      let questionOrder = 1;
      
      for (const questionMatch of questionMatches) {
        const [, questionId, questionText, weight, questionType, opcionesContent] = questionMatch;
        
        const cleanQuestionText = questionText.replace(/\\'/g, "'").replace(/\\"/g, '"');
        
        // Verificar si la pregunta ya existe
        const [existingQuestion] = await connection.execute(
          'SELECT id FROM diagnostic_questions WHERE question_code = ? AND submodule_id = ?',
          [questionId, dbSubmoduleId]
        );
        
        let dbQuestionId;
        
        if (existingQuestion.length > 0) {
          dbQuestionId = existingQuestion[0].id;
        } else {
          dbQuestionId = uuidv4();
          
          await connection.execute(`
            INSERT INTO diagnostic_questions 
            (id, submodule_id, question_code, question_text, question_type, weight, order_index, is_optional) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            dbQuestionId,
            dbSubmoduleId,
            questionId,
            cleanQuestionText,
            questionType,
            parseInt(weight),
            questionOrder,
            false
          ]);
          
          questionsCount++;
        }
        
        // Extraer opciones
        const optionMatches = [...opcionesContent.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*text:\s*["']((?:[^"'\\\\]|\\\\.)*)["'],\s*ponderacion:\s*(\d+)(?:\s*,\s*emoji:\s*["']([^"']*)["'])?\s*}/g)];
        
        let optionOrder = 1;
        
        for (const optionMatch of optionMatches) {
          const [, optionId, optionText, optionWeight, emoji] = optionMatch;
          
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
            
            optionsCount++;
          }
          
          optionOrder++;
        }
        
        questionOrder++;
      }
    }
  }
  
  console.log(`  ✅ Etapa 2 completada: ${questionsCount} preguntas, ${optionsCount} opciones`);
}

// MIGRAR ETAPA 1 (MAPEO DE NEGOCIO)
async function migrateEtapa1(connection) {
  const filePath = path.join(process.cwd(), 'lib/mega-diagnostic/etapa1-data.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('  ❌ Archivo etapa1-data.ts no encontrado');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let questionsCount = 0;
  let optionsCount = 0;
  
  // Buscar módulo de Etapa 1 en la DB
  const [moduleRows] = await connection.execute(
    'SELECT id FROM diagnostic_modules WHERE title LIKE "%Etapa 1%" OR title LIKE "%mapeo%" OR module_code LIKE "%etapa1%" LIMIT 1'
  );
  
  if (moduleRows.length === 0) {
    // Crear el módulo si no existe
    const moduleId = uuidv4();
    await connection.execute(`
      INSERT INTO diagnostic_modules (id, module_code, title, description, order_index)
      VALUES (?, ?, ?, ?, ?)
    `, [moduleId, 'etapa1_mapeo', 'Etapa 1: Mapeo de Negocio', 'Diagnóstico inicial de mapeo de negocio', 1]);
    
    // Crear submódulo
    const submoduleId = uuidv4();
    await connection.execute(`
      INSERT INTO diagnostic_submodules (id, module_id, submodule_code, title, description, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [submoduleId, moduleId, 'etapa1_mapeo_sub', 'Mapeo de Negocio', 'Preguntas de mapeo inicial', 1]);
    
    console.log('  ✅ Módulo y submódulo de Etapa 1 creados');
  }
  
  // Extraer preguntas del archivo
  const questionMatches = [...content.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*pregunta:\s*["'](¿[^"']*)["'],[\s\S]*?opciones:\s*\[([\s\S]*?)\]/g)];
  
  console.log(`  📊 Encontradas ${questionMatches.length} preguntas en Etapa 1`);
  
  // Obtener el submódulo donde insertar
  const [submoduleRows] = await connection.execute(
    'SELECT id FROM diagnostic_submodules WHERE submodule_code LIKE "%etapa1%" LIMIT 1'
  );
  
  if (submoduleRows.length === 0) {
    console.log('  ❌ No se encontró submódulo para Etapa 1');
    return;
  }
  
  const dbSubmoduleId = submoduleRows[0].id;
  let questionOrder = 1;
  
  for (const questionMatch of questionMatches) {
    const [, questionId, questionText, opcionesContent] = questionMatch;
    
    // Verificar si la pregunta ya existe
    const [existingQuestion] = await connection.execute(
      'SELECT id FROM diagnostic_questions WHERE question_code = ?',
      [questionId]
    );
    
    let dbQuestionId;
    
    if (existingQuestion.length > 0) {
      dbQuestionId = existingQuestion[0].id;
    } else {
      dbQuestionId = uuidv4();
      
      await connection.execute(`
        INSERT INTO diagnostic_questions 
        (id, submodule_id, question_code, question_text, question_type, weight, order_index, is_optional) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        dbQuestionId,
        dbSubmoduleId,
        questionId,
        questionText,
        'single',
        1,
        questionOrder,
        false
      ]);
      
      questionsCount++;
    }
    
    // Extraer opciones
    const optionMatches = [...opcionesContent.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*text:\s*["']([^"']*)["']/g)];
    
    let optionOrder = 1;
    
    for (const optionMatch of optionMatches) {
      const [, optionId, optionText] = optionMatch;
      
      // Verificar si la opción ya existe
      const [existingOption] = await connection.execute(
        'SELECT id FROM diagnostic_options WHERE option_code = ? AND question_id = ?',
        [optionId, dbQuestionId]
      );
      
      if (existingOption.length === 0) {
        const dbOptionId = uuidv4();
        
        await connection.execute(`
          INSERT INTO diagnostic_options 
          (id, question_id, option_code, option_text, weight, order_index) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          dbOptionId,
          dbQuestionId,
          optionId,
          optionText,
          1,
          optionOrder
        ]);
        
        optionsCount++;
      }
      
      optionOrder++;
    }
    
    questionOrder++;
  }
  
  console.log(`  ✅ Etapa 1 completada: ${questionsCount} preguntas, ${optionsCount} opciones`);
}

// MIGRAR QUIZ GENERAL
async function migrateQuizGeneral(connection) {
  const filePath = path.join(process.cwd(), 'lib/quiz-data.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('  ❌ Archivo quiz-data.ts no encontrado');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let questionsCount = 0;
  let optionsCount = 0;
  
  // Buscar o crear módulo de Quiz
  let [moduleRows] = await connection.execute(
    'SELECT id FROM diagnostic_modules WHERE title LIKE "%Quiz%" OR module_code LIKE "%quiz%" LIMIT 1'
  );
  
  let dbModuleId;
  
  if (moduleRows.length === 0) {
    // Crear módulo de Quiz
    dbModuleId = uuidv4();
    await connection.execute(`
      INSERT INTO diagnostic_modules (id, module_code, title, description, order_index)
      VALUES (?, ?, ?, ?, ?)
    `, [dbModuleId, 'quiz_general', 'Quiz General', 'Evaluación general de la empresa', 15]);
    
    // Crear submódulo
    const dbSubmoduleId = uuidv4();
    await connection.execute(`
      INSERT INTO diagnostic_submodules (id, module_id, submodule_code, title, description, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [dbSubmoduleId, dbModuleId, 'quiz_general_sub', 'Evaluación General', 'Preguntas generales de evaluación', 1]);
    
    console.log('  ✅ Módulo y submódulo de Quiz creados');
  } else {
    dbModuleId = moduleRows[0].id;
  }
  
  // Extraer preguntas del quiz
  const questionMatches = [...content.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*question:\s*["'](¿[^"']*)["'],[\s\S]*?options:\s*\[([\s\S]*?)\]/g)];
  
  console.log(`  📊 Encontradas ${questionMatches.length} preguntas en Quiz`);
  
  // Obtener el submódulo
  const [submoduleRows] = await connection.execute(
    'SELECT id FROM diagnostic_submodules WHERE module_id = ? LIMIT 1',
    [dbModuleId]
  );
  
  if (submoduleRows.length === 0) {
    console.log('  ❌ No se encontró submódulo para Quiz');
    return;
  }
  
  const dbSubmoduleId = submoduleRows[0].id;
  let questionOrder = 1;
  
  for (const questionMatch of questionMatches) {
    const [, questionId, questionText, optionsContent] = questionMatch;
    
    // Verificar si la pregunta ya existe
    const [existingQuestion] = await connection.execute(
      'SELECT id FROM diagnostic_questions WHERE question_code = ?',
      [questionId]
    );
    
    let dbQuestionId;
    
    if (existingQuestion.length > 0) {
      dbQuestionId = existingQuestion[0].id;
    } else {
      dbQuestionId = uuidv4();
      
      await connection.execute(`
        INSERT INTO diagnostic_questions 
        (id, submodule_id, question_code, question_text, question_type, weight, order_index, is_optional) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        dbQuestionId,
        dbSubmoduleId,
        questionId,
        questionText,
        'single',
        1,
        questionOrder,
        false
      ]);
      
      questionsCount++;
    }
    
    // Extraer opciones
    const optionMatches = [...optionsContent.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*text:\s*["']([^"']*)["'],\s*weight:\s*(\d+)/g)];
    
    let optionOrder = 1;
    
    for (const optionMatch of optionMatches) {
      const [, optionId, optionText, optionWeight] = optionMatch;
      
      // Verificar si la opción ya existe
      const [existingOption] = await connection.execute(
        'SELECT id FROM diagnostic_options WHERE option_code = ? AND question_id = ?',
        [optionId, dbQuestionId]
      );
      
      if (existingOption.length === 0) {
        const dbOptionId = uuidv4();
        
        await connection.execute(`
          INSERT INTO diagnostic_options 
          (id, question_id, option_code, option_text, weight, order_index) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          dbOptionId,
          dbQuestionId,
          optionId,
          optionText,
          parseInt(optionWeight),
          optionOrder
        ]);
        
        optionsCount++;
      }
      
      optionOrder++;
    }
    
    questionOrder++;
  }
  
  console.log(`  ✅ Quiz completado: ${questionsCount} preguntas, ${optionsCount} opciones`);
}

// VERIFICACIÓN FINAL
async function verifyFinalMigration(connection) {
  const [questions] = await connection.execute(
    'SELECT COUNT(*) as count FROM diagnostic_questions'
  );
  
  const [options] = await connection.execute(
    'SELECT COUNT(*) as count FROM diagnostic_options'
  );
  
  const [modules] = await connection.execute(
    'SELECT COUNT(*) as count FROM diagnostic_modules'
  );
  
  const [submodules] = await connection.execute(
    'SELECT COUNT(*) as count FROM diagnostic_submodules'
  );
  
  console.log(`📊 Estado final de la migración:`);
  console.log(`   • Módulos: ${modules[0].count}`);
  console.log(`   • Submódulos: ${submodules[0].count}`);
  console.log(`   • Preguntas: ${questions[0].count}`);
  console.log(`   • Opciones: ${options[0].count}`);
  
  if (questions[0].count > 50) {
    console.log('✅ ¡Migración exitosa! Se migraron más de 50 preguntas');
  } else {
    console.log('⚠️  La migración parece incompleta, menos de 50 preguntas migradas');
  }
}

// Ejecutar migración
migrateAllQuestionnaires().catch(console.error);
