const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkLegacyData() {
  console.log('🔍 VERIFICANDO DATOS LEGACY (sin organization_id)\n');
  console.log('================================================\n');

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

    // Tablas con organization_id
    const tablesToCheck = [
      'users',
      'tasks',
      'achievements',
      'rewards',
      'organization_departments',
      'user_badges',
      'user_rewards',
      'user_achievements',
      'organization_invitations',
      'daily_checkins',
      'user_gems',
      'user_medals',
      'diagnostic_answers',
      'gems_history'
    ];

    console.log('📊 REGISTROS SIN organization_id:\n');
    console.log('Tabla                          | Total | Sin org_id | % Sin org');
    console.log('------------------------------|-------|-----------|------------');

    let totalNeedingOrgId = 0;
    const tablesNeedingUpdate = [];

    for (const table of tablesToCheck) {
      try {
        // Verificar si la tabla existe
        const [tableExists] = await connection.query(
          'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
          [process.env.DB_NAME, table]
        );

        if (tableExists[0].cnt === 0) {
          console.log(`${table.padEnd(30)} | N/A   | (no existe) |`);
          continue;
        }

        // Verificar si tiene organization_id
        const [colExists] = await connection.query(
          'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = "organization_id"',
          [process.env.DB_NAME, table]
        );

        if (colExists[0].cnt === 0) {
          console.log(`${table.padEnd(30)} | N/A   | (sin columna) |`);
          continue;
        }

        // Contar registros totales
        const [totalRows] = await connection.query(`SELECT COUNT(*) as cnt FROM ${table}`);
        const total = totalRows[0].cnt;

        // Contar registros sin organization_id
        const [nullRows] = await connection.query(`SELECT COUNT(*) as cnt FROM ${table} WHERE organization_id IS NULL`);
        const withoutOrgId = nullRows[0].cnt;

        const percentage = total > 0 ? ((withoutOrgId / total) * 100).toFixed(1) : '0.0';

        const status = withoutOrgId > 0 ? '⚠️' : '✅';
        console.log(`${status} ${table.padEnd(28)} | ${String(total).padStart(5)} | ${String(withoutOrgId).padStart(9)} | ${String(percentage).padStart(9)}%`);

        if (withoutOrgId > 0) {
          totalNeedingOrgId += withoutOrgId;
          tablesNeedingUpdate.push({ table, count: withoutOrgId });
        }

      } catch (error) {
        console.log(`❌ ${table.padEnd(28)} | Error: ${error.message}`);
      }
    }

    console.log('\n\n📋 RESUMEN:\n');
    console.log('================================');
    console.log(`Total de registros sin organization_id: ${totalNeedingOrgId}`);
    console.log(`Tablas que necesitan actualización: ${tablesNeedingUpdate.length}\n`);

    if (tablesNeedingUpdate.length > 0) {
      console.log('⚠️  TABLAS QUE NECESITAN ACTUALIZACIÓN:\n');
      tablesNeedingUpdate.forEach(t => {
        console.log(`   - ${t.table}: ${t.count} registros`);
      });
      
      console.log('\n💡 RECOMENDACIÓN:');
      console.log('   Ejecuta el script de backfill para asignar organization_id');
      console.log('   Comando: node scripts/backfill-organization-id.js\n');
    } else {
      console.log('✅ ¡Perfecto! Todos los registros tienen organization_id asignado\n');
    }

    // Verificar organizaciones existentes
    console.log('\n📊 ORGANIZACIONES EXISTENTES:\n');
    console.log('================================');
    
    const [orgs] = await connection.query(`
      SELECT id, name, admin_user_id, created_at 
      FROM organizations 
      ORDER BY id
    `);

    if (orgs.length === 0) {
      console.log('⚠️  No hay organizaciones creadas');
      console.log('💡 Necesitas crear al menos una organización para asignar a los registros\n');
    } else {
      console.log('ID  | Nombre                     | Admin ID | Creada');
      console.log('----|----------------------------|----------|-------------------');
      orgs.forEach(org => {
        const date = new Date(org.created_at).toLocaleDateString();
        console.log(`${String(org.id).padStart(3)} | ${String(org.name).padEnd(26)} | ${String(org.admin_user_id).padStart(8)} | ${date}`);
      });
      console.log(`\n✅ Total: ${orgs.length} organizaciones\n`);
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada\n');
    }
  }
}

checkLegacyData();
