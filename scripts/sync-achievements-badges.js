const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

async function syncAchievementsToBadges() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b'
    const userId = 'f8f78bc1-a91b-11f0-ad18-2e9b82b60d1c'

    console.log('\n🔄 Sincronizando achievements → badges...\n')

    // Obtener achievements
    const [achievements] = await pool.execute(
      'SELECT * FROM achievements WHERE organization_id = ?',
      [orgId]
    )

    console.log(`📋 Encontrados ${achievements.length} achievements`)

    // Para cada achievement, crear/actualizar en badges
    for (const ach of achievements) {
      // Verificar si ya existe
      const [existing] = await pool.execute(
        'SELECT id FROM badges WHERE id = ?',
        [ach.id]
      )

      if (existing.length === 0) {
        // Insertar en badges
        await pool.execute(
          'INSERT INTO badges (id, name, description, icon, color, unlocks_at, level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
          [ach.id, ach.name, ach.description, ach.icon, '#FFA500', ach.points, ach.rarity]
        )
        console.log(`✅ Creado badge: ${ach.name}`)
      } else {
        console.log(`⏭️  Ya existe: ${ach.name}`)
      }
    }

    // Ahora desbloquear "Primera Tarea Completada" si el usuario tiene >= 1 tarea
    const [tasks] = await pool.execute(
      'SELECT COUNT(*) as total FROM tasks WHERE user_id = ? AND status = "completed"',
      [userId]
    )

    if (tasks[0].total >= 1) {
      const primeraTargetrea = achievements.find(a => a.name.includes('Primera Tarea'))
      
      if (primeraTargetrea) {
        const [unlocked] = await pool.execute(
          'SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?',
          [userId, primeraTargetrea.id]
        )

        if (unlocked.length === 0) {
          // Desbloquear
          await pool.execute(
            'INSERT INTO user_badges (id, user_id, badge_id, unlocked_at, organization_id) VALUES (UUID(), ?, ?, NOW(), ?)',
            [userId, primeraTargetrea.id, orgId]
          )

          // Agregar gemas
          await pool.execute(
            'UPDATE users SET total_gems = total_gems + ? WHERE id = ?',
            [primeraTargetrea.points, userId]
          )

          // Historial
          await pool.execute(
            'INSERT INTO gems_history (id, user_id, gems_amount, source_type, source_id, description, created_at, organization_id) VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), ?)',
            [userId, primeraTargetrea.points, 'achievement', primeraTargetrea.id, `Logro: ${primeraTargetrea.name}`, orgId]
          )

          console.log(`\n✨ ¡Logro desbloqueado! ${primeraTargetrea.name} (+${primeraTargetrea.points} gemas)`)
        } else {
          console.log(`\n✅ El logro "Primera Tarea Completada" ya estaba desbloqueado`)
        }
      }
    }

    console.log('\n✅ Sincronización completada')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await pool.end()
  }
}

syncAchievementsToBadges()
