const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

async function compareTables() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b'

    console.log('\n📦 TABLA: badges\n')
    const [badges] = await pool.execute(
      'SELECT id, name, points FROM badges WHERE organization_id = ? LIMIT 10',
      [orgId]
    )
    console.table(badges)

    console.log('\n🏆 TABLA: achievements\n')
    const [achievements] = await pool.execute(
      'SELECT id, name, points FROM achievements WHERE organization_id = ? LIMIT 10',
      [orgId]
    )
    console.table(achievements)

    console.log('\n🔍 CONCLUSIÓN:')
    console.log(`- Badges: ${badges.length} registros`)
    console.log(`- Achievements: ${achievements.length} registros`)
    console.log('\nuser_badges apunta a → badges (no achievements)')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

compareTables()
