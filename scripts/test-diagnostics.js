const { executeQuery } = require('../lib/server/mysql');

async function testAPIs() {
  try {
    console.log('🔍 Probando API de diagnósticos...\n');
    
    // 1. Probar datos de onboarding
    console.log('1. Verificando datos de onboarding:');
    const onboardingData = await executeQuery(`
      SELECT COUNT(*) as total, user_id, created_at
      FROM onboarding_diagnostics
      ORDER BY created_at DESC
      LIMIT 3
    `);
    console.log('   Total diagnósticos onboarding:', onboardingData[0]?.total || 0);
    
    // 2. Probar datos de usuario
    console.log('\n2. Verificando usuarios:');
    const users = await executeQuery(`
      SELECT id, first_name, last_name, onboarding_completed, created_at
      FROM users 
      WHERE onboarding_completed = true
      ORDER BY created_at DESC
      LIMIT 3
    `);
    console.log(`   Usuarios con onboarding completado: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.id})`);
    });

    // 3. Probar datos de organización
    console.log('\n3. Verificando organizaciones:');
    const orgs = await executeQuery(`
      SELECT id, name, business_type, created_by, created_at
      FROM organizations
      ORDER BY created_at DESC
      LIMIT 3
    `);
    console.log(`   Total organizaciones: ${orgs.length}`);
    orgs.forEach((org, index) => {
      console.log(`   ${index + 1}. ${org.name} - ${org.business_type} (creada por: ${org.created_by})`);
    });

    // 4. Correlacionar datos
    if (users.length > 0 && onboardingData.length > 0) {
      console.log('\n4. ✅ RESULTADO: Hay datos para mostrar "1/2" completado');
      console.log('   - Diagnóstico onboarding: ✅ COMPLETADO');
      console.log('   - Mega diagnóstico: ⏳ PENDIENTE');
    } else {
      console.log('\n4. ❌ PROBLEMA: No hay datos suficientes');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPIs();
