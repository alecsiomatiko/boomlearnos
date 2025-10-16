const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkConversationTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log('\n📋 Estructura de tabla CONVERSATION_PARTICIPANTS:\n');
    const [columns] = await connection.execute('DESCRIBE conversation_participants');
    columns.forEach(col => {
      console.log(`  ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null.padEnd(5)} ${col.Key.padEnd(4)} ${col.Default || ''}`);
    });

    console.log('\n📋 Estructura de tabla CONVERSATIONS:\n');
    const [columns2] = await connection.execute('DESCRIBE conversations');
    columns2.forEach(col => {
      console.log(`  ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null.padEnd(5)} ${col.Key.padEnd(4)} ${col.Default || ''}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkConversationTables();
