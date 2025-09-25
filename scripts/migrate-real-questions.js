// Script completo para migrar preguntas REALES desde archivos hardcodeados
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

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

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

// Función para extraer datos de archivos TypeScript usando regex más simples
function extractQuestionData(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Para módulo 0 - extraer questions array
  if (filePath.includes('modulo0-data.ts')) {
    // Buscar el array questions
    const questionsMatch = content.match(/questions:\s*\[([\s\S]*?)\]/);
    if (questionsMatch) {
      const questionsContent = questionsMatch[1];
      
      // Extraer cada pregunta individual
      const questions = [];
      const questionMatches = questionsContent.match(/{\s*id:\s*["']([^"']+)["'][\s\S]*?},?\s*(?={\s*id:|$)/g);
      
      if (questionMatches) {
        questionMatches.forEach(qMatch => {
          try {
            const idMatch = qMatch.match(/id:\s*["']([^"']+)["']/);
            const preguntaMatch = qMatch.match(/pregunta:\s*["']([^"']+)["']/);
            const tipoMatch = qMatch.match(/tipo:\s*["']([^"']+)["']/);
            
            if (idMatch && preguntaMatch && tipoMatch) {
              const question = {
                id: idMatch[1],
                pregunta: preguntaMatch[1],
                tipo: tipoMatch[1],
                opciones: []
              };
              
              // Extraer opciones
              const opcionesMatch = qMatch.match(/opciones:\s*\[([\s\S]*?)\]/);
              if (opcionesMatch) {
                const opcionesContent = opcionesMatch[1];
                const optionMatches = opcionesContent.match(/{\s*id:\s*["']([^"']+)["'],\s*text:\s*["']([^"']*?)["'][\s\S]*?}/g);
                
                if (optionMatches) {
                  optionMatches.forEach(optMatch => {
                    const optIdMatch = optMatch.match(/id:\s*["']([^"']+)["']/);
                    const optTextMatch = optMatch.match(/text:\s*["']([^"']*?)["']/);
                    
                    if (optIdMatch && optTextMatch) {
                      question.opciones.push({
                        id: optIdMatch[1],
                        text: optTextMatch[1]
                      });
                    }
                  });
                }
              }
              
              questions.push(question);
            }
          } catch (error) {
            console.log('⚠️  Error procesando pregunta:', error.message);
          }
        });
      }
      
      return { questions };
    }
  }
  
  // Para etapa2 - extraer módulos con submódulos y preguntas
  if (filePath.includes('etapa2-modulos-data.ts')) {
    const modules = [];
    
    // Buscar cada módulo
    const moduleMatches = content.match(/{\s*id:\s*["']([^"']+)["'],\s*titulo:\s*["']([^"']*?)["'][\s\S]*?submodules:\s*\[([\s\S]*?)\]\s*},?/g);
    
    if (moduleMatches) {
      moduleMatches.forEach(modMatch => {
        try {
          const modIdMatch = modMatch.match(/id:\s*["']([^"']+)["']/);
          const modTitleMatch = modMatch.match(/titulo:\s*["']([^"']*?)["']/);
          const submodulesMatch = modMatch.match(/submodules:\s*\[([\s\S]*?)\]/);
          
          if (modIdMatch && modTitleMatch && submodulesMatch) {
            const module = {
              id: modIdMatch[1],
              titulo: modTitleMatch[1],
              submodules: []
            };
            
            const submodulesContent = submodulesMatch[1];
            const submoduleMatches = submodulesContent.match(/{\s*id:\s*["']([^"']+)["'][\s\S]*?preguntas:\s*\[([\s\S]*?)\]\s*},?/g);
            
            if (submoduleMatches) {
              submoduleMatches.forEach(subMatch => {
                const subIdMatch = subMatch.match(/id:\s*["']([^"']+)["']/);
                const subTitleMatch = subMatch.match(/titulo:\s*["']([^"']*?)["']/);
                const preguntasMatch = subMatch.match(/preguntas:\s*\[([\s\S]*?)\]/);
                
                if (subIdMatch && subTitleMatch && preguntasMatch) {
                  const submodule = {
                    id: subIdMatch[1],
                    titulo: subTitleMatch[1],
                    preguntas: []
                  };
                  
                  // Extraer preguntas del submódulo (similar al módulo 0)
                  const preguntasContent = preguntasMatch[1];
                  const questionMatches = preguntasContent.match(/{\s*id:\s*["']([^"']+)["'][\s\S]*?},?/g);
                  
                  if (questionMatches) {
                    questionMatches.forEach(qMatch => {
                      const qIdMatch = qMatch.match(/id:\s*["']([^"']+)["']/);
                      const qPreguntaMatch = qMatch.match(/pregunta:\s*["']([^"']*?)["']/);
                      const qTipoMatch = qMatch.match(/tipo:\s*["']([^"']+)["']/);
                      
                      if (qIdMatch && qPreguntaMatch && qTipoMatch) {
                        const question = {
                          id: qIdMatch[1],
                          pregunta: qPreguntaMatch[1],
                          tipo: qTipoMatch[1],
                          opciones: []
                        };
                        
                        // Extraer opciones
                        const opcionesMatch = qMatch.match(/opciones:\s*\[([\s\S]*?)\]/);
                        if (opcionesMatch) {
                          const opcionesContent = opcionesMatch[1];
                          const optionMatches = opcionesContent.match(/{\s*id:\s*["']([^"']+)["'],\s*text:\s*["']([^"']*?)["'][\s\S]*?}/g);
                          
                          if (optionMatches) {
                            optionMatches.forEach(optMatch => {
                              const optIdMatch = optMatch.match(/id:\s*["']([^"']+)["']/);
                              const optTextMatch = optMatch.match(/text:\s*["']([^"']*?)["']/);
                              
                              if (optIdMatch && optTextMatch) {
                                question.opciones.push({
                                  id: optIdMatch[1],
                                  text: optTextMatch[1]
                                });
                              }
                            });
                          }
                        }
                        
                        submodule.preguntas.push(question);
                      }
                    });
                  }
                  
                  module.submodules.push(submodule);
                }
              });
            }
            
            modules.push(module);
          }
        } catch (error) {
          console.log('⚠️  Error procesando módulo:', error.message);
        }
      });
    }
    
    return { modules };
  }
  
  return {};
}

async function migrarPreguntasReales() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');
    
    console.log('\n🚀 MIGRANDO PREGUNTAS REALES DESDE ARCHIVOS HARDCODEADOS');
    
    // Verificar que existe la tabla diagnostic_questions
    const [questionTableExists] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'diagnostic_questions'
    `, [dbConfig.database]);
    
    if (questionTableExists.length === 0) {
      console.log('❌ Tabla diagnostic_questions no existe. Creando...');
      // Aquí podrías crear la tabla si no existe
      return;
    }
    
    // 1. Migrar preguntas del Módulo 0 (BHAG)
    console.log('\n--- Migrando Módulo 0: PROPÓSITO Y BHAG ---');
    const modulo0Path = path.join(__dirname, '../lib/mega-diagnostic/modulo0-data.ts');
    const modulo0Data = extractQuestionData(modulo0Path);
    
    if (modulo0Data.questions) {
      console.log(`📋 Encontradas ${modulo0Data.questions.length} preguntas en Módulo 0`);
      
      // Obtener el ID del módulo MOD0
      const [mod0] = await connection.execute('SELECT id FROM diagnostic_modules WHERE module_code = ?', ['MOD0']);
      
      if (mod0.length > 0) {
        const moduleId = mod0[0].id;
        
        // Obtener submódulos existentes para MOD0
        const [submods] = await connection.execute('SELECT id, submodule_code FROM diagnostic_submodules WHERE module_id = ?', [moduleId]);
        
        for (let i = 0; i < modulo0Data.questions.length; i++) {
          const question = modulo0Data.questions[i];
          const questionId = uuidv4();
          
          // Asignar a submódulo basado en el ID de la pregunta
          let submoduleId = submods[0]?.id; // Default al primer submódulo
          if (question.id.includes('s2')) {
            submoduleId = submods[1]?.id || submods[0]?.id;
          } else if (question.id.includes('s3')) {
            submoduleId = submods[2]?.id || submods[0]?.id;
          }
          
          // Insertar pregunta
          await connection.execute(`
            INSERT INTO diagnostic_questions (
              id, question_code, submodule_id, question_text, question_type,
              weight, order_index, is_optional, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
              question_text = VALUES(question_text)
          `, [
            questionId,
            question.id,
            submoduleId,
            question.pregunta,
            question.tipo,
            1, // weight default
            i + 1,
            0  // not optional (required)
          ]);
          
          // Insertar opciones
          for (let j = 0; j < question.opciones.length; j++) {
            const option = question.opciones[j];
            const optionId = uuidv4();
            
            await connection.execute(`
              INSERT INTO diagnostic_options (
                id, option_code, question_id, option_text, weight,
                order_index, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, NOW())
              ON DUPLICATE KEY UPDATE
                option_text = VALUES(option_text)
            `, [
              optionId,
              option.id,
              questionId,
              option.text,
              1, // weight default
              j + 1
            ]);
          }
          
          console.log(`  ✅ Pregunta migrada: ${question.pregunta.substring(0, 50)}... (${question.opciones.length} opciones)`);
        }
      }
    }
    
    // 2. Migrar preguntas de Etapa 2
    console.log('\n--- Migrando Etapa 2: MÓDULOS PRINCIPALES ---');
    const etapa2Path = path.join(__dirname, '../lib/mega-diagnostic/etapa2-modulos-data.ts');
    
    if (fs.existsSync(etapa2Path)) {
      const etapa2Content = fs.readFileSync(etapa2Path, 'utf8');
      
      // Contar preguntas encontradas
      const preguntasEtapa2 = [...etapa2Content.matchAll(/pregunta:\s*["'](¿[^"']*?)["']/g)];
      console.log(`📋 Encontradas ${preguntasEtapa2.length} preguntas en Etapa 2`);
      
      // Usar el primer submódulo disponible para las preguntas de Etapa 2
      const [firstSubmodule] = await connection.execute('SELECT id FROM diagnostic_submodules LIMIT 1');
      
      if (firstSubmodule.length > 0 && preguntasEtapa2.length > 0) {
        const targetSubmoduleId = firstSubmodule[0].id;
        
        // Obtener próximo order_index
        const [maxOrder] = await connection.execute(
          'SELECT COALESCE(MAX(order_index), 0) as max_order FROM diagnostic_questions WHERE submodule_id = ?',
          [targetSubmoduleId]
        );
        
        let currentOrder = maxOrder[0].max_order + 1;
        let etapa2QuestionsAdded = 0;
        let etapa2OptionsAdded = 0;
        
        // Extraer bloques completos de preguntas con opciones
        const questionBlocks = [...etapa2Content.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*pregunta:\s*["'](¿[^"']*?)["'],\s*ponderacionPregunta:\s*(\d+),\s*tipo:\s*["']([^"']+)["'],\s*opciones:\s*\[([\s\S]*?)\],?\s*}/g)];
        
        console.log(`  📊 Encontrados ${questionBlocks.length} bloques completos de preguntas`);
        
        for (const questionBlock of questionBlocks.slice(40)) { // Tomar las últimas preguntas restantes (41+)
          const [, questionId, questionText, weight, questionType, optionsContent] = questionBlock;
          
          // Verificar si la pregunta ya existe
          const [existingQ] = await connection.execute(
            'SELECT id FROM diagnostic_questions WHERE question_code = ?',
            [questionId]
          );
          
          if (existingQ.length === 0) {
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
              currentOrder,
              0
            ]);
            
            etapa2QuestionsAdded++;
            
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
              
              etapa2OptionsAdded++;
              optionOrder++;
            }
            
            console.log(`  ✅ Pregunta Etapa 2: ${questionText.substring(0, 50)}... (${optionMatches.length} opciones)`);
            currentOrder++;
          }
        }
        
        console.log(`📊 Etapa 2 completada: ${etapa2QuestionsAdded} preguntas, ${etapa2OptionsAdded} opciones`);
      }
    }
    
    console.log('\n🎉 ¡MIGRACIÓN DE PREGUNTAS REALES COMPLETADA!');
    
    // Verificar resultado
    const [totalQuestions] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_questions');
    const [totalOptions] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_options');
    
    console.log(`📊 Total migrado:`);
    console.log(`   • Preguntas: ${totalQuestions[0].count}`);
    console.log(`   • Opciones: ${totalOptions[0].count}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la migración
migrarPreguntasReales()
  .then(() => {
    console.log('\n✅ ¡PREGUNTAS REALES MIGRADAS EXITOSAMENTE!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
