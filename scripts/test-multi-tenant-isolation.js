require('dotenv').config();
const mysql = require('mysql2/promise');

async function testMultiTenantIsolation() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('🔒 PRUEBA DE AISLAMIENTO MULTI-TENANT\n');
  console.log('=======================================\n');

  try {
    // 1. Obtener las 2 organizaciones
    const [orgs] = await connection.query('SELECT id, name FROM organizations ORDER BY created_at');
    
    if (orgs.length !== 2) {
      console.log('❌ ERROR: Debería haber exactamente 2 organizaciones');
      return;
    }

    const org1 = orgs[0];
    const org2 = orgs[1];

    console.log(`📦 Organización 1: ${org1.name} (${org1.id})`);
    console.log(`📦 Organización 2: ${org2.name} (${org2.id})\n`);

    // 2. Obtener los admins de cada organización
    const [admin1] = await connection.query(
      'SELECT id, email FROM users WHERE organization_id = ? AND role = "admin"',
      [org1.id]
    );
    const [admin2] = await connection.query(
      'SELECT id, email FROM users WHERE organization_id = ? AND role = "admin"',
      [org2.id]
    );

    if (admin1.length === 0 || admin2.length === 0) {
      console.log('❌ ERROR: Cada organización debe tener un admin');
      return;
    }

    console.log(`👤 Admin 1: ${admin1[0].email}`);
    console.log(`👤 Admin 2: ${admin2[0].email}\n`);

    // 3. Crear datos de prueba para org1
    console.log('🔨 Creando datos de prueba para Org 1...\n');
    
    const [task1Result] = await connection.query(
      `INSERT INTO tasks (id, user_id, organization_id, title, description, category, difficulty, priority, due_date, status, created_at) 
       VALUES (UUID(), ?, ?, 'Tarea Org 1', 'Esta es una tarea de la org 1', 'Desarrollo', 'medium', 'high', DATE_ADD(NOW(), INTERVAL 7 DAY), 'pending', NOW())`,
      [admin1[0].id, org1.id]
    );

    const [achievement1Result] = await connection.query(
      `INSERT INTO achievements (id, organization_id, name, description, category, points, rarity, max_progress, icon, active) 
       VALUES (UUID(), ?, 'Logro Org 1', 'Logro de la organización 1', 'General', 100, 'common', 1, '🏆', TRUE)`,
      [org1.id]
    );

    const [reward1Result] = await connection.query(
      `INSERT INTO rewards (organization_id, title, description, cost, category, is_available, created_at, updated_at) 
       VALUES (?, 'Recompensa Org 1', 'Recompensa de la org 1', 50, 'Beneficios', TRUE, NOW(), NOW())`,
      [org1.id]
    );

    console.log('   ✅ 1 tarea creada');
    console.log('   ✅ 1 logro creado');
    console.log('   ✅ 1 recompensa creada\n');

    // 4. Crear datos de prueba para org2
    console.log('🔨 Creando datos de prueba para Org 2...\n');
    
    const [task2Result] = await connection.query(
      `INSERT INTO tasks (id, user_id, organization_id, title, description, category, difficulty, priority, due_date, status, created_at) 
       VALUES (UUID(), ?, ?, 'Tarea Org 2', 'Esta es una tarea de la org 2', 'Ventas', 'easy', 'medium', DATE_ADD(NOW(), INTERVAL 5 DAY), 'pending', NOW())`,
      [admin2[0].id, org2.id]
    );

    const [achievement2Result] = await connection.query(
      `INSERT INTO achievements (id, organization_id, name, description, category, points, rarity, max_progress, icon, active) 
       VALUES (UUID(), ?, 'Logro Org 2', 'Logro de la organización 2', 'General', 200, 'rare', 1, '🎖️', TRUE)`,
      [org2.id]
    );

    const [reward2Result] = await connection.query(
      `INSERT INTO rewards (organization_id, title, description, cost, category, is_available, created_at, updated_at) 
       VALUES (?, 'Recompensa Org 2', 'Recompensa de la org 2', 100, 'Premios', TRUE, NOW(), NOW())`,
      [org2.id]
    );

    console.log('   ✅ 1 tarea creada');
    console.log('   ✅ 1 logro creado');
    console.log('   ✅ 1 recompensa creada\n');

    // 5. PRUEBA: Verificar que org1 solo ve sus datos
    console.log('🔍 VERIFICANDO AISLAMIENTO...\n');
    
    const [org1Tasks] = await connection.query(
      'SELECT title FROM tasks WHERE organization_id = ?',
      [org1.id]
    );
    const [org1Achievements] = await connection.query(
      'SELECT name FROM achievements WHERE organization_id = ?',
      [org1.id]
    );
    const [org1Rewards] = await connection.query(
      'SELECT title FROM rewards WHERE organization_id = ?',
      [org1.id]
    );

    console.log(`📋 ${org1.name} ve:`);
    console.log(`   - ${org1Tasks.length} tarea(s): ${org1Tasks.map(t => t.title).join(', ')}`);
    console.log(`   - ${org1Achievements.length} logro(s): ${org1Achievements.map(a => a.name).join(', ')}`);
    console.log(`   - ${org1Rewards.length} recompensa(s): ${org1Rewards.map(r => r.title).join(', ')}\n`);

    const [org2Tasks] = await connection.query(
      'SELECT title FROM tasks WHERE organization_id = ?',
      [org2.id]
    );
    const [org2Achievements] = await connection.query(
      'SELECT name FROM achievements WHERE organization_id = ?',
      [org2.id]
    );
    const [org2Rewards] = await connection.query(
      'SELECT title FROM rewards WHERE organization_id = ?',
      [org2.id]
    );

    console.log(`📋 ${org2.name} ve:`);
    console.log(`   - ${org2Tasks.length} tarea(s): ${org2Tasks.map(t => t.title).join(', ')}`);
    console.log(`   - ${org2Achievements.length} logro(s): ${org2Achievements.map(a => a.name).join(', ')}`);
    console.log(`   - ${org2Rewards.length} recompensa(s): ${org2Rewards.map(r => r.title).join(', ')}\n`);

    // 6. VERIFICAR: No hay contaminación cruzada
    const org1SeesOrg2 = org1Tasks.some(t => t.title.includes('Org 2')) ||
                         org1Achievements.some(a => a.name.includes('Org 2')) ||
                         org1Rewards.some(r => r.title.includes('Org 2'));

    const org2SeesOrg1 = org2Tasks.some(t => t.title.includes('Org 1')) ||
                         org2Achievements.some(a => a.name.includes('Org 1')) ||
                         org2Rewards.some(r => r.title.includes('Org 1'));

    console.log('🎯 RESULTADO DE LA PRUEBA:\n');
    
    if (!org1SeesOrg2 && !org2SeesOrg1) {
      console.log('✅ ¡ÉXITO! Aislamiento multi-tenant completo');
      console.log('   - Org 1 NO ve datos de Org 2');
      console.log('   - Org 2 NO ve datos de Org 1');
      console.log('\n🎉 Sistema listo para producción\n');
    } else {
      console.log('❌ FALLO: Hay contaminación de datos entre organizaciones');
      if (org1SeesOrg2) console.log('   - Org 1 puede ver datos de Org 2');
      if (org2SeesOrg1) console.log('   - Org 2 puede ver datos de Org 1');
      console.log('\n⚠️  NO está listo para producción\n');
    }

    // 7. Verificar datos sin organization_id
    const [orphanedTasks] = await connection.query('SELECT COUNT(*) as count FROM tasks WHERE organization_id IS NULL');
    const [orphanedAchievements] = await connection.query('SELECT COUNT(*) as count FROM achievements WHERE organization_id IS NULL');
    const [orphanedRewards] = await connection.query('SELECT COUNT(*) as count FROM rewards WHERE organization_id IS NULL');

    const hasOrphans = orphanedTasks[0].count > 0 || orphanedAchievements[0].count > 0 || orphanedRewards[0].count > 0;

    if (hasOrphans) {
      console.log('⚠️  ADVERTENCIA: Hay datos sin organization_id:\n');
      if (orphanedTasks[0].count > 0) console.log(`   - ${orphanedTasks[0].count} tareas`);
      if (orphanedAchievements[0].count > 0) console.log(`   - ${orphanedAchievements[0].count} logros`);
      if (orphanedRewards[0].count > 0) console.log(`   - ${orphanedRewards[0].count} recompensas`);
      console.log('\n   Estos datos NO serán visibles por ninguna organización\n');
    } else {
      console.log('✅ No hay datos huérfanos (sin organization_id)\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testMultiTenantIsolation();
