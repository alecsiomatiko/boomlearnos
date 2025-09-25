// Script de prueba para el flujo de onboarding
console.log('🧪 TESTING: Flujo de onboarding obligatorio');

// Simular registro de nuevo usuario
async function testUserRegistration() {
  console.log('\n1️⃣ Probando registro de usuario...');
  
  const userData = {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@test.com',
    password: '123456',
    phone: '+57 300 123 4567',
    city: 'Bogotá',
    businessType: 'Tecnología',
    position: 'CEO'
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    console.log('✅ Registro exitoso:', result);
    return result.user?.id;
  } catch (error) {
    console.error('❌ Error en registro:', error);
    return null;
  }
}

// Simular verificación de estado de onboarding
async function testOnboardingStatus(userId) {
  console.log('\n2️⃣ Verificando estado de onboarding...');
  
  try {
    const response = await fetch(`http://localhost:3000/api/onboarding/status?userId=${userId}`);
    const result = await response.json();
    console.log('✅ Estado de onboarding:', result);
    return result;
  } catch (error) {
    console.error('❌ Error obteniendo estado:', error);
    return null;
  }
}

// Simular completar identidad organizacional
async function testIdentityOnboarding(userId) {
  console.log('\n3️⃣ Completando identidad organizacional...');
  
  const identityData = {
    userId: userId,
    companyName: 'TechCorp Solutions',
    businessType: 'Desarrollo de Software',
    companySize: '11-50',
    businessDescription: 'Desarrollamos soluciones tecnológicas innovadoras para empresas medianas',
    targetAudience: 'Empresas medianas que buscan digitalizar sus procesos',
    mainChallenges: 'Competencia feroz en el mercado tech y retención de talento',
    currentGoals: 'Expandir a 3 países latinoamericanos en 2025',
    uniqueValue: 'Combinamos agilidad de startup con experiencia enterprise',
    workValues: 'Innovación, transparencia, colaboración',
    communicationStyle: 'Inspiracional'
  };

  try {
    const response = await fetch('http://localhost:3000/api/onboarding/identity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(identityData)
    });

    const result = await response.json();
    console.log('✅ Identidad organizacional completada:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Error en identidad organizacional:', error);
    return false;
  }
}

// Simular completar onboarding
async function testCompleteOnboarding(userId) {
  console.log('\n4️⃣ Completando onboarding...');
  
  try {
    const response = await fetch('http://localhost:3000/api/onboarding/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });

    const result = await response.json();
    console.log('✅ Onboarding completado:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Error completando onboarding:', error);
    return false;
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas del flujo de onboarding...\n');
  
  // 1. Registrar usuario
  const userId = await testUserRegistration();
  if (!userId) {
    console.log('❌ Falló el registro, deteniendo pruebas');
    return;
  }

  // 2. Verificar estado inicial
  await testOnboardingStatus(userId);

  // 3. Completar identidad organizacional
  const identitySuccess = await testIdentityOnboarding(userId);
  if (!identitySuccess) {
    console.log('❌ Falló la identidad organizacional, deteniendo pruebas');
    return;
  }

  // 4. Verificar estado después de identidad
  await testOnboardingStatus(userId);

  // 5. Completar onboarding
  const onboardingSuccess = await testCompleteOnboarding(userId);
  if (!onboardingSuccess) {
    console.log('❌ Falló completar onboarding');
    return;
  }

  // 6. Verificar estado final
  await testOnboardingStatus(userId);

  console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
  console.log('✅ El flujo de onboarding obligatorio está funcionando correctamente');
}

// Exportar función para usar desde Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}

// Ejecutar si se llama directamente
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}
