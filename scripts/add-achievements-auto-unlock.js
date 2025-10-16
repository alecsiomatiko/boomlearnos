const mysql = require('mysql2/promise');

const dbConfig = {
  host: '151.106.99.1',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
  port: 3306
};

async function addAutoUnlockColumns() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos\n');

    // 1. Verificar si la tabla achievements existe
    console.log('📋 Verificando tabla achievements...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'u191251575_BoomlearnOS' 
      AND TABLE_NAME = 'achievements'
    `);

    if (tables.length === 0) {
      console.log('❌ La tabla achievements NO existe. Creándola primero...\n');
      
      await connection.execute(`
        CREATE TABLE achievements (
          id VARCHAR(50) PRIMARY KEY,
          organization_id VARCHAR(36) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          points INT DEFAULT 0,
          rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
          max_progress INT DEFAULT 1,
          icon VARCHAR(50) DEFAULT 'Target',
          active BOOLEAN DEFAULT true,
          trigger_type ENUM('manual', 'tasks_completed', 'checkin_streak', 'gems_earned', 'messages_sent') DEFAULT 'manual',
          trigger_value INT DEFAULT 0,
          auto_unlock BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_organization (organization_id),
          INDEX idx_auto_unlock (auto_unlock, active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ Tabla achievements creada con todas las columnas\n');
    } else {
      console.log('✅ La tabla achievements existe\n');
      
      // 2. Verificar y agregar columnas si no existen
      console.log('📊 Verificando columnas...');
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'u191251575_BoomlearnOS' 
        AND TABLE_NAME = 'achievements'
      `);
      
      const existingColumns = columns.map((c: any) => c.COLUMN_NAME);
      console.log('Columnas existentes:', existingColumns.join(', '));
      
      // Agregar trigger_type si no existe
      if (!existingColumns.includes('trigger_type')) {
        console.log('\n➕ Agregando columna trigger_type...');
        await connection.execute(`
          ALTER TABLE achievements 
          ADD COLUMN trigger_type ENUM('manual', 'tasks_completed', 'checkin_streak', 'gems_earned', 'messages_sent') DEFAULT 'manual' AFTER active
        `);
        console.log('✅ Columna trigger_type agregada');
      } else {
        console.log('✓ trigger_type ya existe');
      }
      
      // Agregar trigger_value si no existe
      if (!existingColumns.includes('trigger_value')) {
        console.log('➕ Agregando columna trigger_value...');
        await connection.execute(`
          ALTER TABLE achievements 
          ADD COLUMN trigger_value INT DEFAULT 0 AFTER trigger_type
        `);
        console.log('✅ Columna trigger_value agregada');
      } else {
        console.log('✓ trigger_value ya existe');
      }
      
      // Agregar auto_unlock si no existe
      if (!existingColumns.includes('auto_unlock')) {
        console.log('➕ Agregando columna auto_unlock...');
        await connection.execute(`
          ALTER TABLE achievements 
          ADD COLUMN auto_unlock BOOLEAN DEFAULT false AFTER trigger_value
        `);
        console.log('✅ Columna auto_unlock agregada');
      } else {
        console.log('✓ auto_unlock ya existe');
      }
      
      // Agregar índice para auto_unlock si no existe
      console.log('\n📊 Verificando índices...');
      const [indexes] = await connection.execute(`
        SHOW INDEX FROM achievements WHERE Key_name = 'idx_auto_unlock'
      `);
      
      if (indexes.length === 0) {
        console.log('➕ Creando índice idx_auto_unlock...');
        await connection.execute(`
          ALTER TABLE achievements 
          ADD INDEX idx_auto_unlock (auto_unlock, active)
        `);
        console.log('✅ Índice idx_auto_unlock creado');
      } else {
        console.log('✓ Índice idx_auto_unlock ya existe');
      }
    }

    // 3. Verificar tabla user_achievements
    console.log('\n📋 Verificando tabla user_achievements...');
    const [userAchievementsTables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'u191251575_BoomlearnOS' 
      AND TABLE_NAME = 'user_achievements'
    `);

    if (userAchievementsTables.length === 0) {
      console.log('❌ La tabla user_achievements NO existe. Creándola...\n');
      
      await connection.execute(`
        CREATE TABLE user_achievements (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          achievement_id VARCHAR(50) NOT NULL,
          organization_id VARCHAR(36) NOT NULL,
          progress INT DEFAULT 0,
          max_progress INT DEFAULT 1,
          unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user (user_id),
          INDEX idx_achievement (achievement_id),
          INDEX idx_organization (organization_id),
          UNIQUE KEY unique_user_achievement (user_id, achievement_id),
          FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ Tabla user_achievements creada\n');
    } else {
      console.log('✅ La tabla user_achievements existe\n');
    }

    // 4. Mostrar estructura final
    console.log('📊 Estructura final de achievements:');
    const [finalColumns] = await connection.execute('DESCRIBE achievements');
    console.table(finalColumns);

    // 5. Insertar logros de ejemplo si no hay ninguno
    const [achievementCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM achievements'
    ) as any[];
    
    if (achievementCount[0].count === 0) {
      console.log('\n💡 No hay logros. ¿Deseas crear ejemplos? (Ejecuta scripts/seed-achievements.js)\n');
    } else {
      console.log(`\n✅ Hay ${achievementCount[0].count} logro(s) en la base de datos\n`);
    }

    console.log('✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

addAutoUnlockColumns().catch(console.error);
