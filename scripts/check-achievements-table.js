const mysql = require('mysql2/promise');

const dbConfig = {
  host: '151.106.99.1',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
  port: 3306
};

async function checkAchievementsTable() {
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
      console.log('❌ La tabla achievements NO existe. Creándola...\n');
      
      // Crear la tabla achievements
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_organization (organization_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ Tabla achievements creada exitosamente\n');
    } else {
      console.log('✅ La tabla achievements existe\n');
    }

    // 2. Mostrar estructura de la tabla
    console.log('📊 Estructura de la tabla achievements:');
    const [columns] = await connection.execute('DESCRIBE achievements');
    console.table(columns);

    // 3. Contar logros por organización
    console.log('\n📈 Logros por organización:');
    const [orgStats] = await connection.execute(`
      SELECT 
        a.organization_id,
        o.name as org_name,
        COUNT(*) as total_achievements,
        SUM(CASE WHEN a.active = 1 THEN 1 ELSE 0 END) as active_achievements,
        SUM(a.points) as total_points
      FROM achievements a
      LEFT JOIN organizations o ON a.organization_id = o.id
      GROUP BY a.organization_id, o.name
    `);
    
    if (orgStats.length > 0) {
      console.table(orgStats);
    } else {
      console.log('⚠️ No hay logros en ninguna organización\n');
    }

    // 4. Mostrar todos los logros
    console.log('\n🏆 Todos los logros en la base de datos:');
    const [achievements] = await connection.execute(`
      SELECT 
        id,
        name,
        category,
        points,
        rarity,
        max_progress,
        active,
        organization_id
      FROM achievements
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    if (achievements.length > 0) {
      console.table(achievements);
    } else {
      console.log('⚠️ No hay logros creados todavía\n');
    }

    // 5. Verificar tabla user_badges (la que se usa para almacenar logros desbloqueados)
    console.log('\n📋 Verificando tabla user_badges...');
    const [badgesTables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'u191251575_BoomlearnOS' 
      AND TABLE_NAME = 'user_badges'
    `);

    if (badgesTables.length > 0) {
      console.log('✅ La tabla user_badges existe\n');
      
      // Contar logros desbloqueados por usuario
      const [userBadges] = await connection.execute(`
        SELECT 
          u.name,
          u.email,
          COUNT(ub.id) as badges_count,
          SUM(b.points) as total_points
        FROM user_badges ub
        JOIN users u ON ub.user_id = u.id
        LEFT JOIN badges b ON ub.badge_id = b.id
        GROUP BY u.id, u.name, u.email
        LIMIT 10
      `);
      
      if (userBadges.length > 0) {
        console.log('👥 Logros desbloqueados por usuario:');
        console.table(userBadges);
      } else {
        console.log('⚠️ No hay logros desbloqueados todavía\n');
      }
    } else {
      console.log('❌ La tabla user_badges NO existe\n');
    }

    console.log('\n✅ Verificación completada');

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

checkAchievementsTable().catch(console.error);
