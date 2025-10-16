const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyFirstLoginLogic() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  console.log('🔍 VERIFICANDO LÓGICA DE FIRST_LOGIN\n');
  console.log('='.repeat(60));

  const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b';

  // Ver todos los usuarios con su estado first_login
  console.log('\n📊 Estado de first_login por tipo de usuario:\n');

  const [allUsers] = await conn.query(`
    SELECT 
      name,
      email,
      role,
      first_login,
      created_at,
      CASE 
        WHEN role = 'admin' THEN 'Registrado normalmente'
        WHEN role = 'user' THEN 'Invitado por admin'
        ELSE 'Otro'
      END as tipo_usuario
    FROM users
    WHERE organization_id = ? OR role = 'admin'
    ORDER BY created_at DESC
  `, [orgId]);

  // Agrupar por tipo
  const admins = allUsers.filter(u => u.role === 'admin');
  const colaboradores = allUsers.filter(u => u.role === 'user');

  console.log('👨‍💼 ADMINISTRADORES (Registrados normalmente):');
  console.log('   → first_login debe ser FALSE\n');
  
  if (admins.length > 0) {
    admins.forEach(admin => {
      const icon = admin.first_login === 0 ? '✅' : '❌';
      console.log(`   ${icon} ${admin.name} (${admin.email})`);
      console.log(`      first_login: ${admin.first_login === 0 ? 'false' : 'true'} ${admin.first_login === 0 ? '✓' : '✗ INCORRECTO'}`);
      console.log('');
    });
  } else {
    console.log('   ℹ️  No hay administradores\n');
  }

  console.log('👥 COLABORADORES (Invitados por admin):');
  console.log('   → first_login debe ser TRUE\n');
  
  if (colaboradores.length > 0) {
    colaboradores.forEach(colab => {
      const icon = colab.first_login === 1 ? '✅' : '❌';
      console.log(`   ${icon} ${colab.name} (${colab.email})`);
      console.log(`      first_login: ${colab.first_login === 1 ? 'true' : 'false'} ${colab.first_login === 1 ? '✓' : '✗ INCORRECTO'}`);
      console.log('');
    });
  } else {
    console.log('   ℹ️  No hay colaboradores\n');
  }

  // Resumen de lógica
  console.log('='.repeat(60));
  console.log('\n📋 LÓGICA IMPLEMENTADA:\n');
  
  console.log('1️⃣  REGISTRO NORMAL (/register):');
  console.log('   • Usuario se registra por sí mismo');
  console.log('   • Role: admin (generalmente)');
  console.log('   • first_login: FALSE ✓');
  console.log('   • NO se le fuerza a cambiar contraseña');
  console.log('   • Acceso directo al dashboard\n');

  console.log('2️⃣  INVITACIÓN POR ADMIN (/api/admin/users):');
  console.log('   • Admin crea usuario desde panel');
  console.log('   • Role: user (colaborador)');
  console.log('   • first_login: TRUE ✓');
  console.log('   • SE le fuerza a cambiar contraseña');
  console.log('   • Recibe credenciales por WhatsApp\n');

  console.log('3️⃣  FLUJO FORCED PASSWORD CHANGE:');
  console.log('   • Aplicado SOLO a usuarios con first_login = TRUE');
  console.log('   • PasswordChangeGuard verifica en cada navegación');
  console.log('   • Redirige a /change-password si first_login = TRUE');
  console.log('   • Después del cambio: first_login = FALSE\n');

  // Verificar configuración correcta
  console.log('='.repeat(60));
  console.log('\n✅ VERIFICACIÓN:\n');

  const adminsIncorrectos = admins.filter(a => a.first_login === 1);
  const colaboradoresIncorrectos = colaboradores.filter(c => c.first_login === 0);

  if (adminsIncorrectos.length === 0 && colaboradoresIncorrectos.length === 0) {
    console.log('   ✅ Todos los usuarios tienen first_login configurado correctamente');
  } else {
    if (adminsIncorrectos.length > 0) {
      console.log(`   ❌ ${adminsIncorrectos.length} admin(s) con first_login = true (incorrecto)`);
      console.log('   → Los admins NO deben ser forzados a cambiar contraseña\n');
    }
    if (colaboradoresIncorrectos.length > 0) {
      console.log(`   ❌ ${colaboradoresIncorrectos.length} colaborador(es) con first_login = false (incorrecto)`);
      console.log('   → Los colaboradores invitados SÍ deben cambiar contraseña\n');
    }
  }

  console.log('\n📊 RESUMEN:');
  console.log(`   👨‍💼 Administradores: ${admins.length}`);
  console.log(`   👥 Colaboradores: ${colaboradores.length}`);
  console.log(`   🔐 Con first_login = TRUE: ${allUsers.filter(u => u.first_login === 1).length}`);
  console.log(`   ✅ Con first_login = FALSE: ${allUsers.filter(u => u.first_login === 0).length}`);

  console.log('\n' + '='.repeat(60) + '\n');

  await conn.end();
}

verifyFirstLoginLogic();
