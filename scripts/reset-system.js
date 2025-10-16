require('dotenv').config();
const mysql = require('mysql2/promise');

async function resetSystem() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('🔄 REINICIANDO SISTEMA COMPLETO\n');
  console.log('================================\n');

  try {
    // 1. Vincular admin@supernova.com
    console.log('1️⃣ Vinculando admin@supernova.com...');
    const [supernova] = await connection.query(
      'SELECT id, organization_id FROM users WHERE email = ?',
      ['admin@supernova.com']
    );

    if (supernova.length > 0) {
      const userId = supernova[0].id;
      const orgId = supernova[0].organization_id;

      // Verificar si ya existe
      const [exists] = await connection.query(
        'SELECT * FROM user_organizations WHERE user_id = ? AND organization_id = ?',
        [userId, orgId]
      );

      if (exists.length === 0) {
        const userOrgId = require('crypto').randomUUID();
        await connection.query(
          'INSERT INTO user_organizations (id, user_id, organization_id, role, joined_at) VALUES (?, ?, ?, ?, NOW())',
          [userOrgId, userId, orgId, 'admin']
        );
        console.log('   ✅ admin@supernova.com vinculado como admin\n');
      } else {
        console.log('   ✅ Ya estaba vinculado\n');
      }
    }

    // 2. BORRAR TODO
    console.log('2️⃣ BORRANDO TODOS LOS DATOS...\n');

    // Gems history
    const [gemsResult] = await connection.query('DELETE FROM gems_history');
    console.log(`   🗑️ Gemas borradas: ${gemsResult.affectedRows}`);

    // User badges
    const [badgesResult] = await connection.query('DELETE FROM user_badges');
    console.log(`   🗑️ Badges borrados: ${badgesResult.affectedRows}`);

    // User achievements
    const [userAchResult] = await connection.query('DELETE FROM user_achievements');
    console.log(`   🗑️ User achievements borrados: ${userAchResult.affectedRows}`);

    // User rewards
    const [userRewResult] = await connection.query('DELETE FROM user_rewards');
    console.log(`   🗑️ User rewards borrados: ${userRewResult.affectedRows}`);

    // Daily checkins
    const [checkinsResult] = await connection.query('DELETE FROM daily_checkins');
    console.log(`   🗑️ Checkins borrados: ${checkinsResult.affectedRows}`);

    // Tasks
    const [tasksResult] = await connection.query('DELETE FROM tasks');
    console.log(`   🗑️ Tasks borradas: ${tasksResult.affectedRows}`);

    // Achievements (plantillas)
    const [achResult] = await connection.query('DELETE FROM achievements');
    console.log(`   🗑️ Achievements borrados: ${achResult.affectedRows}`);

    // Rewards (plantillas)
    const [rewResult] = await connection.query('DELETE FROM rewards');
    console.log(`   🗑️ Rewards borrados: ${rewResult.affectedRows}`);

    console.log('   ✅ Todos los datos borrados\n');

    // 3. Verificación final
    console.log('3️⃣ VERIFICACIÓN FINAL\n');

    const [userOrgs] = await connection.query(`
      SELECT u.email, o.name as org_name, uo.role
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      LEFT JOIN user_organizations uo ON u.id = uo.user_id
      WHERE u.role = 'admin'
    `);

    console.log('👥 USUARIOS ADMIN:');
    userOrgs.forEach(u => {
      console.log(`   ${u.email.padEnd(25)} | ${u.org_name.padEnd(20)} | ${u.role || 'NO VINCULADO'}`);
    });

    console.log('\n📊 CONTEO FINAL:');
    const tables = [
      'gems_history',
      'user_badges', 
      'user_achievements',
      'user_rewards',
      'daily_checkins',
      'tasks',
      'achievements',
      'rewards'
    ];

    for (const table of tables) {
      const [count] = await connection.query(`SELECT COUNT(*) as total FROM ${table}`);
      console.log(`   ${table.padEnd(20)}: ${count[0].total}`);
    }

    console.log('\n✅ SISTEMA RESETEADO COMPLETAMENTE');
    console.log('🎯 Ambas organizaciones empiezan desde 0\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

resetSystem();
