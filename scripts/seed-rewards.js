const mysql = require('mysql2/promise');

async function seedRewards() {
  const conn = await mysql.createConnection({
    host: '151.106.99.1',
    user: 'u191251575_BoomlearnOS',
    password: 'Cerounocero.com20182417',
    database: 'u191251575_BoomlearnOS'
  });

  console.log('✅ Conectado a la base de datos');

  try {
    // Obtener organización principal
    const [orgs] = await conn.execute(
      'SELECT id, name FROM organizations ORDER BY created_at ASC LIMIT 1'
    );
    const mainOrg = orgs[0];
    console.log(`🏢 Organización: ${mainOrg.name} (${mainOrg.id})`);

    // Recompensas de ejemplo profesionales
    const rewards = [
      {
        title: '30 Minutos Extra',
        description: 'Obtén 30 minutos adicionales de tiempo libre en tu jornada laboral',
        cost: 50,
        category: 'Tiempo',
        rarity: 'common',
        icon: 'Clock',
        stock_limit: -1
      },
      {
        title: '1 Hora de Descanso',
        description: 'Tómate una hora completa de descanso cuando quieras',
        cost: 100,
        category: 'Tiempo',
        rarity: 'rare',
        icon: 'Clock',
        stock_limit: 20
      },
      {
        title: 'Café Premium Gratis',
        description: 'Un café premium de tu elección en cualquier momento',
        cost: 25,
        category: 'Beneficios',
        rarity: 'common',
        icon: 'Gift',
        stock_limit: -1
      },
      {
        title: 'Almuerzo Premium',
        description: 'Disfruta de un almuerzo premium en el restaurante de tu elección',
        cost: 150,
        category: 'Beneficios',
        rarity: 'epic',
        icon: 'Star',
        stock_limit: 10
      },
      {
        title: 'Día de Home Office',
        description: 'Trabaja desde casa por un día completo',
        cost: 200,
        category: 'Tiempo',
        rarity: 'epic',
        icon: 'Target',
        stock_limit: 15
      },
      {
        title: 'Curso de Capacitación',
        description: 'Acceso a un curso online de tu elección (hasta $100 USD)',
        cost: 300,
        category: 'Desarrollo',
        rarity: 'legendary',
        icon: 'Trophy',
        stock_limit: 5
      },
      {
        title: 'Entrada de Cine Doble',
        description: 'Dos entradas para el cine en cualquier horario',
        cost: 120,
        category: 'Entretenimiento',
        rarity: 'rare',
        icon: 'Sparkles',
        stock_limit: 30
      },
      {
        title: 'Gift Card Amazon $25',
        description: 'Tarjeta de regalo de Amazon por valor de $25 USD',
        cost: 250,
        category: 'Premios',
        rarity: 'epic',
        icon: 'Package',
        stock_limit: 10
      },
      {
        title: 'Viernes Libre',
        description: 'Tómate el viernes libre sin afectar tus vacaciones',
        cost: 400,
        category: 'Tiempo',
        rarity: 'legendary',
        icon: 'Crown',
        stock_limit: 3
      },
      {
        title: 'Kit de Productividad',
        description: 'Kit completo con libreta, bolígrafos premium y accesorios de escritorio',
        cost: 80,
        category: 'Oficina',
        rarity: 'rare',
        icon: 'Zap',
        stock_limit: 25
      }
    ];

    console.log(`\n📦 Insertando ${rewards.length} recompensas...`);

    for (const reward of rewards) {
      await conn.execute(
        `INSERT INTO rewards 
          (organization_id, title, description, cost, category, rarity, icon, stock_limit, claimed_count, is_available, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, NOW(), NOW())`,
        [
          mainOrg.id,
          reward.title,
          reward.description,
          reward.cost,
          reward.category,
          reward.rarity,
          reward.icon,
          reward.stock_limit
        ]
      );
      console.log(`  ✅ ${reward.title} (${reward.rarity})`);
    }

    // Resumen
    console.log('\n📊 RESUMEN:');
    const [summary] = await conn.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN rarity = 'common' THEN 1 ELSE 0 END) as common,
        SUM(CASE WHEN rarity = 'rare' THEN 1 ELSE 0 END) as rare,
        SUM(CASE WHEN rarity = 'epic' THEN 1 ELSE 0 END) as epic,
        SUM(CASE WHEN rarity = 'legendary' THEN 1 ELSE 0 END) as legendary,
        AVG(cost) as avg_cost
      FROM rewards WHERE organization_id = ?`,
      [mainOrg.id]
    );

    const stats = summary[0];
    console.log(`  🎁 Total: ${stats.total} recompensas`);
    console.log(`  ⚪ Comunes: ${stats.common}`);
    console.log(`  🔵 Raras: ${stats.rare}`);
    console.log(`  🟣 Épicas: ${stats.epic}`);
    console.log(`  🟡 Legendarias: ${stats.legendary}`);
    console.log(`  💎 Costo promedio: ${Math.round(stats.avg_cost)} gemas`);

    console.log('\n✅ Recompensas creadas exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await conn.end();
  }
}

seedRewards().catch(console.error);
