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

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...\n');

    // Verificar estructura de organizations
    console.log('=== TABLA ORGANIZATIONS ===');
    try {
      const orgStructure = await executeQuery('DESCRIBE organizations');
      console.log('Columnas encontradas:');
      orgStructure.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

      const orgData = await executeQuery('SELECT * FROM organizations LIMIT 3');
      console.log(`\nRegistros en organizations: ${orgData.length}`);
      if (orgData.length > 0) {
        console.log('Ejemplo de datos:', Object.keys(orgData[0]).join(', '));
      }
    } catch (error) {
      console.log('❌ Error al verificar organizations:', error.message);
    }

    // Verificar estructura de onboarding_diagnostics
    console.log('\n=== TABLA ONBOARDING_DIAGNOSTICS ===');
    try {
      const onboardingStructure = await executeQuery('DESCRIBE onboarding_diagnostics');
      console.log('Columnas encontradas:');
      onboardingStructure.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

      const onboardingData = await executeQuery('SELECT * FROM onboarding_diagnostics LIMIT 5');
      console.log(`\nRegistros en onboarding_diagnostics: ${onboardingData.length}`);
      if (onboardingData.length > 0) {
        console.log('Datos de ejemplo:');
        onboardingData.forEach((record, index) => {
          console.log(`  ${index + 1}. user_id: ${record.user_id}, completed: ${record.completed_at ? 'Sí' : 'No'}`);
        });
      }
    } catch (error) {
      console.log('❌ Error al verificar onboarding_diagnostics:', error.message);
    }

    // Verificar usuarios
    console.log('\n=== TABLA USERS ===');
    try {
      const users = await executeQuery('SELECT id, email, name FROM users LIMIT 5');
      console.log(`Usuarios encontrados: ${users.length}`);
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.id} - ${user.email} (${user.name || 'Sin nombre'})`);
      });
    } catch (error) {
      console.log('❌ Error al verificar users:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkDatabaseStructure();
