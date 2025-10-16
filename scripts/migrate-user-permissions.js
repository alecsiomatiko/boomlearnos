const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateUserPermissions() {
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
    console.log('✅ Conectado a la base de datos\n');

    // 1. Verificar columnas existentes
    console.log('📋 Verificando estructura actual de la tabla users...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME]);

    console.log(`   Columnas actuales: ${columns.length}`);
    const columnNames = columns.map(c => c.COLUMN_NAME);
    
    // 2. Agregar first_login si no existe
    if (!columnNames.includes('first_login')) {
      console.log('\n📦 Agregando columna first_login...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN first_login BOOLEAN DEFAULT true AFTER password
      `);
      console.log('   ✅ Columna first_login agregada');
    } else {
      console.log('\n   ℹ️  Columna first_login ya existe');
    }

    // 3. Agregar phone si no existe
    if (!columnNames.includes('phone')) {
      console.log('\n📦 Agregando columna phone...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER email
      `);
      console.log('   ✅ Columna phone agregada');
    } else {
      console.log('\n   ℹ️  Columna phone ya existe');
    }

    // 4. Agregar permissions si no existe
    if (!columnNames.includes('permissions')) {
      console.log('\n📦 Agregando columna permissions...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN permissions JSON DEFAULT NULL AFTER role
      `);
      console.log('   ✅ Columna permissions agregada');
    } else {
      console.log('\n   ℹ️  Columna permissions ya existe');
    }

    // 5. Verificar/actualizar department_id
    const deptColumn = columns.find(c => c.COLUMN_NAME === 'department_id');
    if (deptColumn) {
      console.log('\n📦 Columna department_id existe');
      console.log(`   Tipo actual: ${deptColumn.DATA_TYPE}, Nullable: ${deptColumn.IS_NULLABLE}`);
    } else {
      console.log('\n📦 Agregando columna department_id...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN department_id INT DEFAULT NULL AFTER organization_id
      `);
      console.log('   ✅ Columna department_id agregada');
    }

    // 6. Inicializar permisos por defecto para usuarios existentes sin permisos
    console.log('\n📦 Inicializando permisos por defecto para usuarios sin permisos...');
    const defaultPermissions = {
      tasks_view_team: false,
      tasks_assign_others: false,
      messages: true,
      achievements: true,
      checkin: false,
      team: false
    };

    const [result] = await connection.query(`
      UPDATE users 
      SET permissions = ?
      WHERE (permissions IS NULL OR permissions = 'null' OR permissions = '{}')
      AND role = 'user'
    `, [JSON.stringify(defaultPermissions)]);

    console.log(`   ✅ ${result.affectedRows} usuarios actualizados con permisos por defecto`);

    // 7. Establecer first_login = false para admins existentes
    console.log('\n📦 Configurando first_login = false para admins...');
    const [adminResult] = await connection.query(`
      UPDATE users 
      SET first_login = false
      WHERE role = 'admin'
    `);
    console.log(`   ✅ ${adminResult.affectedRows} admins actualizados`);

    // 8. Mostrar resumen de la estructura final
    console.log('\n📊 ESTRUCTURA FINAL DE LA TABLA USERS:');
    const [finalColumns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME]);

    console.log('\n   Columnas importantes:');
    const importantColumns = ['id', 'name', 'email', 'phone', 'password', 'first_login', 'role', 'permissions', 'organization_id', 'department_id'];
    finalColumns
      .filter(c => importantColumns.includes(c.COLUMN_NAME))
      .forEach(col => {
        console.log(`   - ${col.COLUMN_NAME.padEnd(20)} ${col.DATA_TYPE.padEnd(15)} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

    // 9. Mostrar usuarios actuales
    console.log('\n👥 USUARIOS ACTUALES:');
    const [users] = await connection.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.first_login,
        u.permissions,
        o.name as organization_name,
        d.name as department_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      LEFT JOIN organization_departments d ON u.department_id = d.id
      ORDER BY u.role DESC, u.id
    `);

    users.forEach(user => {
      const roleIcon = user.role === 'admin' ? '👑' : '👤';
      const firstLoginIcon = user.first_login ? '🔐' : '✅';
      console.log(`\n   ${roleIcon} ${user.name}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Phone: ${user.phone || 'No registrado'}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      First login: ${firstLoginIcon} ${user.first_login ? 'Pendiente' : 'Completado'}`);
      console.log(`      Organización: ${user.organization_name || 'Sin asignar'}`);
      console.log(`      Departamento: ${user.department_name || 'Sin asignar'}`);
      if (user.permissions) {
        const perms = JSON.parse(user.permissions);
        console.log(`      Permisos: ${JSON.stringify(perms, null, 10).substring(0, 100)}...`);
      }
    });

    console.log('\n\n✅ ¡Migración completada exitosamente!');
    console.log('\n📝 SIGUIENTES PASOS:');
    console.log('   1. Crear panel /admin/users para gestión de colaboradores');
    console.log('   2. Implementar middleware de permisos en las rutas');
    console.log('   3. Crear flujo de cambio obligatorio de contraseña');
    console.log('   4. Implementar botón de WhatsApp para compartir credenciales');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar migración
migrateUserPermissions();
