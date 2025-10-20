const mysql = require('mysql2/promise');

async function checkUserProfile() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'alecs',
    password: '123',
    database: 'boom_learn',
    connectTimeout: 10000,
    acquireTimeout: 10000,
    reconnect: true
  });

  try {
    console.log('🔍 Verificando usuario: 91f30f63-ade7-11f0-ad18-2e9b82b60d1c\n');

    // Verificar si el usuario existe
    const [users] = await connection.execute(
      'SELECT id, first_name, last_name, email, business_type, position, city, phone, organization_id, onboarding_completed FROM users WHERE id = ?',
      ['91f30f63-ade7-11f0-ad18-2e9b82b60d1c']
    );

    if (users.length === 0) {
      console.log('❌ Usuario NO existe en la tabla users');
      return;
    }

    console.log('✅ Usuario encontrado en tabla users:');
    console.log(JSON.stringify(users[0], null, 2));

    // Verificar organización si existe
    if (users[0].organization_id) {
      console.log('\n🏢 Verificando organización...');
      const [orgs] = await connection.execute(
        'SELECT id, name, business_type, size FROM organizations WHERE id = ?',
        [users[0].organization_id]
      );

      if (orgs.length > 0) {
        console.log('✅ Organización encontrada:');
        console.log(JSON.stringify(orgs[0], null, 2));
      } else {
        console.log('❌ Organización NO encontrada');
      }
    }

    // Probar la consulta del endpoint
    console.log('\n🔍 Probando consulta del endpoint...');
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.position,
        u.bio,
        u.city,
        u.profile_image,
        u.role,
        u.total_gems,
        u.first_login,
        u.onboarding_step,
        u.onboarding_completed,
        org.id as org_id,
        org.name as company_name,
        org.business_type,
        org.size as company_size,
        org.description as business_description,
        org.target_audience,
        org.mission,
        org.vision,
        org.values_json as 'values'
      FROM users u
      LEFT JOIN organizations org ON u.organization_id = org.id
      WHERE u.id = ?`;

    const [profileResults] = await connection.execute(query, ['91f30f63-ade7-11f0-ad18-2e9b82b60d1c']);
    
    console.log(`📊 Resultado consulta completa: ${profileResults.length} registros`);
    if (profileResults.length > 0) {
      console.log(JSON.stringify(profileResults[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUserProfile();