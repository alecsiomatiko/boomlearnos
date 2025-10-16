const mysql = require('mysql2/promise');
require('dotenv').config();

async function testMessagesEndpoints() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
  });

  try {
    const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b'; // Supernova
    const adminId = 'f8f78bc1-a91b-11f0-ad18-2e9b82b60d1c'; // admin@supernova.com

    console.log('\n📊 VERIFICANDO CONTACTOS:\n');
    
    // Query simplificado de contactos (sin is_active)
    const [contacts] = await connection.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.profile_image
      FROM users u
      WHERE u.organization_id = ?
        AND u.id != ?
        AND u.id IS NOT NULL
      ORDER BY u.name ASC
    `, [orgId, adminId]);

    console.log(`✅ Encontrados ${contacts.length} contactos:`);
    contacts.forEach(c => {
      console.log(`   - ${c.name} (${c.email}) - ${c.role}`);
    });

    console.log('\n📊 VERIFICANDO TABLAS DE CONVERSACIONES:\n');
    
    // Verificar si existen conversaciones
    const [conversations] = await connection.execute(
      'SELECT COUNT(*) as count FROM conversations WHERE organization_id = ?',
      [orgId]
    );
    console.log(`✅ Conversaciones existentes: ${conversations[0].count}`);

    // Verificar estructura de conversation_participants
    console.log('\n📋 Columnas de conversation_participants:');
    const [cols] = await connection.execute('DESCRIBE conversation_participants');
    cols.forEach(c => console.log(`   - ${c.Field} (${c.Type})`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testMessagesEndpoints();
