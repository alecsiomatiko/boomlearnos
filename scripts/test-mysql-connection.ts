// Archivo: scripts/test-mysql-connection.ts
import { pool, executeQuery, getOrCreateDefaultUser } from '../lib/mysql'

async function testConnection() {
  console.log('🔄 Probando conexión a MySQL...')
  
  try {
    // Probar conexión básica
    const connection = await pool.getConnection()
    console.log('✅ Conexión a MySQL establecida correctamente')
    connection.release()

    // Probar consulta simple
    const result = await executeQuery('SELECT 1 as test')
    console.log('✅ Consulta de prueba ejecutada:', result)

    // Probar función de usuario
    const user = await getOrCreateDefaultUser()
    console.log('✅ Usuario por defecto obtenido:', {
      id: user.id,
      email: user.email,
      name: user.name
    })

    console.log('🎉 Todas las pruebas de conexión pasaron exitosamente!')
    
  } catch (error) {
    console.error('❌ Error en la conexión a MySQL:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        console.error('💡 Verifica que el host de la base de datos sea correcto')
      } else if (error.message.includes('Access denied')) {
        console.error('💡 Verifica las credenciales de la base de datos')
      } else if (error.message.includes('Unknown database')) {
        console.error('💡 Verifica que el nombre de la base de datos sea correcto')
      }
    }
  } finally {
    await pool.end()
    console.log('🔌 Conexión cerrada')
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testConnection()
}

export { testConnection }
