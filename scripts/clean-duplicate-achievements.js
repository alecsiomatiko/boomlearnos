const mysql = require('mysql2/promise');

const dbConfig = {
  host: '151.106.99.1',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
  port: 3306
};

async function cleanDuplicateAchievements() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado\n');

    // 1. Mostrar todos los logros actuales
    console.log('📋 Logros actuales:');
    const [before] = await connection.execute(`
      SELECT id, name, organization_id, trigger_type, trigger_value, auto_unlock, points
      FROM achievements
      ORDER BY name, points
    `);
    console.table(before);

    // 2. Encontrar duplicados por nombre
    const [duplicates] = await connection.execute(`
      SELECT name, COUNT(*) as count
      FROM achievements
      GROUP BY name
      HAVING count > 1
    `);

    console.log(`\n🔍 Encontrados ${duplicates.length} nombres duplicados\n`);

    // 3. Para cada duplicado, mantener solo el que tiene auto_unlock = true
    for (const dup of duplicates) {
      console.log(`📌 Procesando duplicados de: "${dup.name}"`);
      
      // Obtener todos los registros con ese nombre
      const [records] = await connection.execute(`
        SELECT id, auto_unlock, trigger_type, organization_id
        FROM achievements
        WHERE name = ?
        ORDER BY auto_unlock DESC, created_at ASC
      `, [dup.name]);

      if (records.length > 1) {
        // Mantener el primero (que tiene auto_unlock = true si existe)
        const keepId = records[0].id;
        const deleteIds = records.slice(1).map(r => r.id);

        console.log(`   ✅ Manteniendo: ${keepId} (auto_unlock: ${records[0].auto_unlock})`);
        console.log(`   🗑️ Eliminando: ${deleteIds.length} duplicado(s)`);

        // Eliminar duplicados
        for (const deleteId of deleteIds) {
          // Primero eliminar referencias en user_badges
          await connection.execute(`
            DELETE FROM user_badges WHERE badge_id = ?
          `, [deleteId]);

          // Luego eliminar el achievement
          await connection.execute(`
            DELETE FROM achievements WHERE id = ?
          `, [deleteId]);
        }

        // Si el que mantuvimos no tiene organization_id, actualizarlo
        if (!records[0].organization_id) {
          const [org] = await connection.execute(`
            SELECT id FROM organizations LIMIT 1
          `);
          if (org.length > 0) {
            await connection.execute(`
              UPDATE achievements SET organization_id = ? WHERE id = ?
            `, [org[0].id, keepId]);
            console.log(`   📝 Organization_id actualizado`);
          }
        }
      }
    }

    // 4. Actualizar logros que no tienen auto_unlock configurado
    console.log('\n🔧 Configurando auto_unlock para logros pendientes...');
    
    await connection.execute(`
      UPDATE achievements 
      SET auto_unlock = TRUE
      WHERE trigger_type != 'manual' 
        AND trigger_value > 0
        AND auto_unlock = FALSE
    `);

    // 5. Mostrar resultado final
    console.log('\n📊 Logros finales:');
    const [after] = await connection.execute(`
      SELECT id, name, category, trigger_type, trigger_value, auto_unlock, points, organization_id
      FROM achievements
      ORDER BY points ASC
    `);
    console.table(after);

    // 6. Estadísticas
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN auto_unlock = TRUE THEN 1 ELSE 0 END) as auto_count,
        SUM(CASE WHEN organization_id IS NOT NULL THEN 1 ELSE 0 END) as with_org
      FROM achievements
    `);

    console.log('\n📈 Resumen:');
    console.log(`   Total de logros: ${stats[0].total}`);
    console.log(`   Con auto-unlock: ${stats[0].auto_count}`);
    console.log(`   Con organization_id: ${stats[0].with_org}`);

    console.log('\n✅ Limpieza completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

cleanDuplicateAchievements().catch(console.error);
