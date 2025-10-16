const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUsers() {
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

    // Obtener departamentos
    const [departments] = await connection.query(`
      SELECT id, name FROM organization_departments 
      WHERE organization_id = ? 
      ORDER BY id ASC 
      LIMIT 5
    `, [orgId]);

    console.log(`📋 Departamentos disponibles: ${departments.length}\n`);

    // Usuarios de prueba
    const testUsers = [
      {
        name: 'María González',
        email: 'maria.gonzalez@supernova.com',
        phone: '524445551111',
        password: 'BoomTest2025!',
        department_id: departments[1]?.id || null, // RRHH
        permissions: {
          tasks_view_team: true,
          tasks_assign_others: true,
          messages: true,
          achievements: true,
          checkin: true,
          team: true
        }
      },
      {
        name: 'Carlos Ramírez',
        email: 'carlos.ramirez@supernova.com',
        phone: '524445552222',
        password: 'BoomTest2025!',
        department_id: departments[2]?.id || null, // Marketing
        permissions: {
          tasks_view_team: true,
          tasks_assign_others: false,
          messages: true,
          achievements: true,
          checkin: true,
          team: true
        }
      },
      {
        name: 'Ana López',
        email: 'ana.lopez@supernova.com',
        phone: '524445553333',
        password: 'BoomTest2025!',
        department_id: departments[3]?.id || null, // Ventas
        permissions: {
          tasks_view_team: false,
          tasks_assign_others: false,
          messages: true,
          achievements: true,
          checkin: true,
          team: false
        }
      },
      {
        name: 'Roberto Martínez',
        email: 'roberto.martinez@supernova.com',
        phone: '524445554444',
        password: 'BoomTest2025!',
        department_id: departments[4]?.id || null, // Tecnología
        permissions: {
          tasks_view_team: true,
          tasks_assign_others: true,
          messages: true,
          achievements: true,
          checkin: true,
          team: true
        }
      },
      {
        name: 'Laura Sánchez',
        email: 'laura.sanchez@supernova.com',
        phone: '524445555555',
        password: 'BoomTest2025!',
        department_id: departments[1]?.id || null, // RRHH
        permissions: {
          tasks_view_team: false,
          tasks_assign_others: false,
          messages: true,
          achievements: true,
          checkin: false,
          team: false
        }
      }
    ];

    console.log('👥 Creando usuarios de prueba...\n');

    for (const userData of testUsers) {
      // Verificar si el email ya existe
      const [existing] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [userData.email]
      );

      if (existing.length > 0) {
        console.log(`   ⚠️  ${userData.name} (${userData.email}) - Ya existe`);
        continue;
      }

      // Hash del password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Insertar usuario
      await connection.query(`
        INSERT INTO users (
          name, 
          email, 
          phone, 
          password, 
          role, 
          first_login, 
          organization_id, 
          department_id, 
          permissions,
          total_gems,
          created_at
        ) VALUES (?, ?, ?, ?, 'user', true, ?, ?, ?, 0, NOW())
      `, [
        userData.name,
        userData.email,
        userData.phone,
        hashedPassword,
        orgId,
        userData.department_id,
        JSON.stringify(userData.permissions)
      ]);

      const deptName = departments.find(d => d.id === userData.department_id)?.name || 'Sin departamento';
      const permsCount = Object.values(userData.permissions).filter(v => v === true).length;
      
      console.log(`   ✅ ${userData.name}`);
      console.log(`      Email: ${userData.email}`);
      console.log(`      Password: ${userData.password}`);
      console.log(`      Phone: ${userData.phone}`);
      console.log(`      Departamento: ${deptName}`);
      console.log(`      Permisos activos: ${permsCount}/6\n`);
    }

    // Resumen final
    console.log('\n📊 RESUMEN:');
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as users,
        SUM(CASE WHEN first_login = true THEN 1 ELSE 0 END) as pending
      FROM users
      WHERE organization_id = ?
    `, [orgId]);

    const s = stats[0];
    console.log(`   👥 Total usuarios: ${s.total}`);
    console.log(`   👑 Admins: ${s.admins}`);
    console.log(`   👤 Colaboradores: ${s.users}`);
    console.log(`   🔐 Pendientes primer login: ${s.pending}`);

    console.log('\n📋 USUARIOS POR DEPARTAMENTO:');
    const [byDept] = await connection.query(`
      SELECT 
        d.name as department,
        COUNT(u.id) as count
      FROM organization_departments d
      LEFT JOIN users u ON d.id = u.department_id AND u.role = 'user'
      WHERE d.organization_id = ?
      GROUP BY d.id, d.name
      ORDER BY count DESC, d.name
    `, [orgId]);

    byDept.forEach(row => {
      console.log(`   ${row.department}: ${row.count} usuario(s)`);
    });

    console.log('\n✅ ¡Usuarios de prueba creados exitosamente!');
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('   1. Login con cualquiera de estos usuarios');
    console.log('   2. El sistema pedirá cambiar contraseña (first_login = true)');
    console.log('   3. Verificar panel /dashboard/equipo');
    console.log('   4. Verificar panel /dashboard/mensajes');
    console.log('\n🔑 CREDENCIALES DE PRUEBA:');
    console.log('   Password para todos: BoomTest2025!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestUsers();
