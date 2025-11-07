const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function migrateOrganizationId() {
  let connection;
  
  try {
    console.log('🚀 Iniciando migración: Agregar organization_id a user_responses...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conexión establecida\n');

    // Paso 1: Agregar columna organization_id
    console.log('📝 Paso 1: Agregando columna organization_id...');
    try {
      await connection.execute(`
        ALTER TABLE user_responses 
        ADD COLUMN organization_id VARCHAR(36) NULL AFTER user_id
      `);
      console.log('✅ Columna agregada');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Columna ya existe, continuando...');
      } else {
        throw err;
      }
    }

    // Paso 2: Agregar índice
    console.log('\n📝 Paso 2: Agregando índice...');
    try {
      await connection.execute(`
        ALTER TABLE user_responses 
        ADD INDEX idx_organization_id (organization_id)
      `);
      console.log('✅ Índice agregado');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Índice ya existe, continuando...');
      } else {
        throw err;
      }
    }

    // Paso 3: Actualizar registros existentes
    console.log('\n📝 Paso 3: Actualizando registros existentes...');
    const [updateResult] = await connection.execute(`
      UPDATE user_responses ur
      INNER JOIN users u ON ur.user_id = u.id
      SET ur.organization_id = u.current_organization_id
      WHERE ur.organization_id IS NULL AND u.current_organization_id IS NOT NULL
    `);
    console.log(`✅ ${updateResult.affectedRows} registros actualizados`);

    // Verificar registros sin organization_id
    const [nullOrgs] = await connection.execute(`
      SELECT COUNT(*) as count FROM user_responses WHERE organization_id IS NULL
    `);
    const nullCount = nullOrgs[0].count;
    
    if (nullCount > 0) {
      console.log(`\n⚠️  ADVERTENCIA: ${nullCount} registros sin organization_id`);
      console.log('   Estos registros necesitan ser asignados manualmente o eliminados');
    } else {
      console.log('\n✅ Todos los registros tienen organization_id');
      
      // Paso 4: Hacer columna NOT NULL
      console.log('\n📝 Paso 4: Haciendo columna NOT NULL...');
      await connection.execute(`
        ALTER TABLE user_responses 
        MODIFY COLUMN organization_id VARCHAR(36) NOT NULL
      `);
      console.log('✅ Columna ahora es NOT NULL');
    }

    // Paso 5: Agregar Foreign Key
    console.log('\n📝 Paso 5: Agregando Foreign Key...');
    try {
      await connection.execute(`
        ALTER TABLE user_responses 
        ADD CONSTRAINT fk_user_responses_organization 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      `);
      console.log('✅ Foreign Key agregada');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Foreign Key ya existe, continuando...');
      } else {
        throw err;
      }
    }

    // Paso 6: Agregar índice único
    console.log('\n📝 Paso 6: Agregando índice único (user + org + question)...');
    try {
      await connection.execute(`
        ALTER TABLE user_responses 
        ADD UNIQUE KEY unique_user_org_question (user_id, organization_id, question_id)
      `);
      console.log('✅ Índice único agregado');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Índice único ya existe, continuando...');
      } else {
        throw err;
      }
    }

    // Verificación final
    console.log('\n\n=== VERIFICACIÓN FINAL ===');
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_responses,
        COUNT(DISTINCT organization_id) as total_organizations,
        COUNT(DISTINCT user_id) as total_users
      FROM user_responses
    `);
    
    console.log('✅ Migración completada exitosamente!');
    console.log(`📊 Total de respuestas: ${stats[0].total_responses}`);
    console.log(`🏢 Total de organizaciones: ${stats[0].total_organizations}`);
    console.log(`👥 Total de usuarios: ${stats[0].total_users}`);

  } catch (error) {
    console.error('\n❌ Error en la migración:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateOrganizationId();
