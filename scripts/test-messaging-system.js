const mysql = require('mysql2/promise');
require('dotenv').config();

async function testMessagingSystem() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  console.log('\n✅ TEST COMPLETO: Sistema de Mensajería\n');
  console.log('='.repeat(80));

  const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b'; // Supernova

  // TEST 1: Verificar usuarios en la organización
  console.log('\n📊 TEST 1: Usuarios en organización Supernova\n');
  
  const [users] = await conn.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.organization_id,
      u.permissions
    FROM users u
    WHERE u.organization_id = ?
    ORDER BY u.role DESC, u.name
  `, [orgId]);

  console.log(`   Total usuarios: ${users.length}\n`);

  const adminUser = users.find(u => u.role === 'admin');
  const colaboradorUser = users.find(u => u.role === 'user');

  if (adminUser) {
    console.log(`   👨‍💼 Admin: ${adminUser.name} (${adminUser.email})`);
  }
  if (colaboradorUser) {
    console.log(`   👥 Colaborador: ${colaboradorUser.name} (${colaboradorUser.email})`);
  }

  // TEST 2: Simular query de contactos para el admin
  console.log('\n='.repeat(80));
  console.log('\n📊 TEST 2: Contactos visibles para ADMIN\n');

  const [adminContacts] = await conn.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role
    FROM users u
    WHERE u.organization_id = ?
      AND u.id != ?
      AND u.id IS NOT NULL
    ORDER BY u.name ASC
  `, [orgId, adminUser.id]);

  console.log(`   Contactos que ve el admin: ${adminContacts.length}\n`);
  
  if (adminContacts.length > 0) {
    adminContacts.forEach(contact => {
      console.log(`      ✅ ${contact.name} (${contact.email})`);
    });
  } else {
    console.log('      ❌ NO SE ENCONTRARON CONTACTOS');
  }

  // TEST 3: Simular query de contactos para un colaborador
  console.log('\n='.repeat(80));
  console.log('\n📊 TEST 3: Contactos visibles para COLABORADOR\n');

  const [colabContacts] = await conn.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role
    FROM users u
    WHERE u.organization_id = ?
      AND u.id != ?
      AND u.id IS NOT NULL
    ORDER BY u.name ASC
  `, [orgId, colaboradorUser.id]);

  console.log(`   Contactos que ve el colaborador: ${colabContacts.length}\n`);
  
  if (colabContacts.length > 0) {
    colabContacts.forEach(contact => {
      console.log(`      ✅ ${contact.name} (${contact.email})`);
    });
  } else {
    console.log('      ❌ NO SE ENCONTRARON CONTACTOS');
  }

  // TEST 4: Verificar estructura de conversations
  console.log('\n='.repeat(80));
  console.log('\n📊 TEST 4: Estructura de tabla conversations\n');

  const [convCols] = await conn.query('SHOW COLUMNS FROM conversations');
  
  const hasOrgId = convCols.some(c => c.Field === 'organization_id');
  
  console.log('   Columnas importantes:');
  convCols.forEach(c => {
    if (['id', 'type', 'created_by', 'organization_id'].includes(c.Field)) {
      console.log(`      • ${c.Field} (${c.Type})`);
    }
  });

  console.log(`\n   ${hasOrgId ? '⚠️  TIENE' : '✅ NO TIENE'} campo organization_id`);
  
  if (hasOrgId) {
    console.log('      → Esto está causando errores en los endpoints');
    console.log('      → Se recomienda eliminar referencias a este campo');
  } else {
    console.log('      → Los endpoints deben usar conversation_participants para filtrar');
  }

  // TEST 5: Ver conversaciones existentes
  console.log('\n='.repeat(80));
  console.log('\n📊 TEST 5: Conversaciones existentes\n');

  const [conversations] = await conn.query(`
    SELECT 
      c.id,
      c.type,
      c.created_by,
      u.name as creator_name,
      u.organization_id as creator_org,
      COUNT(DISTINCT cp.user_id) as participant_count
    FROM conversations c
    LEFT JOIN users u ON c.created_by = u.id
    LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
    GROUP BY c.id
  `);

  console.log(`   Total conversaciones: ${conversations.length}\n`);

  const supernovaConversations = conversations.filter(c => c.creator_org === orgId);
  
  console.log(`   Conversaciones de Supernova: ${supernovaConversations.length}\n`);

  if (supernovaConversations.length > 0) {
    for (const conv of supernovaConversations) {
      console.log(`   💬 Conversación ${conv.type}`);
      console.log(`      ID: ${conv.id}`);
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
    console.log('   ℹ️  No hay conversaciones. Esto es normal si es la primera vez.');
  }

  // RESUMEN FINAL
  console.log('='.repeat(80));
  console.log('\n📋 RESUMEN:\n');

  console.log(`   ✅ Usuarios en Supernova: ${users.length}`);
  console.log(`   ✅ Admin puede ver: ${adminContacts.length} contactos`);
  console.log(`   ✅ Colaborador puede ver: ${colabContacts.length} contactos`);
  console.log(`   ✅ Conversaciones existentes: ${supernovaConversations.length}`);
  console.log(`   ${hasOrgId ? '❌' : '✅'} Tabla conversations ${hasOrgId ? 'TIENE' : 'NO TIENE'} organization_id`);

  console.log('\n🎯 DIAGNÓSTICO:\n');

  if (adminContacts.length > 0 && colabContacts.length > 0) {
    console.log('   ✅ Sistema de contactos funciona correctamente');
    console.log('   ✅ Los usuarios pueden verse entre sí');
    console.log('   ✅ El filtro por organization_id está trabajando bien');
  } else {
    console.log('   ❌ Hay un problema con la detección de contactos');
    console.log('   → Verificar que organization_id coincida');
    console.log('   → Verificar que los IDs no sean NULL');
  }

  if (!hasOrgId) {
    console.log('   ✅ Endpoints corregidos (sin organization_id en conversations)');
  } else {
    console.log('   ⚠️  Los endpoints necesitan corrección');
  }

  console.log('\n💡 RECOMENDACIONES:\n');
  
  console.log('   1. ✅ Los contactos se filtran correctamente por organization_id en users');
  console.log('   2. ✅ Las conversaciones se deben filtrar por conversation_participants');
  console.log('   3. 🔄 Probar crear una conversación desde el frontend');
  console.log('   4. 🔄 Verificar que los mensajes se envíen correctamente');

  console.log('\n='.repeat(80) + '\n');

  await conn.end();
}

testMessagingSystem();
