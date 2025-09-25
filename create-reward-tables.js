const mysql = require('mysql2/promise');

async function createRewardTables() {
  const connection = await mysql.createConnection({
    host: 'srv440.hstgr.io',
    user: 'u191251575_BoomlearnOS',  
    password: 'Cerounocero.com20182417',
    database: 'u191251575_BoomlearnOS'
  });
  
  console.log('🏆 Creando tablas de recompensas...');
  
  // Tabla de gemas de usuario
  const createUserGemsSQL = `
    CREATE TABLE IF NOT EXISTS user_gems (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      user_id VARCHAR(36) NOT NULL,
      gems_earned INT NOT NULL,
      activity_type VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  
  // Tabla de medallas de usuario
  const createUserMedalsSQL = `
    CREATE TABLE IF NOT EXISTS user_medals (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      user_id VARCHAR(36) NOT NULL,
      medal_id VARCHAR(100) NOT NULL,
      medal_name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100) NOT NULL,
      earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_medal_id (medal_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  
  await connection.execute(createUserGemsSQL);
  console.log('✅ Tabla user_gems creada');
  
  await connection.execute(createUserMedalsSQL);
  console.log('✅ Tabla user_medals creada');
  
  // Verificar estructuras
  console.log('\n📋 Estructura user_gems:');
  const [gemsColumns] = await connection.execute('DESCRIBE user_gems');
  gemsColumns.forEach(col => console.log('-', col.Field, ':', col.Type));
  
  console.log('\n📋 Estructura user_medals:');
  const [medalsColumns] = await connection.execute('DESCRIBE user_medals');
  medalsColumns.forEach(col => console.log('-', col.Field, ':', col.Type));
  
  await connection.end();
}

createRewardTables().catch(console.error);
