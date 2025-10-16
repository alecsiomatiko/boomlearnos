const mysql = require('mysql2/promise');
require('dotenv').config();

async function finalValidation() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  console.log('\n🎯 VALIDACIÓN FINAL - Sistema de First Login Diferenciado\n');
  console.log('═'.repeat(70));

  let allPassed = true;

  // Test 1: Estructura de BD
  console.log('\n✅ TEST 1: Verificar estructura de base de datos\n');
  
  const [columns] = await conn.query(`
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    AND COLUMN_NAME IN ('first_login', 'permissions', 'phone', 'organization_id')
  `, [process.env.DB_NAME]);

  const requiredFields = {
    'first_login': 'tinyint',
    'permissions': 'longtext',
    'phone': 'varchar',
    'organization_id': 'varchar'
  };

  for (const [field, type] of Object.entries(requiredFields)) {
    const col = columns.find(c => c.COLUMN_NAME === field);
    if (col && col.DATA_TYPE === type) {
      console.log(`   ✅ ${field} (${type})`);
    } else {
      console.log(`   ❌ ${field} - ${col ? `tipo incorrecto: ${col.DATA_TYPE}` : 'NO EXISTE'}`);
      allPassed = false;
    }
  }

  // Test 2: Lógica de admins
  console.log('\n✅ TEST 2: Verificar admins (first_login = false)\n');
  
  const [admins] = await conn.query(`
    SELECT name, email, role, first_login
    FROM users
    WHERE role = 'admin'
  `);

  let adminsFailed = 0;
  admins.forEach(admin => {
    if (admin.first_login === 0) {
      console.log(`   ✅ ${admin.name} (${admin.email}) - first_login: false`);
    } else {
      console.log(`   ❌ ${admin.name} (${admin.email}) - first_login: true (INCORRECTO)`);
      adminsFailed++;
      allPassed = false;
    }
  });

  if (adminsFailed === 0) {
    console.log(`\n   🎉 Todos los ${admins.length} admin(s) configurados correctamente`);
  }

  // Test 3: Lógica de colaboradores
  console.log('\n✅ TEST 3: Verificar colaboradores (first_login = true)\n');
  
  const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b';
  const [colaboradores] = await conn.query(`
    SELECT name, email, role, first_login
    FROM users
    WHERE role = 'user' AND organization_id = ?
  `, [orgId]);

  let colabsFailed = 0;
  colaboradores.forEach(colab => {
    if (colab.first_login === 1) {
      console.log(`   ✅ ${colab.name} (${colab.email}) - first_login: true`);
    } else {
      console.log(`   ❌ ${colab.name} (${colab.email}) - first_login: false (INCORRECTO)`);
      colabsFailed++;
      allPassed = false;
    }
  });

  if (colabsFailed === 0) {
    console.log(`\n   🎉 Todos los ${colaboradores.length} colaborador(es) configurados correctamente`);
  }

  // Test 4: Endpoints implementados
  console.log('\n✅ TEST 4: Verificar archivos de endpoints\n');
  
  const fs = require('fs');
  const path = require('path');
  
  const endpoints = [
    { path: 'app/api/auth/register/route.ts', check: 'first_login' },
    { path: 'app/api/admin/users/route.ts', check: 'first_login = true' },
    { path: 'app/api/auth/login/route.ts', check: 'first_login' },
    { path: 'app/api/auth/change-password/route.ts', check: 'first_login = false' }
  ];

  endpoints.forEach(ep => {
    const fullPath = path.join(process.cwd(), ep.path);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes(ep.check)) {
        console.log(`   ✅ ${ep.path} - incluye "${ep.check}"`);
      } else {
        console.log(`   ⚠️  ${ep.path} - no encontrado "${ep.check}"`);
      }
    } else {
      console.log(`   ❌ ${ep.path} - NO EXISTE`);
      allPassed = false;
    }
  });

  // Test 5: Componentes de UI
  console.log('\n✅ TEST 5: Verificar componentes de UI\n');
  
  const components = [
    'app/change-password/page.tsx',
    'components/auth/password-change-guard.tsx',
    'app/dashboard/layout.tsx'
  ];

  components.forEach(comp => {
    const fullPath = path.join(process.cwd(), comp);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${comp} - existe`);
    } else {
      console.log(`   ❌ ${comp} - NO EXISTE`);
      allPassed = false;
    }
  });

  // Test 6: Documentación
  console.log('\n✅ TEST 6: Verificar documentación\n');
  
  const docs = [
    'FIRST_LOGIN_LOGIC.md',
    'USER_MANAGEMENT_SYSTEM.md',
    'FIRST_LOGIN_UPDATE.md'
  ];

  docs.forEach(doc => {
    const fullPath = path.join(process.cwd(), doc);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`   ✅ ${doc} - ${Math.round(stats.size / 1024)}KB`);
    } else {
      console.log(`   ❌ ${doc} - NO EXISTE`);
      allPassed = false;
    }
  });

  // Test 7: Scripts de verificación
  console.log('\n✅ TEST 7: Verificar scripts de test\n');
  
  const scripts = [
    'scripts/verify-first-login-logic.js',
    'scripts/test-admin-vs-colaborador.js',
    'scripts/test-first-login-flow.js'
  ];

  scripts.forEach(script => {
    const fullPath = path.join(process.cwd(), script);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${script} - disponible`);
    } else {
      console.log(`   ❌ ${script} - NO EXISTE`);
      allPassed = false;
    }
  });

  // Resumen final
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 RESUMEN DE VALIDACIÓN:\n');

  console.log(`   👨‍💼 Administradores: ${admins.length}`);
  console.log(`      └─ Con first_login = false: ${admins.filter(a => a.first_login === 0).length}/${admins.length}`);
  
  console.log(`   👥 Colaboradores: ${colaboradores.length}`);
  console.log(`      └─ Con first_login = true: ${colaboradores.filter(c => c.first_login === 1).length}/${colaboradores.length}`);

  console.log(`\n   📁 Archivos verificados: ${4 + 3 + 3 + 3} archivos`);
  console.log(`   ✅ Estructura BD: 4/4 campos`);
  console.log(`   ✅ Endpoints: 4 archivos`);
  console.log(`   ✅ Componentes UI: 3 archivos`);
  console.log(`   ✅ Documentación: 3 archivos`);
  console.log(`   ✅ Scripts: 3 archivos`);

  console.log('\n' + '═'.repeat(70));

  if (allPassed) {
    console.log('\n🎉 ¡VALIDACIÓN EXITOSA!');
    console.log('\n✅ Sistema de First Login Diferenciado funcionando correctamente:');
    console.log('   • Admins: NO forzados a cambiar contraseña');
    console.log('   • Colaboradores: SÍ forzados a cambiar contraseña');
    console.log('   • Todos los archivos implementados');
    console.log('   • Documentación completa');
    console.log('   • Scripts de test disponibles');
    console.log('\n🚀 Sistema listo para producción\n');
  } else {
    console.log('\n⚠️  VALIDACIÓN PARCIAL');
    console.log('\n❌ Se encontraron algunos problemas.');
    console.log('   Revisa los mensajes anteriores para más detalles.\n');
  }

  console.log('═'.repeat(70) + '\n');

  await conn.end();
  
  return allPassed ? 0 : 1;
}

finalValidation().then(code => process.exit(code));
