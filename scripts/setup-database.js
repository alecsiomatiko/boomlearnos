// Script para crear la tabla organizations
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

async function createOrganizationsTable() {
  try {
    console.log('🔧 Creando tabla organizations...')
    
    // Crear tabla organizations
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100),
        size VARCHAR(50),
        description TEXT,
        target_audience TEXT,
        main_challenges TEXT,
        current_goals TEXT,
        unique_value TEXT,
        work_values TEXT,
        communication_style VARCHAR(50),
        mission TEXT,
        vision TEXT,
        values_json TEXT,
        identity_status VARCHAR(50) DEFAULT 'pending',
        identity_generated_at TIMESTAMP NULL,
        ai_generation_failed BOOLEAN DEFAULT FALSE,
        ai_error_message TEXT,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    
    console.log('✅ Tabla organizations creada exitosamente')
    
    // Agregar columnas faltantes si no existen
    const columnsToAdd = [
      'target_audience TEXT',
      'main_challenges TEXT',
      'current_goals TEXT',
      'unique_value TEXT',
      'work_values TEXT',
      'communication_style VARCHAR(50)',
      'identity_status VARCHAR(50) DEFAULT \'pending\'',
      'identity_generated_at TIMESTAMP NULL',
      'ai_generation_failed BOOLEAN DEFAULT FALSE',
      'ai_error_message TEXT'
    ]
    
    for (const column of columnsToAdd) {
      try {
        const columnName = column.split(' ')[0]
        await executeQuery(`ALTER TABLE organizations ADD COLUMN ${column}`)
        console.log(`✅ Columna ${columnName} agregada`)
      } catch (e) {
        console.log(`ℹ️ Columna ${column.split(' ')[0]} ya existe`)
      }
    }
    
    // Crear índices
    try {
      await executeQuery(`CREATE INDEX idx_organizations_created_by ON organizations(created_by)`)
      console.log('✅ Índice created_by creado')
    } catch (e) {
      console.log('ℹ️ Índice created_by ya existe')
    }
    
    try {
      await executeQuery(`CREATE INDEX idx_organizations_identity_status ON organizations(identity_status)`)
      console.log('✅ Índice identity_status creado')
    } catch (e) {
      console.log('ℹ️ Índice identity_status ya existe')
    }
    
    // Verificar si es necesario agregar columnas a users
    try {
      await executeQuery(`ALTER TABLE users ADD COLUMN organization_id VARCHAR(36)`)
      console.log('✅ Columna organization_id agregada a users')
    } catch (e) {
      console.log('ℹ️ Columna organization_id ya existe en users')
    }
    
    try {
      await executeQuery(`ALTER TABLE users ADD COLUMN onboarding_step VARCHAR(50) DEFAULT 'personal'`)
      console.log('✅ Columna onboarding_step agregada a users')
    } catch (e) {
      console.log('ℹ️ Columna onboarding_step ya existe en users')
    }
    
    try {
      await executeQuery(`ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE`)
      console.log('✅ Columna onboarding_completed agregada a users')
    } catch (e) {
      console.log('ℹ️ Columna onboarding_completed ya existe en users')
    }
    
    try {
      await executeQuery(`ALTER TABLE users ADD COLUMN can_access_dashboard BOOLEAN DEFAULT FALSE`)
      console.log('✅ Columna can_access_dashboard agregada a users')
    } catch (e) {
      console.log('ℹ️ Columna can_access_dashboard ya existe en users')
    }
    
    console.log('🎉 Base de datos actualizada correctamente!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createOrganizationsTable()
