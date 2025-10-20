// Script para verificar el estado del diagnóstico avanzado
const mysql = require('mysql2/promise')

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'boomlearn',
  port: parseInt(process.env.DB_PORT || '3306'),
}

async function checkDiagnosticStatus() {
  let connection
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    console.log('🔍 Verificando estado del diagnóstico avanzado...\n')
    
    // Verificar si existe la tabla advanced_diagnostics
    try {
      const [tables] = await connection.execute("SHOW TABLES LIKE 'advanced_diagnostics'")
      if (tables.length > 0) {
        console.log('✅ Tabla advanced_diagnostics existe')
        
        // Mostrar estructura
        const [structure] = await connection.execute("DESCRIBE advanced_diagnostics")
        console.log('📋 Estructura de la tabla:')
        structure.forEach(col => {
          console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''}`)
        })
        
        // Mostrar registros
        const [records] = await connection.execute("SELECT user_id, created_at, updated_at FROM advanced_diagnostics ORDER BY updated_at DESC LIMIT 5")
        console.log(`\n📊 Registros encontrados: ${records.length}`)
        records.forEach(record => {
          console.log(`   - Usuario: ${record.user_id}, Creado: ${record.created_at}`)
        })
        
      } else {
        console.log('❌ Tabla advanced_diagnostics NO existe')
      }
    } catch (error) {
      console.log('❌ Error verificando advanced_diagnostics:', error.message)
    }
    
    // Verificar tabla legacy
    try {
      const [legacyTables] = await connection.execute("SHOW TABLES LIKE 'onboarding_diagnostics'")
      if (legacyTables.length > 0) {
        console.log('\n✅ Tabla legacy onboarding_diagnostics existe')
        const [legacyRecords] = await connection.execute("SELECT user_id, created_at FROM onboarding_diagnostics ORDER BY created_at DESC LIMIT 3")
        console.log(`📊 Registros legacy: ${legacyRecords.length}`)
      } else {
        console.log('\n❌ Tabla legacy onboarding_diagnostics NO existe')
      }
    } catch (error) {
      console.log('\n❌ Error verificando onboarding_diagnostics:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkDiagnosticStatus()
}

module.exports = { checkDiagnosticStatus }