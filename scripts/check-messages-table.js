const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkMessagesTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log('\n📋 Estructura de tabla MESSAGES:\n');
    const [columns] = await connection.execute('DESCRIBE messages');
    columns.forEach(col => {
      console.log(`  ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null.padEnd(5)} ${col.Key.padEnd(4)} ${col.Default || ''}`);
    });

    console.log('\n📊 Sample de 1 mensaje (para ver qué columnas existen):\n');
    const [sample] = await connection.execute('SELECT * FROM messages LIMIT 1');
    if (sample.length > 0) {
      console.log('Columnas encontradas:', Object.keys(sample[0]).join(', '));
    } else {
      console.log('No hay mensajes en la tabla');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkMessagesTable();
