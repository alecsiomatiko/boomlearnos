const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugChatContacts() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  console.log('\n💬 DEBUG: Contactos en el Chat\n');
  console.log('='.repeat(80));

  const adminEmail = 'admin@supernova.com';
  
  // Obtener el usuario admin
  const [adminUser] = await conn.query(
    'SELECT id, name, email, organization_id FROM users WHERE email = ?',
    [adminEmail]
  );

  if (adminUser.length === 0) {
    console.log('   ❌ Usuario admin no encontrado');
    await conn.end();
    return;
  }

  const admin = adminUser[0];
  console.log(`\n👤 Usuario actual: ${admin.name}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Organization ID: ${admin.organization_id}`);

  // Simular la query que hace el endpoint /api/messages/contacts
  console.log('\n📊 Query del endpoint /api/messages/contacts:\n');

  const [contacts] = await conn.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.phone,
      u.role,
      u.profile_image,
      u.first_login,
      d.name as department_name,
      d.color as department_color
    FROM users u
    LEFT JOIN organization_departments d ON u.department_id = d.id
    WHERE u.organization_id = ?
      AND u.id != ?
      AND u.id IS NOT NULL
    ORDER BY u.name ASC
  `, [admin.organization_id, admin.id]);

  console.log(`   Total contactos encontrados: ${contacts.length}\n`);

  if (contacts.length > 0) {
    contacts.forEach((contact, index) => {
      console.log(`   ${index + 1}. ✅ ${contact.name}`);
      console.log(`      Email: ${contact.email}`);
      console.log(`      Role: ${contact.role}`);
      console.log(`      Department: ${contact.department_name || 'Sin departamento'}`);
      console.log(`      Phone: ${contact.phone || 'N/A'}`);
      console.log('');
    });
  } else {
    console.log('   ❌ NO HAY CONTACTOS\n');
    console.log('   Verificando posibles causas:\n');
    
    // Ver todos los usuarios de la organización
    const [allUsers] = await conn.query(
      'SELECT id, name, email FROM users WHERE organization_id = ?',
      [admin.organization_id]
    );
    
    console.log(`   Total usuarios en la organización: ${allUsers.length}`);
    if (allUsers.length === 1) {
      console.log('   → Solo hay 1 usuario (tú), por eso no hay contactos');
    }
  }

  // Verificar permisos
  console.log('\n🔐 Verificando permisos de mensajes:\n');
  
  const [permissions] = await conn.query(
    'SELECT permissions FROM users WHERE id = ?',
    [admin.id]
  );

  if (permissions[0]?.permissions) {
    const perms = JSON.parse(permissions[0].permissions);
    console.log('   Permiso messages:', perms.messages ? '✅ Activo' : '❌ Inactivo');
  } else {
    console.log('   Admin role:', admin.role === 'admin' ? '✅ Tiene acceso total' : '❌ Sin permisos');
  }

  console.log('\n='.repeat(80) + '\n');

  await conn.end();
}

debugChatContacts();
