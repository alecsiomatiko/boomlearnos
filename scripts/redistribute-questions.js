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

async function redistributeQuestions() {
  console.log('🔄 REDISTRIBUYENDO PREGUNTAS A SUS MÓDULOS CORRECTOS');
  console.log('=' .repeat(60));
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Conectado a MySQL');

    // Mapeo de prefijos de preguntas a códigos de módulo
    const questionToModuleMap = {
      'm1s': 'MOD1',  // MÓDULO 1: Organización y Roles
      'm2s': 'MOD2',  // MÓDULO 2: Procesos y Sistemas
      'm3s': 'MOD3',  // MÓDULO 3: Ventas y Marketing
      'm4s': 'MOD4',  // MÓDULO 4: Finanzas y Métricas
      'm5s': 'MOD5',  // MÓDULO 5: Liderazgo y Cultura
      'm6s': 'MOD6',  // MÓDULO 6: Innovación y Producto
      'm7s': 'MOD7',  // MÓDULO 7: Operaciones y Calidad
      'm8s': 'MOD8',  // MÓDULO 8: Recursos Humanos
      'm9s': 'MOD9',  // MÓDULO 9: Tecnología y Sistemas
      'm10s': 'MOD10', // MÓDULO 10: Estrategia Competitiva
      'm11s': 'MOD11', // MÓDULO 11: Sostenibilidad y RSE
      'm12s': 'MOD12', // MÓDULO 12: Expansión y Crecimiento
      'm13s': 'MOD13'  // MÓDULO 13: Evaluación Integral
    };

    // Obtener todas las preguntas que están en el módulo 13
    const [questionsInMod13] = await connection.execute(`
      SELECT q.id, q.question_code, q.submodule_id, ds.title as submodule_title
      FROM diagnostic_questions q
      JOIN diagnostic_submodules ds ON q.submodule_id = ds.id
      JOIN diagnostic_modules dm ON ds.module_id = dm.id
      WHERE dm.module_code = 'MOD13'
      ORDER BY q.question_code
    `);

    console.log(`📊 Encontradas ${questionsInMod13.length} preguntas en MÓDULO 13 para redistribuir`);

    let questionsReassigned = 0;

    for (const question of questionsInMod13) {
      const questionCode = question.question_code;
      
      // Determinar a qué módulo pertenece basándose en el código
      let targetModuleCode = null;
      
      for (const [prefix, moduleCode] of Object.entries(questionToModuleMap)) {
        if (questionCode.startsWith(prefix)) {
          targetModuleCode = moduleCode;
          break;
        }
      }

      if (targetModuleCode && targetModuleCode !== 'MOD13') {
        // Buscar el módulo destino
        const [targetModule] = await connection.execute(
          'SELECT id FROM diagnostic_modules WHERE module_code = ?',
          [targetModuleCode]
        );

        if (targetModule.length > 0) {
          const targetModuleId = targetModule[0].id;

          // Buscar un submódulo en el módulo destino
          const [targetSubmodules] = await connection.execute(
            'SELECT id FROM diagnostic_submodules WHERE module_id = ? LIMIT 1',
            [targetModuleId]
          );

          if (targetSubmodules.length > 0) {
            const targetSubmoduleId = targetSubmodules[0].id;

            // Mover la pregunta al submódulo correcto
            await connection.execute(
              'UPDATE diagnostic_questions SET submodule_id = ? WHERE id = ?',
              [targetSubmoduleId, question.id]
            );

            questionsReassigned++;
            console.log(`  ✅ ${questionCode} → ${targetModuleCode}`);
          }
        }
      }
    }

    // Verificar la redistribución
    console.log('\n📊 VERIFICANDO REDISTRIBUCIÓN:');
    
    const [moduleQuestionCounts] = await connection.execute(`
      SELECT 
        dm.module_code,
        dm.title,
        COUNT(q.id) as question_count
      FROM diagnostic_modules dm
      LEFT JOIN diagnostic_submodules ds ON dm.id = ds.module_id
      LEFT JOIN diagnostic_questions q ON ds.id = q.submodule_id
      GROUP BY dm.id, dm.module_code, dm.title
      ORDER BY dm.module_code
    `);

    moduleQuestionCounts.forEach(module => {
      const icon = module.question_count > 0 ? '✅' : '⚪';
      console.log(`   ${icon} ${module.module_code}: ${module.question_count} preguntas`);
    });

    console.log(`\n🎉 ¡REDISTRIBUCIÓN COMPLETADA!`);
    console.log(`📈 Preguntas reasignadas: ${questionsReassigned}`);
    
    // Encontrar el primer módulo con preguntas para pruebas
    const firstModuleWithQuestions = moduleQuestionCounts.find(m => m.question_count > 0);
    if (firstModuleWithQuestions) {
      const [moduleDetails] = await connection.execute(
        'SELECT id FROM diagnostic_modules WHERE module_code = ?',
        [firstModuleWithQuestions.module_code]
      );
      
      if (moduleDetails.length > 0) {
        console.log(`\n🎯 PRUEBA RECOMENDADA:`);
        console.log(`   URL: http://localhost:3000/api/diagnostic/questions?moduleId=${moduleDetails[0].id}`);
      }
    }

    await connection.end();
    console.log('🔌 Conexión cerrada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

redistributeQuestions();
