const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugOrganizations() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  console.log('\n🔍 DEBUG: Organizaciones y Usuarios\n');
  console.log('='.repeat(80));

  // Ver usuarios con sus organizaciones
  console.log('\n👥 USUARIOS Y SUS ORGANIZACIONES:\n');
  
  const [users] = await conn.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.organization_id,
      o.name as org_name
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    ORDER BY u.role DESC, u.created_at
  `);

  // Agrupar por organización
  const byOrg = {};
  users.forEach(user => {
    const orgId = user.organization_id || 'SIN_ORG';
    const orgName = user.org_name || 'SIN ORGANIZACIÓN';
    
    if (!byOrg[orgId]) {
      byOrg[orgId] = {
        name: orgName,
        admins: [],
        colaboradores: []
      };
    }
    
    if (user.role === 'admin') {
      byOrg[orgId].admins.push(user);
    } else {
      byOrg[orgId].colaboradores.push(user);
    }
  });

  // Mostrar por organización
  for (const [orgId, data] of Object.entries(byOrg)) {
    console.log(`📊 ORGANIZACIÓN: ${data.name}`);
    console.log(`   ID: ${orgId}`);
    console.log(`   👨‍💼 Admins: ${data.admins.length}`);
    console.log(`   👥 Colaboradores: ${data.colaboradores.length}`);
    
    if (data.admins.length > 0) {
      console.log('\n   Admins:');
      data.admins.forEach(admin => {
        console.log(`      ${admin.name} (${admin.email})`);
      });
    }
    
    if (data.colaboradores.length > 0) {
      console.log('\n   Colaboradores:');
      data.colaboradores.forEach(colab => {
        console.log(`      ${colab.name} (${colab.email})`);
      });
    }
    
    console.log('\n' + '-'.repeat(80) + '\n');
  }

  // Verificar problema: múltiples admins en misma org
  console.log('⚠️  VERIFICACIÓN: Múltiples admins en misma organización\n');
  
  const [multiAdminOrgs] = await conn.query(`
    SELECT 
      u.organization_id,
      o.name as org_name,
      COUNT(*) as admin_count,
      GROUP_CONCAT(u.email SEPARATOR ', ') as admin_emails
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    WHERE u.role = 'admin' AND u.organization_id IS NOT NULL
    GROUP BY u.organization_id
    HAVING COUNT(*) > 1
  `);

  if (multiAdminOrgs.length > 0) {
    console.log('   ❌ PROBLEMA DETECTADO:');
    multiAdminOrgs.forEach(org => {
      console.log(`      Org: ${org.org_name} (${org.organization_id})`);
      console.log(`      Admins: ${org.admin_count}`);
      console.log(`      Emails: ${org.admin_emails}`);
      console.log('');
    });
  } else {
    console.log('   ✅ No hay múltiples admins en la misma organización');
  }

  // Ver tabla organizations
  console.log('\n📋 TABLA ORGANIZATIONS:\n');
  
  const [orgs] = await conn.query(`
    SELECT 
      o.id,
      o.name,
      o.owner_user_id,
      u.email as owner_email,
      o.created_at
    FROM organizations o
    LEFT JOIN users u ON o.owner_user_id = u.id
    ORDER BY o.created_at DESC
  `);

  if (orgs.length > 0) {
    orgs.forEach(org => {
      console.log(`   📁 ${org.name}`);
      console.log(`      ID: ${org.id}`);
      console.log(`      Owner: ${org.owner_email || 'N/A'}`);
      console.log(`      Creada: ${org.created_at}`);
      console.log('');
    });
  } else {
    console.log('   ⚠️  No hay organizaciones en la tabla');
  }

  // Resumen
  console.log('='.repeat(80));
  console.log('\n📊 RESUMEN:\n');
  console.log(`   Total usuarios: ${users.length}`);
  console.log(`   Total admins: ${users.filter(u => u.role === 'admin').length}`);
  console.log(`   Total colaboradores: ${users.filter(u => u.role !== 'admin').length}`);
  console.log(`   Total organizaciones: ${orgs.length}`);
  console.log(`   Usuarios sin organización: ${users.filter(u => !u.organization_id).length}`);

  console.log('\n='.repeat(80) + '\n');

  await conn.end();
}

debugOrganizations();
