const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

async function cleanMockData() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    console.log('\n🧹 Limpiando datos de prueba...\n')

    const orgId = '9a913edd-1f70-49af-91da-9ffb12bfef2b' // Supernova

    // 1. Ver usuarios actuales
    console.log('📋 Usuarios actuales en Supernova:\n')
    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE organization_id = ?',
      [orgId]
    )
    console.table(users)

    // 2. Identificar usuarios mock (los que NO son admin@supernova.com)
    const realUsers = users.filter(u => u.email === 'admin@supernova.com')
    const mockUsers = users.filter(u => u.email !== 'admin@supernova.com')

    if (mockUsers.length === 0) {
      console.log('✅ No hay usuarios mock para eliminar')
      await pool.end()
      return
    }

    console.log(`\n⚠️  Encontrados ${mockUsers.length} usuarios de prueba:`)
    mockUsers.forEach(u => console.log(`   - ${u.name} (${u.email})`))

    console.log('\n❓ ¿Deseas eliminar estos usuarios? (Escribe "SI" para confirmar)')
    
    // Para automatizar, vamos a eliminarlos directamente
    // Si quieres confirmación manual, comenta el siguiente bloque
    
    console.log('\n🗑️  Eliminando usuarios mock...')

    const mockUserIds = mockUsers.map(u => u.id)
    
    if (mockUserIds.length > 0) {
      const placeholders = mockUserIds.map(() => '?').join(',')

      // Eliminar datos relacionados primero (por foreign keys)
      
      // 1. Eliminar participaciones en conversaciones
      const [convDel] = await pool.execute(
        `DELETE FROM conversation_participants WHERE user_id IN (${placeholders})`,
        mockUserIds
      )
      console.log(`   ✅ Eliminadas ${convDel.affectedRows} participaciones en conversaciones`)

      // 2. Eliminar mensajes
      const [msgDel] = await pool.execute(
        `DELETE FROM messages WHERE sender_id IN (${placeholders})`,
        mockUserIds
      )
      console.log(`   ✅ Eliminados ${msgDel.affectedRows} mensajes`)

      // 3. Eliminar tareas
      const [taskDel] = await pool.execute(
        `DELETE FROM tasks WHERE user_id IN (${placeholders})`,
        mockUserIds
      )
      console.log(`   ✅ Eliminadas ${taskDel.affectedRows} tareas`)

      // 4. Eliminar checkins
      const [checkinDel] = await pool.execute(
        `DELETE FROM daily_checkins WHERE user_id IN (${placeholders})`,
        mockUserIds
      )
      console.log(`   ✅ Eliminados ${checkinDel.affectedRows} check-ins`)

      // 5. Eliminar gemas
      const [gemsDel] = await pool.execute(
        `DELETE FROM gems_history WHERE user_id IN (${placeholders})`,
        mockUserIds
      )
      console.log(`   ✅ Eliminadas ${gemsDel.affectedRows} transacciones de gemas`)

      // 6. Eliminar logros
      const [badgesDel] = await pool.execute(
        `DELETE FROM user_badges WHERE user_id IN (${placeholders})`,
        mockUserIds
      )
      console.log(`   ✅ Eliminados ${badgesDel.affectedRows} logros desbloqueados`)

      // 7. Eliminar recompensas canjeadas
      const [rewardsDel] = await pool.execute(
        `DELETE FROM user_rewards WHERE user_id IN (${placeholders})`,
        mockUserIds
      )
      console.log(`   ✅ Eliminadas ${rewardsDel.affectedRows} recompensas canjeadas`)

      // 8. Finalmente, eliminar los usuarios
      const [userDel] = await pool.execute(
        `DELETE FROM users WHERE id IN (${placeholders})`,
        mockUserIds
      )
      console.log(`   ✅ Eliminados ${userDel.affectedRows} usuarios`)

      console.log('\n✨ Limpieza completada exitosamente!')
    }

    // Mostrar usuarios restantes
    console.log('\n📋 Usuarios restantes:\n')
    const [remainingUsers] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE organization_id = ?',
      [orgId]
    )
    console.table(remainingUsers)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await pool.end()
  }
}

cleanMockData()
