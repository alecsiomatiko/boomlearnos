const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createGemsTables() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: '192.168.0.157',
      user: 'alex',
      password: 'password',
      database: 'boomlearn_db',
      multipleStatements: true
    });

    console.log('Connected to MySQL database');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'create-gems-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute SQL
    await connection.query(sql);

    console.log('✓ Tables created successfully');

    // Verify tables exist
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'boomlearn_db' 
      AND table_name IN ('gems_history', 'daily_checkins')
    `);

    console.log('Existing tables:', tables.map(t => t.TABLE_NAME).join(', '));

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed');
    }
  }
}

createGemsTables();
