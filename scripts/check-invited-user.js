const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkInvitedUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log('\n🔍 Verificando usuario invitado admin@testo.com:\n');
    
    const [users] = await connection.execute(
      'SELECT id, email, name, role, organization_id, first_login FROM users WHERE email = ?',
      ['admin@testo.com']
    );

    if (users.length === 0) {
      console.log('❌ Usuario no encontrado');
    } else {
      const user = users[0];
      console.log('✅ Usuario encontrado:');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Nombre:', user.name);
      console.log('   Role:', user.role);
      console.log('   Organization ID:', user.organization_id || '❌ NULL');
      console.log('   First Login:', user.first_login);

      if (user.organization_id) {
        console.log('\n🏢 Verificando organización:');
        const [orgs] = await connection.execute(
          'SELECT id, name FROM organizations WHERE id = ?',
          [user.organization_id]
        );
        
        if (orgs.length > 0) {
          console.log('   ✅ Organización:', orgs[0].name);
        } else {
          console.log('   ❌ Organización no encontrada con ID:', user.organization_id);
        }
      } else {
        console.log('\n❌ PROBLEMA: Usuario no tiene organization_id asignado');
        console.log('   Esto causa el error 401 en /api/user/profile');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkInvitedUser();
