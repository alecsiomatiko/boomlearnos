const mysql = require('mysql2/promise');

async function updateUserToAdmin() {
  const connection = await mysql.createConnection({
    host: '151.106.99.1',
    port: 3306,
    user: 'u191251575_BoomlearnOS',
    password: 'Boomlearn2024!',
    database: 'u191251575_BoomlearnOS'
  });

  try {
    // Update user to admin
    const [result] = await connection.execute(
      'UPDATE users SET role = ? WHERE email = ?',
      ['admin', 'admin@musicaparatodos.com']
    );

    console.log('✅ Usuario actualizado a admin:', result.affectedRows, 'fila(s)');

    // Verify
    const [users] = await connection.execute(
      'SELECT id, email, role FROM users WHERE email = ?',
      ['admin@musicaparatodos.com']
    );

    console.log('📋 Usuario verificado:', users[0]);

  } finally {
    await connection.end();
  }
}

updateUserToAdmin().catch(console.error);
