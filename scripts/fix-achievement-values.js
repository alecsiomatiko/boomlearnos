const mysql = require('mysql2/promise');

const dbConfig = {
  host: '151.106.99.1',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
  port: 3306
};

async function fixAchievementValues() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado\n');

    // Corregir "5 Tareas Completadas"
    await connection.execute(`
      UPDATE achievements 
      SET trigger_value = 5
      WHERE name LIKE '%5%Tarea%'
    `);

    // Mostrar logros actualizados
    const [achievements] = await connection.execute(`
      SELECT id, name, trigger_type, trigger_value, auto_unlock, points
      FROM achievements
      ORDER BY points ASC
    `);

    console.log('🏆 Logros actualizados:');
    console.table(achievements);

    console.log('\n✅ Corrección completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixAchievementValues().catch(console.error);
