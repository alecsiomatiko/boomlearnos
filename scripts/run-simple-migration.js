const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSimpleMigration() {
  console.log('🔌 Conectando a MySQL en Hostinger...\n');
  console.log('📋 Credenciales:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log(`   Database: ${process.env.DB_NAME}\n`);

  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conexión establecida\n');

    // Tablas a las que agregaremos organization_id
    const tablesToMigrate = [
      { name: 'users', columns: 'organization_id INT NULL, current_organization_id INT NULL' },
      { name: 'achievements', columns: 'organization_id INT NULL' },
      { name: 'rewards', columns: 'organization_id INT NULL' },
      { name: 'tasks', columns: 'organization_id INT NULL' },
      { name: 'teams', columns: 'organization_id INT NULL' },
      { name: 'organization_departments', columns: 'organization_id INT NULL' },
      { name: 'user_badges', columns: 'organization_id INT NULL' },
      { name: 'user_rewards', columns: 'organization_id INT NULL' },
      { name: 'user_achievements', columns: 'organization_id INT NULL' },
      { name: 'organization_invitations', columns: 'organization_id INT NULL' },
      { name: 'daily_checkins', columns: 'organization_id INT NULL' },
      { name: 'user_gems', columns: 'organization_id INT NULL' },
      { name: 'user_medals', columns: 'organization_id INT NULL' },
      { name: 'diagnostic_answers', columns: 'organization_id INT NULL' },
      { name: 'gems_history', columns: 'organization_id INT NULL' }
    ];

    console.log('📋 PROCESANDO TABLAS:');
    console.log('================================\n');

    let addedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    for (const table of tablesToMigrate) {
      try {
        // Verificar si la tabla existe
        const [tables] = await connection.query(
          'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
          [process.env.DB_NAME, table.name]
        );

        if (tables[0].cnt === 0) {
          console.log(`⚠️  ${table.name.padEnd(30)} Tabla no existe - omitiendo`);
          notFoundCount++;
          continue;
        }

        // Verificar si ya tiene organization_id
        const [columns] = await connection.query(
          'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = "organization_id"',
          [process.env.DB_NAME, table.name]
        );

        if (columns[0].cnt > 0) {
          console.log(`ℹ️  ${table.name.padEnd(30)} Ya tiene organization_id`);
          skippedCount++;
          continue;
        }

        // Agregar la columna
        await connection.query(`ALTER TABLE ${table.name} ADD COLUMN ${table.columns}`);
        console.log(`✅ ${table.name.padEnd(30)} organization_id AGREGADA`);
        addedCount++;

      } catch (error) {
        console.error(`❌ ${table.name.padEnd(30)} Error: ${error.message}`);
      }
    }

    // Crear índices
    console.log('\n\n📊 CREANDO ÍNDICES:');
    console.log('================================\n');

    const indexesToCreate = [
      { table: 'users', indexName: 'idx_users_org' },
      { table: 'achievements', indexName: 'idx_achievements_org' },
      { table: 'rewards', indexName: 'idx_rewards_org' },
      { table: 'tasks', indexName: 'idx_tasks_org' },
      { table: 'organization_departments', indexName: 'idx_org_depts_org' },
      { table: 'user_badges', indexName: 'idx_user_badges_org' },
      { table: 'user_rewards', indexName: 'idx_user_rewards_org' },
      { table: 'user_achievements', indexName: 'idx_user_achievements_org' }
    ];

    let indexesCreated = 0;
    let indexesSkipped = 0;

    for (const idx of indexesToCreate) {
      try {
        // Verificar si la tabla existe
        const [tables] = await connection.query(
          'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
          [process.env.DB_NAME, idx.table]
        );

        if (tables[0].cnt === 0) {
          console.log(`⚠️  ${idx.table.padEnd(30)} Tabla no existe - omitiendo índice`);
          continue;
        }

        // Verificar si el índice ya existe
        const [indexes] = await connection.query(
          'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?',
          [process.env.DB_NAME, idx.table, idx.indexName]
        );

        if (indexes[0].cnt > 0) {
          console.log(`ℹ️  ${idx.table.padEnd(30)} Índice ya existe`);
          indexesSkipped++;
          continue;
        }

        // Crear índice
        await connection.query(`CREATE INDEX ${idx.indexName} ON ${idx.table}(organization_id)`);
        console.log(`✅ ${idx.table.padEnd(30)} Índice creado`);
        indexesCreated++;

      } catch (error) {
        // Ignorar errores de índices duplicados
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`ℹ️  ${idx.table.padEnd(30)} Índice ya existe`);
          indexesSkipped++;
        } else {
          console.error(`⚠️  ${idx.table.padEnd(30)} Error creando índice: ${error.message}`);
        }
      }
    }

    console.log('\n\n🎉 RESUMEN DE LA MIGRACIÓN:');
    console.log('================================');
    console.log(`✅ Columnas agregadas: ${addedCount}`);
    console.log(`ℹ️  Columnas ya existentes: ${skippedCount}`);
    console.log(`⚠️  Tablas no encontradas: ${notFoundCount}`);
    console.log(`📊 Índices creados: ${indexesCreated}`);
    console.log(`📊 Índices ya existentes: ${indexesSkipped}`);
    console.log(`💾 Base de datos: ${process.env.DB_NAME}`);
    console.log(`🔒 Multi-tenant: ACTIVADO\n`);

  } catch (error) {
    console.error('\n❌ ERROR FATAL:');
    console.error('================================');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    if (error.sqlMessage) {
      console.error('SQL Error:', error.sqlMessage);
    }
    console.error('\n📍 Stack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada\n');
    }
  }
}

runSimpleMigration();
