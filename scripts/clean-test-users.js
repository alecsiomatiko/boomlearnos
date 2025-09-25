const mysql = require('mysql2/promise');

async function cleanTestUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'boomlearnos'
  });

  try {
    console.log('🧹 Limpiando usuarios de prueba...');
    
    // Eliminar usuarios de prueba (emails que contengan 'test' o terminen en '.test')
    const [result] = await connection.execute(
      "DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%.test'"
    );
    
    console.log(`✅ ${result.affectedRows} usuarios de prueba eliminados`);
    
    // También limpiar organizaciones huérfanas
    const [orgResult] = await connection.execute(
      `DELETE FROM organizations 
       WHERE created_by NOT IN (SELECT id FROM users)`
    );
    
    console.log(`✅ ${orgResult.affectedRows} organizaciones huérfanas eliminadas`);
    
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
  } finally {
    await connection.end();
  }
}

cleanTestUsers().catch(console.error);
