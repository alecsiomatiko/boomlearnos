const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugMessages() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  console.log('\n💬 DEBUG: Sistema de Mensajería\n');
  console.log('='.repeat(80));

  const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b'; // Supernova

  // Ver usuarios de la organización Supernova
  console.log('\n👥 USUARIOS EN ORGANIZACIÓN SUPERNOVA:\n');
  
  const [users] = await conn.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.organization_id,
      u.permissions,
      d.name as department_name
    FROM users u
    LEFT JOIN organization_departments d ON u.department_id = d.id
    WHERE u.organization_id = ?
    ORDER BY u.role DESC, u.name
  `, [orgId]);

  console.log(`   Total usuarios en Supernova: ${users.length}\n`);

  users.forEach(user => {
    let perms = {};
    try {
      perms = user.permissions ? JSON.parse(user.permissions) : {};
    } catch (e) {}

    const canMessage = user.role === 'admin' || perms.messages === true;
    
    console.log(`   ${canMessage ? '✅' : '❌'} ${user.name} (${user.email})`);
    console.log(`      Role: ${user.role}`);
    console.log(`      Department: ${user.department_name || 'N/A'}`);
    console.log(`      Permiso mensajes: ${user.role === 'admin' ? 'admin (siempre)' : perms.messages === true ? 'true' : 'false'}`);
    console.log('');
  });

  // Simular query de contactos como lo hace el endpoint
  console.log('='.repeat(80));
  console.log('\n🔍 SIMULANDO QUERY DE /api/messages/contacts:\n');

  const testUserId = users[0].id; // Usar el primer usuario
  console.log(`   Usuario actual: ${users[0].name} (${users[0].email})`);
  console.log(`   Organization ID: ${orgId}\n`);

  const [contacts] = await conn.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.organization_id,
      d.name as department_name
    FROM users u
    LEFT JOIN organization_departments d ON u.department_id = d.id
    WHERE u.organization_id = ?
      AND u.id != ?
      AND u.id IS NOT NULL
    ORDER BY u.name ASC
  `, [orgId, testUserId]);

  console.log(`   📊 Contactos encontrados: ${contacts.length}\n`);

  if (contacts.length > 0) {
    contacts.forEach(contact => {
      console.log(`      ✅ ${contact.name} (${contact.email})`);
      console.log(`         Role: ${contact.role}`);
      console.log(`         Department: ${contact.department_name || 'N/A'}`);
      console.log('');
    });
  } else {
    console.log('      ❌ NO SE ENCONTRARON CONTACTOS\n');
    console.log('      Posibles causas:');
    console.log('         1. Todos los usuarios tienen el mismo ID');
    console.log('         2. organization_id no coincide');
    console.log('         3. No hay otros usuarios en la organización');
  }

  // Verificar si hay conversaciones
  console.log('='.repeat(80));
  console.log('\n💬 CONVERSACIONES EXISTENTES:\n');

  const [conversations] = await conn.query(`
    SELECT 
      c.id,
      c.type,
      c.organization_id,
      c.created_by,
      u.name as creator_name,
      COUNT(DISTINCT cp.user_id) as participant_count
    FROM conversations c
    LEFT JOIN users u ON c.created_by = u.id
    LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
    WHERE c.organization_id = ?
    GROUP BY c.id
  `, [orgId]);

  console.log(`   Total conversaciones: ${conversations.length}\n`);

  if (conversations.length > 0) {
    for (const conv of conversations) {
      console.log(`   💬 Conversación ${conv.id}`);
      console.log(`      Tipo: ${conv.type}`);
      console.log(`      Creador: ${conv.creator_name}`);
      console.log(`      Participantes: ${conv.participant_count}`);
      
      // Ver participantes
      const [participants] = await conn.query(`
        SELECT u.name, u.email
        FROM conversation_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = ?
      `, [conv.id]);
      
      if (participants.length > 0) {
        participants.forEach(p => {
          console.log(`         • ${p.name} (${p.email})`);
        });
      }
      console.log('');
    }
  } else {
    console.log('   ℹ️  No hay conversaciones creadas');
  }

  // Resumen y diagnóstico
  console.log('='.repeat(80));
  console.log('\n📋 DIAGNÓSTICO:\n');

  const usersWithMessages = users.filter(u => {
    let perms = {};
    try {
      perms = u.permissions ? JSON.parse(u.permissions) : {};
    } catch (e) {}
    return u.role === 'admin' || perms.messages === true;
  });

  console.log(`   ✅ Usuarios totales en Supernova: ${users.length}`);
  console.log(`   ✅ Usuarios con permiso mensajes: ${usersWithMessages.length}`);
  console.log(`   ✅ Conversaciones existentes: ${conversations.length}`);
  
  if (contacts.length === 0 && users.length > 1) {
    console.log('\n   ⚠️  PROBLEMA DETECTADO:');
    console.log('      • Hay múltiples usuarios en la organización');
    console.log('      • Pero la query de contactos NO los encuentra');
    console.log('      • Revisar lógica del endpoint /api/messages/contacts');
  } else if (contacts.length > 0) {
    console.log('\n   ✅ La query de contactos funciona correctamente');
  }

  console.log('\n='.repeat(80) + '\n');

  await conn.end();
}

debugMessages();
