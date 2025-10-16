const mysql = require('mysql2/promise');

async function migrateRewardsSystem() {
  const conn = await mysql.createConnection({
    host: '151.106.99.1',
    user: 'u191251575_BoomlearnOS',
    password: 'Cerounocero.com20182417',
    database: 'u191251575_BoomlearnOS'
  });

  console.log('✅ Conectado a la base de datos');

  try {
    // 1. Obtener organización principal
    const [orgs] = await conn.execute(
      'SELECT id, name FROM organizations ORDER BY created_at ASC LIMIT 1'
    );
    const mainOrg = orgs[0];
    console.log(`🏢 Organización principal: ${mainOrg.name} (${mainOrg.id})`);

    // 2. Verificar estructura actual
    const [currentCols] = await conn.execute('DESCRIBE rewards');
    const orgIdCol = currentCols.find(col => col.Field === 'organization_id');
    console.log(`📋 Tipo actual de organization_id: ${orgIdCol?.Type || 'No existe'}`);

    // 3. Si organization_id es INT, cambiarlo a VARCHAR(36)
    if (orgIdCol?.Type?.includes('int')) {
      console.log('🔄 Convirtiendo organization_id de INT a VARCHAR(36)...');
      
      // Primero eliminar el índice si existe
      try {
        await conn.execute('ALTER TABLE rewards DROP INDEX idx_org_available');
        console.log('  ✅ Índice eliminado');
      } catch (e) {
        console.log('  ℹ️  Índice no existía');
      }

      // Cambiar tipo de columna
      await conn.execute(
        'ALTER TABLE rewards MODIFY COLUMN organization_id VARCHAR(36) NULL'
      );
      console.log('  ✅ organization_id ahora es VARCHAR(36)');
    }

    // 4. Actualizar todas las recompensas a la organización principal
    console.log('🔄 Actualizando organization_id en todas las recompensas...');
    await conn.execute(
      'UPDATE rewards SET organization_id = ?',
      [mainOrg.id]
    );
    console.log('  ✅ Todas las recompensas actualizadas');

    // 5. Crear índice compuesto para mejor rendimiento
    try {
      await conn.execute(
        'CREATE INDEX idx_rewards_org_available ON rewards(organization_id, is_available)'
      );
      console.log('✅ Índice compuesto creado');
    } catch (e) {
      console.log('ℹ️  Índice ya existe');
    }

    // 6. Verificar tabla user_rewards
    console.log('\n🔍 Verificando tabla user_rewards...');
    const [tables] = await conn.execute(
      "SHOW TABLES LIKE 'user_rewards'"
    );
    
    if (tables.length === 0) {
      console.log('⚠️  Tabla user_rewards no existe, creándola...');
      await conn.execute(`
        CREATE TABLE user_rewards (
          id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
          user_id VARCHAR(36) NOT NULL,
          reward_id VARCHAR(36) NOT NULL,
          organization_id VARCHAR(36) NOT NULL,
          claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status ENUM('claimed', 'used', 'expired') DEFAULT 'claimed',
          notes TEXT,
          INDEX idx_user_rewards_user (user_id),
          INDEX idx_user_rewards_reward (reward_id),
          INDEX idx_user_rewards_org (organization_id),
          INDEX idx_user_rewards_status (status),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('  ✅ Tabla user_rewards creada');
    } else {
      console.log('  ✅ Tabla user_rewards existe');
      
      // Verificar si tiene organization_id
      const [userRewardsCols] = await conn.execute('DESCRIBE user_rewards');
      const hasOrgId = userRewardsCols.some(col => col.Field === 'organization_id');
      
      if (!hasOrgId) {
        console.log('  🔄 Agregando organization_id a user_rewards...');
        await conn.execute(
          'ALTER TABLE user_rewards ADD COLUMN organization_id VARCHAR(36) NULL AFTER reward_id'
        );
        
        // Actualizar registros existentes
        await conn.execute(`
          UPDATE user_rewards ur
          JOIN rewards r ON ur.reward_id = r.id
          SET ur.organization_id = r.organization_id
        `);
        
        console.log('  ✅ organization_id agregado y actualizado');
      }
    }

    // 7. Resumen final
    console.log('\n📊 RESUMEN:');
    const [rewards] = await conn.execute(
      'SELECT COUNT(*) as total, SUM(is_available) as available FROM rewards WHERE organization_id = ?',
      [mainOrg.id]
    );
    const [userRewards] = await conn.execute(
      'SELECT COUNT(*) as total FROM user_rewards WHERE organization_id = ?',
      [mainOrg.id]
    );
    
    console.log(`  🎁 Total recompensas: ${rewards[0].total}`);
    console.log(`  ✅ Recompensas disponibles: ${rewards[0].available}`);
    console.log(`  👥 Recompensas reclamadas: ${userRewards[0].total}`);
    console.log(`  🏢 Organización: ${mainOrg.name}`);
    
    console.log('\n✅ Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    await conn.end();
  }
}

migrateRewardsSystem().catch(console.error);
