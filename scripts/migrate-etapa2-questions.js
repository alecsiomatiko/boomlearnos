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

async function migrateEtapa2Questions() {
  console.log('🚀 MIGRANDO PREGUNTAS DE ETAPA 2 (etapa2-modulos-data.ts)');
  
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
    const filePath = 'lib/mega-diagnostic/etapa2-modulos-data.ts';
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraer la estructura de módulos usando regex más específicos
    const moduleMatches = [...content.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*titulo:\s*["']([^"']+)["'],\s*icon:[^}]+,\s*submodules:\s*\[([\s\S]*?)\]\s*},?(?=\s*\/\/\s*MÓDULO|\s*\])/g)];
    
    console.log(`📊 Encontrados ${moduleMatches.length} módulos en el archivo`);
    
    let totalQuestions = 0;
    let totalOptions = 0;
    
    for (const moduleMatch of moduleMatches) {
      const [, moduleId, moduleTitle, submodulesContent] = moduleMatch;
      
      console.log(`\n📋 Procesando módulo: ${moduleTitle}`);
      
      // Obtener el ID del módulo desde la base de datos
      const [moduleRows] = await connection.execute(
        'SELECT id FROM diagnostic_modules WHERE module_code = ?',
        [moduleId]
      );
      
      if (moduleRows.length === 0) {
        console.log(`  ⚠️  Módulo ${moduleId} no encontrado en DB, saltando...`);
        continue;
      }
      
      const dbModuleId = moduleRows[0].id;
      
      // Extraer submódulos
      const submoduleMatches = [...submodulesContent.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*titulo:\s*["']([^"']+)["'],\s*preguntas:\s*\[([\s\S]*?)\]\s*}/g)];
      
      for (const submoduleMatch of submoduleMatches) {
        const [, submoduleId, submoduleTitle, preguntasContent] = submoduleMatch;
        
        console.log(`  📁 Procesando submódulo: ${submoduleTitle}`);
        
        // Obtener el ID del submódulo desde la base de datos
        const [submoduleRows] = await connection.execute(
          'SELECT id FROM diagnostic_submodules WHERE submodule_code = ? AND module_id = ?',
          [submoduleId, dbModuleId]
        );
        
        if (submoduleRows.length === 0) {
          console.log(`    ⚠️  Submódulo ${submoduleId} no encontrado en DB, saltando...`);
          continue;
        }
        
        const dbSubmoduleId = submoduleRows[0].id;
        
        // Extraer preguntas usando regex más robusto
        const questionMatches = [...preguntasContent.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*pregunta:\s*["']((?:[^"'\\\\]|\\\\.)*)["'],\s*ponderacionPregunta:\s*(\d+),\s*tipo:\s*["']([^"']+)["'],\s*opciones:\s*\[([\s\S]*?)\]\s*},?/g)];
        
        let questionOrder = 1;
        
        for (const questionMatch of questionMatches) {
          const [, questionId, questionText, weight, questionType, opcionesContent] = questionMatch;
          
          // Limpiar el texto de la pregunta (manejar escapes)
          const cleanQuestionText = questionText.replace(/\\'/g, "'").replace(/\\"/g, '"');
          
          console.log(`    📝 Migrando pregunta: ${cleanQuestionText.substring(0, 50)}...`);
          
          // Verificar si la pregunta ya existe
          const [existingQuestion] = await connection.execute(
            'SELECT id FROM diagnostic_questions WHERE question_code = ? AND submodule_id = ?',
            [questionId, dbSubmoduleId]
          );
          
          let dbQuestionId;
          
          if (existingQuestion.length > 0) {
            // Ya existe, usar el ID existente
            dbQuestionId = existingQuestion[0].id;
            console.log(`      ⚠️  Pregunta ya existe, saltando inserción`);
          } else {
            // Insertar nueva pregunta
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
            
            totalQuestions++;
            console.log(`      ✅ Pregunta insertada`);
          }
          
          // Extraer opciones
          const optionMatches = [...opcionesContent.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*text:\s*["']((?:[^"'\\\\]|\\\\.)*)["'],\s*ponderacion:\s*(\d+)(?:\s*,\s*emoji:\s*["']([^"']*)["'])?\s*}/g)];
          
          let optionOrder = 1;
          
          for (const optionMatch of optionMatches) {
            const [, optionId, optionText, optionWeight, emoji] = optionMatch;
            
            // Limpiar el texto de la opción
            const cleanOptionText = optionText.replace(/\\'/g, "'").replace(/\\"/g, '"');
            
            // Verificar si la opción ya existe
            const [existingOption] = await connection.execute(
              'SELECT id FROM diagnostic_options WHERE option_code = ? AND question_id = ?',
              [optionId, dbQuestionId]
            );
            
            if (existingOption.length === 0) {
              // Insertar nueva opción
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
              
              totalOptions++;
            }
            
            optionOrder++;
          }
          
          questionOrder++;
        }
      }
    }
    
    await connection.end();
    
    console.log('\n🎉 ¡MIGRACIÓN DE ETAPA 2 COMPLETADA!');
    console.log(`📊 Total migrado:`);
    console.log(`   • Preguntas nuevas: ${totalQuestions}`);
    console.log(`   • Opciones nuevas: ${totalOptions}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

migrateEtapa2Questions();
