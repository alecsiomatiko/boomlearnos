const mysql = require('mysql2/promise');

async function verifyMigratedQuestions() {
  const connection = await mysql.createConnection({
    host: 'srv440.hstgr.io',
    user: 'u191251575_BoomlearnOS',
    password: 'I6H-LF-Z5RRgR',
    database: 'u191251575_BoomlearnOS'
  });

  try {
    console.log('📊 VERIFICANDO PREGUNTAS MIGRADAS:');
    
    const [questions] = await connection.execute(`
      SELECT 
        q.id, 
        q.question_text, 
        q.question_type, 
        q.order_index,
        dm.title as module, 
        ds.title as submodule 
      FROM diagnostic_questions q 
      LEFT JOIN diagnostic_submodules ds ON q.submodule_id = ds.id 
      LEFT JOIN diagnostic_modules dm ON ds.module_id = dm.id 
      ORDER BY dm.id, ds.id, q.order_index
    `);
    
    console.log('📈 Total preguntas migradas:', questions.length);
    
    const [options] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_options');
    console.log('📈 Total opciones migradas:', options[0].count);
    
    console.log('\n📋 PREGUNTAS POR MÓDULO:');
    
    let currentModule = '';
    let currentSubmodule = '';
    let moduleCount = 0;
    let submoduleCount = 0;
    
    for (const q of questions) {
      if (q.module !== currentModule) {
        if (currentModule) console.log(`   └─ ${submoduleCount} submódulos\n`);
        currentModule = q.module;
        moduleCount++;
        submoduleCount = 0;
        console.log(`🎯 MÓDULO ${moduleCount}: ${q.module || 'Sin módulo'}`);
      }
      if (q.submodule !== currentSubmodule) {
        currentSubmodule = q.submodule;
        submoduleCount++;
        console.log(`  📁 ${submoduleCount}. ${q.submodule || 'Sin submódulo'}`);
      }
      console.log(`    📝 ${q.order_index}. ${q.question_text.substring(0, 70)}...`);
    }
    
    if (currentModule) console.log(`   └─ ${submoduleCount} submódulos`);
    
    // Verificar archivos hardcodeados restantes
    console.log('\n🔍 VERIFICANDO ARCHIVOS HARDCODEADOS RESTANTES:');
    
    const fs = require('fs');
    const path = require('path');
    
    const hardcodedFiles = [
      'lib/mega-diagnostic/etapa2-modulos-data.ts',
      'lib/mega-diagnostic/etapa1-data.ts', 
      'app/onboarding/diagnostico/page.tsx',
      'lib/quiz-data.ts'
    ];
    
    for (const file of hardcodedFiles) {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const questionMatches = content.match(/pregunta[s]?[\s]*[:=]/gi) || [];
        const optionMatches = content.match(/opciones[\s]*[:=]/gi) || [];
        const textMatches = content.match(/["']¿[^"']*["']/g) || [];
        
        console.log(`📄 ${file}:`);
        console.log(`   - Menciones de "pregunta": ${questionMatches.length}`);
        console.log(`   - Menciones de "opciones": ${optionMatches.length}`);
        console.log(`   - Textos con "¿": ${textMatches.length}`);
        
        if (textMatches.length > 5) {
          console.log('   🔴 Este archivo parece contener muchas preguntas sin migrar');
        } else if (textMatches.length > 0) {
          console.log('   🟡 Este archivo podría contener algunas preguntas');
        } else {
          console.log('   ✅ Este archivo parece no tener preguntas pendientes');
        }
      } else {
        console.log(`📄 ${file}: ❌ No encontrado`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

verifyMigratedQuestions();
