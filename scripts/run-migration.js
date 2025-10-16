const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  console.log('🔌 Conectando a MySQL...\n');
  console.log('📋 Usando credenciales:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   Port: ${process.env.DB_PORT || 3306}\n`);

  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✅ Conexión establecida\n');

    // 1. Ver todas las tablas
    console.log('📊 TABLAS EN LA BASE DE DATOS:');
    console.log('================================');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(row => {
      console.log(`  - ${Object.values(row)[0]}`);
    });
    console.log(`\n📈 Total: ${tables.length} tablas\n`);

    // 2. Ver schema ANTES de la migración
    console.log('📋 VERIFICANDO COLUMNAS ANTES DE LA MIGRACIÓN:');
    console.log('================================\n');
    
    const tablesToCheck = [
      'users',
      'tasks', 
      'teams',
      'achievements',
      'rewards',
      'organization_departments',
      'user_badges',
      'user_rewards',
      'user_achievements',
      'organization_invitations'
    ];
    
    const beforeStatus = {};
    
    for (const table of tablesToCheck) {
      try {
        const [columns] = await connection.query(`DESCRIBE ${table}`);
        const hasOrgId = columns.some(col => col.Field === 'organization_id');
        beforeStatus[table] = hasOrgId;
        
        console.log(`${table.padEnd(30)} ${hasOrgId ? '✅ Ya tiene' : '❌ Falta'} organization_id`);
      } catch (err) {
        console.log(`${table.padEnd(30)} ⚠️  Tabla no existe`);
        beforeStatus[table] = null;
      }
    }

    // 3. Confirmar antes de ejecutar
    console.log('\n\n🚀 EJECUTANDO MIGRACIÓN...');
    console.log('================================');
    console.log('⚠️  Esto agregará la columna organization_id a las tablas que no la tengan');
    console.log('💡 La migración es IDEMPOTENTE (segura para ejecutar múltiples veces)\n');
    
    const migrationPath = path.join(__dirname, 'migrations', '001-add-organization-id-columns-safe.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Archivo de migración no encontrado: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Archivo:', migrationPath);
    console.log('📏 Tamaño:', migrationSQL.length, 'bytes');
    console.log('\n⏳ Ejecutando SQL...\n');
    
    // Ejecutar la migración
    await connection.query(migrationSQL);
    
    console.log('✅ Migración ejecutada exitosamente\n');

    // 4. Verificar DESPUÉS de la migración
    console.log('📋 VERIFICANDO CAMBIOS:');
    console.log('================================\n');
    
    let changesCount = 0;
    
    for (const table of tablesToCheck) {
      try {
        const [columns] = await connection.query(`DESCRIBE ${table}`);
        const hasOrgId = columns.some(col => col.Field === 'organization_id');
        
        const wasBefore = beforeStatus[table];
        const isNow = hasOrgId;
        
        let status = '';
        if (wasBefore === null) {
          status = '⚠️  Tabla no existía';
        } else if (!wasBefore && isNow) {
          status = '🆕 AGREGADA organization_id';
          changesCount++;
        } else if (wasBefore && isNow) {
          status = '✅ Ya existía (sin cambios)';
        } else {
          status = '❌ ERROR: No se agregó';
        }
        
        console.log(`${table.padEnd(30)} ${status}`);
      } catch (err) {
        console.log(`${table.padEnd(30)} ⚠️  Error: ${err.message}`);
      }
    }

    // 5. Verificar índices
    console.log('\n\n📊 VERIFICANDO ÍNDICES:');
    console.log('================================\n');
    
    const indexTables = ['users', 'achievements', 'rewards', 'tasks', 'organization_departments'];
    
    for (const table of indexTables) {
      try {
        const [indexes] = await connection.query(`SHOW INDEX FROM ${table}`);
        const hasOrgIndex = indexes.some(idx => 
          idx.Column_name === 'organization_id' || 
          idx.Key_name.includes('org')
        );
        console.log(`${table.padEnd(30)} ${hasOrgIndex ? '✅ Índice creado' : '⚠️  Sin índice'}`);
      } catch (err) {
        console.log(`${table.padEnd(30)} ⚠️  Error verificando`);
      }
    }

    console.log('\n\n🎉 RESUMEN DE LA MIGRACIÓN:');
    console.log('================================');
    console.log(`✅ Migración completada exitosamente`);
    console.log(`📊 Tablas modificadas: ${changesCount}`);
    console.log(`💾 Base de datos: ${process.env.DB_NAME}`);
    console.log(`🔒 Multi-tenant: ACTIVADO\n`);

    if (changesCount === 0) {
      console.log('ℹ️  Nota: Todas las tablas ya tenían organization_id');
      console.log('   La migración es idempotente, por lo que no hay problema.\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR EN LA MIGRACIÓN:');
    console.error('================================');
    console.error('Mensaje:', error.message);
    
    if (error.code) {
      console.error('Código:', error.code);
    }
    
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

runMigration();
