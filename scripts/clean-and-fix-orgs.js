const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanAndFix() {
  console.log('🧹 LIMPIEZA Y CORRECCIÓN DE ORGANIZACIONES\n');
  console.log('==========================================\n');

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

    // 1. Identificar los 2 usuarios legítimos
    console.log('📋 Paso 1: Identificando usuarios legítimos...\n');
    
    const [users] = await connection.query(`
      SELECT id, first_name, last_name, email, organization_id, current_organization_id
      FROM users
      ORDER BY id
    `);
    
    console.log('Usuarios encontrados:');
    users.forEach(u => {
      console.log(`  - ${u.first_name} ${u.last_name} (${u.email})`);
      console.log(`    Org ID: ${u.organization_id}`);
      console.log(`    Current Org: ${u.current_organization_id}\n`);
    });

    // 2. Obtener las organizaciones legítimas (las que tienen estos usuarios)
    const legitOrgIds = users
      .map(u => u.organization_id || u.current_organization_id)
      .filter(id => id);
    
    console.log(`\n📋 Organizaciones legítimas: ${legitOrgIds.length}\n`);
    
    const [legitOrgs] = await connection.query(`
      SELECT id, name
      FROM organizations
      WHERE id IN (?)
    `, [legitOrgIds]);
    
    console.log('Organizaciones a MANTENER:');
    legitOrgs.forEach(o => {
      console.log(`  ✅ ${o.name} (${o.id})`);
    });

    // 3. Eliminar organizaciones basura
    console.log('\n\n📋 Paso 2: Eliminando organizaciones basura...\n');
    
    const [deleteResult] = await connection.query(`
      DELETE FROM organizations
      WHERE id NOT IN (?)
    `, [legitOrgIds.length > 0 ? legitOrgIds : ['dummy']]);
    
    console.log(`✅ ${deleteResult.affectedRows} organizaciones basura eliminadas\n`);

    // 4. Crear relaciones en user_organizations
    console.log('\n📋 Paso 3: Creando relaciones user_organizations...\n');
    
    for (const user of users) {
      const orgId = user.organization_id || user.current_organization_id;
      
      if (orgId) {
        try {
          await connection.query(`
            INSERT INTO user_organizations (user_id, organization_id, role, created_at)
            VALUES (?, ?, 'admin', NOW())
            ON DUPLICATE KEY UPDATE role = 'admin'
          `, [user.id, orgId]);
          
          console.log(`✅ ${user.email} → ${orgId}`);
        } catch (error) {
          console.log(`⚠️  ${user.email}: ${error.message}`);
        }
      }
    }

    // 5. Asignar tasks a las organizaciones correctas
    console.log('\n\n📋 Paso 4: Asignando tasks a organizaciones...\n');
    
    // Por ahora, vamos a necesitar tu input sobre cómo distribuir las tasks
    // ¿Las tasks pertenecen al primer usuario o al segundo?
    // O necesitamos revisar algún campo como created_by, assigned_to, etc?
    
    const [tasks] = await connection.query(`
      SELECT id, title, assigned_to, created_by, created_at
      FROM tasks
      WHERE organization_id IS NULL
      LIMIT 10
    `);
    
    console.log(`⚠️  Encontradas ${tasks.length} tasks sin organization_id\n`);
    
    if (tasks.length > 0) {
      console.log('Muestra de tasks:');
      tasks.forEach(t => {
        console.log(`  - Task #${t.id}: "${t.title}"`);
        console.log(`    Assigned to: ${t.assigned_to}`);
        console.log(`    Created by: ${t.created_by || 'NULL'}`);
        console.log(`    Date: ${new Date(t.created_at).toLocaleDateString()}\n`);
      });
      
      console.log('\n💡 NECESITO TU INPUT:');
      console.log('   ¿Cómo determino a qué organización pertenece cada task?');
      console.log('   Opciones:');
      console.log('   A) Por el campo assigned_to (user_id)');
      console.log('   B) Por el campo created_by (user_id)');
      console.log('   C) Todas a la primera org');
      console.log('   D) Todas a la segunda org\n');
    }

    // 6. Verificación final
    console.log('\n📋 Paso 5: Verificación...\n');
    
    const [finalOrgs] = await connection.query('SELECT COUNT(*) as cnt FROM organizations');
    const [finalUserOrgs] = await connection.query('SELECT COUNT(*) as cnt FROM user_organizations');
    const [nullTasks] = await connection.query('SELECT COUNT(*) as cnt FROM tasks WHERE organization_id IS NULL');
    
    console.log('Estado final:');
    console.log(`  ✅ Organizaciones: ${finalOrgs[0].cnt}`);
    console.log(`  ✅ Relaciones user_organizations: ${finalUserOrgs[0].cnt}`);
    console.log(`  ${nullTasks[0].cnt > 0 ? '⚠️' : '✅'}  Tasks sin org_id: ${nullTasks[0].cnt}\n`);

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

cleanAndFix();
