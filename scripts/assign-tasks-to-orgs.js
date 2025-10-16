const mysql = require('mysql2/promise');
require('dotenv').config();

async function assignTasksToOrgs() {
  console.log('📋 ASIGNANDO TASKS A ORGANIZACIONES\n');
  console.log('===================================\n');

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

    // 1. Ver usuarios y sus org IDs
    const [users] = await connection.query(`
      SELECT id, email, first_name, organization_id
      FROM users
    `);
    
    console.log('Usuarios disponibles:');
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.email} → Org: ${u.organization_id}`);
    });
    console.log('');

    // 2. Ver tasks sin org_id
    const [tasks] = await connection.query(`
      SELECT id, title, assigned_to, created_by, status
      FROM tasks
      WHERE organization_id IS NULL
      ORDER BY id
    `);
    
    console.log(`\n📋 Tasks sin organization_id: ${tasks.length}\n`);
    
    if (tasks.length === 0) {
      console.log('✅ ¡Todas las tasks ya tienen organization_id!\n');
      return;
    }
    
    console.log('Detalles:');
    tasks.forEach(t => {
      console.log(`\nTask #${t.id}: "${t.title}"`);
      console.log(`  assigned_to: ${t.assigned_to || 'NULL'}`);
      console.log(`  created_by: ${t.created_by || 'NULL'}`);
      console.log(`  status: ${t.status}`);
    });

    // 3. Asignar basándose en assigned_to
    console.log('\n\n📋 Asignando tasks basándome en el campo assigned_to...\n');
    
    let assignedCount = 0;
    let notAssignedCount = 0;
    
    for (const task of tasks) {
      if (task.assigned_to) {
        // Buscar el user y su organization_id
        const user = users.find(u => u.id === task.assigned_to);
        
        if (user && user.organization_id) {
          await connection.query(`
            UPDATE tasks
            SET organization_id = ?
            WHERE id = ?
          `, [user.organization_id, task.id]);
          
          console.log(`✅ Task #${task.id} → ${user.email} (${user.organization_id})`);
          assignedCount++;
        } else {
          console.log(`⚠️  Task #${task.id} → Usuario no encontrado o sin org`);
          notAssignedCount++;
        }
      } else {
        console.log(`⚠️  Task #${task.id} → Sin assigned_to, asignando a primera org...`);
        
        // Asignar a la primera org por defecto
        if (users.length > 0 && users[0].organization_id) {
          await connection.query(`
            UPDATE tasks
            SET organization_id = ?
            WHERE id = ?
          `, [users[0].organization_id, task.id]);
          
          console.log(`✅ Task #${task.id} → ${users[0].email} (por defecto)`);
          assignedCount++;
        }
      }
    }

    // 4. Hacer lo mismo con achievements y rewards
    console.log('\n\n📋 Asignando achievements sin org_id...\n');
    
    const [achievements] = await connection.query(`
      SELECT id, name
      FROM achievements
      WHERE organization_id IS NULL
    `);
    
    if (achievements.length > 0) {
      // Asignar todos a la primera org (son recursos compartidos inicialmente)
      const firstOrgId = users[0].organization_id;
      
      for (const ach of achievements) {
        await connection.query(`
          UPDATE achievements
          SET organization_id = ?
          WHERE id = ?
        `, [firstOrgId, ach.id]);
        
        console.log(`✅ Achievement "${ach.name}" → Org ${firstOrgId}`);
      }
    }

    console.log('\n\n📋 Asignando rewards sin org_id...\n');
    
    const [rewards] = await connection.query(`
      SELECT id, title
      FROM rewards
      WHERE organization_id IS NULL
    `);
    
    if (rewards.length > 0) {
      const firstOrgId = users[0].organization_id;
      
      for (const rew of rewards) {
        await connection.query(`
          UPDATE rewards
          SET organization_id = ?
          WHERE id = ?
        `, [firstOrgId, rew.id]);
        
        console.log(`✅ Reward "${rew.title}" → Org ${firstOrgId}`);
      }
    }

    // 5. Asignar gems_history
    console.log('\n\n📋 Asignando gems_history sin org_id...\n');
    
    const [gemsHistory] = await connection.query(`
      SELECT id, user_id, gems_amount
      FROM gems_history
      WHERE organization_id IS NULL
    `);
    
    if (gemsHistory.length > 0) {
      for (const gem of gemsHistory) {
        const user = users.find(u => u.id === gem.user_id);
        
        if (user && user.organization_id) {
          await connection.query(`
            UPDATE gems_history
            SET organization_id = ?
            WHERE id = ?
          `, [user.organization_id, gem.id]);
          
          console.log(`✅ Gem history #${gem.id} → User ${gem.user_id} org`);
        }
      }
    }

    // 6. Verificación final
    console.log('\n\n📊 VERIFICACIÓN FINAL:\n');
    console.log('================================\n');
    
    const checks = [
      { table: 'tasks', query: 'SELECT COUNT(*) as cnt FROM tasks WHERE organization_id IS NULL' },
      { table: 'achievements', query: 'SELECT COUNT(*) as cnt FROM achievements WHERE organization_id IS NULL' },
      { table: 'rewards', query: 'SELECT COUNT(*) as cnt FROM rewards WHERE organization_id IS NULL' },
      { table: 'gems_history', query: 'SELECT COUNT(*) as cnt FROM gems_history WHERE organization_id IS NULL' }
    ];
    
    for (const check of checks) {
      const [result] = await connection.query(check.query);
      const cnt = result[0].cnt;
      console.log(`${cnt === 0 ? '✅' : '⚠️'}  ${check.table.padEnd(20)} ${cnt} registros sin org_id`);
    }
    
    console.log('\n\n🎉 ¡ASIGNACIÓN COMPLETADA!\n');
    console.log(`Tasks asignadas: ${assignedCount}`);
    console.log(`Tasks no asignadas: ${notAssignedCount}\n`);

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

assignTasksToOrgs();
