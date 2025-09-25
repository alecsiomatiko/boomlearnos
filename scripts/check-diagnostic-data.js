const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno del archivo .env.local
function loadEnv() {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim().replace(/['"]/g, '');
      }
    });
    return env;
  } catch (error) {
    console.error('Error cargando .env.local:', error.message);
    return {};
  }
}

async function executeQuery(query, params = []) {
  const env = loadEnv();
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT || 3306,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });
  
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } finally {
    await connection.end();
  }
}

async function checkDiagnosticData() {
  try {
    console.log('🔍 Verificando datos del sistema de diagnóstico...\n');

    // Verificar módulos disponibles
    console.log('=== MÓDULOS DISPONIBLES ===');
    const modules = await executeQuery('SELECT * FROM diagnostic_modules');
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.module_code}: ${module.title}`);
      console.log(`   Descripción: ${module.description}`);
      console.log(`   Tiempo estimado: ${module.estimated_time_minutes} min`);
      console.log(`   Activo: ${module.is_active ? 'Sí' : 'No'}`);
    });

    // Verificar submódulos
    console.log('\n=== SUBMÓDULOS ===');
    const submodules = await executeQuery('SELECT * FROM diagnostic_submodules ORDER BY order_index');
    submodules.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.submodule_code}: ${sub.title}`);
    });

    // Verificar si el usuario actual ha completado algo
    const userId = '2f7b7b9d-8dad-11f0-a6cb-1c4e310eb252'; // Del resultado anterior
    console.log(`\n=== DATOS DEL USUARIO ${userId} ===`);
    
    // Onboarding
    const onboarding = await executeQuery('SELECT * FROM onboarding_diagnostics WHERE user_id = ?', [userId]);
    console.log(`Onboarding completado: ${onboarding.length > 0 ? 'Sí' : 'No'}`);
    if (onboarding.length > 0) {
      console.log(`Fecha: ${onboarding[0].created_at}`);
      const answers = JSON.parse(onboarding[0].diagnostic_answers);
      console.log(`Respuestas: ${Object.keys(answers).length} preguntas respondidas`);
    }

    // Respuestas del mega diagnóstico
    const megaAnswers = await executeQuery('SELECT * FROM diagnostic_answers WHERE user_id = ?', [userId]);
    console.log(`Respuestas mega diagnóstico: ${megaAnswers.length}`);

    // Organización del usuario
    const organization = await executeQuery('SELECT * FROM organizations WHERE owner_id = ?', [userId]);
    console.log(`Organización creada: ${organization.length > 0 ? 'Sí' : 'No'}`);
    if (organization.length > 0) {
      console.log(`Nombre: ${organization[0].name}`);
      console.log(`Identidad completada: ${organization[0].identity_completed ? 'Sí' : 'No'}`);
      console.log(`Diagnóstico completado: ${organization[0].diagnostic_completed ? 'Sí' : 'No'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDiagnosticData();
