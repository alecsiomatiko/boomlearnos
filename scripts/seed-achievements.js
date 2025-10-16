const mysql = require('mysql2/promise');

const dbConfig = {
  host: '151.106.99.1',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
  port: 3306
};

const sampleAchievements = [
  {
    id: 'first_task',
    name: 'Primera Tarea Completada',
    description: 'Completa tu primera tarea en el sistema',
    category: 'Productividad',
    points: 50,
    rarity: 'common',
    max_progress: 1,
    icon: 'Target',
    trigger_type: 'tasks_completed',
    trigger_value: 1,
    auto_unlock: true
  },
  {
    id: 'task_master',
    name: 'Maestro de Tareas',
    description: 'Completa 10 tareas',
    category: 'Productividad',
    points: 150,
    rarity: 'uncommon',
    max_progress: 10,
    icon: 'Trophy',
    trigger_type: 'tasks_completed',
    trigger_value: 10,
    auto_unlock: true
  },
  {
    id: 'task_legend',
    name: 'Leyenda de Productividad',
    description: 'Completa 50 tareas',
    category: 'Productividad',
    points: 500,
    rarity: 'epic',
    max_progress: 50,
    icon: 'Crown',
    trigger_type: 'tasks_completed',
    trigger_value: 50,
    auto_unlock: true
  },
  {
    id: 'streak_3',
    name: 'Racha Inicial',
    description: 'Mantén una racha de 3 días consecutivos',
    category: 'Consistencia',
    points: 75,
    rarity: 'common',
    max_progress: 3,
    icon: 'Flame',
    trigger_type: 'checkin_streak',
    trigger_value: 3,
    auto_unlock: true
  },
  {
    id: 'streak_7',
    name: 'Una Semana Dedicado',
    description: 'Mantén una racha de 7 días consecutivos',
    category: 'Consistencia',
    points: 200,
    rarity: 'uncommon',
    max_progress: 7,
    icon: 'Flame',
    trigger_type: 'checkin_streak',
    trigger_value: 7,
    auto_unlock: true
  },
  {
    id: 'streak_30',
    name: 'Mes Imparable',
    description: 'Mantén una racha de 30 días consecutivos',
    category: 'Consistencia',
    points: 1000,
    rarity: 'legendary',
    max_progress: 30,
    icon: 'Flame',
    trigger_type: 'checkin_streak',
    trigger_value: 30,
    auto_unlock: true
  },
  {
    id: 'gems_100',
    name: 'Coleccionista Novato',
    description: 'Acumula 100 gemas',
    category: 'Logros',
    points: 100,
    rarity: 'common',
    max_progress: 100,
    icon: 'Star',
    trigger_type: 'gems_earned',
    trigger_value: 100,
    auto_unlock: true
  },
  {
    id: 'gems_500',
    name: 'Buscador de Tesoros',
    description: 'Acumula 500 gemas',
    category: 'Logros',
    points: 250,
    rarity: 'rare',
    max_progress: 500,
    icon: 'Star',
    trigger_type: 'gems_earned',
    trigger_value: 500,
    auto_unlock: true
  },
  {
    id: 'gems_1000',
    name: 'Millonario de Gemas',
    description: 'Acumula 1000 gemas',
    category: 'Logros',
    points: 500,
    rarity: 'epic',
    max_progress: 1000,
    icon: 'Crown',
    trigger_type: 'gems_earned',
    trigger_value: 1000,
    auto_unlock: true
  },
  {
    id: 'communicator',
    name: 'Comunicador Activo',
    description: 'Envía 25 mensajes',
    category: 'Social',
    points: 100,
    rarity: 'uncommon',
    max_progress: 25,
    icon: 'Users',
    trigger_type: 'messages_sent',
    trigger_value: 25,
    auto_unlock: true
  }
];

async function seedAchievements() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos\n');

    // Obtener la organización (asumimos que es Supernova)
    const [orgs] = await connection.execute(`
      SELECT id, name FROM organizations LIMIT 1
    `);

    if (orgs.length === 0) {
      console.log('❌ No hay organizaciones en la base de datos');
      return;
    }

    const organizationId = orgs[0].id;
    const orgName = orgs[0].name;
    console.log(`🏢 Organización: ${orgName} (${organizationId})\n`);

    // Insertar logros
    console.log('📝 Insertando logros de ejemplo...\n');
    let inserted = 0;
    let skipped = 0;

    for (const achievement of sampleAchievements) {
      try {
        await connection.execute(
          `INSERT INTO achievements 
          (id, organization_id, name, description, category, points, rarity, max_progress, icon, trigger_type, trigger_value, auto_unlock, active) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
          [
            achievement.id,
            organizationId,
            achievement.name,
            achievement.description,
            achievement.category,
            achievement.points,
            achievement.rarity,
            achievement.max_progress,
            achievement.icon,
            achievement.trigger_type,
            achievement.trigger_value,
            achievement.auto_unlock
          ]
        );
        console.log(`✅ ${achievement.name} - ${achievement.trigger_type}: ${achievement.trigger_value}`);
        inserted++;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ ${achievement.name} - Ya existe`);
          skipped++;
        } else {
          throw error;
        }
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Insertados: ${inserted}`);
    console.log(`   ⚠️ Omitidos: ${skipped}`);
    console.log(`   📝 Total: ${sampleAchievements.length}\n`);

    // Mostrar logros creados
    const [achievements] = await connection.execute(`
      SELECT name, trigger_type, trigger_value, points, rarity, auto_unlock 
      FROM achievements 
      WHERE organization_id = ?
      ORDER BY points ASC
    `, [organizationId]);

    console.log('🏆 Logros en la organización:');
    console.table(achievements);

    console.log('\n✅ Logros de ejemplo creados exitosamente');
    console.log('\n💡 Ahora puedes probar:');
    console.log('   1. Completa una tarea para desbloquear "Primera Tarea Completada"');
    console.log('   2. Haz check-in 3 días seguidos para "Racha Inicial"');
    console.log('   3. Acumula gemas para desbloquear logros de coleccionista\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

seedAchievements().catch(console.error);
