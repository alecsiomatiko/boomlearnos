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

let connection;

// Función para ejecutar queries
async function executeQuery(query, params = []) {
  try {
    console.log('🔍 Ejecutando query:', query.substring(0, 100) + '...');
    const result = await sql(query, params);
    return result;
  } catch (error) {
    console.error('❌ Error en query:', error);
    throw error;
  }
}

// Función para leer y evaluar archivos TypeScript
function loadTSModule(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Remover imports/exports de TypeScript y convertir a JavaScript ejecutable
  let jsContent = content
    .replace(/import\s+.*?from\s+["'].*?["']/g, '') // Remover imports
    .replace(/export\s+(const|interface|type)/g, '$1') // Remover exports
    .replace(/:\s*\w+(\[\])?/g, '') // Remover type annotations
    .replace(/\?\s*:/g, ':') // Remover optional operators
    .replace(/as\s+\w+/g, '') // Remover type assertions
    .replace(/<[^>]+>/g, '') // Remover generics
    .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remover interfaces
    .replace(/type\s+\w+\s*=\s*[^;]+;/g, ''); // Remover type definitions
  
  // Crear contexto para evaluar el código
  const context = { module: { exports: {} }, exports: {} };
  
  try {
    // Evaluar el código JavaScript procesado
    eval(`(function(module, exports) { ${jsContent} })`)(context.module, context.exports);
    return context.module.exports;
  } catch (error) {
    console.log('⚠️  Intentando método alternativo para:', filePath);
    
    // Método alternativo: extraer solo los datos usando regex
    const dataMatches = jsContent.match(/export\s+const\s+(\w+)\s*[:=]\s*({[\s\S]*?});?\s*$/gm);
    if (dataMatches) {
      const result = {};
      dataMatches.forEach(match => {
        const nameMatch = match.match(/export\s+const\s+(\w+)/);
        if (nameMatch) {
          const name = nameMatch[1];
          try {
            eval(`const ${name} = ${match.replace(/export\s+const\s+\w+\s*[:=]\s*/, '')}`);
            result[name] = eval(name);
          } catch (e) {
            console.log(`⚠️  No se pudo extraer ${name}:`, e.message);
          }
        }
      });
      return result;
    }
    
    throw error;
  }
}

// Cargar datos hardcodeados
console.log('📂 Cargando datos de archivos TypeScript...');

let etapa1DiagnosticoInicial, etapa2Modulos, modulo0PropositoBHAG;

try {
  const modulo0Data = loadTSModule(path.join(__dirname, '../lib/mega-diagnostic/modulo0-data.ts'));
  modulo0PropositoBHAG = modulo0Data.modulo0PropositoBHAG;
  
  const etapa1Data = loadTSModule(path.join(__dirname, '../lib/mega-diagnostic/etapa1-data.ts'));
  etapa1DiagnosticoInicial = etapa1Data.etapa1DiagnosticoInicial;
  
  const etapa2Data = loadTSModule(path.join(__dirname, '../lib/mega-diagnostic/etapa2-modulos-data.ts'));
  etapa2Modulos = etapa2Data.etapa2Modulos;
  
  console.log('✅ Datos cargados exitosamente');
  
} catch (error) {
  console.error('❌ Error cargando datos:', error);
  process.exit(1);
}

console.log('🚀 INICIANDO MIGRACIÓN DE CUESTIONARIOS HARDCODEADOS A BASE DE DATOS');

async function migrarCuestionariosCompletos() {
  try {
    console.log('\n=== PASO 1: VERIFICANDO ESQUEMA DE BASE DE DATOS ===');
    
    // Verificar que las tablas existan
    const tables = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('diagnostic_modules', 'diagnostic_submodules', 'diagnostic_questions', 'diagnostic_options')
    `);
    
    console.log('✅ Tablas disponibles:', tables.map(t => t.table_name));
    
    if (tables.length < 4) {
      throw new Error('❌ Faltan tablas necesarias en la base de datos');
    }

    console.log('\n=== PASO 2: MIGRANDO MÓDULO 0 (PROPÓSITO Y BHAG) ===');
    await migrarModulo0();
    
    console.log('\n=== PASO 3: MIGRANDO ETAPA 1 (MAPEO TOTAL DEL NEGOCIO) ===');
    await migrarEtapa1();
    
    console.log('\n=== PASO 4: MIGRANDO ETAPA 2 (MÓDULOS 1-13) ===');
    await migrarEtapa2();
    
    console.log('\n🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('✅ Todos los cuestionarios hardcodeados han sido migrados a la base de datos');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

async function migrarModulo0() {
  const modulo = modulo0PropositoBHAG;
  
  // Insertar módulo principal
  const moduleResult = await executeQuery(`
    INSERT INTO diagnostic_modules (
      module_code, title, description, estimated_time_minutes, 
      is_active, display_order, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      description = VALUES(description),
      updated_at = NOW()
  `, [
    modulo.id,
    modulo.titulo,
    modulo.descripcion,
    30, // tiempo estimado
    1,  // activo
    0   // orden de display
  ]);
  
  console.log(`✅ Módulo 0 insertado/actualizado`);
  
  // Crear submódulo único para las preguntas
  const submoduleResult = await executeQuery(`
    INSERT INTO diagnostic_submodules (
      submodule_code, module_code, title, description,
      display_order, is_active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      description = VALUES(description),
      updated_at = NOW()
  `, [
    'modulo0_proposito',
    modulo.id,
    'Propósito de Vida y BHAG',
    'Identifica tu propósito personal y define tu BHAG',
    1,
    1
  ]);
  
  // Insertar preguntas
  for (let i = 0; i < modulo.questions.length; i++) {
    const question = modulo.questions[i];
    
    await executeQuery(`
      INSERT INTO diagnostic_questions (
        question_code, submodule_code, question_text, question_type,
        weight, display_order, is_required, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        question_text = VALUES(question_text),
        updated_at = NOW()
    `, [
      question.id,
      'modulo0_proposito',
      question.pregunta,
      question.tipo,
      question.ponderacionPregunta,
      i + 1,
      1, // requerida
      1  // activa
    ]);
    
    // Insertar opciones
    if (question.opciones) {
      for (let j = 0; j < question.opciones.length; j++) {
        const option = question.opciones[j];
        
        await executeQuery(`
          INSERT INTO diagnostic_options (
            option_code, question_code, option_text, weight,
            display_order, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            option_text = VALUES(option_text),
            weight = VALUES(weight),
            updated_at = NOW()
        `, [
          option.id,
          question.id,
          option.text,
          option.ponderacion,
          j + 1,
          1
        ]);
      }
    }
  }
  
  console.log(`✅ Módulo 0: ${modulo.questions.length} preguntas migradas`);
}

async function migrarEtapa1() {
  const etapa = etapa1DiagnosticoInicial;
  
  // Insertar módulo principal
  await executeQuery(`
    INSERT INTO diagnostic_modules (
      module_code, title, description, estimated_time_minutes, 
      is_active, display_order, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      description = VALUES(description),
      updated_at = NOW()
  `, [
    etapa.id,
    etapa.titulo,
    etapa.descripcion,
    45, // tiempo estimado
    1,  // activo
    1   // orden de display
  ]);
  
  console.log(`✅ Etapa 1 insertada/actualizada`);
  
  // Crear submódulo único para las preguntas
  await executeQuery(`
    INSERT INTO diagnostic_submodules (
      submodule_code, module_code, title, description,
      display_order, is_active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      description = VALUES(description),
      updated_at = NOW()
  `, [
    'etapa1_mapeo',
    etapa.id,
    'Mapeo Total del Negocio',
    'Diagnóstico completo de la situación actual de tu negocio',
    1,
    1
  ]);
  
  // Insertar preguntas
  for (let i = 0; i < etapa.questions.length; i++) {
    const question = etapa.questions[i];
    
    await executeQuery(`
      INSERT INTO diagnostic_questions (
        question_code, submodule_code, question_text, question_type,
        weight, display_order, is_required, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        question_text = VALUES(question_text),
        updated_at = NOW()
    `, [
      question.id,
      'etapa1_mapeo',
      question.pregunta,
      question.tipo,
      question.ponderacionPregunta,
      i + 1,
      1, // requerida
      1  // activa
    ]);
    
    // Insertar opciones
    if (question.opciones) {
      for (let j = 0; j < question.opciones.length; j++) {
        const option = question.opciones[j];
        
        await executeQuery(`
          INSERT INTO diagnostic_options (
            option_code, question_code, option_text, weight,
            display_order, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            option_text = VALUES(option_text),
            weight = VALUES(weight),
            updated_at = NOW()
        `, [
          option.id,
          question.id,
          option.text,
          option.ponderacion,
          j + 1,
          1
        ]);
      }
    }
  }
  
  console.log(`✅ Etapa 1: ${etapa.questions.length} preguntas migradas`);
}

async function migrarEtapa2() {
  console.log('📋 Migrando 13 módulos de Etapa 2...');
  
  for (let moduleIndex = 0; moduleIndex < etapa2Modulos.length; moduleIndex++) {
    const modulo = etapa2Modulos[moduleIndex];
    
    console.log(`\n--- Migrando ${modulo.titulo} ---`);
    
    // Insertar módulo principal
    await executeQuery(`
      INSERT INTO diagnostic_modules (
        module_code, title, description, estimated_time_minutes, 
        is_active, display_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        updated_at = NOW()
    `, [
      modulo.id,
      modulo.titulo,
      `Módulo ${moduleIndex + 1} del mega-diagnóstico`,
      60, // tiempo estimado
      1,  // activo
      moduleIndex + 2 // orden de display (después de módulo 0 y etapa 1)
    ]);
    
    // Migrar submódulos
    for (let subIndex = 0; subIndex < modulo.submodules.length; subIndex++) {
      const submodulo = modulo.submodules[subIndex];
      
      await executeQuery(`
        INSERT INTO diagnostic_submodules (
          submodule_code, module_code, title, description,
          display_order, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          updated_at = NOW()
      `, [
        submodulo.id,
        modulo.id,
        submodulo.titulo,
        `Submódulo ${subIndex + 1}`,
        subIndex + 1,
        1
      ]);
      
      // Migrar preguntas del submódulo
      for (let qIndex = 0; qIndex < submodulo.preguntas.length; qIndex++) {
        const question = submodulo.preguntas[qIndex];
        
        await executeQuery(`
          INSERT INTO diagnostic_questions (
            question_code, submodule_code, question_text, question_type,
            weight, display_order, is_required, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            question_text = VALUES(question_text),
            updated_at = NOW()
        `, [
          question.id,
          submodulo.id,
          question.pregunta,
          question.tipo,
          question.ponderacionPregunta,
          qIndex + 1,
          1, // requerida
          1  // activa
        ]);
        
        // Insertar opciones
        if (question.opciones) {
          for (let oIndex = 0; oIndex < question.opciones.length; oIndex++) {
            const option = question.opciones[oIndex];
            
            await executeQuery(`
              INSERT INTO diagnostic_options (
                option_code, question_code, option_text, weight,
                display_order, is_active, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, NOW())
              ON DUPLICATE KEY UPDATE
                option_text = VALUES(option_text),
                weight = VALUES(weight),
                updated_at = NOW()
            `, [
              option.id,
              question.id,
              option.text,
              option.ponderacion,
              oIndex + 1,
              1
            ]);
          }
        }
      }
      
      console.log(`  ✅ Submódulo ${submodulo.titulo}: ${submodulo.preguntas.length} preguntas`);
    }
    
    const totalQuestions = modulo.submodules.reduce((acc, sub) => acc + sub.preguntas.length, 0);
    console.log(`✅ ${modulo.titulo}: ${totalQuestions} preguntas totales migradas`);
  }
}

// Función para verificar la migración
async function verificarMigracion() {
  console.log('\n=== VERIFICACIÓN DE MIGRACIÓN ===');
  
  const modules = await executeQuery('SELECT COUNT(*) as count FROM diagnostic_modules');
  const submodules = await executeQuery('SELECT COUNT(*) as count FROM diagnostic_submodules');
  const questions = await executeQuery('SELECT COUNT(*) as count FROM diagnostic_questions');
  const options = await executeQuery('SELECT COUNT(*) as count FROM diagnostic_options');
  
  console.log(`📊 Resultados de migración:`);
  console.log(`   • Módulos: ${modules[0].count}`);
  console.log(`   • Submódulos: ${submodules[0].count}`);
  console.log(`   • Preguntas: ${questions[0].count}`);
  console.log(`   • Opciones: ${options[0].count}`);
}

// Ejecutar migración
if (require.main === module) {
  migrarCuestionariosCompletos()
    .then(() => verificarMigracion())
    .then(() => {
      console.log('\n🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en migración:', error);
      process.exit(1);
    });
}

module.exports = {
  migrarCuestionariosCompletos,
  verificarMigracion
};
