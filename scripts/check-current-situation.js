const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkCurrentSituation() {
  console.log('🔍 VERIFICANDO SITUACIÓN ACTUAL\n');
  console.log('================================\n');

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

    // 1. Ver todas las organizaciones
    console.log('📊 ORGANIZACIONES:\n');
    console.log('ID | Nombre                     | Creada');
    console.log('---|----------------------------|-------------------');
    
    const [orgs] = await connection.query(`
      SELECT id, name, created_at 
      FROM organizations 
      ORDER BY id
    `);
    
    orgs.forEach(org => {
      const date = new Date(org.created_at).toLocaleDateString();
      console.log(`${String(org.id).padStart(2)} | ${String(org.name).padEnd(26)} | ${date}`);
    });
    console.log(`\nTotal: ${orgs.length} organizaciones\n`);

    // 2. Ver usuarios y sus organizaciones
    console.log('\n👥 USUARIOS:\n');
    console.log('ID | Nombre                     | Email                          | Role  | Org ID | Current Org');
    console.log('---|----------------------------|--------------------------------|-------|--------|-------------');
    
    const [users] = await connection.query(`
      SELECT id, first_name, last_name, email, role, organization_id, current_organization_id
      FROM users 
      ORDER BY id
    `);
    
    users.forEach(user => {
      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sin nombre';
      console.log(
        `${String(user.id).padStart(2)} | ${name.padEnd(26)} | ${String(user.email).padEnd(30)} | ${String(user.role).padEnd(5)} | ${String(user.organization_id || 'NULL').padStart(6)} | ${String(user.current_organization_id || 'NULL').padStart(11)}`
      );
    });
    console.log(`\nTotal: ${users.length} usuarios\n`);

    // 3. Ver relación user_organizations
    console.log('\n🔗 RELACIÓN USUARIOS-ORGANIZACIONES:\n');
    console.log('User ID | Org ID | Role   | Usuario                  | Organización');
    console.log('--------|--------|--------|--------------------------|----------------------------');
    
    const [userOrgs] = await connection.query(`
      SELECT 
        uo.user_id,
        uo.organization_id,
        uo.role,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        o.name as org_name
      FROM user_organizations uo
      LEFT JOIN users u ON uo.user_id = u.id
      LEFT JOIN organizations o ON uo.organization_id = o.id
      ORDER BY uo.user_id, uo.organization_id
    `);
    
    if (userOrgs.length === 0) {
      console.log('⚠️  No hay relaciones en user_organizations\n');
    } else {
      userOrgs.forEach(rel => {
        console.log(
          `${String(rel.user_id).padStart(7)} | ${String(rel.organization_id).padStart(6)} | ${String(rel.role).padEnd(6)} | ${String(rel.user_name || 'NULL').padEnd(24)} | ${rel.org_name || 'NULL'}`
        );
      });
      console.log(`\nTotal: ${userOrgs.length} relaciones\n`);
    }

    // 4. Ver tasks y su org_id
    console.log('\n📋 TASKS (distribution por organización):\n');
    
    const [tasks] = await connection.query(`
      SELECT 
        organization_id,
        COUNT(*) as count,
        o.name as org_name
      FROM tasks t
      LEFT JOIN organizations o ON t.organization_id = o.id
      GROUP BY organization_id
      ORDER BY organization_id
    `);
    
    if (tasks.length === 0) {
      console.log('⚠️  No hay tareas\n');
    } else {
      console.log('Org ID | Count | Organización');
      console.log('-------|-------|----------------------------');
      tasks.forEach(t => {
        console.log(`${String(t.organization_id || 'NULL').padStart(6)} | ${String(t.count).padStart(5)} | ${t.org_name || 'NULL'}`);
      });
    }

    // 5. Ver achievements y rewards
    console.log('\n\n🏆 ACHIEVEMENTS:\n');
    const [achievements] = await connection.query(`
      SELECT organization_id, COUNT(*) as count
      FROM achievements
      GROUP BY organization_id
    `);
    
    achievements.forEach(a => {
      console.log(`Org ${a.organization_id || 'NULL'}: ${a.count} achievements`);
    });

    console.log('\n\n💎 REWARDS:\n');
    const [rewards] = await connection.query(`
      SELECT organization_id, COUNT(*) as count
      FROM rewards
      GROUP BY organization_id
    `);
    
    rewards.forEach(r => {
      console.log(`Org ${r.organization_id || 'NULL'}: ${r.count} rewards`);
    });

    console.log('\n\n📊 GEMS HISTORY:\n');
    const [gemsHistory] = await connection.query(`
      SELECT organization_id, COUNT(*) as count, SUM(gems_amount) as total_gems
      FROM gems_history
      GROUP BY organization_id
    `);
    
    if (gemsHistory.length === 0) {
      console.log('⚠️  No hay historial de gemas\n');
    } else {
      gemsHistory.forEach(g => {
        console.log(`Org ${g.organization_id || 'NULL'}: ${g.count} registros, ${g.total_gems} gemas totales`);
      });
    }

    console.log('\n\n════════════════════════════════════════════\n');
    console.log('🎯 ANÁLISIS:\n');
    
    if (orgs.length > 1 && users.length >= orgs.length) {
      console.log('⚠️  PROBLEMA DETECTADO:');
      console.log(`   - Tienes ${orgs.length} organizaciones`);
      console.log(`   - Tienes ${users.length} usuarios`);
      console.log('   - El backfill asignó TODO a una sola organización\n');
      console.log('💡 SOLUCIÓN:');
      console.log('   1. Identificar qué usuario es admin de qué organización');
      console.log('   2. Reasignar tasks, achievements, rewards a las orgs correctas');
      console.log('   3. Basarse en el user_id o contexto del dato\n');
    } else {
      console.log('✅ Situación parece correcta o solo hay 1 organización\n');
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

checkCurrentSituation();
