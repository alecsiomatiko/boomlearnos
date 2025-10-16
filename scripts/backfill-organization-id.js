const mysql = require('mysql2/promise');
require('dotenv').config();

async function backfillOrganizationId() {
  console.log('🔄 BACKFILL: Asignando organization_id a registros legacy\n');
  console.log('========================================================\n');

  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conectado a la base de datos\n');

    // 1. Obtener la primera organización (o crear una si no existe)
    console.log('📋 Paso 1: Verificando organizaciones...\n');
    
    const [orgs] = await connection.query('SELECT id, name FROM organizations ORDER BY id LIMIT 1');
    
    let defaultOrgId;
    
    if (orgs.length === 0) {
      console.log('⚠️  No hay organizaciones. Creando organización por defecto...');
      
      // Crear organización por defecto
      const [result] = await connection.query(`
        INSERT INTO organizations (name, description, created_at, updated_at) 
        VALUES ('Organización Principal', 'Organización creada automáticamente durante migración', NOW(), NOW())
      `);
      
      defaultOrgId = result.insertId;
      console.log(`✅ Organización creada con ID: ${defaultOrgId}\n`);
    } else {
      defaultOrgId = orgs[0].id;
      console.log(`✅ Usando organización existente: "${orgs[0].name}" (ID: ${defaultOrgId})\n`);
    }

    // 2. Actualizar usuarios sin organization_id
    console.log('📋 Paso 2: Actualizando usuarios...\n');
    
    const [usersUpdate] = await connection.query(`
      UPDATE users 
      SET organization_id = ?, current_organization_id = ?
      WHERE organization_id IS NULL
    `, [defaultOrgId, defaultOrgId]);
    
    console.log(`✅ Usuarios actualizados: ${usersUpdate.affectedRows}\n`);

    // 3. Asegurar que usuarios estén en user_organizations
    console.log('📋 Paso 3: Vinculando usuarios a la organización...\n');
    
    const [users] = await connection.query(`
      SELECT id FROM users WHERE organization_id = ?
    `, [defaultOrgId]);
    
    let linkedCount = 0;
    
    for (const user of users) {
      try {
        await connection.query(`
          INSERT IGNORE INTO user_organizations (user_id, organization_id, role, created_at)
          VALUES (?, ?, 'member', NOW())
        `, [user.id, defaultOrgId]);
        linkedCount++;
      } catch (error) {
        // Ignorar duplicados
      }
    }
    
    console.log(`✅ Usuarios vinculados: ${linkedCount}\n`);

    // 4. Actualizar tablas con organization_id NULL
    const tablesToUpdate = [
      'tasks',
      'achievements',
      'rewards',
      'daily_checkins',
      'gems_history',
      'user_badges',
      'user_rewards',
      'user_achievements',
      'diagnostic_answers'
    ];

    console.log('📋 Paso 4: Actualizando registros en otras tablas...\n');
    
    let totalUpdated = 0;
    
    for (const table of tablesToUpdate) {
      try {
        // Verificar si la tabla existe y tiene la columna
        const [tableExists] = await connection.query(
          'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
          [process.env.DB_NAME, table]
        );

        if (tableExists[0].cnt === 0) continue;

        const [colExists] = await connection.query(
          'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = "organization_id"',
          [process.env.DB_NAME, table]
        );

        if (colExists[0].cnt === 0) continue;

        // Actualizar registros
        const [result] = await connection.query(`
          UPDATE ${table} 
          SET organization_id = ?
          WHERE organization_id IS NULL
        `, [defaultOrgId]);

        if (result.affectedRows > 0) {
          console.log(`✅ ${table.padEnd(30)} ${result.affectedRows} registros actualizados`);
          totalUpdated += result.affectedRows;
        }

      } catch (error) {
        console.error(`❌ ${table.padEnd(30)} Error: ${error.message}`);
      }
    }

    console.log(`\n📊 Total de registros actualizados: ${totalUpdated}\n`);

    // 5. Verificación final
    console.log('\n📋 Paso 5: Verificación final...\n');
    console.log('================================\n');

    const verificaciones = [
      { tabla: 'users', query: 'SELECT COUNT(*) as cnt FROM users WHERE organization_id IS NULL' },
      { tabla: 'tasks', query: 'SELECT COUNT(*) as cnt FROM tasks WHERE organization_id IS NULL' },
      { tabla: 'achievements', query: 'SELECT COUNT(*) as cnt FROM achievements WHERE organization_id IS NULL' },
      { tabla: 'rewards', query: 'SELECT COUNT(*) as cnt FROM rewards WHERE organization_id IS NULL' },
      { tabla: 'gems_history', query: 'SELECT COUNT(*) as cnt FROM gems_history WHERE organization_id IS NULL' }
    ];

    let allClear = true;

    for (const v of verificaciones) {
      try {
        const [result] = await connection.query(v.query);
        const sinOrgId = result[0].cnt;
        
        if (sinOrgId === 0) {
          console.log(`✅ ${v.tabla.padEnd(25)} Sin registros pendientes`);
        } else {
          console.log(`⚠️  ${v.tabla.padEnd(25)} ${sinOrgId} registros aún sin organization_id`);
          allClear = false;
        }
      } catch (error) {
        // Tabla no existe o no tiene la columna
      }
    }

    console.log('\n\n🎉 BACKFILL COMPLETADO\n');
    console.log('================================');
    console.log(`Organization ID usado: ${defaultOrgId}`);
    console.log(`Estado: ${allClear ? '✅ Todos los registros actualizados' : '⚠️  Algunos registros pendientes'}\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada\n');
    }
  }
}

backfillOrganizationId();
