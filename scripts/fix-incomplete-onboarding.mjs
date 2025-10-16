import mysql from 'mysql2/promise'

async function fixIncompleteOnboarding() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  })

  console.log('🔍 Buscando usuarios con onboarding incompleto...')

  // Buscar usuarios marcados como completados pero sin organización o sin identidad
  const [incompleteUsers] = await connection.execute(`
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.onboarding_step,
      u.organization_id,
      org.identity_status
    FROM users u
    LEFT JOIN organizations org ON u.organization_id = org.id
    WHERE u.onboarding_step = 'completed'
    AND (
      u.organization_id IS NULL 
      OR org.identity_status IS NULL
      OR org.identity_status = 'pending'
    )
  `)

  console.log(`📊 Encontrados ${incompleteUsers.length} usuarios con onboarding incompleto`)

  if (incompleteUsers.length > 0) {
    console.log('👥 Usuarios a corregir:')
    incompleteUsers.forEach(user => {
      console.log(`- ${user.first_name} ${user.last_name} (${user.email})`)
      console.log(`  Organization ID: ${user.organization_id || 'NULL'}`)
      console.log(`  Identity Status: ${user.identity_status || 'NULL'}`)
    })

    // Resetear estos usuarios para que completen el onboarding correctamente
    const userIds = incompleteUsers.map(u => u.id)
    
    await connection.execute(`
      UPDATE users 
      SET 
        onboarding_step = 'identidad',
        onboarding_completed = false,
        can_access_dashboard = false
      WHERE id IN (${userIds.map(() => '?').join(',')})
    `, userIds)

    console.log('✅ Usuarios reseteados. Ahora deben completar el onboarding correctamente.')
  } else {
    console.log('✅ No se encontraron usuarios con onboarding incompleto')
  }

  await connection.end()
}

// Solo ejecutar si es un script standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  // Cargar variables de entorno manualmente
  const fs = await import('fs')
  const path = await import('path')
  
  try {
    const envFile = fs.readFileSync('.env.local', 'utf8')
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key] = value
      }
    })
  } catch (e) {
    console.warn('No se pudo cargar .env.local')
  }
  
  await fixIncompleteOnboarding()
}