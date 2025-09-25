const { executeQuery } = require('../lib/server/mysql.ts');

async function addProfileImageColumn() {
  try {
    console.log('🔄 Iniciando migración para agregar columna profile_image...');
    
    // Agregar la columna profile_image
    await executeQuery(`
      ALTER TABLE users 
      ADD COLUMN profile_image VARCHAR(500) NULL 
      COMMENT 'URL de la imagen de perfil del usuario'
    `);
    
    console.log('✅ Columna profile_image agregada exitosamente');
    
    // Verificar que la columna se agregó
    const columns = await executeQuery('DESCRIBE users');
    console.log('📋 Estructura actual de la tabla users:');
    console.table(columns);
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️  La columna profile_image ya existe');
    } else {
      console.error('❌ Error ejecutando migración:', error);
    }
  }
  
  process.exit(0);
}

addProfileImageColumn();
