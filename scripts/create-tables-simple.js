const mysql = require('mysql2/promise');

async function createTables() {
  const pool = mysql.createPool({
    host: 'srv440.hstgr.io',
    user: 'u191251575_BoomlearnOS',
    password: 'Cerounocero.com20182417',
    database: 'u191251575_BoomlearnOS'
  });

  try {
    console.log('🚀 Creando tablas de producción...');

    // 1. Tabla organizations
    console.log('📋 Creando tabla organizations...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mission TEXT,
        vision TEXT,
        values_json JSON,
        purpose_statement TEXT,
        tagline VARCHAR(255),
        brand_colors JSON,
        logo_url VARCHAR(500),
        industry VARCHAR(100),
        business_type VARCHAR(100),
        size ENUM('1-10', '11-50', '51-200', '201-1000', '1000+'),
        years_in_business INT,
        country VARCHAR(100),
        city VARCHAR(100),
        website VARCHAR(255),
        description TEXT,
        main_product_service TEXT,
        target_market TEXT,
        monthly_revenue DECIMAL(12,2),
        employee_count INT,
        main_challenges TEXT,
        business_goals TEXT,
        owner_id VARCHAR(36),
        identity_completed BOOLEAN DEFAULT FALSE,
        diagnostic_completed BOOLEAN DEFAULT FALSE,
        setup_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ organizations creada');

    // 2. Tabla user_organizations
    console.log('📋 Creando tabla user_organizations...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_organizations (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        organization_id VARCHAR(36) NOT NULL,
        role ENUM('owner', 'admin', 'manager', 'employee') DEFAULT 'owner',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        UNIQUE KEY unique_user_org (user_id, organization_id)
      )
    `);
    console.log('✅ user_organizations creada');

    // 3. Tabla diagnostic_answers
    console.log('📋 Creando tabla diagnostic_answers...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS diagnostic_answers (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        organization_id VARCHAR(36) NOT NULL,
        question_id VARCHAR(36) NOT NULL,
        answer_data JSON NOT NULL,
        confidence_level TINYINT DEFAULT 5,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_question (user_id, question_id)
      )
    `);
    console.log('✅ diagnostic_answers creada');

    // 4. Tabla user_gems
    console.log('📋 Creando tabla user_gems...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_gems (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        organization_id VARCHAR(36) NOT NULL,
        gems_count INT DEFAULT 0,
        total_earned INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_org_gems (user_id, organization_id)
      )
    `);
    console.log('✅ user_gems creada');

    // 5. Tabla user_medals
    console.log('📋 Creando tabla user_medals...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_medals (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        organization_id VARCHAR(36) NOT NULL,
        medal_code VARCHAR(50) NOT NULL,
        medal_name VARCHAR(255) NOT NULL,
        medal_description TEXT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ user_medals creada');

    // 6. Actualizar tabla users
    console.log('📋 Actualizando tabla users...');
    
    const alterCommands = [
      'ALTER TABLE users ADD COLUMN onboarding_step ENUM("personal", "business", "diagnostic", "completed") DEFAULT "personal"',
      'ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE',
      'ALTER TABLE users ADD COLUMN can_access_dashboard BOOLEAN DEFAULT FALSE',
      'ALTER TABLE users ADD COLUMN current_organization_id VARCHAR(36)',
      'ALTER TABLE users ADD COLUMN first_name VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN last_name VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN position VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN bio TEXT',
      'ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)',
      'ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE'
    ];

    for (const command of alterCommands) {
      try {
        await pool.execute(command);
        console.log('✅ Columna agregada:', command.split('ADD COLUMN ')[1]?.split(' ')[0] || 'columna');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️  Columna ya existe:', command.split('ADD COLUMN ')[1]?.split(' ')[0] || 'columna');
        } else {
          console.error('❌ Error agregando columna:', error.message);
        }
      }
    }

    console.log('🎉 ¡Todas las tablas creadas exitosamente!');

    // Verificar tablas
    const [tables] = await pool.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log('📋 Tablas verificadas:');
    ['users', 'organizations', 'user_organizations', 'diagnostic_answers', 'user_gems', 'user_medals'].forEach(table => {
      console.log(tableNames.includes(table) ? `  ✅ ${table}` : `  ❌ ${table}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

createTables();
