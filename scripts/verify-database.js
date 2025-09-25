// Script para verificar la estructura de la tabla organizations
const mysql = require('mysql2/promise')

// Configuración de la base de datos MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'srv440.hstgr.io',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'u191251575_BoomlearnOS',
  password: process.env.DB_PASSWORD || 'Cerounocero.com20182417',
  database: process.env.DB_NAME || 'u191251575_BoomlearnOS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00'
}

async function executeQuery(query, params = []) {
  const connection = await mysql.createConnection(dbConfig)
  try {
    const [results] = await connection.execute(query, params)
    return results
  } finally {
    await connection.end()
  }
}

async function verifyTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla organizations...')
    
    const columns = await executeQuery(`DESCRIBE organizations`)
    console.log('✅ Columnas en la tabla organizations:')
    columns.forEach((col) => {
      console.log(`   - ${col.Field} (${col.Type})`)
    })
    
    // Probar inserción básica
    console.log('\n🧪 Probando inserción básica...')
    const testId = 'test-' + Date.now()
    await executeQuery(`
      INSERT INTO organizations (
        id, name, business_type, size, description, target_audience,
        main_challenges, current_goals, unique_value, work_values,
        communication_style, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      testId, 'Test Company', 'Technology', '1-10', 'Test description',
      'Test audience', 'Test challenges', 'Test goals', 'Test value',
      'Test values', 'Professional', 'test-user'
    ])
    
    console.log('✅ Inserción exitosa')
    
    // Limpiar test
    await executeQuery(`DELETE FROM organizations WHERE id = ?`, [testId])
    console.log('✅ Test limpiado')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyTable()
