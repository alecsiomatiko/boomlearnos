const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

async function unlockAchievements() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    const userId = 'f8f78bc1-a91b-11f0-ad18-2e9b82b60d1c'
    const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b'

    console.log('\n🔍 Desbloqueando logros...\n')

    // Ver todos los achievements
    const [achievements] = await pool.execute(
      'SELECT * FROM achievements WHERE organization_id = ? AND active = 1',
      [orgId]
    )

    console.log('🏆 Logros disponibles:', achievements.length)
    achievements.forEach(a => console.log(`  - ${a.name} (${a.points} gemas)`))

    // Contar tareas completadas
    const [tasks] = await pool.execute(
      'SELECT COUNT(*) as total FROM tasks WHERE user_id = ? AND status = "completed"',
      [userId]
    )
    const tasksCompleted = tasks[0].total
    console.log('\n✅ Tareas completadas:', tasksCompleted)

    // Buscar logro "Primera Tarea Completada"
    const primeraTargetrea = achievements.find(a => a.name.includes('Primera Tarea'))
    
    if (primeraTargetrea && tasksCompleted >= 1) {
      // Verificar si ya está desbloqueado
      const [existing] = await pool.execute(
        'SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?',
        [userId, primeraTargetrea.id]
      )

      if (existing.length === 0) {
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

        // Registrar en historial
        await pool.execute(
          'INSERT INTO gems_history (id, user_id, gems_amount, source, description, created_at, organization_id) VALUES (UUID(), ?, ?, ?, ?, NOW(), ?)',
          [userId, primeraTargetrea.points, 'achievement', `Logro desbloqueado: ${primeraTargetrea.name}`, orgId]
        )

        console.log(`\n✨ ¡Logro desbloqueado! ${primeraTargetrea.name} (+${primeraTargetrea.points} gemas)`)
      } else {
        console.log(`\n✅ El logro "${primeraTargetrea.name}" ya estaba desbloqueado`)
      }
    }

    // Verificar gemas totales
    const [user] = await pool.execute(
      'SELECT total_gems FROM users WHERE id = ?',
      [userId]
    )
    console.log('\n💎 Gemas totales:', user[0].total_gems)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await pool.end()
  }
}

unlockAchievements()
