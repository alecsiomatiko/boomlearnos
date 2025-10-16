const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

async function checkUserBadgesStructure() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    console.log('\n📋 Estructura de la tabla user_badges:\n')
    
    const [columns] = await pool.execute('DESCRIBE user_badges')
    console.table(columns.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Key: col.Key,
      Default: col.Default
    })))

    console.log('\n📊 Muestra de datos:\n')
    const [rows] = await pool.execute('SELECT * FROM user_badges LIMIT 5')
    console.log('Total registros:', rows.length)
    if (rows.length > 0) {
      console.log('Columnas disponibles:', Object.keys(rows[0]))
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

checkUserBadgesStructure()
