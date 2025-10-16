require('dotenv').config();
const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function createDefaultAchievements() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('🏆 CREANDO LOGROS PREDETERMINADOS\n');
  console.log('==================================\n');

  try {
    // Obtener las 2 organizaciones
    const [orgs] = await connection.query('SELECT id, name FROM organizations ORDER BY created_at');
    
    if (orgs.length === 0) {
      console.log('❌ No hay organizaciones en el sistema');
      return;
    }

    console.log(`📦 Organizaciones encontradas: ${orgs.length}\n`);

    const achievements = [
      {
        name: 'Primera Tarea Completada',
        description: '¡Felicitaciones! Completaste tu primera tarea',
        category: 'Tareas',
        points: 50,
        rarity: 'common',
        max_progress: 1,
        icon: '✅',
        active: true
      },
      {
        name: 'Racha de 3 días',
        description: 'Hiciste check-in 3 días seguidos',
        category: 'Constancia',
        points: 100,
        rarity: 'rare',
        max_progress: 3,
        icon: '🔥',
        active: true
      },
      {
        name: '5 Tareas Completadas',
        description: 'Completaste 5 tareas en total',
        category: 'Tareas',
        points: 150,
        rarity: 'rare',
        max_progress: 5,
        icon: '🎯',
        active: true
      },
      {
        name: 'Primer Canje',
        description: 'Canjeaste tu primera recompensa',
        category: 'Recompensas',
        points: 75,
        rarity: 'common',
        max_progress: 1,
        icon: '🎁',
        active: true
      }
    ];

    let totalCreated = 0;

    for (const org of orgs) {
      console.log(`📋 Procesando organización: ${org.name}`);
      
      for (const achievement of achievements) {
        // Verificar si ya existe
        const [existing] = await connection.query(
          'SELECT id FROM achievements WHERE name = ? AND organization_id = ?',
          [achievement.name, org.id]
        );

        if (existing.length > 0) {
          console.log(`   ⏭️  "${achievement.name}" ya existe`);
          continue;
        }

        // Crear logro
        const achievementId = crypto.randomUUID();
        await connection.query(
          `INSERT INTO achievements (id, organization_id, name, description, category, points, rarity, max_progress, icon, active, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [achievementId, org.id, achievement.name, achievement.description, achievement.category, achievement.points, achievement.rarity, achievement.max_progress, achievement.icon, achievement.active]
        );

        console.log(`   ✅ "${achievement.name}" creado (${achievement.points} gemas)`);
        totalCreated++;
      }
      
      console.log('');
    }

    console.log(`\n🎉 RESUMEN:`);
    console.log(`   Total de logros creados: ${totalCreated}`);
    console.log(`   Logros por organización: ${achievements.length}`);
    console.log(`\n✅ ¡Logros predeterminados configurados!\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createDefaultAchievements();
