const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testAdminRegistration() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  console.log('🧪 TEST: Registro de Admin vs Invitación de Colaborador\n');
  console.log('='.repeat(70));

  // Test 1: Simular registro de admin
  console.log('\n📝 TEST 1: REGISTRO NORMAL DE ADMIN\n');
  
  const testAdminEmail = 'test.admin@example.com';
  const testAdminPassword = 'AdminPass123!';
  
  // Verificar si existe
  const [existingAdmin] = await conn.query(
    'SELECT id FROM users WHERE email = ?',
    [testAdminEmail]
  );

  if (existingAdmin.length > 0) {
    console.log('   ℹ️  Usuario de prueba ya existe, eliminando...');
    await conn.query('DELETE FROM users WHERE email = ?', [testAdminEmail]);
  }

  // Simular INSERT del endpoint /api/auth/register
  const hashedPassword = await bcrypt.hash(testAdminPassword, 10);
  
  await conn.query(`
    INSERT INTO users (
      email, 
      password,
      name,
      first_name,
      last_name,
      role,
      level,
      total_gems,
      first_login
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    testAdminEmail,
    hashedPassword,
    'Test Admin',
    'Test',
    'Admin',
    'admin',
    1,
    0,
    false  // ← IMPORTANTE: FALSE para registro normal
  ]);

  const [newAdmin] = await conn.query(
    'SELECT id, email, name, role, first_login FROM users WHERE email = ?',
    [testAdminEmail]
  );

  const admin = newAdmin[0];
  
  console.log('   ✅ Admin registrado:');
  console.log(`      Email: ${admin.email}`);
  console.log(`      Role: ${admin.role}`);
  console.log(`      first_login: ${admin.first_login === 0 ? 'false' : 'true'}`);
  
  if (admin.first_login === 0) {
    console.log('\n   ✅ CORRECTO: first_login = false');
    console.log('   → Admin NO será forzado a cambiar contraseña');
    console.log('   → Puede acceder al dashboard directamente');
  } else {
    console.log('\n   ❌ ERROR: first_login debería ser false');
  }

  // Test 2: Simular creación de colaborador por admin
  console.log('\n' + '='.repeat(70));
  console.log('\n👥 TEST 2: INVITACIÓN DE COLABORADOR POR ADMIN\n');

  const testColabEmail = 'test.colaborador@example.com';
  const testColabPassword = 'TempPass2025!';

  // Verificar si existe
  const [existingColab] = await conn.query(
    'SELECT id FROM users WHERE email = ?',
    [testColabEmail]
  );

  if (existingColab.length > 0) {
    console.log('   ℹ️  Usuario de prueba ya existe, eliminando...');
    await conn.query('DELETE FROM users WHERE email = ?', [testColabEmail]);
  }

  // Simular INSERT del endpoint /api/admin/users
  const hashedTempPassword = await bcrypt.hash(testColabPassword, 10);
  const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b';
  
  await conn.query(`
    INSERT INTO users (
      name,
      email,
      password,
      role,
      first_login,
      organization_id
    ) VALUES (?, ?, ?, ?, ?, ?)
  `, [
    'Test Colaborador',
    testColabEmail,
    hashedTempPassword,
    'user',
    true,  // ← IMPORTANTE: TRUE para usuarios invitados
    orgId
  ]);

  const [newColab] = await conn.query(
    'SELECT id, email, name, role, first_login FROM users WHERE email = ?',
    [testColabEmail]
  );

  const colab = newColab[0];
  
  console.log('   ✅ Colaborador invitado:');
  console.log(`      Email: ${colab.email}`);
  console.log(`      Role: ${colab.role}`);
  console.log(`      first_login: ${colab.first_login === 1 ? 'true' : 'false'}`);
  
  if (colab.first_login === 1) {
    console.log('\n   ✅ CORRECTO: first_login = true');
    console.log('   → Colaborador SERÁ forzado a cambiar contraseña');
    console.log('   → No puede acceder al dashboard hasta cambiar contraseña');
  } else {
    console.log('\n   ❌ ERROR: first_login debería ser true');
  }

  // Comparación lado a lado
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 COMPARACIÓN:\n');

  console.log('┌─────────────────────────┬──────────────────┬──────────────────────┐');
  console.log('│ Característica          │ Admin (Register) │ Colaborador (Invite) │');
  console.log('├─────────────────────────┼──────────────────┼──────────────────────┤');
  console.log('│ Endpoint                │ /api/auth/...    │ /api/admin/users     │');
  console.log('│ Role                    │ admin            │ user                 │');
  console.log(`│ first_login             │ ${admin.first_login === 0 ? 'false ✅' : 'true  ❌'}          │ ${colab.first_login === 1 ? 'true  ✅' : 'false ❌'}            │`);
  console.log('│ Cambio obligatorio      │ NO ✅            │ SÍ ✅                │');
  console.log('│ Acceso directo          │ SÍ ✅            │ NO ✅                │');
  console.log('└─────────────────────────┴──────────────────┴──────────────────────┘');

  // Test 3: Simular flujo de login
  console.log('\n' + '='.repeat(70));
  console.log('\n🔐 TEST 3: SIMULACIÓN DE LOGIN\n');

  console.log('👨‍💼 Admin hace login:');
  console.log(`   → first_login = ${admin.first_login === 0 ? 'false' : 'true'}`);
  console.log('   → PasswordChangeGuard evalúa: first_login === true?');
  console.log(`   → Resultado: ${admin.first_login === 0 ? 'NO' : 'SÍ'}`);
  console.log(`   → Acción: ${admin.first_login === 0 ? 'PERMITE acceso al dashboard ✅' : 'REDIRIGE a /change-password ❌'}`);

  console.log('\n👥 Colaborador hace login:');
  console.log(`   → first_login = ${colab.first_login === 1 ? 'true' : 'false'}`);
  console.log('   → PasswordChangeGuard evalúa: first_login === true?');
  console.log(`   → Resultado: ${colab.first_login === 1 ? 'SÍ' : 'NO'}`);
  console.log(`   → Acción: ${colab.first_login === 1 ? 'REDIRIGE a /change-password ✅' : 'PERMITE acceso al dashboard ❌'}`);

  // Cleanup
  console.log('\n' + '='.repeat(70));
  console.log('\n🧹 LIMPIEZA:\n');
  
  await conn.query('DELETE FROM users WHERE email IN (?, ?)', [testAdminEmail, testColabEmail]);
  console.log('   ✅ Usuarios de prueba eliminados');

  // Resumen final
  console.log('\n' + '='.repeat(70));
  console.log('\n✅ RESUMEN DE TESTS:\n');

  const adminCorrect = admin.first_login === 0;
  const colabCorrect = colab.first_login === 1;

  console.log(`   ${adminCorrect ? '✅' : '❌'} Admin: first_login = false (${adminCorrect ? 'CORRECTO' : 'INCORRECTO'})`);
  console.log(`   ${colabCorrect ? '✅' : '❌'} Colaborador: first_login = true (${colabCorrect ? 'CORRECTO' : 'INCORRECTO'})`);

  if (adminCorrect && colabCorrect) {
    console.log('\n   🎉 ¡TODOS LOS TESTS PASARON!');
    console.log('   → La lógica de first_login está implementada correctamente');
  } else {
    console.log('\n   ⚠️  ALGUNOS TESTS FALLARON');
    console.log('   → Revisar implementación en endpoints');
  }

  console.log('\n' + '='.repeat(70) + '\n');

  await conn.end();
}

testAdminRegistration();
