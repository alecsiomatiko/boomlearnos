const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixUserOrganizations() {
  console.log('🔧 CORRIGIENDO RELACIONES USER_ORGANIZATIONS\n');
  console.log('============================================\n');

  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conectado\n');

    // 1. Ver estructura de user_organizations
    console.log('📋 Verificando estructura de user_organizations...\n');
    
    const [columns] = await connection.query(`
      DESCRIBE user_organizations
    `);
    
    console.log('Columnas existentes:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    console.log('');

    // 2. Obtener usuarios
    const [users] = await connection.query(`
      SELECT id, first_name, last_name, email, organization_id, current_organization_id
      FROM users
    `);

    // 3. Crear relaciones (adaptado a la estructura real)
    console.log('\n📋 Creando relaciones...\n');
    
    for (const user of users) {
      const orgId = user.organization_id || user.current_organization_id;
      
      if (orgId) {
        try {
          // Intentar sin created_at primero
          await connection.query(`
            INSERT INTO user_organizations (user_id, organization_id, role)
            VALUES (?, ?, 'admin')
            ON DUPLICATE KEY UPDATE role = 'admin'
          `, [user.id, orgId]);
          
          console.log(`✅ ${user.email} vinculado a org ${orgId}`);
        } catch (error) {
          console.log(`⚠️  ${user.email}: ${error.message}`);
        }
      }
    }

    // 4. Verificar tasks distribution
    console.log('\n\n📋 Verificando distribución de tasks...\n');
    
    const [tasksByOrg] = await connection.query(`
      SELECT 
        t.organization_id,
        o.name as org_name,
        COUNT(*) as task_count
      FROM tasks t
      LEFT JOIN organizations o ON t.organization_id = o.id
      GROUP BY t.organization_id
    `);
    
    console.log('Tasks por organización:');
    tasksByOrg.forEach(row => {
      console.log(`  ${row.org_name || 'NULL'}: ${row.task_count} tasks`);
    });

    // 5. Si todas las tasks están en una org, preguntar si hay que redistribuir
    if (tasksByOrg.length === 1 && tasksByOrg[0].organization_id) {
      console.log('\n\n⚠️  TODAS LAS TASKS ESTÁN EN UNA SOLA ORGANIZACIÓN');
      console.log('\n💡 ¿Necesitas redistribuir las tasks entre las 2 organizaciones?');
      console.log('   Si las tasks fueron creadas por diferentes admins,');
      console.log('   puedo usar el campo assigned_to o created_by para redistribuir.\n');
    }

    // 6. Estado final
    console.log('\n\n📊 ESTADO FINAL:\n');
    console.log('================================');
    
    const [finalCheck] = await connection.query(`
      SELECT 
        u.id,
        u.email,
        u.organization_id,
        o.name as org_name,
        uo.role as user_org_role
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      LEFT JOIN user_organizations uo ON u.id = uo.user_id AND u.organization_id = uo.organization_id
    `);
    
    console.log('\nUsuario                  | Organización              | Role en user_org');
    console.log('-------------------------|---------------------------|------------------');
    finalCheck.forEach(row => {
      console.log(`${row.email.padEnd(24)} | ${(row.org_name || 'NULL').padEnd(25)} | ${row.user_org_role || 'NO VINCULADO'}`);
    });
    
    const [orgCount] = await connection.query('SELECT COUNT(*) as cnt FROM organizations');
    const [userOrgCount] = await connection.query('SELECT COUNT(*) as cnt FROM user_organizations');
    
    console.log('\n\nResumen:');
    console.log(`  ✅ Organizaciones activas: ${orgCount[0].cnt}`);
    console.log(`  ${userOrgCount[0].cnt >= 2 ? '✅' : '⚠️'}  Relaciones user_organizations: ${userOrgCount[0].cnt}`);
    console.log('\n');

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

fixUserOrganizations();
