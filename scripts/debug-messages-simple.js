const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugMessages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
  });

  try {
    const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b';
    const adminId = 'f8f78bc1-a91b-11f0-ad18-2e9b82b60d1c';

    console.log('\n=== TEST MENSAJERÍA ===\n');
    
    // Test 1: Usuarios de la organización
    console.log('1️⃣ Usuarios en Supernova (excepto admin):');
    const [users] = await connection.execute(`
      SELECT id, name, email, role 
      FROM users 
      WHERE organization_id = ? AND id != ?
    `, [orgId, adminId]);
    
    console.log(`   ✅ ${users.length} usuarios encontrados:`);
    users.forEach(u => console.log(`      - ${u.name} (${u.email})`));

    // Test 2: Estructura de conversation_participants
    console.log('\n2️⃣ Columnas de conversation_participants:');
    const [cols] = await connection.execute('DESCRIBE conversation_participants');
    const hasIsActive = cols.some(c => c.Field === 'is_active');
    console.log(`   is_active existe: ${hasIsActive ? '✅ SÍ' : '❌ NO'}`);
    
    // Test 3: Query simplificado de contactos (el que usa el endpoint)
    console.log('\n3️⃣ Test query de contactos (simplificado):');
    try {
      const [contacts] = await connection.execute(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          u.profile_image
        FROM users u
        LEFT JOIN organization_departments d ON u.department_id = d.id
        WHERE u.organization_id = ?
          AND u.id != ?
          AND u.id IS NOT NULL
        ORDER BY u.name ASC
      `, [orgId, adminId]);
      
      console.log(`   ✅ Query ejecutado exitosamente: ${contacts.length} contactos`);
    } catch (err) {
      console.log(`   ❌ Error en query: ${err.message}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await connection.end();
  }
}

debugMessages();
