const mysql = require('mysql2/promise');
require('dotenv').config();

async function testUserSystem() {
  let connection;
  
  try {
    console.log('🔌 Conectando a la base de datos...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });
    console.log('✅ Conectado\n');

    const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b';

    // Test 1: Verificar estructura de tabla users
    console.log('📋 TEST 1: Verificar campos en tabla users');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      AND COLUMN_NAME IN ('first_login', 'phone', 'permissions', 'department_id')
    `, [process.env.DB_NAME]);

    console.log('   Campos encontrados:');
    columns.forEach(col => {
      console.log(`   ✅ ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    if (columns.length < 4) {
      console.log('\n   ⚠️  Faltan campos. Ejecuta: node scripts/migrate-user-permissions.js');
      return;
    }

    // Test 2: Verificar departamentos
    console.log('\n📋 TEST 2: Verificar departamentos disponibles');
    const [depts] = await connection.query(`
      SELECT id, name, color FROM organization_departments 
      WHERE organization_id = ? AND active = 1
      LIMIT 5
    `, [orgId]);

    console.log(`   Departamentos: ${depts.length}`);
    depts.forEach(dept => {
      console.log(`   🏢 ${dept.name} (${dept.color})`);
    });

    // Test 3: Ver usuarios actuales
    console.log('\n📋 TEST 3: Usuarios actuales');
    const [users] = await connection.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.first_login,
        u.permissions,
        d.name as department_name
      FROM users u
      LEFT JOIN organization_departments d ON u.department_id = d.id
      WHERE u.organization_id = ?
      ORDER BY u.role DESC, u.created_at DESC
      LIMIT 10
    `, [orgId]);

    console.log(`   Total: ${users.length} usuarios`);
    users.forEach(user => {
      const roleIcon = user.role === 'admin' ? '👑' : '👤';
      const statusIcon = user.first_login ? '🔐' : '✅';
      console.log(`   ${roleIcon} ${user.name} (${user.email})`);
      console.log(`      Role: ${user.role} | Status: ${statusIcon} ${user.first_login ? 'Primer login' : 'Activo'}`);
      console.log(`      Phone: ${user.phone || 'No registrado'}`);
      console.log(`      Departamento: ${user.department_name || 'Sin asignar'}`);
      if (user.permissions) {
        try {
          const perms = JSON.parse(user.permissions);
          const activePerms = Object.entries(perms).filter(([k, v]) => v === true).map(([k]) => k);
          console.log(`      Permisos activos: ${activePerms.length > 0 ? activePerms.join(', ') : 'Ninguno'}`);
        } catch (e) {
          console.log(`      Permisos: Error al parsear JSON`);
        }
      }
      console.log('');
    });

    // Test 4: Estadísticas
    console.log('📊 TEST 4: Estadísticas del sistema');
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as users,
        SUM(CASE WHEN first_login = true THEN 1 ELSE 0 END) as pending_first_login,
        SUM(CASE WHEN first_login = false THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as with_phone,
        SUM(CASE WHEN department_id IS NOT NULL THEN 1 ELSE 0 END) as with_department
      FROM users
      WHERE organization_id = ?
    `, [orgId]);

    const s = stats[0];
    console.log(`   👥 Total usuarios: ${s.total}`);
    console.log(`   👑 Admins: ${s.admins}`);
    console.log(`   👤 Colaboradores: ${s.users}`);
    console.log(`   ✅ Usuarios activos: ${s.active_users}`);
    console.log(`   🔐 Pendientes primer login: ${s.pending_first_login}`);
    console.log(`   📱 Con teléfono: ${s.with_phone}`);
    console.log(`   🏢 Asignados a departamento: ${s.with_department}`);

    console.log('\n✅ Todos los tests pasaron correctamente');
    console.log('\n📝 PRÓXIMO PASO:');
    console.log('   Abrir en navegador: http://localhost:3000/admin/users');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testUserSystem();
