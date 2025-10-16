const mysql = require('mysql2/promise');

const dbConfig = {
  host: '151.106.99.1',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
  port: 3306
};

async function migrateExistingAchievements() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos\n');

    // 1. Obtener la organización principal
    const [orgs] = await connection.execute(`
      SELECT id, name FROM organizations ORDER BY created_at ASC LIMIT 1
    `);

    if (orgs.length === 0) {
      console.log('❌ No hay organizaciones en la base de datos');
      return;
    }

    const organizationId = orgs[0].id;
    const orgName = orgs[0].name;
    console.log(`🏢 Organización principal: ${orgName} (${organizationId})\n`);

    // 2. Verificar estructura de la tabla achievements
    console.log('📊 Verificando estructura de achievements...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'u191251575_BoomlearnOS' 
      AND TABLE_NAME = 'achievements'
    `);
    
    const existingColumns = columns.map((c) => c.COLUMN_NAME);
    console.log('Columnas existentes:', existingColumns.join(', '), '\n');

    // 3. Agregar columnas faltantes si no existen
    if (!existingColumns.includes('organization_id')) {
      console.log('➕ Agregando columna organization_id...');
      await connection.execute(`
        ALTER TABLE achievements 
        ADD COLUMN organization_id VARCHAR(36) NULL AFTER id
      `);
      console.log('✅ Columna organization_id agregada\n');
    }

    if (!existingColumns.includes('trigger_type')) {
      console.log('➕ Agregando columna trigger_type...');
      await connection.execute(`
        ALTER TABLE achievements 
        ADD COLUMN trigger_type ENUM('manual', 'tasks_completed', 'checkin_streak', 'gems_earned', 'messages_sent') DEFAULT 'manual' AFTER active
      `);
      console.log('✅ Columna trigger_type agregada\n');
    }

    if (!existingColumns.includes('trigger_value')) {
      console.log('➕ Agregando columna trigger_value...');
      await connection.execute(`
        ALTER TABLE achievements 
        ADD COLUMN trigger_value INT DEFAULT 0 AFTER trigger_type
      `);
      console.log('✅ Columna trigger_value agregada\n');
    }

    if (!existingColumns.includes('auto_unlock')) {
      console.log('➕ Agregando columna auto_unlock...');
      await connection.execute(`
        ALTER TABLE achievements 
        ADD COLUMN auto_unlock BOOLEAN DEFAULT false AFTER trigger_value
      `);
      console.log('✅ Columna auto_unlock agregada\n');
    }

    // 4. Actualizar logros existentes sin organization_id
    console.log('🔄 Actualizando logros existentes...');
    const [updateResult] = await connection.execute(`
      UPDATE achievements 
      SET organization_id = ? 
      WHERE organization_id IS NULL OR organization_id = ''
    `, [organizationId]);

    console.log(`✅ ${updateResult.affectedRows} logros actualizados con organization_id\n`);

    // 5. Mapear categorías a trigger_type automáticos
    console.log('🎯 Configurando trigger_type según categoría...');
    
    const triggerMappings = [
      { pattern: '%tarea%', trigger_type: 'tasks_completed', trigger_value: 1 },
      { pattern: '%racha%', trigger_type: 'checkin_streak', trigger_value: 3 },
      { pattern: '%streak%', trigger_type: 'checkin_streak', trigger_value: 3 },
      { pattern: '%gem%', trigger_type: 'gems_earned', trigger_value: 100 },
      { pattern: '%mensaje%', trigger_type: 'messages_sent', trigger_value: 10 }
    ];

    for (const mapping of triggerMappings) {
      const [result] = await connection.execute(`
        UPDATE achievements 
        SET 
          trigger_type = ?,
          trigger_value = ?,
          auto_unlock = TRUE
        WHERE (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)
          AND trigger_type = 'manual'
          AND organization_id = ?
      `, [mapping.trigger_type, mapping.trigger_value, mapping.pattern, mapping.pattern, organizationId]);
      
      if (result.affectedRows > 0) {
        console.log(`  ✅ ${result.affectedRows} logros configurados como ${mapping.trigger_type}`);
      }
    }

    // 6. Actualizar valores específicos basados en el nombre
    console.log('\n🔢 Ajustando valores específicos...');
    
    const specificUpdates = [
      { pattern: '%10%tarea%', value: 10 },
      { pattern: '%50%tarea%', value: 50 },
      { pattern: '%7%día%', value: 7 },
      { pattern: '%30%día%', value: 30 },
      { pattern: '%500%gem%', value: 500 },
      { pattern: '%1000%gem%', value: 1000 }
    ];

    for (const update of specificUpdates) {
      const [result] = await connection.execute(`
        UPDATE achievements 
        SET trigger_value = ?
        WHERE (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)
          AND trigger_value != ?
          AND organization_id = ?
      `, [update.value, update.pattern, update.pattern, update.value, organizationId]);
      
      if (result.affectedRows > 0) {
        console.log(`  ✅ ${result.affectedRows} logros actualizados a valor ${update.value}`);
      }
    }

    // 7. Mostrar resumen final
    console.log('\n📊 Resumen de logros configurados:');
    const [achievements] = await connection.execute(`
      SELECT 
        id,
        name,
        category,
        points,
        rarity,
        trigger_type,
        trigger_value,
        auto_unlock,
        active
      FROM achievements
      WHERE organization_id = ?
      ORDER BY points ASC
    `, [organizationId]);

    console.table(achievements);

    // 8. Estadísticas
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN auto_unlock = TRUE THEN 1 ELSE 0 END) as auto_unlock_count,
        SUM(CASE WHEN active = TRUE THEN 1 ELSE 0 END) as active_count,
        COUNT(DISTINCT trigger_type) as trigger_types,
        COUNT(DISTINCT category) as categories
      FROM achievements
      WHERE organization_id = ?
    `, [organizationId]);

    console.log('\n📈 Estadísticas:');
    console.log(`   Total de logros: ${stats[0].total}`);
    console.log(`   Con auto-desbloqueo: ${stats[0].auto_unlock_count}`);
    console.log(`   Activos: ${stats[0].active_count}`);
    console.log(`   Tipos de trigger: ${stats[0].trigger_types}`);
    console.log(`   Categorías: ${stats[0].categories}`);

    console.log('\n✅ Migración completada exitosamente');
    console.log('\n💡 Ahora puedes:');
    console.log('   1. Ir a /admin/achievements para ver y editar todos los logros');
    console.log('   2. Crear nuevos logros desde el panel de admin');
    console.log('   3. Los logros automáticos se desbloquearán según las condiciones configuradas\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

migrateExistingAchievements().catch(console.error);
