const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

async function verifyAchievements() {
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

    console.log('\n🔍 Verificando logros y progreso:\n')

    // Contar tareas completadas
    const [tasks] = await pool.execute(
      'SELECT COUNT(*) as total FROM tasks WHERE user_id = ? AND status = "completed"',
      [userId]
    )
    console.log('✅ Tareas completadas:', tasks[0].total)

    // Contar días de check-in
    const [checkins] = await pool.execute(
      'SELECT COUNT(DISTINCT checkin_date) as days FROM daily_checkins WHERE user_id = ?',
      [userId]
    )
    console.log('📅 Días de check-in consecutivos:', checkins[0].days)

    // Ver logros disponibles
    const [achievements] = await pool.execute(
      'SELECT id, name, condition_type, condition_value, points FROM achievements WHERE organization_id = ?',
      [orgId]
    )
    console.log('\n🏆 Logros disponibles en la organización:')
    achievements.forEach(a => {
      console.log(`  - ${a.name}: ${a.condition_type} >= ${a.condition_value} (${a.points} gemas)`)
    })

    // Ver logros desbloqueados
    const [unlocked] = await pool.execute(
      'SELECT a.name, ub.unlocked_at FROM user_badges ub JOIN achievements a ON a.id = ub.badge_id WHERE ub.user_id = ?',
      [userId]
    )
    console.log('\n✨ Logros desbloqueados:', unlocked.length)
    if (unlocked.length > 0) {
      unlocked.forEach(u => console.log(`  - ${u.name} (${u.unlocked_at})`))
    } else {
      console.log('  (ninguno)')
    }

    // Verificar qué logros DEBERÍAN estar desbloqueados
    console.log('\n🎯 Análisis:\n')
    
    const tasksCompleted = tasks[0].total
    const daysCheckin = checkins[0].days

    achievements.forEach(a => {
      let shouldBeUnlocked = false
      let currentProgress = 0

      if (a.condition_type === 'tasks_completed') {
        currentProgress = tasksCompleted
        shouldBeUnlocked = tasksCompleted >= a.condition_value
      } else if (a.condition_type === 'daily_checkin_streak') {
        currentProgress = daysCheckin
        shouldBeUnlocked = daysCheckin >= a.condition_value
      }

      const isUnlocked = unlocked.some(u => u.name === a.name)
      const status = isUnlocked ? '✅ DESBLOQUEADO' : (shouldBeUnlocked ? '❌ DEBERÍA ESTAR DESBLOQUEADO' : '⏳ Pendiente')

      console.log(`${status} - ${a.name}`)
      console.log(`   Progreso: ${currentProgress}/${a.condition_value}`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

verifyAchievements()
