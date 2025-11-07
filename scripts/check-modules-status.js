const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function checkModulesStatus() {
  let connection;
  
  try {
    console.log('🔍 Conectando a la base de datos...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conexión establecida\n');
    console.log('=== ESTADO DE LOS MÓDULOS DE DIAGNÓSTICO ===\n');

    // Obtener todos los módulos con conteo de preguntas
    const [modules] = await connection.execute(`
      SELECT 
        dm.module_code,
        dm.title,
        dm.description,
        dm.order_index,
        COUNT(DISTINCT ds.id) as submodules_count,
        COUNT(DISTINCT dq.id) as questions_count,
        COUNT(DISTINCT dop.id) as options_count
      FROM diagnostic_modules dm
      LEFT JOIN diagnostic_submodules ds ON dm.id = ds.module_id
      LEFT JOIN diagnostic_questions dq ON ds.id = dq.submodule_id
      LEFT JOIN diagnostic_options dop ON dq.id = dop.question_id
      GROUP BY dm.id, dm.module_code, dm.title, dm.description, dm.order_index
      ORDER BY dm.order_index
    `);

    modules.forEach((module, index) => {
      const status = module.questions_count > 0 ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${module.module_code}: ${module.title}`);
      console.log(`   📊 Submódulos: ${module.submodules_count}`);
      console.log(`   ❓ Preguntas: ${module.questions_count}`);
      console.log(`   📝 Opciones: ${module.options_count}`);
      console.log(`   📄 Descripción: ${module.description || 'Sin descripción'}`);
      console.log('');
    });

    // Resumen
    const totalModules = modules.length;
    const modulesWithQuestions = modules.filter(m => m.questions_count > 0).length;
    const modulesWithoutQuestions = modules.filter(m => m.questions_count === 0).length;
    const totalQuestions = modules.reduce((sum, m) => sum + parseInt(m.questions_count), 0);

    console.log('\n=== RESUMEN ===');
    console.log(`📦 Total de módulos: ${totalModules}`);
    console.log(`✅ Módulos con preguntas: ${modulesWithQuestions}`);
    console.log(`❌ Módulos sin preguntas: ${modulesWithoutQuestions}`);
    console.log(`❓ Total de preguntas: ${totalQuestions}`);
    
    if (modulesWithoutQuestions > 0) {
      console.log('\n⚠️  MÓDULOS QUE NECESITAN PREGUNTAS:');
      modules
        .filter(m => m.questions_count === 0)
        .forEach(m => {
          console.log(`   • ${m.module_code}: ${m.title}`);
        });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkModulesStatus();
